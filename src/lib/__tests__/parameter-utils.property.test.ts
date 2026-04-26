import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { clampValue, validatePreampTubeCount } from '@/lib/parameter-utils';
import { ampModels } from '@/data/amp-models';

// ── Property 12: Parameter value clamping ──

/**
 * Property 12: Parameter value clamping
 * **Validates: Requirements 26.5**
 *
 * For any numeric value and any [min, max] range where min <= max,
 * clampValue should return a value in [min, max].
 * If value is already in range, it should be returned unchanged.
 */
describe('Property 12: Parameter value clamping', () => {
  const rangeArb = fc
    .tuple(fc.double({ min: -1e6, max: 1e6, noNaN: true }), fc.double({ min: -1e6, max: 1e6, noNaN: true }))
    .filter(([a, b]) => a <= b)
    .map(([a, b]) => ({ min: a, max: b }));

  const valueArb = fc.double({ min: -1e6, max: 1e6, noNaN: true });

  it('clamped value is always within [min, max]', () => {
    fc.assert(
      fc.property(valueArb, rangeArb, (value, { min, max }) => {
        const result = clampValue(value, min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
      }),
      { numRuns: 200 },
    );
  });

  it('value already in range is returned unchanged', () => {
    fc.assert(
      fc.property(
        rangeArb.chain(({ min, max }) =>
          fc.tuple(fc.constant(min), fc.constant(max), fc.double({ min, max, noNaN: true })),
        ),
        ([min, max, value]) => {
          const result = clampValue(value, min, max);
          expect(result).toBe(value);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('value below min returns min', () => {
    fc.assert(
      fc.property(rangeArb, valueArb, ({ min, max }, offset) => {
        const belowMin = min - Math.abs(offset) - 1;
        const result = clampValue(belowMin, min, max);
        expect(result).toBe(min);
      }),
      { numRuns: 200 },
    );
  });

  it('value above max returns max', () => {
    fc.assert(
      fc.property(rangeArb, valueArb, ({ min, max }, offset) => {
        const aboveMax = max + Math.abs(offset) + 1;
        const result = clampValue(aboveMax, min, max);
        expect(result).toBe(max);
      }),
      { numRuns: 200 },
    );
  });
});

// ── Property 9: Preamp tube count validation ──

/**
 * Property 9: Preamp tube count validation
 * **Validates: Requirements 4.1**
 *
 * For any amp model and any integer tube count, validatePreampTubeCount
 * should return valid=true iff count is in [1, model.preampStageCount].
 */
describe('Property 9: Preamp tube count validation', () => {
  const modelArb = fc.constantFrom(...ampModels);
  const tubeCountArb = fc.integer({ min: -10, max: 20 });

  it('returns valid=true iff count is in [1, model.preampStageCount]', () => {
    fc.assert(
      fc.property(modelArb, tubeCountArb, (model, count) => {
        const result = validatePreampTubeCount(count, model);
        const expectedValid = count >= 1 && count <= model.preampStageCount;
        expect(result.valid).toBe(expectedValid);
      }),
      { numRuns: 200 },
    );
  });

  it('valid counts produce no error message', () => {
    fc.assert(
      fc.property(
        modelArb.chain((model) =>
          fc.tuple(
            fc.constant(model),
            fc.integer({ min: 1, max: model.preampStageCount }),
          ),
        ),
        ([model, count]) => {
          const result = validatePreampTubeCount(count, model);
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('invalid counts produce an error message', () => {
    fc.assert(
      fc.property(
        modelArb.chain((model) =>
          fc.tuple(
            fc.constant(model),
            fc.oneof(
              fc.integer({ min: -100, max: 0 }),
              fc.integer({ min: model.preampStageCount + 1, max: model.preampStageCount + 100 }),
            ),
          ),
        ),
        ([model, count]) => {
          const result = validatePreampTubeCount(count, model);
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('non-integer counts are always invalid', () => {
    fc.assert(
      fc.property(
        modelArb,
        fc.double({ min: 0.1, max: 20, noNaN: true }).filter((n) => !Number.isInteger(n)),
        (model, count) => {
          const result = validatePreampTubeCount(count, model);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('integer');
        },
      ),
      { numRuns: 100 },
    );
  });
});
