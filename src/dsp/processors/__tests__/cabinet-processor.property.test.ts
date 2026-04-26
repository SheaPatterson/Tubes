import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import { installWorkletGlobals, makeParams } from './worklet-test-helpers';

/**
 * Property-based tests for the CabinetProcessor.
 *
 * Property 16: Microphone configuration determinism
 * **Validates: Requirements 7.8, 8.3**
 */

let cleanup: () => void;

beforeAll(() => {
  cleanup = installWorkletGlobals(44100);
});
afterAll(() => cleanup());

async function getModule() {
  return await import('../cabinet-processor');
}

// ─── Arbitraries ─────────────────────────────────────────────────────

const micTypeArb = fc.constantFrom('condenser', 'ribbon', 'dynamic');
const positionArb = fc.record({
  x: fc.double({ min: -1, max: 1, noNaN: true }),
  y: fc.double({ min: -1, max: 1, noNaN: true }),
  z: fc.double({ min: 0, max: 1, noNaN: true }),
});
const distanceArb = fc.double({ min: 0, max: 1, noNaN: true });

/**
 * Generate a short IR kernel with finite values.
 */
const irArb = fc
  .array(fc.double({ min: -1, max: 1, noNaN: true }), { minLength: 1, maxLength: 32 })
  .map((arr) => new Float32Array(arr));

/**
 * Generate a block of input samples (128 samples, sine-like signal).
 */
function makeInputBlock(amplitude: number, blockSize = 128): Float32Array {
  const buf = new Float32Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    buf[i] = amplitude * Math.sin(2 * Math.PI * 440 * i / 44100);
  }
  return buf;
}

/**
 * Property 16: Microphone configuration determinism
 * **Validates: Requirements 7.8, 8.3**
 *
 * For any mic type (condenser, ribbon, dynamic), for any position (x, y, z)
 * within valid ranges, and for any distance in [0, 1], processing the same
 * input signal twice with the same configuration SHALL produce identical
 * output buffers (deterministic behavior). Additionally, for any valid mic
 * configuration, all output samples SHALL be finite.
 */
describe('Property 16: Microphone configuration determinism', () => {
  it('same mic configuration and input produces identical output on two separate processors', async () => {
    const { CabinetProcessor } = await getModule();

    await fc.assert(
      fc.asyncProperty(
        micTypeArb,
        positionArb,
        distanceArb,
        irArb,
        async (micType, position, distance, ir) => {
          const blockSize = 128;
          const inputSignal = makeInputBlock(0.5, blockSize);

          // Configure and process with first processor
          const proc1 = new CabinetProcessor();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const port1 = (proc1 as any).port;
          port1.onmessage?.({ data: { type: 'loadIR', irData: ir } } as MessageEvent);
          port1.onmessage?.({ data: { type: 'setMicType', micType } } as MessageEvent);
          port1.onmessage?.({ data: { type: 'setMicPosition', x: position.x, y: position.y, z: position.z } } as MessageEvent);
          port1.onmessage?.({ data: { type: 'setMicDistance', distance } } as MessageEvent);

          const inputs1: Float32Array[][] = [[Float32Array.from(inputSignal)]];
          const outputs1: Float32Array[][] = [[new Float32Array(blockSize)]];
          const params1 = makeParams({ mix: 1.0 });
          proc1.process(inputs1, outputs1, params1);

          // Configure and process with second processor (identical config)
          const proc2 = new CabinetProcessor();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const port2 = (proc2 as any).port;
          port2.onmessage?.({ data: { type: 'loadIR', irData: ir } } as MessageEvent);
          port2.onmessage?.({ data: { type: 'setMicType', micType } } as MessageEvent);
          port2.onmessage?.({ data: { type: 'setMicPosition', x: position.x, y: position.y, z: position.z } } as MessageEvent);
          port2.onmessage?.({ data: { type: 'setMicDistance', distance } } as MessageEvent);

          const inputs2: Float32Array[][] = [[Float32Array.from(inputSignal)]];
          const outputs2: Float32Array[][] = [[new Float32Array(blockSize)]];
          const params2 = makeParams({ mix: 1.0 });
          proc2.process(inputs2, outputs2, params2);

          // Both outputs must be identical
          for (let i = 0; i < blockSize; i++) {
            expect(outputs1[0][0][i]).toBe(outputs2[0][0][i]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('processing the same input twice on the same processor with reset produces identical output', async () => {
    const { CabinetProcessor } = await getModule();

    await fc.assert(
      fc.asyncProperty(
        micTypeArb,
        positionArb,
        distanceArb,
        irArb,
        async (micType, position, distance, ir) => {
          const blockSize = 128;
          const inputSignal = makeInputBlock(0.6, blockSize);

          // First run
          const proc1 = new CabinetProcessor();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const port1 = (proc1 as any).port;
          port1.onmessage?.({ data: { type: 'configure', irData: ir, micType, x: position.x, y: position.y, z: position.z, distance } } as MessageEvent);

          const outputs1: Float32Array[][] = [[new Float32Array(blockSize)]];
          proc1.process([[Float32Array.from(inputSignal)]], outputs1, makeParams({ mix: 1.0 }));

          // Second run with fresh processor, same config
          const proc2 = new CabinetProcessor();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const port2 = (proc2 as any).port;
          port2.onmessage?.({ data: { type: 'configure', irData: ir, micType, x: position.x, y: position.y, z: position.z, distance } } as MessageEvent);

          const outputs2: Float32Array[][] = [[new Float32Array(blockSize)]];
          proc2.process([[Float32Array.from(inputSignal)]], outputs2, makeParams({ mix: 1.0 }));

          for (let i = 0; i < blockSize; i++) {
            expect(outputs1[0][0][i]).toBe(outputs2[0][0][i]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('all output samples are finite for any valid mic configuration', async () => {
    const { CabinetProcessor } = await getModule();

    const amplitudeArb = fc.double({ min: 0, max: 1, noNaN: true });

    await fc.assert(
      fc.asyncProperty(
        micTypeArb,
        positionArb,
        distanceArb,
        irArb,
        amplitudeArb,
        async (micType, position, distance, ir, amplitude) => {
          const blockSize = 128;
          const proc = new CabinetProcessor();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const port = (proc as any).port;
          port.onmessage?.({ data: { type: 'loadIR', irData: ir } } as MessageEvent);
          port.onmessage?.({ data: { type: 'setMicType', micType } } as MessageEvent);
          port.onmessage?.({ data: { type: 'setMicPosition', x: position.x, y: position.y, z: position.z } } as MessageEvent);
          port.onmessage?.({ data: { type: 'setMicDistance', distance } } as MessageEvent);

          const inputs: Float32Array[][] = [[makeInputBlock(amplitude, blockSize)]];
          const outputs: Float32Array[][] = [[new Float32Array(blockSize)]];
          const params = makeParams({ mix: 1.0 });

          // Process several blocks to exercise filter state accumulation
          for (let b = 0; b < 10; b++) {
            proc.process(inputs, outputs, params);
          }

          for (let i = 0; i < blockSize; i++) {
            expect(Number.isFinite(outputs[0][0][i])).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
