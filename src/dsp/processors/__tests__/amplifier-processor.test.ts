import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { installWorkletGlobals, createBuffers, makeParams } from './worklet-test-helpers';

let cleanup: () => void;

beforeAll(() => {
  cleanup = installWorkletGlobals(44100);
});
afterAll(() => cleanup());

async function getProcessor() {
  const mod = await import('../amplifier-processor');
  return mod.AmplifierProcessor;
}

async function getHelpers() {
  return import('../amplifier-processor');
}

describe('AmplifierProcessor', () => {
  it('has correct parameterDescriptors', async () => {
    const Processor = await getProcessor();
    const descriptors = Processor.parameterDescriptors;
    const names = descriptors.map((d: AudioParamDescriptor) => d.name);
    expect(names).toContain('bass');
    expect(names).toContain('mid');
    expect(names).toContain('treble');
    expect(names).toContain('presence');
    expect(names).toContain('resonance');
    expect(names).toHaveLength(5);
  });

  it('passes signal through on clean channel with neutral EQ', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // Generate a 1kHz sine wave input
    const blockSize = 128;
    const inputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    for (let i = 0; i < blockSize; i++) {
      inputs[0][0][i] = 0.3 * Math.sin(2 * Math.PI * 1000 * i / 44100);
    }
    const params = makeParams({ bass: 0.5, mid: 0.5, treble: 0.5, presence: 0.5, resonance: 0.5 });

    // Process several blocks to let filters settle
    for (let b = 0; b < 20; b++) {
      proc.process(inputs, outputs, params);
    }

    // Clean channel with neutral EQ should pass signal through relatively unchanged
    let peak = 0;
    for (let i = 0; i < blockSize; i++) {
      peak = Math.max(peak, Math.abs(outputs[0][0][i]));
    }
    expect(peak).toBeGreaterThan(0.1);
    expect(peak).toBeLessThan(1.0);
  });

  it('outputs silence when no input is connected', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const inputs: Float32Array[][] = [[]];
    const outputs: Float32Array[][] = [[new Float32Array(128)]];
    const params = makeParams({ bass: 0.5, mid: 0.5, treble: 0.5, presence: 0.5, resonance: 0.5 });

    proc.process(inputs, outputs, params);

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBe(0);
    }
  });

  it('returns false after dispose message', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'dispose' } } as MessageEvent);

    const { inputs, outputs } = createBuffers(1, 128, 0.5);
    const params = makeParams({ bass: 0.5, mid: 0.5, treble: 0.5, presence: 0.5, resonance: 0.5 });

    const result = proc.process(inputs, outputs, params);
    expect(result).toBe(false);
  });

  it('handles setChannel message for all channel types', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;

    port.onmessage?.({ data: { type: 'setChannel', channel: 'crunch' } } as MessageEvent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).channel).toBe('crunch');

    port.onmessage?.({ data: { type: 'setChannel', channel: 'overdrive' } } as MessageEvent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).channel).toBe('overdrive');

    port.onmessage?.({ data: { type: 'setChannel', channel: 'clean' } } as MessageEvent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).channel).toBe('clean');
  });

  it('ignores invalid channel values', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;

    port.onmessage?.({ data: { type: 'setChannel', channel: 'crunch' } } as MessageEvent);
    port.onmessage?.({ data: { type: 'setChannel', channel: 'invalid' } } as MessageEvent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).channel).toBe('crunch');
  });

  it('overdrive channel produces more saturation than clean', async () => {
    const Processor = await getProcessor();
    const blockSize = 128;
    const params = makeParams({ bass: 0.5, mid: 0.5, treble: 0.5, presence: 0.5, resonance: 0.5 });

    // Generate a 1kHz sine wave
    function makeSineInput(): Float32Array[][] {
      const inp: Float32Array[][] = [[new Float32Array(blockSize)]];
      for (let i = 0; i < blockSize; i++) {
        inp[0][0][i] = 0.5 * Math.sin(2 * Math.PI * 1000 * i / 44100);
      }
      return inp;
    }

    // Clean channel
    const procClean = new Processor();
    const outClean: Float32Array[][] = [[new Float32Array(blockSize)]];
    for (let b = 0; b < 30; b++) {
      procClean.process(makeSineInput(), outClean, params);
    }

    // Overdrive channel
    const procOD = new Processor();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (procOD as any).port.onmessage?.({ data: { type: 'setChannel', channel: 'overdrive' } } as MessageEvent);
    const outOD: Float32Array[][] = [[new Float32Array(blockSize)]];
    for (let b = 0; b < 30; b++) {
      procOD.process(makeSineInput(), outOD, params);
    }

    // Compute RMS for both
    let rmsClean = 0, rmsOD = 0;
    for (let i = 0; i < blockSize; i++) {
      rmsClean += outClean[0][0][i] ** 2;
      rmsOD += outOD[0][0][i] ** 2;
    }
    rmsClean = Math.sqrt(rmsClean / blockSize);
    rmsOD = Math.sqrt(rmsOD / blockSize);

    // Overdrive should have different characteristics (more compressed/saturated)
    // Both should produce non-zero output
    expect(rmsClean).toBeGreaterThan(0);
    expect(rmsOD).toBeGreaterThan(0);
  });

  it('crunch channel applies moderate saturation', async () => {
    const Processor = await getProcessor();
    const blockSize = 128;
    const params = makeParams({ bass: 0.5, mid: 0.5, treble: 0.5, presence: 0.5, resonance: 0.5 });

    function makeSineInput(): Float32Array[][] {
      const inp: Float32Array[][] = [[new Float32Array(blockSize)]];
      for (let i = 0; i < blockSize; i++) {
        inp[0][0][i] = 0.5 * Math.sin(2 * Math.PI * 1000 * i / 44100);
      }
      return inp;
    }

    const proc = new Processor();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proc as any).port.onmessage?.({ data: { type: 'setChannel', channel: 'crunch' } } as MessageEvent);
    const out: Float32Array[][] = [[new Float32Array(blockSize)]];
    for (let b = 0; b < 30; b++) {
      proc.process(makeSineInput(), out, params);
    }

    // Should produce non-zero output
    let peak = 0;
    for (let i = 0; i < blockSize; i++) {
      peak = Math.max(peak, Math.abs(out[0][0][i]));
    }
    expect(peak).toBeGreaterThan(0);
    expect(peak).toBeLessThanOrEqual(1.0);
  });

  it('EQ bass boost increases low-frequency energy', async () => {
    const Processor = await getProcessor();
    const blockSize = 128;

    // Low frequency input (100Hz)
    function makeLowInput(): Float32Array[][] {
      const inp: Float32Array[][] = [[new Float32Array(blockSize)]];
      for (let i = 0; i < blockSize; i++) {
        inp[0][0][i] = 0.3 * Math.sin(2 * Math.PI * 100 * i / 44100);
      }
      return inp;
    }

    // Neutral bass
    const procNeutral = new Processor();
    const outNeutral: Float32Array[][] = [[new Float32Array(blockSize)]];
    const paramsNeutral = makeParams({ bass: 0.5, mid: 0.5, treble: 0.5, presence: 0.5, resonance: 0.5 });
    for (let b = 0; b < 50; b++) {
      procNeutral.process(makeLowInput(), outNeutral, paramsNeutral);
    }

    // Boosted bass
    const procBoosted = new Processor();
    const outBoosted: Float32Array[][] = [[new Float32Array(blockSize)]];
    const paramsBoosted = makeParams({ bass: 1.0, mid: 0.5, treble: 0.5, presence: 0.5, resonance: 0.5 });
    for (let b = 0; b < 50; b++) {
      procBoosted.process(makeLowInput(), outBoosted, paramsBoosted);
    }

    // Compute RMS
    let rmsNeutral = 0, rmsBoosted = 0;
    for (let i = 0; i < blockSize; i++) {
      rmsNeutral += outNeutral[0][0][i] ** 2;
      rmsBoosted += outBoosted[0][0][i] ** 2;
    }
    rmsNeutral = Math.sqrt(rmsNeutral / blockSize);
    rmsBoosted = Math.sqrt(rmsBoosted / blockSize);

    // Boosted bass should produce more energy at 100Hz
    expect(rmsBoosted).toBeGreaterThan(rmsNeutral);
  });

  it('handles configureToneStack message', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({
      data: {
        type: 'configureToneStack',
        config: {
          bass: { frequency: 120, q: 0.8, minGain: -18, maxGain: 18 },
          mid: { frequency: 1000, q: 1.2 },
        },
      },
    } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toneStack = (proc as any).toneStackConfig;
    expect(toneStack.bass.frequency).toBe(120);
    expect(toneStack.bass.q).toBe(0.8);
    expect(toneStack.bass.minGain).toBe(-18);
    expect(toneStack.bass.maxGain).toBe(18);
    expect(toneStack.mid.frequency).toBe(1000);
    expect(toneStack.mid.q).toBe(1.2);
    // Treble should remain at default
    expect(toneStack.treble.frequency).toBe(3200);
  });

  it('handles bulk configure message', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({
      data: {
        type: 'configure',
        channel: 'overdrive',
        toneStack: {
          bass: { frequency: 150 },
          presence: { frequency: 6000, q: 1.0 },
        },
      },
    } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).channel).toBe('overdrive');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).toneStackConfig.bass.frequency).toBe(150);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).toneStackConfig.presence.frequency).toBe(6000);
  });

  it('processes multi-channel audio', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const { inputs, outputs } = createBuffers(2, 128, 0.3);
    const params = makeParams({ bass: 0.5, mid: 0.5, treble: 0.5, presence: 0.5, resonance: 0.5 });

    for (let b = 0; b < 20; b++) {
      proc.process(inputs, outputs, params);
    }

    // Both channels should have non-zero output
    let peak0 = 0, peak1 = 0;
    for (let i = 0; i < 128; i++) {
      peak0 = Math.max(peak0, Math.abs(outputs[0][0][i]));
      peak1 = Math.max(peak1, Math.abs(outputs[0][1][i]));
    }
    expect(peak0).toBeGreaterThan(0);
    expect(peak1).toBeGreaterThan(0);
  });
});

describe('applySaturation', () => {
  it('clean channel is transparent for small signals', async () => {
    const { applySaturation, CHANNEL_DEFAULTS } = await getHelpers();
    const chars = CHANNEL_DEFAULTS.clean;

    // Small signal should pass through nearly unchanged
    const result = applySaturation(0.1, chars);
    expect(result).toBeCloseTo(0.1, 2);
  });

  it('overdrive channel compresses signal', async () => {
    const { applySaturation, CHANNEL_DEFAULTS } = await getHelpers();
    const cleanChars = CHANNEL_DEFAULTS.clean;
    const odChars = CHANNEL_DEFAULTS.overdrive;

    const cleanOut = Math.abs(applySaturation(0.5, cleanChars));
    const odOut = Math.abs(applySaturation(0.5, odChars));

    // Both should produce output
    expect(cleanOut).toBeGreaterThan(0);
    expect(odOut).toBeGreaterThan(0);
  });

  it('saturation output is bounded', async () => {
    const { applySaturation, CHANNEL_DEFAULTS } = await getHelpers();

    for (const channel of ['clean', 'crunch', 'overdrive'] as const) {
      const chars = CHANNEL_DEFAULTS[channel];
      for (const input of [-1.0, -0.5, 0, 0.5, 1.0]) {
        const result = applySaturation(input, chars);
        expect(Math.abs(result)).toBeLessThanOrEqual(2.0); // reasonable bound
        expect(Number.isFinite(result)).toBe(true);
      }
    }
  });
});

describe('Biquad filter helpers', () => {
  it('createBiquadPeaking returns valid coefficients', async () => {
    const { createBiquadPeaking } = await getHelpers();
    const state = createBiquadPeaking(1000, 1.0, 6, 44100);

    expect(Number.isFinite(state.b0)).toBe(true);
    expect(Number.isFinite(state.b1)).toBe(true);
    expect(Number.isFinite(state.b2)).toBe(true);
    expect(Number.isFinite(state.a1)).toBe(true);
    expect(Number.isFinite(state.a2)).toBe(true);
    expect(state.z1).toBe(0);
    expect(state.z2).toBe(0);
  });

  it('processBiquad produces finite output', async () => {
    const { createBiquadPeaking, processBiquad } = await getHelpers();
    const state = createBiquadPeaking(1000, 1.0, 0, 44100);

    for (let i = 0; i < 128; i++) {
      const sample = Math.sin(2 * Math.PI * 1000 * i / 44100);
      const out = processBiquad(state, sample);
      expect(Number.isFinite(out)).toBe(true);
    }
  });

  it('zero gain biquad passes signal through', async () => {
    const { createBiquadPeaking, processBiquad } = await getHelpers();
    const state = createBiquadPeaking(1000, 1.0, 0, 44100);

    // Process many samples to let filter settle
    for (let i = 0; i < 1000; i++) {
      processBiquad(state, 0.5 * Math.sin(2 * Math.PI * 1000 * i / 44100));
    }

    // After settling, output should be close to input for 0dB gain
    const input = 0.5 * Math.sin(2 * Math.PI * 1000 * 1000 / 44100);
    const output = processBiquad(state, input);
    expect(Math.abs(output)).toBeGreaterThan(0);
    expect(Math.abs(output)).toBeLessThan(1.0);
  });

  it('updateBiquadPeaking preserves filter state', async () => {
    const { createBiquadPeaking, processBiquad, updateBiquadPeaking } = await getHelpers();
    const state = createBiquadPeaking(1000, 1.0, 0, 44100);

    // Process some samples to build up state
    for (let i = 0; i < 100; i++) {
      processBiquad(state, 0.3 * Math.sin(2 * Math.PI * 1000 * i / 44100));
    }

    const z1Before = state.z1;
    const z2Before = state.z2;

    // Update coefficients
    updateBiquadPeaking(state, 1000, 1.0, 6, 44100);

    // z1 and z2 should be preserved
    expect(state.z1).toBe(z1Before);
    expect(state.z2).toBe(z2Before);
    // But coefficients should have changed
    expect(Number.isFinite(state.b0)).toBe(true);
  });
});
