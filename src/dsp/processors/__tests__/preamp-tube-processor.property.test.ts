import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import { installWorkletGlobals, makeParams } from './worklet-test-helpers';

/**
 * Property 6: Cumulative preamp gain staging
 * **Validates: Requirements 3.3, 4.2, 4.4**
 *
 * Tests that the PreampTubeProcessor correctly applies cumulative gain
 * across multiple 12AX7 stages with per-stage frequency response shaping
 * and tanh soft-clipping.
 */

let cleanup: () => void;

beforeAll(() => {
  cleanup = installWorkletGlobals(44100);
});
afterAll(() => cleanup());

async function getProcessor() {
  const mod = await import('../preamp-tube-processor');
  return mod.PreampTubeProcessor;
}

/** Create a sine-wave input buffer at a given frequency and amplitude. */
function createSineBuffers(
  blockSize: number,
  frequency: number,
  amplitude: number,
  sampleRate = 44100,
): { inputs: Float32Array[][]; outputs: Float32Array[][] } {
  const inp = new Float32Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    inp[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  return {
    inputs: [[inp]],
    outputs: [[new Float32Array(blockSize)]],
  };
}

/** Process multiple blocks to let one-pole filters settle, then return peak output. */
async function measurePeakOutput(
  tubeCount: number,
  stageGains: number[],
  inputAmplitude: number,
  settleBlocks = 25,
): Promise<number> {
  const Processor = await getProcessor();
  const proc = new Processor();

  // Wide-open frequency response [20, 20000] to avoid filter attenuation
  const freqResponse = Array.from({ length: tubeCount }, () => [20, 20000]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (proc as any).port.onmessage?.({
    data: {
      type: 'configure',
      tubeCount,
      stageGains,
      frequencyResponse: freqResponse,
    },
  } as MessageEvent);

  const blockSize = 128;
  const params = makeParams({ preampGain: 1 }, blockSize, ['preampGain']);

  // Use 1kHz sine wave — well within the [20, 20000] passband
  let outputs: Float32Array[][];
  for (let b = 0; b < settleBlocks; b++) {
    const bufs = createSineBuffers(blockSize, 1000, inputAmplitude);
    outputs = bufs.outputs;
    proc.process(bufs.inputs, outputs, params);
  }

  // Measure peak from the last block
  let peak = 0;
  for (let i = 0; i < blockSize; i++) {
    peak = Math.max(peak, Math.abs(outputs![0][0][i]));
  }
  return peak;
}

describe('Property 6: Cumulative preamp gain staging', () => {
  // Arbitraries — gains > 1.0 ensure each stage adds net gain that overcomes
  // the minor attenuation from per-stage frequency response filters
  const tubeCountArb = fc.integer({ min: 2, max: 5 }); // N >= 2 so we can compare N vs N-1
  const stageGainArb = fc.double({ min: 1.2, max: 4.0, noNaN: true });
  const inputAmplitudeArb = fc.double({ min: 0.01, max: 0.1, noNaN: true });

  it('output amplitude with N stages >= output amplitude with N-1 stages (monotonically increasing gain)', async () => {
    const Processor = await getProcessor();

    await fc.assert(
      fc.asyncProperty(
        tubeCountArb,
        stageGainArb,
        inputAmplitudeArb,
        async (N, gain, amplitude) => {
          // Build gain arrays: all stages use the same gain value
          const gainsN = Array.from({ length: N }, () => gain);
          const gainsNMinus1 = Array.from({ length: N - 1 }, () => gain);

          const peakN = await measurePeakOutput(N, gainsN, amplitude);
          const peakNMinus1 = await measurePeakOutput(N - 1, gainsNMinus1, amplitude);

          // More stages should produce >= output (tanh saturation may cause equality)
          expect(peakN).toBeGreaterThanOrEqual(peakNMinus1 - 1e-10);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('output is always bounded by [-1, 1] due to tanh soft-clipping', async () => {
    const Processor = await getProcessor();

    // Use wider ranges to stress-test bounding
    const highGainArb = fc.double({ min: 1.0, max: 10.0, noNaN: true });
    const highAmplitudeArb = fc.double({ min: 0.1, max: 1.0, noNaN: true });
    const countArb = fc.integer({ min: 1, max: 5 });

    await fc.assert(
      fc.asyncProperty(
        countArb,
        highGainArb,
        highAmplitudeArb,
        async (count, gain, amplitude) => {
          const Proc = await getProcessor();
          const proc = new Proc();

          const freqResponse = Array.from({ length: count }, () => [20, 20000]);
          const gains = Array.from({ length: count }, () => gain);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (proc as any).port.onmessage?.({
            data: {
              type: 'configure',
              tubeCount: count,
              stageGains: gains,
              frequencyResponse: freqResponse,
            },
          } as MessageEvent);

          const blockSize = 128;
          const params = makeParams({ preampGain: 1 }, blockSize, ['preampGain']);

          // Process enough blocks for filters to settle
          let lastOutputs: Float32Array[][] = [[]];
          for (let b = 0; b < 25; b++) {
            const bufs = createSineBuffers(blockSize, 1000, amplitude);
            lastOutputs = bufs.outputs;
            proc.process(bufs.inputs, lastOutputs, params);
          }

          // Every sample must be bounded by [-1, 1]
          for (let i = 0; i < blockSize; i++) {
            const sample = lastOutputs[0][0][i];
            expect(sample).toBeGreaterThanOrEqual(-1.0);
            expect(sample).toBeLessThanOrEqual(1.0);
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  it('positive input signal with gain > 0 produces non-zero output (signal passes through)', async () => {
    const Processor = await getProcessor();

    const countArb = fc.integer({ min: 1, max: 5 });
    const positiveGainArb = fc.double({ min: 0.5, max: 5.0, noNaN: true });
    const positiveAmplitudeArb = fc.double({ min: 0.05, max: 0.5, noNaN: true });

    await fc.assert(
      fc.asyncProperty(
        countArb,
        positiveGainArb,
        positiveAmplitudeArb,
        async (count, gain, amplitude) => {
          const peak = await measurePeakOutput(
            count,
            Array.from({ length: count }, () => gain),
            amplitude,
          );

          // Signal must pass through — output should be non-zero
          expect(peak).toBeGreaterThan(0);
        },
      ),
      { numRuns: 50 },
    );
  });
});
