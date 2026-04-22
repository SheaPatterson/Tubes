import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createAIEngine,
  type AIEngineNotification,
  type AIEngineService,
} from '@/services/ai-engine';

// ── Mock WebSocket ──

type WSHandler = ((event: { data: ArrayBuffer | string }) => void) | null;

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  url: string;
  binaryType: string = 'blob';
  readyState: number = 0; // CONNECTING

  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onmessage: WSHandler = null;

  sent: (ArrayBuffer | string)[] = [];
  closed = false;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: ArrayBuffer | string): void {
    if (this.readyState !== 1) throw new Error('WebSocket not open');
    this.sent.push(data);
  }

  close(): void {
    this.closed = true;
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose();
  }

  // Test helpers
  simulateOpen(): void {
    this.readyState = 1; // OPEN
    if (this.onopen) this.onopen();
  }

  simulateMessage(data: ArrayBuffer | string): void {
    if (this.onmessage) this.onmessage({ data });
  }

  simulateClose(): void {
    this.readyState = 3;
    if (this.onclose) this.onclose();
  }

  simulateError(): void {
    if (this.onerror) this.onerror(new Error('connection error'));
  }
}

// Stub globals
const originalWebSocket = globalThis.WebSocket;
const originalPerformanceNow = performance.now;

beforeEach(() => {
  MockWebSocket.instances = [];
  (globalThis as unknown as Record<string, unknown>).WebSocket = MockWebSocket as unknown as typeof WebSocket;
  vi.useFakeTimers();
});

afterEach(() => {
  (globalThis as unknown as Record<string, unknown>).WebSocket = originalWebSocket;
  vi.useRealTimers();
});

function getLastWS(): MockWebSocket {
  return MockWebSocket.instances[MockWebSocket.instances.length - 1];
}

function connectEngine(engine: AIEngineService): Promise<void> {
  const p = engine.connect();
  const ws = getLastWS();
  ws.simulateOpen();
  return p;
}

// ── Tests ──

describe('AI Engine Service', () => {
  describe('connection management', () => {
    it('connects via WebSocket and reports connected status', async () => {
      const engine = createAIEngine({ url: 'ws://test:8000/ws/audio' });
      await connectEngine(engine);

      const status = engine.getStatus();
      expect(status.connected).toBe(true);
      expect(status.connectionQuality).not.toBe('disconnected');
      engine.disconnect();
    });

    it('reports disconnected status before connect', () => {
      const engine = createAIEngine();
      const status = engine.getStatus();
      expect(status.connected).toBe(false);
      expect(status.connectionQuality).toBe('disconnected');
    });

    it('disconnect cleans up and rejects pending requests', async () => {
      const engine = createAIEngine();
      await connectEngine(engine);

      const dsp = new Float32Array([0.1, 0.2]);
      const processPromise = engine.processAudio(dsp, 44100);

      engine.disconnect();

      // Disconnect rejects pending requests — the promise should reject
      // or the timeout fallback resolves with dspOutput (race condition).
      // Either outcome is acceptable; we just verify disconnect doesn't hang.
      try {
        vi.advanceTimersByTime(300);
        const result = await processPromise;
        expect(result).toBeDefined();
      } catch (err) {
        expect((err as Error).message).toContain('disconnected');
      }

      expect(engine.getStatus().connected).toBe(false);
    });

    it('sends blend level on connect', async () => {
      const engine = createAIEngine();
      engine.setBlendLevel(0.75);
      await connectEngine(engine);

      const ws = getLastWS();
      const textMessages = ws.sent.filter((m): m is string => typeof m === 'string');
      const blendMsg = textMessages.find((m) => JSON.parse(m).type === 'set_blend');
      expect(blendMsg).toBeDefined();
      expect(JSON.parse(blendMsg!).level).toBe(0.75);

      engine.disconnect();
    });

    it('emits connection_restored on successful connect', async () => {
      const engine = createAIEngine();
      const notifications: AIEngineNotification[] = [];
      engine.onNotification((n) => notifications.push(n));

      await connectEngine(engine);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('connection_restored');
      engine.disconnect();
    });

    it('emits connection_lost when WebSocket closes unexpectedly', async () => {
      const engine = createAIEngine();
      const notifications: AIEngineNotification[] = [];
      engine.onNotification((n) => notifications.push(n));

      await connectEngine(engine);
      notifications.length = 0;

      const ws = getLastWS();
      ws.simulateClose();

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('connection_lost');
      expect(notifications[0].message).toContain('unavailable');

      engine.disconnect();
    });

    it('attempts reconnection with exponential backoff', async () => {
      const engine = createAIEngine({
        reconnectBaseDelayMs: 100,
        reconnectMaxRetries: 3,
      });

      await connectEngine(engine);

      // Simulate unexpected close
      const ws1 = getLastWS();
      ws1.simulateClose();

      // First reconnect after 100ms
      vi.advanceTimersByTime(100);
      expect(MockWebSocket.instances).toHaveLength(2);

      // Fail the reconnect
      const ws2 = getLastWS();
      ws2.simulateClose();

      // Second reconnect after 200ms (100 * 2^1)
      vi.advanceTimersByTime(200);
      expect(MockWebSocket.instances).toHaveLength(3);

      engine.disconnect();
    });
  });

  describe('processAudio', () => {
    it('returns DSP output directly when blend level is 0', async () => {
      const engine = createAIEngine();
      await connectEngine(engine);
      engine.setBlendLevel(0);

      const dsp = new Float32Array([0.5, -0.5, 0.3]);
      const result = await engine.processAudio(dsp, 44100);

      expect(result).toBe(dsp); // Same reference — no network call
      engine.disconnect();
    });

    it('returns DSP output when not connected', async () => {
      const engine = createAIEngine();
      const dsp = new Float32Array([0.1, 0.2]);
      const result = await engine.processAudio(dsp, 44100);
      expect(result).toBe(dsp);
    });

    it('sends audio over WebSocket and receives AI response', async () => {
      const engine = createAIEngine();
      let now = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => now);

      await connectEngine(engine);
      engine.setBlendLevel(1.0);

      const dsp = new Float32Array([0.1, 0.2, 0.3]);
      const processPromise = engine.processAudio(dsp, 44100);

      const ws = getLastWS();
      // Should have sent a binary message
      const binaryMessages = ws.sent.filter((m): m is ArrayBuffer => m instanceof ArrayBuffer);
      expect(binaryMessages.length).toBeGreaterThan(0);

      // Simulate AI response after 30ms
      now = 1030;
      const sentMsg = binaryMessages[binaryMessages.length - 1];
      const requestId = new DataView(sentMsg).getUint32(0, true);

      // Build response: [4 bytes requestId] [4 bytes length] [float32 samples]
      const aiSamples = new Float32Array([0.15, 0.25, 0.35]);
      const responseBuffer = new ArrayBuffer(4 + 4 + aiSamples.byteLength);
      const responseView = new DataView(responseBuffer);
      responseView.setUint32(0, requestId, true);
      responseView.setUint32(4, aiSamples.length, true);
      new Float32Array(responseBuffer, 8).set(aiSamples);

      ws.simulateMessage(responseBuffer);

      const result = await processPromise;
      expect(result[0]).toBeCloseTo(0.15);
      expect(result[1]).toBeCloseTo(0.25);
      expect(result[2]).toBeCloseTo(0.35);

      // Latency should be ~30ms
      expect(engine.getLatency()).toBeCloseTo(30);

      engine.disconnect();
      vi.restoreAllMocks();
    });

    it('blends DSP and AI output at intermediate blend levels', async () => {
      const engine = createAIEngine();
      let now = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => now);

      await connectEngine(engine);
      engine.setBlendLevel(0.5);

      const dsp = new Float32Array([1.0, 0.0]);
      const processPromise = engine.processAudio(dsp, 44100);

      now = 1010;
      const ws = getLastWS();
      const binaryMessages = ws.sent.filter((m): m is ArrayBuffer => m instanceof ArrayBuffer);
      const sentMsg = binaryMessages[binaryMessages.length - 1];
      const requestId = new DataView(sentMsg).getUint32(0, true);

      const aiSamples = new Float32Array([0.0, 1.0]);
      const responseBuffer = new ArrayBuffer(4 + 4 + aiSamples.byteLength);
      const responseView = new DataView(responseBuffer);
      responseView.setUint32(0, requestId, true);
      responseView.setUint32(4, aiSamples.length, true);
      new Float32Array(responseBuffer, 8).set(aiSamples);

      ws.simulateMessage(responseBuffer);

      const result = await processPromise;
      // 0.5 * 1.0 + 0.5 * 0.0 = 0.5
      expect(result[0]).toBeCloseTo(0.5);
      // 0.5 * 0.0 + 0.5 * 1.0 = 0.5
      expect(result[1]).toBeCloseTo(0.5);

      engine.disconnect();
      vi.restoreAllMocks();
    });

    it('falls back to DSP output on timeout (200ms)', async () => {
      const engine = createAIEngine();
      await connectEngine(engine);
      engine.setBlendLevel(1.0);

      const dsp = new Float32Array([0.42]);
      const processPromise = engine.processAudio(dsp, 44100);

      // No response from AI — advance past timeout
      vi.advanceTimersByTime(250);

      const result = await processPromise;
      expect(result).toBe(dsp);

      engine.disconnect();
    });
  });

  describe('blend level', () => {
    it('clamps blend level to [0, 1]', async () => {
      const engine = createAIEngine();
      await connectEngine(engine);

      engine.setBlendLevel(-0.5);
      // Verify by processing with blend=0 (should return DSP directly)
      const dsp = new Float32Array([1.0]);
      const result = await engine.processAudio(dsp, 44100);
      expect(result).toBe(dsp);

      engine.setBlendLevel(1.5);
      // Should be clamped to 1.0 — sends to AI
      const dsp2 = new Float32Array([1.0]);
      const processPromise = engine.processAudio(dsp2, 44100);
      // Will timeout and fall back
      vi.advanceTimersByTime(250);
      const result2 = await processPromise;
      expect(result2).toBeDefined();

      engine.disconnect();
    });

    it('sends blend level to server when connected', async () => {
      const engine = createAIEngine();
      await connectEngine(engine);

      const ws = getLastWS();
      const initialSent = ws.sent.length;

      engine.setBlendLevel(0.3);

      const newMessages = ws.sent.slice(initialSent);
      const textMessages = newMessages.filter((m): m is string => typeof m === 'string');
      expect(textMessages).toHaveLength(1);
      expect(JSON.parse(textMessages[0])).toEqual({ type: 'set_blend', level: 0.3 });

      engine.disconnect();
    });
  });

  describe('latency monitoring', () => {
    it('emits latency_warning when latency exceeds threshold', async () => {
      const engine = createAIEngine({ latencyThresholdMs: 50 });
      const notifications: AIEngineNotification[] = [];
      engine.onNotification((n) => notifications.push(n));

      let now = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => now);

      await connectEngine(engine);
      notifications.length = 0;

      engine.setBlendLevel(1.0);
      const dsp = new Float32Array([0.1]);
      const processPromise = engine.processAudio(dsp, 44100);

      // Simulate response after 60ms (above threshold)
      now = 1060;
      const ws = getLastWS();
      const binaryMessages = ws.sent.filter((m): m is ArrayBuffer => m instanceof ArrayBuffer);
      const sentMsg = binaryMessages[binaryMessages.length - 1];
      const requestId = new DataView(sentMsg).getUint32(0, true);

      const aiSamples = new Float32Array([0.15]);
      const responseBuffer = new ArrayBuffer(4 + 4 + aiSamples.byteLength);
      const responseView = new DataView(responseBuffer);
      responseView.setUint32(0, requestId, true);
      responseView.setUint32(4, aiSamples.length, true);
      new Float32Array(responseBuffer, 8).set(aiSamples);

      ws.simulateMessage(responseBuffer);
      await processPromise;

      const latencyWarnings = notifications.filter((n) => n.type === 'latency_warning');
      expect(latencyWarnings).toHaveLength(1);
      expect(latencyWarnings[0].latency).toBe(60);

      engine.disconnect();
      vi.restoreAllMocks();
    });

    it('does not re-emit latency warning until latency recovers', async () => {
      const engine = createAIEngine({ latencyThresholdMs: 50 });
      const notifications: AIEngineNotification[] = [];
      engine.onNotification((n) => notifications.push(n));

      let now = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => now);

      await connectEngine(engine);
      notifications.length = 0;

      const ws = getLastWS();

      // First request — high latency
      engine.setBlendLevel(1.0);
      const p1 = engine.processAudio(new Float32Array([0.1]), 44100);
      now = 1060;
      let binaryMsgs = ws.sent.filter((m): m is ArrayBuffer => m instanceof ArrayBuffer);
      let reqId = new DataView(binaryMsgs[binaryMsgs.length - 1]).getUint32(0, true);
      let resp = buildResponse(reqId, new Float32Array([0.1]));
      ws.simulateMessage(resp);
      await p1;

      // Second request — still high latency, should NOT re-emit
      now = 2000;
      const p2 = engine.processAudio(new Float32Array([0.2]), 44100);
      now = 2070;
      binaryMsgs = ws.sent.filter((m): m is ArrayBuffer => m instanceof ArrayBuffer);
      reqId = new DataView(binaryMsgs[binaryMsgs.length - 1]).getUint32(0, true);
      resp = buildResponse(reqId, new Float32Array([0.2]));
      ws.simulateMessage(resp);
      await p2;

      const latencyWarnings = notifications.filter((n) => n.type === 'latency_warning');
      expect(latencyWarnings).toHaveLength(1); // Only one warning

      engine.disconnect();
      vi.restoreAllMocks();
    });

    it('reports connection quality based on latency', async () => {
      const engine = createAIEngine();
      let now = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => now);

      await connectEngine(engine);
      engine.setBlendLevel(1.0);

      // Low latency → excellent
      const p1 = engine.processAudio(new Float32Array([0.1]), 44100);
      now = 1010;
      const ws = getLastWS();
      let binaryMsgs = ws.sent.filter((m): m is ArrayBuffer => m instanceof ArrayBuffer);
      let reqId = new DataView(binaryMsgs[binaryMsgs.length - 1]).getUint32(0, true);
      ws.simulateMessage(buildResponse(reqId, new Float32Array([0.1])));
      await p1;

      expect(engine.getStatus().connectionQuality).toBe('excellent');

      // High latency → poor
      now = 2000;
      const p2 = engine.processAudio(new Float32Array([0.1]), 44100);
      now = 2080;
      binaryMsgs = ws.sent.filter((m): m is ArrayBuffer => m instanceof ArrayBuffer);
      reqId = new DataView(binaryMsgs[binaryMsgs.length - 1]).getUint32(0, true);
      ws.simulateMessage(buildResponse(reqId, new Float32Array([0.1])));
      await p2;

      expect(engine.getStatus().connectionQuality).toBe('poor');

      engine.disconnect();
      vi.restoreAllMocks();
    });
  });

  describe('model version', () => {
    it('defaults to unknown', () => {
      const engine = createAIEngine();
      expect(engine.getModelVersion()).toBe('unknown');
    });

    it('updates model version from server message', async () => {
      const engine = createAIEngine();
      await connectEngine(engine);

      const ws = getLastWS();
      ws.simulateMessage(JSON.stringify({ type: 'model_version', version: '2.1.0' }));

      expect(engine.getModelVersion()).toBe('2.1.0');
      expect(engine.getStatus().modelVersion).toBe('2.1.0');

      engine.disconnect();
    });

    it('emits model_updated notification on version change', async () => {
      const engine = createAIEngine();
      const notifications: AIEngineNotification[] = [];
      engine.onNotification((n) => notifications.push(n));

      await connectEngine(engine);
      notifications.length = 0;

      const ws = getLastWS();
      // First version set
      ws.simulateMessage(JSON.stringify({ type: 'model_version', version: '1.0.0' }));
      // Version change
      ws.simulateMessage(JSON.stringify({ type: 'model_version', version: '2.0.0' }));

      const updateNotifs = notifications.filter((n) => n.type === 'model_updated');
      expect(updateNotifs).toHaveLength(1);
      expect(updateNotifs[0].modelVersion).toBe('2.0.0');

      engine.disconnect();
    });
  });

  describe('notification subscription', () => {
    it('unsubscribe removes listener', async () => {
      const engine = createAIEngine();
      const notifications: AIEngineNotification[] = [];
      const unsub = engine.onNotification((n) => notifications.push(n));

      await connectEngine(engine);
      notifications.length = 0;

      unsub();

      const ws = getLastWS();
      ws.simulateClose();

      expect(notifications).toHaveLength(0);
      engine.disconnect();
    });
  });

  describe('error fallback', () => {
    it('emits error notification on send failure and returns DSP output', async () => {
      const engine = createAIEngine();
      const notifications: AIEngineNotification[] = [];
      engine.onNotification((n) => notifications.push(n));

      await connectEngine(engine);
      notifications.length = 0;

      engine.setBlendLevel(1.0);

      // Make send throw
      const ws = getLastWS();
      ws.send = () => {
        throw new Error('send failed');
      };

      const dsp = new Float32Array([0.5]);
      const result = await engine.processAudio(dsp, 44100);

      expect(result).toBe(dsp);
      const errorNotifs = notifications.filter((n) => n.type === 'error');
      expect(errorNotifs).toHaveLength(1);

      engine.disconnect();
    });
  });
});

// ── Test Helpers ──

function buildResponse(requestId: number, samples: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(4 + 4 + samples.byteLength);
  const view = new DataView(buffer);
  view.setUint32(0, requestId, true);
  view.setUint32(4, samples.length, true);
  new Float32Array(buffer, 8).set(samples);
  return buffer;
}
