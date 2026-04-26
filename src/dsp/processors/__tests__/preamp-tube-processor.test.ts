import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { installWorkletGlobals, createBuffers, makeParams } from './worklet-test-helpers';

let cleanup: () => void;

beforeAll(() => {
  cleanup = installWorkletGlobals(44100);
});
afterAll(() => cleanup());

async function getProcessor() {
  const mod = await import('../preamp-tube-processor');
  return mod.PreampTubeProcessor;
}

describe('PreampTubeProcessor', () => {
  it('has correct parameterDescriptors', async () => {
    const Processor = await getProcessor();
    const descriptors = Processor.parameterDescriptors;
    const names = descriptors.map((d: AudioParamDescriptor) => d.name);
    expect(names).toContain('preampGain');
  });

  it('passes signal through a single stage with unity gain', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const { inputs, outputs } = createBuffers(1, 128, 0.3);
    const params = makeParams({ preampGain: 1 }, 128, ['preampGain']);

    // Process several blocks to let filters settle
    for (let b = 0; b < 20; b++) {
      proc.process(inputs, outputs, params);
    }

    // With 1 stage at gain=1 and preampGain=1, signal passes through
    // tanh(0.3) ≈ 0.2913 after filter settling
    const sample = outputs[0][0][64];
    expect(sample).toBeGreaterThan(0);
    expect(sample).toBeLessThanOrEqual(1);
  });

  it('applies soft-clipping via tanh — output bounded to [-1, 1]', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // Configure high gain to drive into saturation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setStageGains', gains: [10.0] } } as MessageEvent);

    const { inputs, outputs } = createBuffers(1, 128, 0.8);
    const params = makeParams({ preampGain: 1 }, 128, ['preampGain']);

    for (let b = 0; b < 20; b++) {
      proc.process(inputs, outputs, params);
    }

    // All output samples should be bounded by tanh
    for (let i = 0; i < 128; i++) {
      expect(Math.abs(outputs[0][0][i])).toBeLessThanOrEqual(1.0);
    }
  });

  it('cumulative gain increases with more tube stages', async () => {
    const Processor = await getProcessor();

    // Single stage
    const proc1 = new Processor();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port1 = (proc1 as any).port;
    port1.onmessage?.({ data: { type: 'configure', tubeCount: 1, stageGains: [2.0], frequencyResponse: [[20, 20000]] } } as MessageEvent);

    const { inputs: in1, outputs: out1 } = createBuffers(1, 128, 0.1);
    const params = makeParams({ preampGain: 1 }, 128, ['preampGain']);
    for (let b = 0; b < 30; b++) {
      proc1.process(in1, out1, params);
    }
    const singleStageOutput = Math.abs(out1[0][0][64]);

    // Two stages
    const proc2 = new Processor();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port2 = (proc2 as any).port;
    port2.onmessage?.({ data: { type: 'configure', tubeCount: 2, stageGains: [2.0, 2.0], frequencyResponse: [[20, 20000], [20, 20000]] } } as MessageEvent);

    const { inputs: in2, outputs: out2 } = createBuffers(1, 128, 0.1);
    for (let b = 0; b < 30; b++) {
      proc2.process(in2, out2, params);
    }
    const twoStageOutput = Math.abs(out2[0][0][64]);

    // More stages should produce more gain (or at least equal due to tanh saturation)
    expect(twoStageOutput).toBeGreaterThanOrEqual(singleStageOutput);
  });

  it('handles setTubeCount message', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setTubeCount', count: 3 } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).tubeCount).toBe(3);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).stages.length).toBe(3);
  });

  it('clamps tube count to valid range', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;

    port.onmessage?.({ data: { type: 'setTubeCount', count: 0 } } as MessageEvent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).tubeCount).toBe(1);

    port.onmessage?.({ data: { type: 'setTubeCount', count: 20 } } as MessageEvent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).tubeCount).toBe(12);
  });

  it('handles setStageGains message', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setTubeCount', count: 2 } } as MessageEvent);
    port.onmessage?.({ data: { type: 'setStageGains', gains: [1.5, 2.5] } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stages = (proc as any).stages;
    expect(stages[0].gain).toBe(1.5);
    expect(stages[1].gain).toBe(2.5);
  });

  it('handles setFrequencyResponse message', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setFrequencyResponse', curves: [[100, 8000]] } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stages = (proc as any).stages;
    expect(stages.length).toBe(1);
    // Stage should reflect the frequency response curve values
    expect(stages[0].lowCutHz).toBe(100);
    expect(stages[0].highCutHz).toBe(8000);

    // Process a block to initialize channel filter states, then verify filter coefficients
    const { inputs, outputs } = createBuffers(1, 128, 0.5);
    const params = makeParams({ preampGain: 1 }, 128, ['preampGain']);
    proc.process(inputs, outputs, params);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channelStates = (proc as any).channelFilterStates;
    expect(channelStates.length).toBeGreaterThan(0);
    expect(channelStates[0].filters[0].hpCoeff).toBeGreaterThan(0);
  });

  it('handles bulk configure message', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({
      data: {
        type: 'configure',
        tubeCount: 3,
        stageGains: [1.0, 1.5, 2.0],
        frequencyResponse: [[80, 12000], [100, 10000], [120, 8000]],
      },
    } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).tubeCount).toBe(3);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).stages.length).toBe(3);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).stages[2].gain).toBe(2.0);
  });

  it('outputs silence when no input is connected', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    const inputs: Float32Array[][] = [[]];
    const outputs: Float32Array[][] = [[new Float32Array(128)]];
    const params = makeParams({ preampGain: 1 });

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
    const params = makeParams({ preampGain: 1 });

    const result = proc.process(inputs, outputs, params);
    expect(result).toBe(false);
  });

  it('preampGain AudioParam scales the input signal', async () => {
    const Processor = await getProcessor();

    // Low gain
    const procLow = new Processor();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (procLow as any).port.onmessage?.({ data: { type: 'configure', tubeCount: 1, stageGains: [1.0], frequencyResponse: [[20, 20000]] } } as MessageEvent);
    const { inputs: inLow, outputs: outLow } = createBuffers(1, 128, 0.5);
    const paramsLow = makeParams({ preampGain: 0.2 }, 128, ['preampGain']);
    for (let b = 0; b < 30; b++) {
      procLow.process(inLow, outLow, paramsLow);
    }
    const lowGainSample = Math.abs(outLow[0][0][64]);

    // High gain
    const procHigh = new Processor();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (procHigh as any).port.onmessage?.({ data: { type: 'configure', tubeCount: 1, stageGains: [1.0], frequencyResponse: [[20, 20000]] } } as MessageEvent);
    const { inputs: inHigh, outputs: outHigh } = createBuffers(1, 128, 0.5);
    const paramsHigh = makeParams({ preampGain: 1.0 }, 128, ['preampGain']);
    for (let b = 0; b < 30; b++) {
      procHigh.process(inHigh, outHigh, paramsHigh);
    }
    const highGainSample = Math.abs(outHigh[0][0][64]);

    expect(highGainSample).toBeGreaterThan(lowGainSample);
  });

  it('tanh saturation compresses high-amplitude signals', async () => {
    const Processor = await getProcessor();
    const proc = new Processor();

    // Configure wide-open filters and high stage gain
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proc as any).port.onmessage?.({ data: { type: 'configure', tubeCount: 1, stageGains: [5.0], frequencyResponse: [[20, 20000]] } } as MessageEvent);

    // Use an AC signal (alternating) so the high-pass filter doesn't attenuate it
    const blockSize = 128;
    const inputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    for (let i = 0; i < blockSize; i++) {
      inputs[0][0][i] = 0.8 * Math.sin(2 * Math.PI * 1000 * i / 44100);
    }
    const params = makeParams({ preampGain: 1 }, blockSize, ['preampGain']);

    // Process several blocks to let filters settle
    for (let b = 0; b < 10; b++) {
      proc.process(inputs, outputs, params);
    }

    // Find peak output — should be compressed by tanh but still significant
    let peak = 0;
    for (let i = 0; i < blockSize; i++) {
      peak = Math.max(peak, Math.abs(outputs[0][0][i]));
    }
    // With gain=5 and input peak=0.8, raw would be 4.0, tanh(4.0) ≈ 0.9993
    // After filter the peak will be somewhat lower but still well above 0.5
    expect(peak).toBeGreaterThan(0.3);
    expect(peak).toBeLessThanOrEqual(1.0);
  });
});
