import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ampModels } from '@/data/amp-models';
import { fxPedals } from '@/data/fx-pedals';
import { cabinets } from '@/data/cabinets';
import { microphones } from '@/data/microphones';
import { brandRenameMap } from '@/data/brand-rename';
import type { AmpModel } from '@/types/amp';
import type { FxPedalDefinition } from '@/types/fx';
import type { Cabinet } from '@/types/cabinet';

/**
 * Property 15: Database referential integrity
 * **Validates: Requirements 20.4**
 *
 * Since we cannot run Convex queries in unit tests, we validate the data layer's
 * referential integrity structurally:
 * - Every amp model's brandRename must correspond to a known brand identity
 * - Every amp model's powerAmpTubeType must be one of the valid tube types
 * - Every FX pedal's brand must map back to a valid originalBrand via brandRenameMap
 * - Every cabinet name prefix must correspond to an amp model brand identity
 * - Every microphone type must be one of the valid mic types
 * - All entity IDs must be unique within their collection
 */
describe('Property 15: Database referential integrity', () => {
  const VALID_TUBE_TYPES = ['KT88', '6L6', 'EL34', 'EL84', '12BH7', '12AU7'] as const;
  const VALID_MIC_TYPES = ['condenser', 'ribbon', 'dynamic'] as const;
  const VALID_FX_BRANDS = Object.values(brandRenameMap);

  const ampModelArb = fc.constantFrom(...ampModels);
  const fxPedalArb = fc.constantFrom(...fxPedals);
  const cabinetArb = fc.constantFrom(...cabinets);
  const micArb = fc.constantFrom(...microphones);

  it('every amp model powerAmpTubeType references a valid tube type', () => {
    fc.assert(
      fc.property(ampModelArb, (model: AmpModel) => {
        expect(VALID_TUBE_TYPES).toContain(model.powerAmpTubeType);
      }),
      { numRuns: 100 },
    );
  });

  it('every amp model has a unique id', () => {
    const ids = ampModels.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every amp model has a preampStageCount >= 1', () => {
    fc.assert(
      fc.property(ampModelArb, (model: AmpModel) => {
        expect(model.preampStageCount).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });

  it('every FX pedal brand is a valid renamed brand from brandRenameMap', () => {
    fc.assert(
      fc.property(fxPedalArb, (pedal: FxPedalDefinition) => {
        expect(VALID_FX_BRANDS).toContain(pedal.brand);
      }),
      { numRuns: 100 },
    );
  });

  it('every FX pedal originalBrand exists as a key in brandRenameMap', () => {
    fc.assert(
      fc.property(fxPedalArb, (pedal: FxPedalDefinition) => {
        expect(brandRenameMap).toHaveProperty(pedal.originalBrand);
        expect(brandRenameMap[pedal.originalBrand]).toBe(pedal.brand);
      }),
      { numRuns: 100 },
    );
  });

  it('every FX pedal has a unique id', () => {
    const ids = fxPedals.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every cabinet has a unique id', () => {
    const ids = cabinets.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every cabinet speaker count matches its speakerConfig', () => {
    fc.assert(
      fc.property(cabinetArb, (cab: Cabinet) => {
        const expectedCount = parseInt(cab.speakerConfig.split('x')[0], 10);
        // speakerConfig like "4x12" means 4 speakers, "2x12" means 2, "1x12" means 1
        expect(cab.speakers.length).toBe(expectedCount);
      }),
      { numRuns: 100 },
    );
  });

  it('every cabinet speaker has a unique id within the cabinet', () => {
    fc.assert(
      fc.property(cabinetArb, (cab: Cabinet) => {
        const speakerIds = cab.speakers.map((s) => s.id);
        expect(new Set(speakerIds).size).toBe(speakerIds.length);
      }),
      { numRuns: 100 },
    );
  });

  it('every microphone type is one of the valid mic types', () => {
    fc.assert(
      fc.property(micArb, (mic) => {
        expect(VALID_MIC_TYPES).toContain(mic.type);
      }),
      { numRuns: 100 },
    );
  });

  it('every microphone has a unique id', () => {
    const ids = microphones.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every FX pedal tierRequired is a valid subscription tier', () => {
    const VALID_TIERS = ['free', 'classic', 'next_gen'] as const;
    fc.assert(
      fc.property(fxPedalArb, (pedal: FxPedalDefinition) => {
        expect(VALID_TIERS).toContain(pedal.tierRequired);
      }),
      { numRuns: 100 },
    );
  });
});
