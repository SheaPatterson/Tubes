import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ampModels } from '@/data/amp-models';
import { fxPedals } from '@/data/fx-pedals';
import { brandRenameMap } from '@/data/brand-rename';
import type { FxBrandRename } from '@/types/fx';

// ── Property 10: Model and pedal control completeness ──

/**
 * Property 10: Model and pedal control completeness
 * **Validates: Requirements 3.6, 6.3**
 *
 * Every amp model must have all 10 required control definitions
 * (preampGain, volume, masterVolume, masterGain, bass, middle, treble,
 * tone, presence, resonance).
 * Every FX pedal must have at least 1 control.
 */
describe('Property 10: Model and pedal control completeness', () => {
  const REQUIRED_AMP_CONTROLS = [
    'preampGain',
    'volume',
    'masterVolume',
    'masterGain',
    'bass',
    'middle',
    'treble',
    'tone',
    'presence',
    'resonance',
  ] as const;

  const modelArb = fc.constantFrom(...ampModels);
  const pedalArb = fc.constantFrom(...fxPedals);

  it('every amp model has all 10 required control definitions', () => {
    fc.assert(
      fc.property(modelArb, (model) => {
        const controlKeys = model.controls.map((c) => c.paramKey);
        for (const required of REQUIRED_AMP_CONTROLS) {
          expect(controlKeys).toContain(required);
        }
        expect(controlKeys.length).toBeGreaterThanOrEqual(REQUIRED_AMP_CONTROLS.length);
      }),
      { numRuns: 100 },
    );
  });

  it('every amp model control has valid min, max, and defaultValue', () => {
    fc.assert(
      fc.property(modelArb, (model) => {
        for (const control of model.controls) {
          expect(control.min).toBeLessThanOrEqual(control.max);
          expect(control.defaultValue).toBeGreaterThanOrEqual(control.min);
          expect(control.defaultValue).toBeLessThanOrEqual(control.max);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('every FX pedal has at least 1 control', () => {
    fc.assert(
      fc.property(pedalArb, (pedal) => {
        expect(pedal.controls.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });

  it('every FX pedal control has valid parameter ranges', () => {
    fc.assert(
      fc.property(pedalArb, (pedal) => {
        for (const control of pedal.controls) {
          expect(control.min).toBeLessThanOrEqual(control.max);
          expect(control.defaultValue).toBeGreaterThanOrEqual(control.min);
          expect(control.defaultValue).toBeLessThanOrEqual(control.max);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ── Property 11: Brand rename consistency ──

/**
 * Property 11: Brand rename consistency
 * **Validates: Requirements 19.1**
 *
 * Every FX pedal's brand field must be one of the renamed brands
 * (MAC, KING, Manhattan, TOKYO).
 * Every FX pedal's originalBrand must map to its brand via the
 * brand rename mapping.
 */
describe('Property 11: Brand rename consistency', () => {
  const VALID_BRANDS: FxBrandRename[] = ['MAC', 'KING', 'Manhattan', 'TOKYO'];
  const pedalArb = fc.constantFrom(...fxPedals);

  it('every FX pedal brand is one of the renamed brands', () => {
    fc.assert(
      fc.property(pedalArb, (pedal) => {
        expect(VALID_BRANDS).toContain(pedal.brand);
      }),
      { numRuns: 100 },
    );
  });

  it('every FX pedal originalBrand maps to its brand via brandRenameMap', () => {
    fc.assert(
      fc.property(pedalArb, (pedal) => {
        const expectedBrand = brandRenameMap[pedal.originalBrand];
        expect(expectedBrand).toBeDefined();
        expect(pedal.brand).toBe(expectedBrand);
      }),
      { numRuns: 100 },
    );
  });

  it('no original manufacturer name appears as the brand field', () => {
    const originalNames = Object.keys(brandRenameMap);
    fc.assert(
      fc.property(pedalArb, (pedal) => {
        expect(originalNames).not.toContain(pedal.brand);
      }),
      { numRuns: 100 },
    );
  });
});
