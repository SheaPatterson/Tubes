import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  SignalChainManagerImpl,
  STAGE_ORDER,
  type PedalStageId,
} from '@/dsp/signal-chain-manager';
import type { FxPedalInstance } from '@/types/fx';

/**
 * Property 2: Signal chain processing order invariant
 * **Validates: Requirements 2.1**
 *
 * For any signal chain configuration (regardless of which amp model, pedals,
 * or cabinet are selected), the DSP engine SHALL process audio through stages
 * in the fixed canonical order:
 *   Input Settings → Preamp FX → Preamp Tubes → Amplifier → FX Loop → Cabinet → Output Settings.
 *
 * After any operation (add pedal, remove pedal, reorder pedals, change amp,
 * change cabinet), the stage order must remain fixed.
 * Pedal reordering within a stage must not affect the inter-stage order.
 */
describe('Property 2: Signal chain processing order invariant', () => {
  const EXPECTED_ORDER = [
    'input',
    'preampFx',
    'preampTubes',
    'amplifier',
    'fxLoop',
    'cabinet',
    'output',
  ] as const;

  // ── Arbitraries ────────────────────────────────────────────────

  const pedalStageArb: fc.Arbitrary<PedalStageId> = fc.constantFrom(
    'preampFx' as PedalStageId,
    'fxLoop' as PedalStageId,
  );

  const pedalInstanceArb: fc.Arbitrary<FxPedalInstance> = fc.record({
    definitionId: fc.constantFrom(
      'mac-super-comp',
      'mac-dyna-comp',
      'king-super-overdrive',
      'king-distortion',
      'manhattan-big-muff',
      'tokyo-tube-screamer',
    ),
    instanceId: fc.uuid(),
    enabled: fc.boolean(),
    parameters: fc.constant({ output: 5, sensitivity: 5 }),
    position: fc.nat({ max: 20 }),
  });

  const ampModelIdArb = fc.constantFrom(
    'winston-chl',
    'us-steel-plate',
    'twanger-banger',
    'fizzle-0505',
    'fuzzy-acidtrip',
    'blitzkrieg-warfare',
    'berlin-wall',
  );

  const cabinetIdArb = fc.constantFrom(
    'cab-winston-4x12',
    'cab-winston-4x12v',
    'cab-winston-2x12v',
    'cab-fuzzy-4x12',
    'cab-fuzzy-2x12',
    'cab-us-steel-4x12',
    'cab-twanger-1',
  );

  /** An operation that can be performed on the signal chain. */
  type ChainOperation =
    | { type: 'addPedal'; stageId: PedalStageId; pedal: FxPedalInstance }
    | { type: 'removePedal'; stageId: PedalStageId; instanceId: string }
    | { type: 'reorderPedals'; stageId: PedalStageId }
    | { type: 'setAmpModel'; modelId: string }
    | { type: 'setCabinet'; cabinetId: string }
    | { type: 'setPreampTubeCount'; count: number }
    | { type: 'togglePedal'; stageId: PedalStageId; enabled: boolean }
    | { type: 'setInputGain'; gain: number }
    | { type: 'setOutputVolume'; volume: number }
    | { type: 'setMicPosition'; x: number; y: number; z: number }
    | { type: 'setMicType'; micType: 'condenser' | 'ribbon' | 'dynamic' };

  const operationArb: fc.Arbitrary<ChainOperation> = fc.oneof(
    fc.record({
      type: fc.constant('addPedal' as const),
      stageId: pedalStageArb,
      pedal: pedalInstanceArb,
    }),
    fc.record({
      type: fc.constant('removePedal' as const),
      stageId: pedalStageArb,
      instanceId: fc.uuid(),
    }),
    fc.record({
      type: fc.constant('reorderPedals' as const),
      stageId: pedalStageArb,
    }),
    fc.record({
      type: fc.constant('setAmpModel' as const),
      modelId: ampModelIdArb,
    }),
    fc.record({
      type: fc.constant('setCabinet' as const),
      cabinetId: cabinetIdArb,
    }),
    fc.record({
      type: fc.constant('setPreampTubeCount' as const),
      count: fc.integer({ min: 1, max: 8 }),
    }),
    fc.record({
      type: fc.constant('togglePedal' as const),
      stageId: pedalStageArb,
      enabled: fc.boolean(),
    }),
    fc.record({
      type: fc.constant('setInputGain' as const),
      gain: fc.double({ min: 0, max: 1, noNaN: true }),
    }),
    fc.record({
      type: fc.constant('setOutputVolume' as const),
      volume: fc.double({ min: 0, max: 1, noNaN: true }),
    }),
    fc.record({
      type: fc.constant('setMicPosition' as const),
      x: fc.double({ min: -1, max: 1, noNaN: true }),
      y: fc.double({ min: -1, max: 1, noNaN: true }),
      z: fc.double({ min: 0, max: 1, noNaN: true }),
    }),
    fc.record({
      type: fc.constant('setMicType' as const),
      micType: fc.constantFrom('condenser' as const, 'ribbon' as const, 'dynamic' as const),
    }),
  );

  // ── Helpers ────────────────────────────────────────────────────

  /** Apply an operation to the manager synchronously. */
  function applyOperation(
    manager: SignalChainManagerImpl,
    op: ChainOperation,
  ): void {
    switch (op.type) {
      case 'addPedal':
        manager.addPedal(op.stageId, op.pedal);
        break;
      case 'removePedal':
        manager.removePedal(op.stageId, op.instanceId);
        break;
      case 'reorderPedals': {
        const state = manager.getSignalChainState();
        const pedals =
          op.stageId === 'preampFx' ? state.preampFx : state.fxLoop;
        if (pedals.length > 1) {
          const reversed = [...pedals].reverse().map((p) => p.instanceId);
          manager.reorderPedals(op.stageId, reversed);
        }
        break;
      }
      case 'setAmpModel':
        // setAmpModel returns a Promise but the state mutation is synchronous
        void manager.setAmpModel(op.modelId);
        break;
      case 'setCabinet':
        void manager.setCabinet(op.cabinetId);
        break;
      case 'setPreampTubeCount':
        manager.setPreampTubeCount(op.count);
        break;
      case 'togglePedal': {
        const state = manager.getSignalChainState();
        const pedals =
          op.stageId === 'preampFx' ? state.preampFx : state.fxLoop;
        if (pedals.length > 0) {
          manager.setPedalEnabled(op.stageId, pedals[0].instanceId, op.enabled);
        }
        break;
      }
      case 'setInputGain':
        manager.setInputSettings({ inputGain: op.gain });
        break;
      case 'setOutputVolume':
        manager.setOutputSettings({ masterVolume: op.volume });
        break;
      case 'setMicPosition':
        manager.setMicPosition(op.x, op.y, op.z);
        break;
      case 'setMicType':
        manager.setMicType(op.micType);
        break;
    }
  }

  // ── Property Tests ─────────────────────────────────────────────

  it('stage order matches the canonical fixed order on a fresh manager', () => {
    const manager = new SignalChainManagerImpl();
    expect([...manager.getStageOrder()]).toEqual([...EXPECTED_ORDER]);
  });

  it('STAGE_ORDER constant matches the expected canonical order', () => {
    expect([...STAGE_ORDER]).toEqual([...EXPECTED_ORDER]);
  });

  it('stage order is preserved after any sequence of operations', () => {
    fc.assert(
      fc.property(
        fc.array(operationArb, { minLength: 1, maxLength: 20 }),
        (operations) => {
          const manager = new SignalChainManagerImpl();

          expect([...manager.getStageOrder()]).toEqual([...EXPECTED_ORDER]);

          for (const op of operations) {
            applyOperation(manager, op);
          }

          expect([...manager.getStageOrder()]).toEqual([...EXPECTED_ORDER]);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('signal chain state always has stages in the correct structural order', () => {
    fc.assert(
      fc.property(
        fc.array(operationArb, { minLength: 1, maxLength: 15 }),
        (operations) => {
          const manager = new SignalChainManagerImpl();

          for (const op of operations) {
            applyOperation(manager, op);
          }

          const state = manager.getSignalChainState();

          // The state object must contain all stage properties
          expect(state).toHaveProperty('inputSettings');
          expect(state).toHaveProperty('preampFx');
          expect(state).toHaveProperty('preampTubes');
          expect(state).toHaveProperty('amplifier');
          expect(state).toHaveProperty('fxLoop');
          expect(state).toHaveProperty('cabinet');
          expect(state).toHaveProperty('outputSettings');

          // Verify the structural key order matches the expected stage order
          const stateKeys = Object.keys(state);
          const expectedKeys = [
            'inputSettings',
            'preampFx',
            'preampTubes',
            'amplifier',
            'fxLoop',
            'cabinet',
            'outputSettings',
          ];
          expect(stateKeys).toEqual(expectedKeys);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('pedal reordering within a stage does not affect inter-stage order', () => {
    fc.assert(
      fc.property(
        pedalStageArb,
        fc.array(pedalInstanceArb, { minLength: 2, maxLength: 8 }),
        (stageId, pedals) => {
          const manager = new SignalChainManagerImpl();

          // Add pedals with unique instance IDs
          const uniquePedals = pedals.map((p, i) => ({
            ...p,
            instanceId: `pedal-${i}`,
            position: i,
          }));

          for (const pedal of uniquePedals) {
            manager.addPedal(stageId, pedal);
          }

          const orderBefore = [...manager.getStageOrder()];

          // Reorder pedals (reverse them)
          const reversed = [...uniquePedals].reverse().map((p) => p.instanceId);
          manager.reorderPedals(stageId, reversed);

          // Stage order must be unchanged
          const orderAfter = [...manager.getStageOrder()];
          expect(orderAfter).toEqual(orderBefore);
          expect(orderAfter).toEqual([...EXPECTED_ORDER]);

          // Verify pedals were actually reordered within the stage
          const state = manager.getSignalChainState();
          const stagePedals =
            stageId === 'preampFx' ? state.preampFx : state.fxLoop;
          const reorderedIds = stagePedals.map((p) => p.instanceId);
          expect(reorderedIds).toEqual(reversed);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('adding and removing pedals does not affect the stage order', () => {
    fc.assert(
      fc.property(
        pedalStageArb,
        fc.array(pedalInstanceArb, { minLength: 1, maxLength: 10 }),
        fc.nat({ max: 9 }),
        (stageId, pedals, removeIdx) => {
          const manager = new SignalChainManagerImpl();

          const uniquePedals = pedals.map((p, i) => ({
            ...p,
            instanceId: `pedal-${i}`,
            position: i,
          }));

          for (const pedal of uniquePedals) {
            manager.addPedal(stageId, pedal);
          }

          expect([...manager.getStageOrder()]).toEqual([...EXPECTED_ORDER]);

          // Remove a pedal
          const idx = removeIdx % uniquePedals.length;
          manager.removePedal(stageId, uniquePedals[idx].instanceId);

          expect([...manager.getStageOrder()]).toEqual([...EXPECTED_ORDER]);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('changing amp model does not affect the stage order', () => {
    fc.assert(
      fc.property(ampModelIdArb, (modelId) => {
        const manager = new SignalChainManagerImpl();
        void manager.setAmpModel(modelId);
        expect([...manager.getStageOrder()]).toEqual([...EXPECTED_ORDER]);

        const state = manager.getSignalChainState();
        expect(state.amplifier.modelId).toBe(modelId);
      }),
      { numRuns: 100 },
    );
  });

  it('changing cabinet does not affect the stage order', () => {
    fc.assert(
      fc.property(cabinetIdArb, (cabinetId) => {
        const manager = new SignalChainManagerImpl();
        void manager.setCabinet(cabinetId);
        expect([...manager.getStageOrder()]).toEqual([...EXPECTED_ORDER]);

        const state = manager.getSignalChainState();
        expect(state.cabinet.cabinetId).toBe(cabinetId);
      }),
      { numRuns: 100 },
    );
  });
});
