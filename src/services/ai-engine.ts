/**
 * AI Engine Service
 *
 * WebSocket-based client for the FastAPI AI neural network backend.
 * Processes DSP output through a cloud neural network for Next Gen tier
 * tonal enhancement. Falls back to DSP-only on error/disconnect.
 *
 * Audio is only transmitted when the user holds a Next Gen tier subscription
 * AND has explicitly granted AI processing consent. Transmission ceases
 * immediately upon consent revocation.
 *
 * Requirements: 2.5, 2.6, 9.1, 9.2, 9.4, 9.6, 9.7, 22.5, 22.6
 */

import type { SubscriptionTier } from '@/types/user';
import { canTransmitAudioToAI, type AIConsentState } from '@/lib/security';

// ── Types ──

export interface AIEngineStatus {
  connected: boolean;
  latency: number;
  modelVersion: string;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export interface AIEngineNotification {
  type: 'latency_warning' | 'connection_lost' | 'connection_restored' | 'error' | 'model_updated';
  message: string;
  latency?: number;
  modelVersion?: string;
}

export type NotificationCallback = (notification: AIEngineNotification) => void;

export interface AIEngineConfig {
  url: string;
  reconnectMaxRetries?: number;
  reconnectBaseDelayMs?: number;
  latencyThresholdMs?: number;
}

export interface AIEngineService {
  connect(): Promise<void>;
  disconnect(): void;
  getStatus(): AIEngineStatus;
  processAudio(dspOutput: Float32Array, sampleRate: number): Promise<Float32Array>;
  setBlendLevel(level: number): void;
  getLatency(): number;
  getModelVersion(): string;
  onNotification(callback: NotificationCallback): () => void;
  /** Update the user's subscription tier and AI consent state. Validates: 22.5, 22.6 */
  setUserContext(tier: SubscriptionTier, consent: AIConsentState): void;
}

// ── Constants ──

const DEFAULT_CONFIG: Required<AIEngineConfig> = {
  url: 'ws://localhost:8000/ws/audio',
  reconnectMaxRetries: 5,
  reconnectBaseDelayMs: 1000,
  latencyThresholdMs: 50,
};

const LATENCY_QUALITY_THRESHOLDS = {
  excellent: 20,
  good: 50,
  poor: Infinity,
} as const;

// ── Helpers ──

function getConnectionQuality(latency: number, connected: boolean): AIEngineStatus['connectionQuality'] {
  if (!connected) return 'disconnected';
  if (latency <= LATENCY_QUALITY_THRESHOLDS.excellent) return 'excellent';
  if (latency <= LATENCY_QUALITY_THRESHOLDS.good) return 'good';
  return 'poor';
}

function clampBlendLevel(level: number): number {
  return Math.max(0, Math.min(1, level));
}

/**
 * Encode a Float32Array into an ArrayBuffer message for the WebSocket.
 * Format: [4 bytes sampleRate (uint32)] [4 bytes length (uint32)] [N * 4 bytes float32 samples]
 */
function encodeAudioMessage(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const header = 8; // 4 bytes sampleRate + 4 bytes length
  const buffer = new ArrayBuffer(header + samples.byteLength);
  const view = new DataView(buffer);
  view.setUint32(0, sampleRate, true);
  view.setUint32(4, samples.length, true);
  const floatView = new Float32Array(buffer, header);
  floatView.set(samples);
  return buffer;
}

/**
 * Decode an ArrayBuffer response from the WebSocket into a Float32Array.
 * Format: [4 bytes length (uint32)] [N * 4 bytes float32 samples]
 */
function decodeAudioResponse(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer);
  const length = view.getUint32(0, true);
  return new Float32Array(buffer, 4, length);
}

// ── Implementation ──

export function createAIEngine(config: Partial<AIEngineConfig> = {}): AIEngineService {
  const cfg: Required<AIEngineConfig> = { ...DEFAULT_CONFIG, ...config };

  // State
  let ws: WebSocket | null = null;
  let connected = false;
  let latency = 0;
  let modelVersion = 'unknown';
  let blendLevel = 1.0;
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;
  let latencyWarningEmitted = false;

  // AI consent and tier state — audio only transmitted for Next Gen + consent
  // Validates: Requirements 22.5, 22.6
  let userTier: SubscriptionTier = 'free';
  let aiConsent: AIConsentState = { consentGranted: false, consentGrantedAt: null, consentRevokedAt: null };

  // Pending audio requests keyed by a monotonic request ID
  let nextRequestId = 0;
  const pendingRequests = new Map<number, {
    resolve: (data: Float32Array) => void;
    reject: (error: Error) => void;
    sentAt: number;
  }>();

  // Notification subscribers
  const notificationListeners = new Set<NotificationCallback>();

  function emit(notification: AIEngineNotification): void {
    for (const cb of notificationListeners) {
      try {
        cb(notification);
      } catch {
        // Listener errors should not break the engine
      }
    }
  }

  function rejectAllPending(reason: string): void {
    for (const [id, req] of pendingRequests) {
      req.reject(new Error(reason));
      pendingRequests.delete(id);
    }
  }

  function scheduleReconnect(): void {
    if (disposed || reconnectAttempt >= cfg.reconnectMaxRetries) return;

    const delay = cfg.reconnectBaseDelayMs * Math.pow(2, reconnectAttempt);
    reconnectAttempt++;

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (!disposed && !connected) {
        connectInternal().catch(() => {
          // Will retry via onclose handler
        });
      }
    }, delay);
  }

  function updateLatency(newLatency: number): void {
    latency = newLatency;

    if (newLatency > cfg.latencyThresholdMs && !latencyWarningEmitted) {
      latencyWarningEmitted = true;
      emit({
        type: 'latency_warning',
        message: `AI processing latency is high (${Math.round(newLatency)}ms). Consider disabling AI enhancement temporarily.`,
        latency: newLatency,
      });
    } else if (newLatency <= cfg.latencyThresholdMs) {
      latencyWarningEmitted = false;
    }
  }

  function handleMessage(event: MessageEvent): void {
    try {
      // Binary message = audio response
      if (event.data instanceof ArrayBuffer) {
        // The first 4 bytes of the response are the request ID
        const view = new DataView(event.data);
        const requestId = view.getUint32(0, true);
        const audioBuffer = event.data.slice(4);

        const pending = pendingRequests.get(requestId);
        if (pending) {
          pendingRequests.delete(requestId);
          const roundTrip = performance.now() - pending.sentAt;
          updateLatency(roundTrip);
          pending.resolve(decodeAudioResponse(audioBuffer));
        }
        return;
      }

      // Text message = control/status message
      const msg = JSON.parse(event.data as string);
      if (msg.type === 'model_version') {
        const oldVersion = modelVersion;
        modelVersion = msg.version;
        if (oldVersion !== 'unknown' && oldVersion !== msg.version) {
          emit({
            type: 'model_updated',
            message: `AI model updated to v${msg.version}.`,
            modelVersion: msg.version,
          });
        }
      }
    } catch {
      // Malformed message — ignore
    }
  }

  function connectInternal(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (disposed) {
        reject(new Error('AI Engine has been disposed'));
        return;
      }

      try {
        ws = new WebSocket(cfg.url);
        ws.binaryType = 'arraybuffer';
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
        return;
      }

      const connectionTimeout = setTimeout(() => {
        if (ws && ws.readyState === 0 /* CONNECTING */) {
          ws.close();
          reject(new Error('Connection timeout'));
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        connected = true;
        reconnectAttempt = 0;
        latencyWarningEmitted = false;

        // Send blend level on connect
        if (ws && ws.readyState === 1 /* OPEN */) {
          ws.send(JSON.stringify({ type: 'set_blend', level: blendLevel }));
        }

        emit({
          type: 'connection_restored',
          message: 'AI enhancement connected.',
        });

        resolve();
      };

      ws.onclose = () => {
        clearTimeout(connectionTimeout);
        const wasConnected = connected;
        connected = false;
        rejectAllPending('WebSocket connection closed');

        if (wasConnected && !disposed) {
          emit({
            type: 'connection_lost',
            message: 'AI enhancement unavailable. Using Classic processing.',
          });
          scheduleReconnect();
        }

        if (!wasConnected) {
          reject(new Error('WebSocket connection failed'));
          if (!disposed) {
            scheduleReconnect();
          }
        }
      };

      ws.onerror = () => {
        // The onclose handler will fire after onerror, so we handle cleanup there
      };

      ws.onmessage = handleMessage;
    });
  }

  // ── Public API ──

  const service: AIEngineService = {
    async connect(): Promise<void> {
      reconnectAttempt = 0;
      disposed = false;
      await connectInternal();
    },

    disconnect(): void {
      disposed = true;

      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      rejectAllPending('AI Engine disconnected');

      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws.close();
        ws = null;
      }

      connected = false;
    },

    getStatus(): AIEngineStatus {
      return {
        connected,
        latency,
        modelVersion,
        connectionQuality: getConnectionQuality(latency, connected),
      };
    },

    async processAudio(dspOutput: Float32Array, sampleRate: number): Promise<Float32Array> {
      // Blend level 0 = pure DSP, skip the network round-trip entirely
      if (blendLevel === 0) {
        return dspOutput;
      }

      // Only transmit audio for Next Gen tier with explicit consent (Req 22.5, 22.6)
      if (!canTransmitAudioToAI(userTier, aiConsent)) {
        return dspOutput;
      }

      if (!connected || !ws || ws.readyState !== 1 /* OPEN */) {
        // Fallback: return DSP output as-is when AI is unavailable
        return dspOutput;
      }

      const requestId = nextRequestId++;
      const sentAt = performance.now();

      // Build the message: [4 bytes requestId] [encoded audio]
      const audioPayload = encodeAudioMessage(dspOutput, sampleRate);
      const message = new ArrayBuffer(4 + audioPayload.byteLength);
      const messageView = new DataView(message);
      messageView.setUint32(0, requestId, true);
      new Uint8Array(message, 4).set(new Uint8Array(audioPayload));

      return new Promise<Float32Array>((resolve, reject) => {
        pendingRequests.set(requestId, { resolve: onAIResponse, reject, sentAt });

        try {
          ws!.send(message);
        } catch (err) {
          pendingRequests.delete(requestId);
          emit({
            type: 'error',
            message: 'AI enhancement error. Falling back to Classic.',
          });
          // Fallback: return DSP output
          resolve(dspOutput);
          return;
        }

        // Timeout: if AI doesn't respond in 200ms, fall back to DSP output
        setTimeout(() => {
          if (pendingRequests.has(requestId)) {
            pendingRequests.delete(requestId);
            resolve(dspOutput);
          }
        }, 200);

        function onAIResponse(aiOutput: Float32Array): void {
          // Blend DSP and AI output based on blend level
          if (blendLevel >= 1.0) {
            resolve(aiOutput);
            return;
          }

          // Linear blend: output = (1 - blend) * dsp + blend * ai
          const blended = new Float32Array(dspOutput.length);
          const dspWeight = 1.0 - blendLevel;
          const aiWeight = blendLevel;
          const len = Math.min(dspOutput.length, aiOutput.length);
          for (let i = 0; i < len; i++) {
            blended[i] = dspWeight * dspOutput[i] + aiWeight * aiOutput[i];
          }
          // If dspOutput is longer than aiOutput, fill remaining with DSP
          for (let i = len; i < dspOutput.length; i++) {
            blended[i] = dspOutput[i];
          }
          resolve(blended);
        }
      });
    },

    setBlendLevel(level: number): void {
      blendLevel = clampBlendLevel(level);

      if (ws && ws.readyState === 1 /* OPEN */) {
        ws.send(JSON.stringify({ type: 'set_blend', level: blendLevel }));
      }
    },

    getLatency(): number {
      return latency;
    },

    getModelVersion(): string {
      return modelVersion;
    },

    onNotification(callback: NotificationCallback): () => void {
      notificationListeners.add(callback);
      return () => {
        notificationListeners.delete(callback);
      };
    },

    setUserContext(tier: SubscriptionTier, consent: AIConsentState): void {
      userTier = tier;
      aiConsent = consent;

      // If consent was revoked, immediately cease audio transmission (Req 22.6)
      if (!canTransmitAudioToAI(tier, consent) && connected) {
        rejectAllPending('AI audio consent revoked or tier ineligible');
      }
    },
  };

  return service;
}
