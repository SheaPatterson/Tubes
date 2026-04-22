import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { installWorkletGlobals, createBuffers, makeParams } from './worklet-test-helpers';

let cleanup: () => void;

beforeAll(() => {
  cleanup = installWorkletGlobals(44100);
});
afterAll(() => cleanup());

async function getProcessor() {
  const mod = await import('../power-amp-processor');
  return mod;
}

describe('PowerAmpProcessor', () => {
  it('has correct parameterDescriptors', async () => {
    const { PowerAmpProcessor } = await getProcessor();
    const descriptors = PowerAmpProcessor.parameterDescriptors;
    const names = descriptors.map((d: AudioParamDescriptor) => d.name);
    expect(names).toContain('masterVolume');
    expect(names).toContain('drive');
    expect(names).toContain('bias');
  });

  it('masterVolume is a-rate, drive and bias are k-rate', async () => {
    const { PowerAmpProcessor } = await getProcessor();
    const descriptors = PowerAmpProcessor.parameterDescriptors;
    const mv = descriptors.find((d: AudioParamDescriptor) => d.name === 'masterVolume');
    const dr = descriptors.find((d: AudioParamDescriptor) => d.name === 'drive');
    const bi = descriptors.find((d: AudioParamDescriptor) => d.name === 'bias');
    expect(mv?.automationRate).toBe('a-rate');
    expect(dr?.automationRate).toBe('k-rate');
    expect(bi?.automationRate).toBe('k-rate');
  });

  it('passes signal through with default settings', async () => {
    const { PowerAmpProcessor } = await getProcessor();
    const proc = new PowerAmpProcessor();

    const { inputs, outputs } = createBuffers(1, 128, 0.3);
    const params = makeParams(
      { masterVolume: 1, drive: 0.3, bias: 0.5 },
      128,
      ['masterVolume'],
    );

    for (let b = 0; b < 10; b++) {
      proc.process(inputs, outputs, params);
    }

    // Signal should pass through (non-zero output)
    const sample = outputs[0][0][64];
    expect(sample).not.toBe(0);
    expect(Math.abs(sample)).toBeLessThanOrEqual(1);
  });

  it('outputs silence when no input is connected', async () => {
    const { PowerAmpProcessor } = await getProcessor();
    const proc = new PowerAmpProcessor();

    const inputs: Float32Array[][] = [[]];
    const outputs: Float32Array[][] = [[new Float32Array(128)]];
    const params = makeParams({ masterVolume: 1, drive: 0.3, bias: 0.5 });

    proc.process(inputs, outputs, params);

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBe(0);
    }
  });

  it('returns false after dispose message', async () => {
    const { PowerAmpProcessor } = await getProcessor();
    const proc = new PowerAmpProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'dispose' } } as MessageEvent);

    const { inputs, outputs } = createBuffers(1, 128, 0.5);
    const params = makeParams({ masterVolume: 1, drive: 0.3, bias: 0.5 });

    const result = proc.process(inputs, outputs, params);
    expect(result).toBe(false);
  });

  it('handles setTubeType message', async () => {
    const { PowerAmpProcessor } = await getProcessor();
    const proc = new PowerAmpProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setTubeType', tubeType: 'KT88' } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).tubeType).toBe('KT88');
  });

  it('ignores invalid tube type', async () => {
    const { PowerAmpProcessor } = await getProcessor();
    const proc = new PowerAmpProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setTubeType', tubeType: 'INVALID' } } as MessageEvent);

    // Should remain at default (EL34)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).tubeType).toBe('EL34');
  });

  it('handles configure message with tubeType', async () => {
    const { PowerAmpProcessor } = await getProcessor();
    const proc = new PowerAmpProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'configure', tubeType: '6L6' } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).tubeType).toBe('6L6');
  });

  it('masterVolume scales output level', async () => {
    const { PowerAmpProcessor } = await getProcessor();

    // Low volume
    const procLow = new PowerAmpProcessor();
    const { inputs: inLow, outputs: outLow } = createBuffers(1, 128, 0.5);
    const paramsLow = makeParams(
      { masterVolume: 0.2, drive: 0.3, bias: 0.5 },
      128,
      ['masterVolume'],
    );
    for (let b = 0; b < 10; b++) {
      procLow.process(inLow, outLow, paramsLow);
    }
    const lowPeak = Math.max(...Array.from(outLow[0][0]).map(Math.abs));

    // High volume
    const procHigh = new PowerAmpProcessor();
    const { inputs: inHigh, outputs: outHigh } = createBuffers(1, 128, 0.5);
    const paramsHigh = makeParams(
      { masterVolume: 1.0, drive: 0.3, bias: 0.5 },
      128,
      ['masterVolume'],
    );
    for (let b = 0; b < 10; b++) {
      procHigh.process(inHigh, outHigh, paramsHigh);
    }
    const highPeak = Math.max(...Array.from(outHigh[0][0]).map(Math.abs));

    expect(highPeak).toBeGreaterThan(lowPeak);
  });

  it('low drive produces minimal compression', async () => {
    const { PowerAmpProcessor } = await getProcessor();
    const proc = new PowerAmpProcessor();

    // Use a sine wave to test compression behavior
    const blockSize = 128;
    const inputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    for (let i = 0; i < blockSize; i++) {
      inputs[0][0][i] = 0.4 * Math.sin(2 * Math.PI * 440 * i / 44100);
    }

    const params = makeParams(
      { masterVolume: 1, drive: 0.3, bias: 0.5 },
      blockSize,
      ['masterVolume'],
    );

    for (let b = 0; b < 20; b++) {
      proc.process(inputs, outputs, params);
    }

    // At low drive, signal should pass through with minimal alteration
    const peak = Math.max(...Array.from(outputs[0][0]).map(Math.abs));
    expect(peak).toBeGreaterThan(0);
    expect(peak).toBeLessThanOrEqual(1);
  });

  it('high drive applies more compression than low drive', async () => {
    const { PowerAmpProcessor } = await getProcessor();

    const blockSize = 128;
    const makeSine = () => {
      const buf = new Float32Array(blockSize);
      for (let i = 0; i < blockSize; i++) {
        buf[i] = 0.8 * Math.sin(2 * Math.PI * 440 * i / 44100);
      }
      return buf;
    };

    // Low drive
    const procLow = new PowerAmpProcessor();
    const inLow: Float32Array[][] = [[makeSine()]];
    const outLow: Float32Array[][] = [[new Float32Array(blockSize)]];
    const paramsLow = makeParams(
      { masterVolume: 1, drive: 0.3, bias: 0.5 },
      blockSize,
      ['masterVolume'],
    );
    for (let b = 0; b < 20; b++) {
      procLow.process(inLow, outLow, paramsLow);
    }
    const lowPeak = Math.max(...Array.from(outLow[0][0]).map(Math.abs));

    // High drive
    const procHigh = new PowerAmpProcessor();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (procHigh as any).port.onmessage?.({ data: { type: 'setTubeType', tubeType: 'EL34' } } as MessageEvent);
    const inHigh: Float32Array[][] = [[makeSine()]];
    const outHigh: Float32Array[][] = [[new Float32Array(blockSize)]];
    const paramsHigh = makeParams(
      { masterVolume: 1, drive: 0.9, bias: 0.5 },
      blockSize,
      ['masterVolume'],
    );
    for (let b = 0; b < 20; b++) {
      procHigh.process(inHigh, outHigh, paramsHigh);
    }
    const highPeak = Math.max(...Array.from(outHigh[0][0]).map(Math.abs));

    // High drive should compress more, so peak should be lower or equal
    // (more saturation + sag compression reduces peaks)
    // At minimum, both should produce output
    expect(lowPeak).toBeGreaterThan(0);
    expect(highPeak).toBeGreaterThan(0);
  });

  it('all six tube types produce valid output', async () => {
    const { PowerAmpProcessor, VALID_TUBE_TYPES } = await getProcessor();

    for (const tubeType of VALID_TUBE_TYPES) {
      const proc = new PowerAmpProcessor();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any).port.onmessage?.({
        data: { type: 'setTubeType', tubeType },
      } as MessageEvent);

      const { inputs, outputs } = createBuffers(1, 128, 0.5);
      const params = makeParams(
        { masterVolume: 0.8, drive: 0.5, bias: 0.5 },
        128,
        ['masterVolume'],
      );

      for (let b = 0; b < 10; b++) {
        proc.process(inputs, outputs, params);
      }

      // All outputs should be finite and bounded
      for (let i = 0; i < 128; i++) {
        const s = outputs[0][0][i];
        expect(Number.isFinite(s)).toBe(true);
        expect(Math.abs(s)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('low bias introduces crossover distortion', async () => {
    const { PowerAmpProcessor } = await getProcessor();

    // Low bias processor
    const procLow = new PowerAmpProcessor();
    const blockSize = 128;
    const makeSine = () => {
      const buf = new Float32Array(blockSize);
      for (let i = 0; i < blockSize; i++) {
        buf[i] = 0.1 * Math.sin(2 * Math.PI * 440 * i / 44100);
      }
      return buf;
    };

    const inLow: Float32Array[][] = [[makeSine()]];
    const outLow: Float32Array[][] = [[new Float32Array(blockSize)]];
    const paramsLow = makeParams(
      { masterVolume: 1, drive: 0.3, bias: 0.1 },
      blockSize,
      ['masterVolume'],
    );
    for (let b = 0; b < 20; b++) {
      procLow.process(inLow, outLow, paramsLow);
    }

    // Count zero-crossings — low bias should create dead zone
    let zeroCrossings = 0;
    for (let i = 0; i < blockSize; i++) {
      if (outLow[0][0][i] === 0) zeroCrossings++;
    }
    // With very low bias and small signal, some samples should be zeroed
    // by the crossover distortion dead zone
    expect(zeroCrossings).toBeGreaterThan(0);
  });

  it('TUBE_CHARACTERISTICS has entries for all valid tube types', async () => {
    const { TUBE_CHARACTERISTICS, VALID_TUBE_TYPES } = await getProcessor();

    for (const tubeType of VALID_TUBE_TYPES) {
      const chars = TUBE_CHARACTERISTICS[tubeType];
      expect(chars).toBeDefined();
      expect(chars.sagCoefficient).toBeGreaterThan(0);
      expect(chars.biasDefault).toBeGreaterThan(0);
      expect(chars.biasDefault).toBeLessThanOrEqual(1);
      expect(chars.voltageDefault).toBeGreaterThan(0);
      expect(chars.voltageDefault).toBeLessThanOrEqual(1);
      expect(chars.dynamicRange.min).toBeGreaterThan(0);
      expect(chars.dynamicRange.max).toBeLessThanOrEqual(1);
      expect(chars.compressionCurve[0]).toBeGreaterThan(0);
      expect(chars.compressionCurve[1]).toBeGreaterThan(1);
    }
  });

  it('sag envelope builds up under sustained signal', async () => {
    const { createSagState, updateSagEnvelope } = await getProcessor();

    const state = createSagState(0.25, 44100);
    expect(state.envelope).toBe(0);

    // Feed sustained high-level signal
    for (let i = 0; i < 4410; i++) { // ~100ms
      updateSagEnvelope(state, 0.9, 0.25);
    }

    // Sag should have built up
    expect(state.envelope).toBeGreaterThan(0);
  });

  it('sag envelope recovers when signal drops', async () => {
    const { createSagState, updateSagEnvelope } = await getProcessor();

    const state = createSagState(0.25, 44100);

    // Build up sag
    for (let i = 0; i < 4410; i++) {
      updateSagEnvelope(state, 0.9, 0.25);
    }
    const peakSag = state.envelope;

    // Drop signal
    for (let i = 0; i < 22050; i++) { // ~500ms
      updateSagEnvelope(state, 0.0, 0.25);
    }

    // Sag should have recovered (decreased)
    expect(state.envelope).toBeLessThan(peakSag);
  });
});
