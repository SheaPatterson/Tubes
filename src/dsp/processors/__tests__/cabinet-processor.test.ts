import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { installWorkletGlobals, createBuffers, makeParams } from './worklet-test-helpers';

let cleanup: () => void;

beforeAll(() => {
  cleanup = installWorkletGlobals(44100);
});
afterAll(() => cleanup());

async function getProcessor() {
  return await import('../cabinet-processor');
}

describe('CabinetProcessor', () => {
  it('has correct parameterDescriptors', async () => {
    const { CabinetProcessor } = await getProcessor();
    const descriptors = CabinetProcessor.parameterDescriptors;
    const names = descriptors.map((d: AudioParamDescriptor) => d.name);
    expect(names).toContain('mix');
  });

  it('mix param is k-rate with default 1.0', async () => {
    const { CabinetProcessor } = await getProcessor();
    const desc = CabinetProcessor.parameterDescriptors.find(
      (d: AudioParamDescriptor) => d.name === 'mix',
    );
    expect(desc?.automationRate).toBe('k-rate');
    expect(desc?.defaultValue).toBe(1.0);
  });

  it('passes signal through when no IR is loaded (mix=1)', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    const { inputs, outputs } = createBuffers(1, 128, 0.5);
    const params = makeParams({ mix: 1.0 });

    proc.process(inputs, outputs, params);

    // With no IR, convolve returns the sample itself, so output should be non-zero
    const hasSignal = outputs[0][0].some((s) => s !== 0);
    expect(hasSignal).toBe(true);
  });

  it('outputs silence when no input is connected', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    const inputs: Float32Array[][] = [[]];
    const outputs: Float32Array[][] = [[new Float32Array(128)]];
    const params = makeParams({ mix: 1.0 });

    proc.process(inputs, outputs, params);

    for (let i = 0; i < 128; i++) {
      expect(outputs[0][0][i]).toBe(0);
    }
  });

  it('returns false after dispose message', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'dispose' } } as MessageEvent);

    const { inputs, outputs } = createBuffers(1, 128, 0.5);
    const params = makeParams({ mix: 1.0 });

    const result = proc.process(inputs, outputs, params);
    expect(result).toBe(false);
  });

  it('loads IR data via MessagePort', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    const ir = new Float32Array([1.0, 0.5, 0.25, 0.125]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'loadIR', irData: ir } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).irKernel.length).toBe(4);
  });

  it('applies IR convolution to signal', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    // Simple IR: identity-like (first tap = 1, rest = 0)
    const ir = new Float32Array([1.0, 0.0, 0.0, 0.0]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proc as any).port.onmessage?.({ data: { type: 'loadIR', irData: ir } } as MessageEvent);

    // Create a single impulse input
    const blockSize = 128;
    const inputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    inputs[0][0][0] = 1.0; // impulse at sample 0
    const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    const params = makeParams({ mix: 1.0 });

    proc.process(inputs, outputs, params);

    // The convolved output at sample 0 should be non-zero
    expect(outputs[0][0][0]).not.toBe(0);
  });

  it('convolution with multi-tap IR produces delayed echoes', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    // IR with taps at 0 and 3
    const ir = new Float32Array([0.5, 0.0, 0.0, 0.5]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proc as any).port.onmessage?.({ data: { type: 'loadIR', irData: ir } } as MessageEvent);

    // Set mic to center preset for predictable behavior
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proc as any).port.onmessage?.({ data: { type: 'setMicPreset', preset: 'center' } } as MessageEvent);

    const blockSize = 128;
    const inputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    inputs[0][0][0] = 1.0; // impulse
    const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    const params = makeParams({ mix: 1.0 });

    proc.process(inputs, outputs, params);

    // Sample 0 should have contribution from tap 0
    expect(outputs[0][0][0]).not.toBe(0);
    // Sample 3 should have contribution from tap 3 (delayed echo)
    expect(outputs[0][0][3]).not.toBe(0);
  });

  it('handles setMicType message', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setMicType', micType: 'condenser' } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).micType).toBe('condenser');
  });

  it('ignores invalid mic type', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setMicType', micType: 'INVALID' } } as MessageEvent);

    // Should remain at default (dynamic)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).micType).toBe('dynamic');
  });

  it('handles setMicPosition message', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({
      data: { type: 'setMicPosition', x: 0.5, y: -0.3, z: 0.7 },
    } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pos = (proc as any).micPosition;
    expect(pos.x).toBeCloseTo(0.5);
    expect(pos.y).toBeCloseTo(-0.3);
    expect(pos.z).toBeCloseTo(0.7);
  });

  it('clamps mic position values to valid ranges', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({
      data: { type: 'setMicPosition', x: 5, y: -5, z: 3 },
    } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pos = (proc as any).micPosition;
    expect(pos.x).toBe(1);
    expect(pos.y).toBe(-1);
    expect(pos.z).toBe(1);
  });

  it('handles setMicDistance message', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setMicDistance', distance: 0.6 } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).micDistance).toBeCloseTo(0.6);
  });

  it('applies center preset (bright)', async () => {
    const { CabinetProcessor, MIC_PRESETS } = await getProcessor();
    const proc = new CabinetProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setMicPreset', preset: 'center' } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pos = (proc as any).micPosition;
    const expected = MIC_PRESETS.center.position;
    expect(pos.x).toBeCloseTo(expected.x);
    expect(pos.y).toBeCloseTo(expected.y);
    expect(pos.z).toBeCloseTo(expected.z);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).micDistance).toBeCloseTo(MIC_PRESETS.center.distance);
  });

  it('applies middle preset (warmer)', async () => {
    const { CabinetProcessor, MIC_PRESETS } = await getProcessor();
    const proc = new CabinetProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setMicPreset', preset: 'middle' } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pos = (proc as any).micPosition;
    const expected = MIC_PRESETS.middle.position;
    expect(pos.x).toBeCloseTo(expected.x);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).micDistance).toBeCloseTo(MIC_PRESETS.middle.distance);
  });

  it('applies outside preset (flat)', async () => {
    const { CabinetProcessor, MIC_PRESETS } = await getProcessor();
    const proc = new CabinetProcessor();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setMicPreset', preset: 'outside' } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pos = (proc as any).micPosition;
    const expected = MIC_PRESETS.outside.position;
    expect(pos.x).toBeCloseTo(expected.x);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).micDistance).toBeCloseTo(MIC_PRESETS.outside.distance);
  });

  it('ignores invalid preset', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    // Set to center first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({ data: { type: 'setMicPreset', preset: 'center' } } as MessageEvent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const distBefore = (proc as any).micDistance;

    // Try invalid preset
    port.onmessage?.({ data: { type: 'setMicPreset', preset: 'INVALID' } } as MessageEvent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).micDistance).toBe(distBefore);
  });

  it('handles configure message with multiple params', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    const ir = new Float32Array([1.0, 0.5]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const port = (proc as any).port;
    port.onmessage?.({
      data: {
        type: 'configure',
        irData: ir,
        micType: 'ribbon',
        x: 0.2, y: 0.1, z: 0.3,
        distance: 0.5,
      },
    } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).irKernel.length).toBe(2);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).micType).toBe('ribbon');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).micDistance).toBeCloseTo(0.5);
  });

  it('different mic types produce different output levels', async () => {
    const { CabinetProcessor } = await getProcessor();

    const ir = new Float32Array([1.0]);
    const blockSize = 128;

    const runWithMicType = (micType: string): number => {
      const proc = new CabinetProcessor();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const port = (proc as any).port;
      port.onmessage?.({ data: { type: 'loadIR', irData: ir } } as MessageEvent);
      port.onmessage?.({ data: { type: 'setMicType', micType } } as MessageEvent);
      port.onmessage?.({ data: { type: 'setMicPreset', preset: 'center' } } as MessageEvent);

      const inputs: Float32Array[][] = [[new Float32Array(blockSize).fill(0.5)]];
      const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
      const params = makeParams({ mix: 1.0 });

      proc.process(inputs, outputs, params);

      return Math.abs(outputs[0][0][64]);
    };

    const condenserLevel = runWithMicType('condenser');
    const ribbonLevel = runWithMicType('ribbon');
    const dynamicLevel = runWithMicType('dynamic');

    // All should produce output
    expect(condenserLevel).toBeGreaterThan(0);
    expect(ribbonLevel).toBeGreaterThan(0);
    expect(dynamicLevel).toBeGreaterThan(0);

    // Condenser has higher high-frequency response, so at center preset
    // (bright) it should produce a different level than ribbon
    expect(condenserLevel).not.toBeCloseTo(ribbonLevel, 2);
  });

  it('center preset produces brighter output than outside preset', async () => {
    const { CabinetProcessor } = await getProcessor();

    const ir = new Float32Array([1.0]);
    const blockSize = 128;

    const runWithPreset = (preset: string): number => {
      const proc = new CabinetProcessor();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const port = (proc as any).port;
      port.onmessage?.({ data: { type: 'loadIR', irData: ir } } as MessageEvent);
      port.onmessage?.({ data: { type: 'setMicType', micType: 'condenser' } } as MessageEvent);
      port.onmessage?.({ data: { type: 'setMicPreset', preset } } as MessageEvent);

      const inputs: Float32Array[][] = [[new Float32Array(blockSize).fill(0.5)]];
      const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
      const params = makeParams({ mix: 1.0 });

      // Process multiple blocks for filter to settle
      for (let b = 0; b < 10; b++) {
        proc.process(inputs, outputs, params);
      }

      return Math.abs(outputs[0][0][64]);
    };

    const centerLevel = runWithPreset('center');
    const outsideLevel = runWithPreset('outside');

    // Center (bright) should produce higher output than outside (flat/attenuated)
    // because center has less HF attenuation and closer distance
    expect(centerLevel).toBeGreaterThan(outsideLevel);
  });

  it('greater distance attenuates output', async () => {
    const { CabinetProcessor } = await getProcessor();

    const ir = new Float32Array([1.0]);
    const blockSize = 128;

    const runWithDistance = (distance: number): number => {
      const proc = new CabinetProcessor();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const port = (proc as any).port;
      port.onmessage?.({ data: { type: 'loadIR', irData: ir } } as MessageEvent);
      port.onmessage?.({ data: { type: 'setMicDistance', distance } } as MessageEvent);

      const inputs: Float32Array[][] = [[new Float32Array(blockSize).fill(0.5)]];
      const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
      const params = makeParams({ mix: 1.0 });

      for (let b = 0; b < 10; b++) {
        proc.process(inputs, outputs, params);
      }

      return Math.abs(outputs[0][0][64]);
    };

    const closeLevel = runWithDistance(0.0);
    const farLevel = runWithDistance(1.0);

    // Closer mic should produce higher level (less HF attenuation)
    expect(closeLevel).toBeGreaterThan(farLevel);
  });

  it('mix=0 outputs dry signal only', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    const ir = new Float32Array([0.5, 0.3, 0.1]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proc as any).port.onmessage?.({ data: { type: 'loadIR', irData: ir } } as MessageEvent);

    const blockSize = 128;
    const inputs: Float32Array[][] = [[new Float32Array(blockSize).fill(0.4)]];
    const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    const params = makeParams({ mix: 0.0 });

    proc.process(inputs, outputs, params);

    // With mix=0, output should equal dry input
    for (let i = 0; i < blockSize; i++) {
      expect(outputs[0][0][i]).toBeCloseTo(0.4, 5);
    }
  });

  it('all outputs are finite', async () => {
    const { CabinetProcessor } = await getProcessor();
    const proc = new CabinetProcessor();

    const ir = new Float32Array([1.0, -0.5, 0.25, -0.125]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proc as any).port.onmessage?.({ data: { type: 'loadIR', irData: ir } } as MessageEvent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proc as any).port.onmessage?.({ data: { type: 'setMicType', micType: 'ribbon' } } as MessageEvent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proc as any).port.onmessage?.({ data: { type: 'setMicPreset', preset: 'middle' } } as MessageEvent);

    const blockSize = 128;
    const inputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    for (let i = 0; i < blockSize; i++) {
      inputs[0][0][i] = 0.8 * Math.sin(2 * Math.PI * 440 * i / 44100);
    }
    const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
    const params = makeParams({ mix: 1.0 });

    for (let b = 0; b < 20; b++) {
      proc.process(inputs, outputs, params);
    }

    for (let i = 0; i < blockSize; i++) {
      expect(Number.isFinite(outputs[0][0][i])).toBe(true);
    }
  });

  it('truncates IR data longer than MAX_IR_LENGTH', async () => {
    const { CabinetProcessor, MAX_IR_LENGTH } = await getProcessor();
    const proc = new CabinetProcessor();

    const longIR = new Float32Array(MAX_IR_LENGTH + 100);
    longIR.fill(0.01);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proc as any).port.onmessage?.({ data: { type: 'loadIR', irData: longIR } } as MessageEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proc as any).irKernel.length).toBe(MAX_IR_LENGTH);
  });

  it('MIC_RESPONSE_CURVES has entries for all valid mic types', async () => {
    const { MIC_RESPONSE_CURVES, VALID_MIC_TYPES } = await getProcessor();

    for (const micType of VALID_MIC_TYPES) {
      const curve = MIC_RESPONSE_CURVES[micType];
      expect(curve).toBeDefined();
      expect(curve.low).toBeGreaterThan(0);
      expect(curve.mid).toBeGreaterThan(0);
      expect(curve.highMid).toBeGreaterThan(0);
      expect(curve.high).toBeGreaterThan(0);
    }
  });

  it('MIC_PRESETS has entries for all valid presets', async () => {
    const { MIC_PRESETS, VALID_MIC_PRESETS } = await getProcessor();

    for (const preset of VALID_MIC_PRESETS) {
      const p = MIC_PRESETS[preset];
      expect(p).toBeDefined();
      expect(p.position).toBeDefined();
      expect(typeof p.position.x).toBe('number');
      expect(typeof p.position.y).toBe('number');
      expect(typeof p.position.z).toBe('number');
      expect(typeof p.distance).toBe('number');
      expect(p.distance).toBeGreaterThanOrEqual(0);
      expect(p.distance).toBeLessThanOrEqual(1);
    }
  });
});
