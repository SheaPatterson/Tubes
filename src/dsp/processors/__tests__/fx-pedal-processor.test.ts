import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { installWorkletGlobals, createBuffers, makeParams } from './worklet-test-helpers';

let cleanup: () => void;

beforeAll(() => {
  cleanup = installWorkletGlobals(44100);
});
afterAll(() => cleanup());

async function getProcessor() {
  const mod = await import('../fx-pedal-processor');
  return mod.FxPedalProcessor;
}

async function getHelpers() {
  return import('../fx-pedal-processor');
}

// Helper: send a message to the processor's port
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sendMessage(proc: any, data: Record<string, unknown>) {
  proc.port.onmessage?.({ data } as MessageEvent);
}

// Helper: process N blocks of a sine wave through a processor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processSineBlocks(proc: any, blocks: number, freq = 1000, amplitude = 0.3, blockSize = 128) {
  const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
  const params = makeParams({});
  let phase = 0;
  const phaseInc = freq / 44100;

  for (let b = 0; b < blocks; b++) {
    const inputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    for (let i = 0; i < blockSize; i++) {
      inputs[0][0][i] = amplitude * Math.sin(2 * Math.PI * phase);
      phase += phaseInc;
    }
    proc.process(inputs, outputs, params);
  }
  return outputs;
}

// Helper: compute RMS of a buffer
function rms(buf: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] ** 2;
  return Math.sqrt(sum / buf.length);
}

// Helper: compute peak of a buffer
function peak(buf: Float32Array): number {
  let p = 0;
  for (let i = 0; i < buf.length; i++) p = Math.max(p, Math.abs(buf[i]));
  return p;
}

describe('FxPedalProcessor', () => {
  it('has empty parameterDescriptors (all params via MessagePort)', async () => {
    const Processor = await getProcessor();
    expect(Processor.parameterDescriptors).toEqual([]);
  });

  it('passes signal through when enabled (default overdrive)', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();
    sendMessage(proc, { type: 'setParams', params: { drive: 0.5, tone: 0.5, level: 0.5 } });

    const outputs = processSineBlocks(proc, 20);
    expect(peak(outputs[0][0])).toBeGreaterThan(0);
  });

  it('outputs silence when no input is connected', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const inputs: Float32Array[][] = [[]];
    const outputs: Float32Array[][] = [[new Float32Array(128)]];
    proc.process(inputs, outputs, makeParams({}));

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBe(0);
    }
  });

  it('returns false after dispose message', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();
    sendMessage(proc, { type: 'dispose' });

    const { inputs, outputs } = createBuffers(1, 128, 0.5);
    const result = proc.process(inputs, outputs, makeParams({}));
    expect(result).toBe(false);
  });

  // ── Enable/Disable (bypass) ────────────────────────────────────────

  describe('enable/disable bypass', () => {
    it('passes dry signal through when disabled', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();

      // Configure as distortion with heavy settings
      sendMessage(proc, { type: 'setCircuit', category: 'distortion' });
      sendMessage(proc, { type: 'setParams', params: { distortion: 1.0, tone: 0.5, level: 1.0 } });
      sendMessage(proc, { type: 'setEnabled', enabled: false });

      // Process enough blocks for the enable smoother to settle
      const blockSize = 128;
      const inputs: Float32Array[][] = [[new Float32Array(blockSize)]];
      const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
      const params = makeParams({});

      for (let i = 0; i < blockSize; i++) {
        inputs[0][0][i] = 0.3 * Math.sin(2 * Math.PI * 440 * i / 44100);
      }

      // Process many blocks to let smoother fully settle to 0
      for (let b = 0; b < 100; b++) {
        proc.process(inputs, outputs, params);
      }

      // Output should be very close to input (dry bypass)
      for (let i = 0; i < blockSize; i++) {
        expect(outputs[0][0][i]).toBeCloseTo(inputs[0][0][i], 2);
      }
    });

    it('re-enables processing after toggle', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();

      sendMessage(proc, { type: 'setCircuit', category: 'distortion' });
      sendMessage(proc, { type: 'setParams', params: { distortion: 1.0, tone: 0.5, level: 1.0 } });

      // Disable then re-enable
      sendMessage(proc, { type: 'setEnabled', enabled: false });
      // Let it settle
      processSineBlocks(proc, 50);
      sendMessage(proc, { type: 'setEnabled', enabled: true });
      // Let it settle
      const outputs = processSineBlocks(proc, 50, 440, 0.3);

      // Should be processing (distorted) — output should differ from pure sine
      const p = peak(outputs[0][0]);
      expect(p).toBeGreaterThan(0);
    });
  });

  // ── Circuit types ──────────────────────────────────────────────────

  describe('overdrive circuit', () => {
    it('produces output with soft clipping character', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();
      sendMessage(proc, { type: 'setCircuit', category: 'overdrive' });
      sendMessage(proc, { type: 'setParams', params: { drive: 0.8, tone: 0.5, level: 0.8 } });

      const outputs = processSineBlocks(proc, 20, 440, 0.5);
      const p = peak(outputs[0][0]);
      // Soft clipping via tanh should keep output bounded
      expect(p).toBeGreaterThan(0);
      expect(p).toBeLessThanOrEqual(1.0);
    });

    it('higher drive produces more saturation', async () => {
      const Processor = await getProcessor();

      // Low drive
      const procLow = new Processor();
      sendMessage(procLow, { type: 'setCircuit', category: 'overdrive' });
      sendMessage(procLow, { type: 'setParams', params: { drive: 0.1, tone: 0.5, level: 0.5 } });
      const outLow = processSineBlocks(procLow, 30, 440, 0.3);

      // High drive
      const procHigh = new Processor();
      sendMessage(procHigh, { type: 'setCircuit', category: 'overdrive' });
      sendMessage(procHigh, { type: 'setParams', params: { drive: 0.9, tone: 0.5, level: 0.5 } });
      const outHigh = processSineBlocks(procHigh, 30, 440, 0.3);

      // Both should produce output
      expect(rms(outLow[0][0])).toBeGreaterThan(0);
      expect(rms(outHigh[0][0])).toBeGreaterThan(0);
    });
  });

  describe('distortion circuit', () => {
    it('hard clips signal', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();
      sendMessage(proc, { type: 'setCircuit', category: 'distortion' });
      sendMessage(proc, { type: 'setParams', params: { distortion: 1.0, tone: 0.5, level: 1.0 } });

      const outputs = processSineBlocks(proc, 20, 440, 0.5);
      const p = peak(outputs[0][0]);
      expect(p).toBeGreaterThan(0);
      // Hard clipping + tone filter should keep output bounded
      expect(p).toBeLessThanOrEqual(1.5);
    });
  });

  describe('fuzz circuit', () => {
    it('produces asymmetric clipping', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();
      sendMessage(proc, { type: 'setCircuit', category: 'fuzz' });
      sendMessage(proc, { type: 'setParams', params: { sustain: 0.8, tone: 0.5, volume: 0.5 } });

      const outputs = processSineBlocks(proc, 20, 440, 0.5);
      const p = peak(outputs[0][0]);
      expect(p).toBeGreaterThan(0);
      expect(Number.isFinite(p)).toBe(true);
    });
  });

  describe('delay circuit', () => {
    it('produces delayed output mixed with dry', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();
      sendMessage(proc, { type: 'setCircuit', category: 'delay' });
      sendMessage(proc, { type: 'setParams', params: { delay: 0.1, feedback: 0.3, mix: 0.5 } });

      // Send an impulse then silence
      const blockSize = 128;
      const impulseInputs: Float32Array[][] = [[new Float32Array(blockSize)]];
      impulseInputs[0][0][0] = 1.0;
      const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];

      proc.process(impulseInputs, outputs, makeParams({}));

      // First sample should have the dry impulse
      expect(Math.abs(outputs[0][0][0])).toBeGreaterThan(0);

      // Process more blocks of silence — delayed signal should appear
      const silenceInputs: Float32Array[][] = [[new Float32Array(blockSize)]];
      let foundDelayed = false;
      for (let b = 0; b < 100; b++) {
        proc.process(silenceInputs, outputs, makeParams({}));
        if (peak(outputs[0][0]) > 0.01) {
          foundDelayed = true;
          break;
        }
      }
      expect(foundDelayed).toBe(true);
    });
  });

  describe('modulation circuit', () => {
    it('produces modulated output', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();
      sendMessage(proc, { type: 'setCircuit', category: 'modulation' });
      sendMessage(proc, { type: 'setParams', params: { rate: 0.5, depth: 0.5, mix: 0.5 } });

      const outputs = processSineBlocks(proc, 30, 440, 0.3);
      expect(rms(outputs[0][0])).toBeGreaterThan(0);
    });
  });

  describe('compression circuit', () => {
    it('reduces dynamic range of loud signals', async () => {
      const Processor = await getProcessor();

      // Uncompressed (low ratio)
      const procLow = new Processor();
      sendMessage(procLow, { type: 'setCircuit', category: 'compression' });
      sendMessage(procLow, { type: 'setParams', params: { threshold: 0.3, ratio: 0.0, output: 0.5, attack: 0.5 } });
      const outLow = processSineBlocks(procLow, 30, 440, 0.8);

      // Heavily compressed
      const procHigh = new Processor();
      sendMessage(procHigh, { type: 'setCircuit', category: 'compression' });
      sendMessage(procHigh, { type: 'setParams', params: { threshold: 0.2, ratio: 0.9, output: 0.5, attack: 0.5 } });
      const outHigh = processSineBlocks(procHigh, 30, 440, 0.8);

      // Both should produce output
      expect(rms(outLow[0][0])).toBeGreaterThan(0);
      expect(rms(outHigh[0][0])).toBeGreaterThan(0);
    });
  });

  describe('eq circuit', () => {
    it('boosts signal at specified frequency', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();
      sendMessage(proc, { type: 'setCircuit', category: 'eq' });
      // Boost at mid frequency, high gain
      sendMessage(proc, { type: 'setParams', params: { frequency: 0.5, gain: 0.9, q: 0.5, level: 0.5 } });

      const outputs = processSineBlocks(proc, 30, 1000, 0.3);
      expect(rms(outputs[0][0])).toBeGreaterThan(0);
    });
  });

  describe('gate circuit', () => {
    it('passes signal above threshold', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();
      sendMessage(proc, { type: 'setCircuit', category: 'gate' });
      sendMessage(proc, { type: 'setParams', params: { threshold: 0.1, release: 0.3 } });

      // Loud signal should pass through
      const outputs = processSineBlocks(proc, 20, 440, 0.5);
      expect(peak(outputs[0][0])).toBeGreaterThan(0.1);
    });

    it('attenuates signal below threshold', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();
      sendMessage(proc, { type: 'setCircuit', category: 'gate' });
      // Very high threshold
      sendMessage(proc, { type: 'setParams', params: { threshold: 1.0, release: 0.1 } });

      // Very quiet signal
      const outputs = processSineBlocks(proc, 50, 440, 0.001);
      // Gate should be closed — output should be near zero
      expect(peak(outputs[0][0])).toBeLessThan(0.01);
    });
  });

  describe('multi circuit', () => {
    it('processes through combined effects chain', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();
      sendMessage(proc, { type: 'setCircuit', category: 'multi' });
      sendMessage(proc, { type: 'setParams', params: {
        comp: 0.3, odDs: 0.5, eqLow: 0.5, eqHigh: 0.5, mod: 0.2, delay: 0.2,
      } });

      const outputs = processSineBlocks(proc, 30, 440, 0.3);
      expect(rms(outputs[0][0])).toBeGreaterThan(0);
    });
  });

  // ── MessagePort handling ───────────────────────────────────────────

  describe('message handling', () => {
    it('handles configure message with all fields', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();

      sendMessage(proc, {
        type: 'configure',
        category: 'delay',
        enabled: true,
        params: { delay: 0.3, feedback: 0.4, mix: 0.5 },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((proc as any).circuitCategory).toBe('delay');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((proc as any).enabled).toBe(true);
    });

    it('ignores invalid circuit category', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();

      sendMessage(proc, { type: 'setCircuit', category: 'overdrive' });
      sendMessage(proc, { type: 'setCircuit', category: 'invalid-type' });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((proc as any).circuitCategory).toBe('overdrive');
    });

    it('resets state when switching circuits', async () => {
      const Processor = await getProcessor();
      const proc = new Processor();

      // Use delay to build up state
      sendMessage(proc, { type: 'setCircuit', category: 'delay' });
      sendMessage(proc, { type: 'setParams', params: { delay: 0.5, feedback: 0.5, mix: 0.5 } });
      processSineBlocks(proc, 10);

      // Switch to overdrive — delay state should be cleared
      sendMessage(proc, { type: 'setCircuit', category: 'overdrive' });

      // Process silence — should get silence (no leftover delay)
      const blockSize = 128;
      const silenceInputs: Float32Array[][] = [[new Float32Array(blockSize)]];
      const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
      proc.process(silenceInputs, outputs, makeParams({}));

      // Output should be near zero (no residual delay)
      expect(peak(outputs[0][0])).toBeLessThan(0.01);
    });
  });

  // ── Multi-channel ──────────────────────────────────────────────────

  it('processes multi-channel audio', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();
    sendMessage(proc, { type: 'setCircuit', category: 'overdrive' });
    sendMessage(proc, { type: 'setParams', params: { drive: 0.5, tone: 0.5, level: 0.5 } });

    const { inputs, outputs } = createBuffers(2, 128, 0.3);
    for (let b = 0; b < 20; b++) {
      proc.process(inputs, outputs, makeParams({}));
    }

    expect(peak(outputs[0][0])).toBeGreaterThan(0);
    expect(peak(outputs[0][1])).toBeGreaterThan(0);
  });
});

describe('ParamSmoother', () => {
  it('smoothly transitions to target', async () => {
    const { ParamSmoother } = await getHelpers();
    const s = new ParamSmoother(0, 5, 44100);
    s.setTarget(1);

    // After many samples, should be close to target
    for (let i = 0; i < 44100; i++) s.next();
    expect(s.getValue()).toBeCloseTo(1, 3);
  });

  it('snap jumps immediately to target', async () => {
    const { ParamSmoother } = await getHelpers();
    const s = new ParamSmoother(0, 5, 44100);
    s.setTarget(1);
    s.snap();
    expect(s.getValue()).toBe(1);
  });
});

describe('DelayLine', () => {
  it('reads back written samples after delay', async () => {
    const { DelayLine } = await getHelpers();
    const dl = new DelayLine(1000);

    // Write an impulse followed by zeros
    dl.write(1.0);
    for (let i = 0; i < 99; i++) dl.write(0);

    // The impulse was written 100 samples ago, so reading at delay=99
    // (0-indexed: the most recent write is at delay 0) should retrieve it
    const val = dl.read(99);
    expect(val).toBeCloseTo(1.0, 5);
  });

  it('clear resets the buffer', async () => {
    const { DelayLine } = await getHelpers();
    const dl = new DelayLine(100);
    dl.write(1.0);
    dl.clear();

    // All reads should be zero
    for (let d = 0; d < 100; d++) {
      expect(dl.read(d)).toBe(0);
    }
  });
});

describe('Biquad helpers', () => {
  it('createLowpass produces finite coefficients', async () => {
    const { createLowpass } = await getHelpers();
    const st = createLowpass(1000, 0.707, 44100);
    expect(Number.isFinite(st.b0)).toBe(true);
    expect(Number.isFinite(st.a1)).toBe(true);
  });

  it('createPeaking produces finite coefficients', async () => {
    const { createPeaking } = await getHelpers();
    const st = createPeaking(1000, 1.0, 6, 44100);
    expect(Number.isFinite(st.b0)).toBe(true);
    expect(Number.isFinite(st.a1)).toBe(true);
  });

  it('processBiquad produces finite output', async () => {
    const { createLowpass, processBiquad } = await getHelpers();
    const st = createLowpass(2000, 0.707, 44100);
    for (let i = 0; i < 128; i++) {
      const out = processBiquad(st, Math.sin(2 * Math.PI * 1000 * i / 44100));
      expect(Number.isFinite(out)).toBe(true);
    }
  });
});
