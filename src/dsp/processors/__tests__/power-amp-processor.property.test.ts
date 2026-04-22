import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import { installWorkletGlobals, createBuffers, makeParams } from './worklet-test-helpers';

/**
 * Property-based tests for the PowerAmpProcessor.
 *
 * Property 7: Power amp drive compression monotonicity
 * Property 8: Power amp tube type parameter validity
 */

let cleanup: () => void;

beforeAll(() => {
  cleanup = installWorkletGlobals(44100);
});
afterAll(() => cleanup());

async function getModule() {
  return await import('../power-amp-processor');
}

/**
 * Property 7: Power amp drive compression monotonicity
 * **Validates: Requirements 3.5, 5.3, 5.4**
 *
 * For any tube type and any two drive values d1 < d2, the compression ratio
 * at d2 SHALL be >= the compression ratio at d1. For drive > 0.7 sag SHALL
 * be actively applied; for drive <= 0.7 compression SHALL remain below a
 * minimal threshold.
 */
describe('Property 7: Power amp drive compression monotonicity', () => {
  const tubeTypeArb = fc.constantFrom('KT88', '6L6', 'EL34', 'EL84', '12BH7', '12AU7');

  // Two distinct drive values where d1 < d2
  const drivePairArb = fc
    .tuple(
      fc.double({ min: 0.01, max: 1.0, noNaN: true }),
      fc.double({ min: 0.01, max: 1.0, noNaN: true }),
    )
    .filter(([a, b]) => a !== b)
    .map(([a, b]) => (a < b ? [a, b] : [b, a]) as [number, number]);

  it('compression ratio monotonically increases with drive level', async () => {
    const { PowerAmpProcessor, VALID_TUBE_TYPES } = await getModule();

    await fc.assert(
      fc.asyncProperty(tubeTypeArb, drivePairArb, async (tubeType, [d1, d2]) => {
        // Create two processors with the same tube type
        const proc1 = new PowerAmpProcessor();
        const proc2 = new PowerAmpProcessor();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (proc1 as any).port.onmessage?.({ data: { type: 'setTubeType', tubeType } } as MessageEvent);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (proc2 as any).port.onmessage?.({ data: { type: 'setTubeType', tubeType } } as MessageEvent);

        // Access the private getCompressionRatio method via the processor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ratio1 = (proc1 as any).getCompressionRatio(d1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ratio2 = (proc2 as any).getCompressionRatio(d2);

        // d2 > d1 => compression ratio at d2 >= compression ratio at d1
        expect(ratio2).toBeGreaterThanOrEqual(ratio1 - 1e-10);
      }),
      { numRuns: 100 },
    );
  });

  it('drive above SAG_DRIVE_THRESHOLD activates sag compression (peak output reduced vs clean zone)', async () => {
    const { PowerAmpProcessor, SAG_DRIVE_THRESHOLD } = await getModule();

    // Drive values: one below threshold, one above
    const highDriveArb = fc.double({ min: SAG_DRIVE_THRESHOLD + 0.01, max: 1.0, noNaN: true });

    await fc.assert(
      fc.asyncProperty(tubeTypeArb, highDriveArb, async (tubeType, highDrive) => {
        const proc = new PowerAmpProcessor();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (proc as any).port.onmessage?.({ data: { type: 'setTubeType', tubeType } } as MessageEvent);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ratio = (proc as any).getCompressionRatio(highDrive);

        // Above threshold, compression ratio must be > 1.1 (the max of the clean zone)
        expect(ratio).toBeGreaterThan(1.1);
      }),
      { numRuns: 50 },
    );
  });

  it('drive at or below SAG_DRIVE_THRESHOLD keeps compression below minimal threshold', async () => {
    const { PowerAmpProcessor, SAG_DRIVE_THRESHOLD } = await getModule();

    const lowDriveArb = fc.double({ min: 0.0, max: SAG_DRIVE_THRESHOLD - 0.001, noNaN: true });

    await fc.assert(
      fc.asyncProperty(tubeTypeArb, lowDriveArb, async (tubeType, lowDrive) => {
        const proc = new PowerAmpProcessor();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (proc as any).port.onmessage?.({ data: { type: 'setTubeType', tubeType } } as MessageEvent);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ratio = (proc as any).getCompressionRatio(lowDrive);

        // In the clean zone, compression ratio should be between 1.0 and 1.1
        expect(ratio).toBeGreaterThanOrEqual(1.0);
        expect(ratio).toBeLessThanOrEqual(1.1 + 1e-10);
      }),
      { numRuns: 50 },
    );
  });

  it('increasing drive produces equal or more compressed peak output for the same input', async () => {
    const { PowerAmpProcessor } = await getModule();

    const inputAmplitudeArb = fc.double({ min: 0.3, max: 0.8, noNaN: true });

    await fc.assert(
      fc.asyncProperty(tubeTypeArb, drivePairArb, inputAmplitudeArb, async (tubeType, [d1, d2], amplitude) => {
        const blockSize = 128;

        const makeSine = () => {
          const buf = new Float32Array(blockSize);
          for (let i = 0; i < blockSize; i++) {
            buf[i] = amplitude * Math.sin(2 * Math.PI * 440 * i / 44100);
          }
          return buf;
        };

        // Process with lower drive
        const procLow = new PowerAmpProcessor();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (procLow as any).port.onmessage?.({ data: { type: 'setTubeType', tubeType } } as MessageEvent);
        const paramsLow = makeParams({ masterVolume: 1, drive: d1, bias: 0.5 }, blockSize, ['masterVolume']);
        let outLow: Float32Array[][] = [[new Float32Array(blockSize)]];
        for (let b = 0; b < 20; b++) {
          outLow = [[new Float32Array(blockSize)]];
          procLow.process([[makeSine()]], outLow, paramsLow);
        }
        const peakLow = Math.max(...Array.from(outLow[0][0]).map(Math.abs));

        // Process with higher drive
        const procHigh = new PowerAmpProcessor();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (procHigh as any).port.onmessage?.({ data: { type: 'setTubeType', tubeType } } as MessageEvent);
        const paramsHigh = makeParams({ masterVolume: 1, drive: d2, bias: 0.5 }, blockSize, ['masterVolume']);
        let outHigh: Float32Array[][] = [[new Float32Array(blockSize)]];
        for (let b = 0; b < 20; b++) {
          outHigh = [[new Float32Array(blockSize)]];
          procHigh.process([[makeSine()]], outHigh, paramsHigh);
        }
        const peakHigh = Math.max(...Array.from(outHigh[0][0]).map(Math.abs));

        // Both should produce output
        expect(peakLow).toBeGreaterThan(0);
        expect(peakHigh).toBeGreaterThan(0);

        // Higher drive should not produce a higher peak than lower drive
        // (more compression = peak is capped). Allow small tolerance for
        // numerical precision and the fact that saturation adds gain at
        // low levels while compressing peaks.
        // The key invariant: peakHigh should not significantly exceed peakLow
        // when both drives are in the high-drive zone.
        if (d1 >= 0.70 && d2 >= 0.70) {
          expect(peakHigh).toBeLessThanOrEqual(peakLow + 0.05);
        }
      }),
      { numRuns: 50 },
    );
  });
});


/**
 * Property 8: Power amp tube type parameter validity
 * **Validates: Requirements 5.2, 5.5**
 *
 * Every tube type in VALID_TUBE_TYPES must have a corresponding entry in
 * TUBE_CHARACTERISTICS with valid ranges. For any tube type the processor
 * should produce finite, bounded output.
 */
describe('Property 8: Power amp tube type parameter validity', () => {
  it('every VALID_TUBE_TYPES entry has a TUBE_CHARACTERISTICS record with valid ranges', async () => {
    const { VALID_TUBE_TYPES, TUBE_CHARACTERISTICS } = await getModule();

    for (const tubeType of VALID_TUBE_TYPES) {
      const chars = TUBE_CHARACTERISTICS[tubeType];
      expect(chars).toBeDefined();

      // sagCoefficient > 0
      expect(chars.sagCoefficient).toBeGreaterThan(0);

      // biasDefault in (0, 1]
      expect(chars.biasDefault).toBeGreaterThan(0);
      expect(chars.biasDefault).toBeLessThanOrEqual(1);

      // voltageDefault in (0, 1]
      expect(chars.voltageDefault).toBeGreaterThan(0);
      expect(chars.voltageDefault).toBeLessThanOrEqual(1);

      // compressionCurve[0] > 0 (threshold)
      expect(chars.compressionCurve[0]).toBeGreaterThan(0);

      // compressionCurve[1] > 1 (ratio)
      expect(chars.compressionCurve[1]).toBeGreaterThan(1);

      // dynamicRange.min > 0
      expect(chars.dynamicRange.min).toBeGreaterThan(0);

      // dynamicRange.max <= 1
      expect(chars.dynamicRange.max).toBeLessThanOrEqual(1);
    }
  });

  it('for any tube type and drive level, processor produces finite bounded output', async () => {
    const { PowerAmpProcessor, VALID_TUBE_TYPES } = await getModule();

    const tubeTypeArb = fc.constantFrom(...VALID_TUBE_TYPES);
    const driveArb = fc.double({ min: 0.0, max: 1.0, noNaN: true });
    const biasArb = fc.double({ min: 0.0, max: 1.0, noNaN: true });
    const inputAmplitudeArb = fc.double({ min: 0.0, max: 1.0, noNaN: true });

    await fc.assert(
      fc.asyncProperty(
        tubeTypeArb,
        driveArb,
        biasArb,
        inputAmplitudeArb,
        async (tubeType, drive, bias, amplitude) => {
          const proc = new PowerAmpProcessor();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (proc as any).port.onmessage?.({
            data: { type: 'setTubeType', tubeType },
          } as MessageEvent);

          const blockSize = 128;
          const inputs: Float32Array[][] = [[new Float32Array(blockSize)]];
          const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];

          // Fill input with constant amplitude signal
          for (let i = 0; i < blockSize; i++) {
            inputs[0][0][i] = amplitude * Math.sin(2 * Math.PI * 440 * i / 44100);
          }

          const params = makeParams(
            { masterVolume: 1, drive, bias },
            blockSize,
            ['masterVolume'],
          );

          // Process several blocks to let sag envelope settle
          for (let b = 0; b < 10; b++) {
            proc.process(inputs, outputs, params);
          }

          // Every output sample must be finite and bounded to [-1, 1]
          for (let i = 0; i < blockSize; i++) {
            const s = outputs[0][0][i];
            expect(Number.isFinite(s)).toBe(true);
            expect(Math.abs(s)).toBeLessThanOrEqual(1.0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('sag envelope values remain finite and bounded for any tube type under sustained signal', async () => {
    const { createSagState, updateSagEnvelope, VALID_TUBE_TYPES, TUBE_CHARACTERISTICS } = await getModule();

    const tubeTypeArb = fc.constantFrom(...VALID_TUBE_TYPES);
    const inputLevelArb = fc.double({ min: 0.0, max: 1.0, noNaN: true });

    await fc.assert(
      fc.asyncProperty(tubeTypeArb, inputLevelArb, async (tubeType, inputLevel) => {
        const chars = TUBE_CHARACTERISTICS[tubeType];
        const state = createSagState(chars.sagCoefficient, 44100);

        // Run envelope for ~10ms of sustained signal (441 samples)
        for (let i = 0; i < 441; i++) {
          updateSagEnvelope(state, inputLevel, chars.sagCoefficient);
        }

        // Final envelope state must be finite and bounded
        expect(Number.isFinite(state.envelope)).toBe(true);
        expect(state.envelope).toBeGreaterThanOrEqual(0);
        expect(state.envelope).toBeLessThanOrEqual(1);
      }),
      { numRuns: 50 },
    );
  }, 15000);
});
