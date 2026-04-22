/**
 * Error Recovery Utilities
 *
 * Provides retry logic with exponential backoff for AudioWorklet module loading,
 * audio pipeline recovery, and generic retry utilities.
 *
 * Requirements: 2.6, 9.6, 10.6, 21.3
 */

// ── Types ──

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  /** Optional abort signal to cancel retries */
  signal?: AbortSignal;
}

export interface RetryResult<T> {
  success: boolean;
  value?: T;
  attempts: number;
  lastError?: Error;
}

export interface AudioRecoveryResult {
  recovered: boolean;
  durationMs: number;
  error?: string;
}

export type ErrorNotification = {
  type: 'audio_worklet_error' | 'audio_recovery' | 'ai_fallback' | 'audio_interface_disconnect' | 'convex_connection_loss';
  message: string;
  blocking: boolean;
};

export type ErrorNotificationCallback = (notification: ErrorNotification) => void;

// ── Constants ──

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 500,
};

/** Audio must recover within 500ms per Requirement 21.3 */
const AUDIO_RECOVERY_TIMEOUT_MS = 500;

// ── Generic Retry Utility ──

/**
 * Retry an async function with exponential backoff.
 *
 * Delay formula: baseDelayMs * 2^attempt (0-indexed).
 * E.g. with baseDelayMs=500: 500ms, 1000ms, 2000ms.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<RetryResult<T>> {
  const { maxRetries, baseDelayMs, signal } = { ...DEFAULT_RETRY_OPTIONS, ...options };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) {
      return {
        success: false,
        attempts: attempt,
        lastError: new Error('Retry aborted'),
      };
    }

    try {
      const value = await fn();
      return { success: true, value, attempts: attempt + 1 };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't delay after the last attempt
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await sleep(delay, signal);
      }
    }
  }

  return {
    success: false,
    attempts: maxRetries + 1,
    lastError,
  };
}

// ── AudioWorklet Error Recovery ──

/**
 * Retry loading an AudioWorklet module up to maxRetries times
 * with exponential backoff.
 *
 * Validates: Requirement 21.3 (recover audio within 500ms on exception)
 */
export async function retryWorkletLoad(
  audioContext: AudioContext,
  moduleUrl: string,
  maxRetries = 3,
): Promise<RetryResult<void>> {
  return retryWithBackoff(
    () => audioContext.audioWorklet.addModule(moduleUrl),
    { maxRetries, baseDelayMs: 200 },
  );
}

/**
 * Recover the audio pipeline after an exception.
 * Attempts to resume the AudioContext and re-initialize the signal chain
 * within the 500ms recovery window (Requirement 21.3).
 *
 * @param signalChainManager - Object with initialize/dispose lifecycle methods
 * @param audioContext - The AudioContext to resume
 */
export async function recoverAudioPipeline(
  signalChainManager: { initialize(ctx: AudioContext): Promise<void>; dispose(): void },
  audioContext: AudioContext,
): Promise<AudioRecoveryResult> {
  const start = performance.now();

  try {
    // Dispose current state
    signalChainManager.dispose();

    // Resume AudioContext if suspended
    if (audioContext.state === 'suspended' || audioContext.state === 'closed') {
      await withTimeout(audioContext.resume(), AUDIO_RECOVERY_TIMEOUT_MS);
    }

    // Re-initialize the signal chain
    const elapsed = performance.now() - start;
    const remaining = AUDIO_RECOVERY_TIMEOUT_MS - elapsed;

    if (remaining <= 0) {
      return {
        recovered: false,
        durationMs: elapsed,
        error: 'Recovery timeout exceeded before re-initialization',
      };
    }

    await withTimeout(
      signalChainManager.initialize(audioContext),
      remaining,
    );

    const durationMs = performance.now() - start;
    return { recovered: true, durationMs };
  } catch (err) {
    const durationMs = performance.now() - start;
    return {
      recovered: false,
      durationMs,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Helpers ──

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Retry aborted'));
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('Retry aborted'));
    }, { once: true });
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}
