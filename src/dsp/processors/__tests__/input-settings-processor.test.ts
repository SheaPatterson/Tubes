import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { installWorkletGlobals, createBuffers, makeParams } from './worklet-test-helpers';

let cleanup: () => void;

// Install AudioWorklet globals before importing the processor module.
beforeAll(() => {
  cleanup = installWorkletGlobals(44100);
});
afterAll(() => cleanup());

// Dynamic import so the module sees the mocked globals.
async function getProcessor() {
  const mod = await import('../input-settings-processor');
  return mod.InputSettingsProcessor;
}

describe('InputSettingsProcessor', () => {
  it('applies input gain to the signal', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const { inputs, outputs } = createBuffers(1, 128, 1.0);
    const params = makeParams(
      { inputGain: 0.5, noiseGateEnabled: 0, noiseGateThreshold: -60, noiseGateRelease: 50 },
      128,
      ['inputGain'],
    );

    proc.process(inputs, outputs, params);

    // Every sample should be 1.0 * 0.5 = 0.5
    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBeCloseTo(0.5);
    }
  });

  it('passes signal through at unity gain', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const { inputs, outputs } = createBuffers(1, 128, 0.75);
    const params = makeParams(
      { inputGain: 1, noiseGateEnabled: 0, noiseGateThreshold: -60, noiseGateRelease: 50 },
      128,
      ['inputGain'],
    );

    proc.process(inputs, outputs, params);

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBeCloseTo(0.75);
    }
  });

  it('outputs silence when input is zero', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const { inputs, outputs } = createBuffers(1, 128, 0);
    const params = makeParams(
      { inputGain: 1, noiseGateEnabled: 0, noiseGateThreshold: -60, noiseGateRelease: 50 },
      128,
      ['inputGain'],
    );

    proc.process(inputs, outputs, params);

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBe(0);
    }
  });

  it('noise gate closes on silence below threshold', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // Very quiet signal (well below -20 dB threshold)
    const { inputs, outputs } = createBuffers(1, 128, 0.001);
    const params = makeParams(
      { inputGain: 1, noiseGateEnabled: 1, noiseGateThreshold: -20, noiseGateRelease: 1 },
      128,
      ['inputGain'],
    );

    // Process several blocks so the gate has time to close.
    for (let block = 0; block < 50; block++) {
      proc.process(inputs, outputs, params);
    }

    // After many blocks the gate should have attenuated the signal significantly.
    const maxSample = Math.max(...Array.from(outputs[0][0]).map(Math.abs));
    expect(maxSample).toBeLessThan(0.001);
  });

  it('noise gate stays open when signal exceeds threshold', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // Loud signal (above -20 dB ≈ 0.1 linear)
    const { inputs, outputs } = createBuffers(1, 128, 0.5);
    const params = makeParams(
      { inputGain: 1, noiseGateEnabled: 1, noiseGateThreshold: -20, noiseGateRelease: 50 },
      128,
      ['inputGain'],
    );

    proc.process(inputs, outputs, params);

    // Signal should pass through essentially unchanged.
    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBeCloseTo(0.5, 1);
    }
  });

  it('outputs silence when no input is connected', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const inputs: Float32Array[][] = [[]]; // no channels
    const outputs: Float32Array[][] = [[new Float32Array(128)]];
    const params = makeParams(
      { inputGain: 1, noiseGateEnabled: 0, noiseGateThreshold: -60, noiseGateRelease: 50 },
    );

    proc.process(inputs, outputs, params);

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBe(0);
    }
  });

  it('returns false after dispose message', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // Simulate dispose message via the port.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'dispose' } } as MessageEvent);

    const { inputs, outputs } = createBuffers(1, 128, 1);
    const params = makeParams(
      { inputGain: 1, noiseGateEnabled: 0, noiseGateThreshold: -60, noiseGateRelease: 50 },
    );

    const result = proc.process(inputs, outputs, params);
    expect(result).toBe(false);
  });

  it('has correct parameterDescriptors', async () => {
    const Processor = await getProcessor();
    const descriptors = Processor.parameterDescriptors;
    const names = descriptors.map((d: AudioParamDescriptor) => d.name);
    expect(names).toContain('inputGain');
    expect(names).toContain('noiseGateEnabled');
    expect(names).toContain('noiseGateThreshold');
    expect(names).toContain('noiseGateRelease');
  });
});
