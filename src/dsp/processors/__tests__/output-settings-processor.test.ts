import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { installWorkletGlobals, createBuffers, makeParams } from './worklet-test-helpers';

let cleanup: () => void;

beforeAll(() => {
  cleanup = installWorkletGlobals(44100);
});
afterAll(() => cleanup());

async function getProcessor() {
  const mod = await import('../output-settings-processor');
  return mod.OutputSettingsProcessor;
}

describe('OutputSettingsProcessor', () => {
  it('applies master volume to the signal', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const { inputs, outputs } = createBuffers(1, 128, 1.0);
    const params = makeParams(
      { masterVolume: 0.5, outputGain: 1 },
      128,
      ['masterVolume', 'outputGain'],
    );

    proc.process(inputs, outputs, params);

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBeCloseTo(0.5);
    }
  });

  it('applies output gain to the signal', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const { inputs, outputs } = createBuffers(1, 128, 1.0);
    const params = makeParams(
      { masterVolume: 1, outputGain: 0.25 },
      128,
      ['masterVolume', 'outputGain'],
    );

    proc.process(inputs, outputs, params);

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBeCloseTo(0.25);
    }
  });

  it('combines master volume and output gain multiplicatively', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const { inputs, outputs } = createBuffers(1, 128, 1.0);
    const params = makeParams(
      { masterVolume: 0.5, outputGain: 0.5 },
      128,
      ['masterVolume', 'outputGain'],
    );

    proc.process(inputs, outputs, params);

    // 1.0 * 0.5 * 0.5 = 0.25
    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBeCloseTo(0.25);
    }
  });

  it('passes signal through at unity', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const { inputs, outputs } = createBuffers(1, 128, 0.8);
    const params = makeParams(
      { masterVolume: 1, outputGain: 1 },
      128,
      ['masterVolume', 'outputGain'],
    );

    proc.process(inputs, outputs, params);

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBeCloseTo(0.8);
    }
  });

  it('outputs silence when master volume is 0', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const { inputs, outputs } = createBuffers(1, 128, 1.0);
    const params = makeParams(
      { masterVolume: 0, outputGain: 1 },
      128,
      ['masterVolume', 'outputGain'],
    );

    proc.process(inputs, outputs, params);

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBe(0);
    }
  });

  it('outputs silence when no input is connected', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const inputs: Float32Array[][] = [[]];
    const outputs: Float32Array[][] = [[new Float32Array(128)]];
    const params = makeParams({ masterVolume: 1, outputGain: 1 });

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

    const { inputs, outputs } = createBuffers(1, 128, 1);
    const params = makeParams({ masterVolume: 1, outputGain: 1 });

    const result = proc.process(inputs, outputs, params);
    expect(result).toBe(false);
  });

  it('has correct parameterDescriptors', async () => {
    const Processor = await getProcessor();
    const descriptors = Processor.parameterDescriptors;
    const names = descriptors.map((d: AudioParamDescriptor) => d.name);
    expect(names).toContain('masterVolume');
    expect(names).toContain('outputGain');
  });

  it('handles stereo channels correctly', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const { inputs, outputs } = createBuffers(2, 128);
    // Fill left channel with 0.6, right with 0.4
    inputs[0][0].fill(0.6);
    inputs[0][1].fill(0.4);

    const params = makeParams(
      { masterVolume: 0.5, outputGain: 1 },
      128,
      ['masterVolume', 'outputGain'],
    );

    proc.process(inputs, outputs, params);

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBeCloseTo(0.3); // 0.6 * 0.5
      expect(outputs[0][1][i]).toBeCloseTo(0.2); // 0.4 * 0.5
    }
  });
});
