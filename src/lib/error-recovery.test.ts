/**
 * Tests for error recovery utilities.
 *
 * Validates: Requirements 2.6, 9.6, 10.6, 21.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  retryWithBackoff,
  retryWorkletLoad,
  recoverAudioPipeline,
} from './error-recovery';

// ── retryWithBackoff ──

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('returns success on first attempt when fn succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const resultPromise = retryWithBackoff(fn);
    const result = await resultPromise;

    expect(result.success).toBe(true);
    expect(result.value).toBe('ok');
    expect(result.attempts).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds on later attempt', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('ok');

    const resultPromise = retryWithBackoff(fn, { maxRetries: 3, baseDelayMs: 100 });

    // Advance through the backoff delays
    await vi.advanceTimersByTimeAsync(100); // 1st retry delay: 100ms
    await vi.advanceTimersByTimeAsync(200); // 2nd retry delay: 200ms

    const result = await resultPromise;

    expect(result.success).toBe(true);
    expect(result.value).toBe('ok');
    expect(result.attempts).toBe(3);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('returns failure after exhausting all retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));

    const resultPromise = retryWithBackoff(fn, { maxRetries: 2, baseDelayMs: 50 });

    // Advance through all delays
    await vi.advanceTimersByTimeAsync(50);  // 1st retry
    await vi.advanceTimersByTimeAsync(100); // 2nd retry

    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(3); // initial + 2 retries
    expect(result.lastError?.message).toBe('always fails');
  });

  it('respects abort signal', async () => {
    const controller = new AbortController();
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    controller.abort();

    const result = await retryWithBackoff(fn, {
      maxRetries: 3,
      baseDelayMs: 100,
      signal: controller.signal,
    });

    expect(result.success).toBe(false);
    expect(result.lastError?.message).toBe('Retry aborted');
    expect(fn).not.toHaveBeenCalled();
  });

  it('uses exponential backoff delays', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');

    const resultPromise = retryWithBackoff(fn, { maxRetries: 3, baseDelayMs: 100 });

    // After 99ms, should still be on first retry wait
    await vi.advanceTimersByTimeAsync(99);
    expect(fn).toHaveBeenCalledTimes(1);

    // At 100ms, first retry fires
    await vi.advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(2);

    // Second retry delay is 200ms (100 * 2^1)
    await vi.advanceTimersByTimeAsync(199);
    expect(fn).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(3);

    const result = await resultPromise;
    expect(result.success).toBe(true);
  });
});

// ── retryWorkletLoad ──

describe('retryWorkletLoad', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('calls audioContext.audioWorklet.addModule with the module URL', async () => {
    const addModule = vi.fn().mockResolvedValue(undefined);
    const audioContext = {
      audioWorklet: { addModule },
    } as unknown as AudioContext;

    const resultPromise = retryWorkletLoad(audioContext, '/worklet.js');
    const result = await resultPromise;

    expect(result.success).toBe(true);
    expect(addModule).toHaveBeenCalledWith('/worklet.js');
  });

  it('retries up to 3 times by default on failure', async () => {
    const addModule = vi.fn().mockRejectedValue(new Error('load failed'));
    const audioContext = {
      audioWorklet: { addModule },
    } as unknown as AudioContext;

    const resultPromise = retryWorkletLoad(audioContext, '/worklet.js');

    // Advance through all backoff delays (200, 400, 800ms)
    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(400);
    await vi.advanceTimersByTimeAsync(800);

    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(4); // 1 initial + 3 retries
    expect(addModule).toHaveBeenCalledTimes(4);
  });
});

// ── recoverAudioPipeline ──

describe('recoverAudioPipeline', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('recovers successfully within 500ms', async () => {
    const manager = {
      dispose: vi.fn(),
      initialize: vi.fn().mockResolvedValue(undefined),
    };
    const audioContext = {
      state: 'running' as AudioContextState,
      resume: vi.fn().mockResolvedValue(undefined),
    } as unknown as AudioContext;

    const result = await recoverAudioPipeline(manager, audioContext);

    expect(result.recovered).toBe(true);
    expect(result.durationMs).toBeLessThan(500);
    expect(manager.dispose).toHaveBeenCalled();
    expect(manager.initialize).toHaveBeenCalledWith(audioContext);
  });

  it('resumes suspended AudioContext before re-initializing', async () => {
    const manager = {
      dispose: vi.fn(),
      initialize: vi.fn().mockResolvedValue(undefined),
    };
    const audioContext = {
      state: 'suspended' as AudioContextState,
      resume: vi.fn().mockResolvedValue(undefined),
    } as unknown as AudioContext;

    const result = await recoverAudioPipeline(manager, audioContext);

    expect(result.recovered).toBe(true);
    expect(audioContext.resume).toHaveBeenCalled();
  });

  it('returns failure when initialization throws', async () => {
    const manager = {
      dispose: vi.fn(),
      initialize: vi.fn().mockRejectedValue(new Error('init failed')),
    };
    const audioContext = {
      state: 'running' as AudioContextState,
      resume: vi.fn().mockResolvedValue(undefined),
    } as unknown as AudioContext;

    const result = await recoverAudioPipeline(manager, audioContext);

    expect(result.recovered).toBe(false);
    expect(result.error).toBe('init failed');
  });
});
