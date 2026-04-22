/**
 * Test helpers that mock the AudioWorklet global environment so
 * processor classes can be instantiated and tested outside a real
 * AudioContext.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Minimal MessagePort stub for testing. */
export function createMockPort() {
  return {
    onmessage: null as ((ev: MessageEvent) => void) | null,
    postMessage: (_msg: unknown) => {},
  };
}

/**
 * Install AudioWorklet globals (`AudioWorkletProcessor`, `registerProcessor`,
 * `sampleRate`) on `globalThis` so processor modules can be imported.
 *
 * Returns a cleanup function.
 */
export function installWorkletGlobals(sr = 44100): () => void {
  const origAWP = (globalThis as any).AudioWorkletProcessor;
  const origRP = (globalThis as any).registerProcessor;
  const origSR = (globalThis as any).sampleRate;

  (globalThis as any).sampleRate = sr;

  (globalThis as any).AudioWorkletProcessor = class {
    port = createMockPort();
  };

  // Collect registered processors so tests can inspect them.
  const registered = new Map<string, any>();
  (globalThis as any).registerProcessor = (name: string, ctor: any) => {
    registered.set(name, ctor);
  };

  return () => {
    (globalThis as any).AudioWorkletProcessor = origAWP;
    (globalThis as any).registerProcessor = origRP;
    (globalThis as any).sampleRate = origSR;
  };
}

/**
 * Create Float32Array[][] inputs/outputs matching the AudioWorklet
 * `process()` signature.
 *
 * @param channels  Number of audio channels.
 * @param blockSize Number of samples per channel (default 128).
 * @param fill      Optional value to fill input buffers with.
 */
export function createBuffers(
  channels: number,
  blockSize = 128,
  fill?: number,
): { inputs: Float32Array[][]; outputs: Float32Array[][] } {
  const makeChannel = () => {
    const buf = new Float32Array(blockSize);
    if (fill !== undefined) buf.fill(fill);
    return buf;
  };

  const inputs: Float32Array[][] = [
    Array.from({ length: channels }, makeChannel),
  ];
  const outputs: Float32Array[][] = [
    Array.from({ length: channels }, () => new Float32Array(blockSize)),
  ];

  return { inputs, outputs };
}

/**
 * Build a parameters record matching AudioWorklet conventions.
 * k-rate params have length 1; a-rate params have `blockSize` entries.
 */
export function makeParams(
  values: Record<string, number>,
  blockSize = 128,
  aRateKeys: string[] = [],
): Record<string, Float32Array> {
  const params: Record<string, Float32Array> = {};
  for (const [key, val] of Object.entries(values)) {
    if (aRateKeys.includes(key)) {
      const arr = new Float32Array(blockSize);
      arr.fill(val);
      params[key] = arr;
    } else {
      params[key] = new Float32Array([val]);
    }
  }
  return params;
}
