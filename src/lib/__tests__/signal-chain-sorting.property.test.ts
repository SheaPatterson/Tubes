import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sortSignalChains } from '@/lib/signal-chain-sorting';
import type { SavedSignalChain } from '@/types/signal-chain';

/**
 * Property 14: Saved signal chain list sorting
 * **Validates: Requirements 13.6**
 *
 * For any list of saved signal chains, sorting by name SHALL produce a list
 * in case-insensitive alphabetical order, and sorting by last modified date
 * SHALL produce a list in reverse chronological order (most recent first).
 * The sort SHALL be stable (equal elements preserve their relative order).
 */
describe('Property 14: Saved signal chain list sorting', () => {
  /** Minimal SavedSignalChain generator — only name, updatedAt, and id matter for sorting. */
  const savedChainArb: fc.Arbitrary<SavedSignalChain> = fc.record({
    id: fc.uuid(),
    userId: fc.uuid(),
    name: fc.string({ minLength: 0, maxLength: 30 }),
    config: fc.constant({
      inputSettings: { inputGain: 0.5, noiseGateEnabled: false, noiseGateThreshold: 0, noiseGateRelease: 0 },
      preampFx: [],
      preampTubes: { tubeCount: 1, stageGains: [1] },
      amplifier: { modelId: 'test', parameters: { preampGain: 5, volume: 5, masterVolume: 5, masterGain: 5, bass: 5, middle: 5, treble: 5, tone: 5, presence: 5, resonance: 5, channel: 'clean' as const, toggles: {} } },
      fxLoop: [],
      cabinet: { cabinetId: 'test', mic: { type: 'dynamic' as const, position: { x: 0, y: 0, z: 0 }, distance: 0.5 } },
      outputSettings: { masterVolume: 0.5, outputGain: 0.5 },
    }),
    createdAt: fc.integer({ min: 1_000_000_000_000, max: 2_000_000_000_000 }),
    updatedAt: fc.integer({ min: 1_000_000_000_000, max: 2_000_000_000_000 }),
  });

  const chainListArb = fc.array(savedChainArb, { minLength: 0, maxLength: 20 });

  it('sorting by name produces case-insensitive alphabetical order', () => {
    fc.assert(
      fc.property(chainListArb, (chains) => {
        const sorted = sortSignalChains(chains, 'name');
        for (let i = 1; i < sorted.length; i++) {
          const cmp = sorted[i - 1].name.localeCompare(sorted[i].name, undefined, { sensitivity: 'base' });
          expect(cmp).toBeLessThanOrEqual(0);
        }
      }),
      { numRuns: 200 },
    );
  });

  it('sorting by updatedAt produces reverse chronological order (most recent first)', () => {
    fc.assert(
      fc.property(chainListArb, (chains) => {
        const sorted = sortSignalChains(chains, 'updatedAt');
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i - 1].updatedAt).toBeGreaterThanOrEqual(sorted[i].updatedAt);
        }
      }),
      { numRuns: 200 },
    );
  });

  it('sorting preserves all original elements (no additions or removals)', () => {
    fc.assert(
      fc.property(chainListArb, (chains) => {
        const sortedByName = sortSignalChains(chains, 'name');
        const sortedByDate = sortSignalChains(chains, 'updatedAt');

        expect(sortedByName.length).toBe(chains.length);
        expect(sortedByDate.length).toBe(chains.length);

        const originalIds = chains.map((c) => c.id).sort();
        const nameSortedIds = sortedByName.map((c) => c.id).sort();
        const dateSortedIds = sortedByDate.map((c) => c.id).sort();

        expect(nameSortedIds).toEqual(originalIds);
        expect(dateSortedIds).toEqual(originalIds);
      }),
      { numRuns: 200 },
    );
  });

  it('sorting does not mutate the original array', () => {
    fc.assert(
      fc.property(chainListArb, (chains) => {
        const originalOrder = chains.map((c) => c.id);
        sortSignalChains(chains, 'name');
        sortSignalChains(chains, 'updatedAt');
        expect(chains.map((c) => c.id)).toEqual(originalOrder);
      }),
      { numRuns: 200 },
    );
  });

  it('sort by name is stable — equal-name elements preserve relative order', () => {
    // Generate chains where some share the same name to test stability
    const sharedNameArb = fc.string({ minLength: 1, maxLength: 10 });
    const stableChainListArb = sharedNameArb.chain((sharedName) =>
      fc.array(
        fc.record({
          id: fc.uuid(),
          userId: fc.uuid(),
          name: fc.constantFrom(sharedName, sharedName.toUpperCase(), sharedName.toLowerCase()),
          config: fc.constant({
            inputSettings: { inputGain: 0.5, noiseGateEnabled: false, noiseGateThreshold: 0, noiseGateRelease: 0 },
            preampFx: [],
            preampTubes: { tubeCount: 1, stageGains: [1] },
            amplifier: { modelId: 'test', parameters: { preampGain: 5, volume: 5, masterVolume: 5, masterGain: 5, bass: 5, middle: 5, treble: 5, tone: 5, presence: 5, resonance: 5, channel: 'clean' as const, toggles: {} } },
            fxLoop: [],
            cabinet: { cabinetId: 'test', mic: { type: 'dynamic' as const, position: { x: 0, y: 0, z: 0 }, distance: 0.5 } },
            outputSettings: { masterVolume: 0.5, outputGain: 0.5 },
          }),
          createdAt: fc.integer({ min: 1_000_000_000_000, max: 2_000_000_000_000 }),
          updatedAt: fc.integer({ min: 1_000_000_000_000, max: 2_000_000_000_000 }),
        }),
        { minLength: 2, maxLength: 10 },
      ),
    );

    fc.assert(
      fc.property(stableChainListArb, (chains) => {
        const sorted = sortSignalChains(chains, 'name');
        // For elements with equal names (case-insensitive), their relative order should be preserved
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i - 1].name.localeCompare(sorted[i].name, undefined, { sensitivity: 'base' }) === 0) {
            const origIdxA = chains.findIndex((c) => c.id === sorted[i - 1].id);
            const origIdxB = chains.findIndex((c) => c.id === sorted[i].id);
            expect(origIdxA).toBeLessThan(origIdxB);
          }
        }
      }),
      { numRuns: 200 },
    );
  });

  it('sort by updatedAt is stable — equal-date elements preserve relative order', () => {
    const sharedDateArb = fc.integer({ min: 1_000_000_000_000, max: 2_000_000_000_000 });
    const stableDateListArb = sharedDateArb.chain((sharedDate) =>
      fc.array(
        fc.record({
          id: fc.uuid(),
          userId: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 10 }),
          config: fc.constant({
            inputSettings: { inputGain: 0.5, noiseGateEnabled: false, noiseGateThreshold: 0, noiseGateRelease: 0 },
            preampFx: [],
            preampTubes: { tubeCount: 1, stageGains: [1] },
            amplifier: { modelId: 'test', parameters: { preampGain: 5, volume: 5, masterVolume: 5, masterGain: 5, bass: 5, middle: 5, treble: 5, tone: 5, presence: 5, resonance: 5, channel: 'clean' as const, toggles: {} } },
            fxLoop: [],
            cabinet: { cabinetId: 'test', mic: { type: 'dynamic' as const, position: { x: 0, y: 0, z: 0 }, distance: 0.5 } },
            outputSettings: { masterVolume: 0.5, outputGain: 0.5 },
          }),
          createdAt: fc.integer({ min: 1_000_000_000_000, max: 2_000_000_000_000 }),
          updatedAt: fc.constant(sharedDate),
        }),
        { minLength: 2, maxLength: 10 },
      ),
    );

    fc.assert(
      fc.property(stableDateListArb, (chains) => {
        const sorted = sortSignalChains(chains, 'updatedAt');
        // All have the same updatedAt, so relative order must be preserved
        for (let i = 0; i < sorted.length; i++) {
          const origIdx = chains.findIndex((c) => c.id === sorted[i].id);
          if (i > 0) {
            const prevOrigIdx = chains.findIndex((c) => c.id === sorted[i - 1].id);
            expect(prevOrigIdx).toBeLessThan(origIdx);
          }
        }
      }),
      { numRuns: 200 },
    );
  });
});
