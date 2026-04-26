import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { checkContentAccess, type ContentType } from '@/lib/access-control';
import type { SubscriptionTier } from '@/types/user';
import { ampModels } from '@/data/amp-models';
import { fxPedals } from '@/data/fx-pedals';
import { cabinets } from '@/data/cabinets';

/**
 * Property 1: Subscription tier access control
 * **Validates: Requirements 1.2, 1.3, 1.4, 6.7**
 *
 * For any user with a given subscription tier and for any content item
 * (amp model, FX pedal, or cabinet), the access control function SHALL
 * return true if and only if the content is within the tier's allowed set:
 * Free tier allows exactly 1 amp, free-tier pedals, 1 cabinet;
 * Classic and Next Gen tiers allow all content.
 */

// ── Arbitraries ──

const tierArb = fc.constantFrom<SubscriptionTier>('free', 'classic', 'next_gen');
const contentTypeArb = fc.constantFrom<ContentType>('amp', 'pedal', 'cabinet');

const allAmpIds = ampModels.map((a) => a.id);
const allPedalIds = fxPedals.map((p) => p.id);
const allCabinetIds = cabinets.map((c) => c.id);

const ampIdArb = fc.constantFrom(...allAmpIds);
const pedalIdArb = fc.constantFrom(...allPedalIds);
const cabinetIdArb = fc.constantFrom(...allCabinetIds);

/** Generates a valid content ID for a given content type. */
function validContentIdArb(contentType: ContentType): fc.Arbitrary<string> {
  switch (contentType) {
    case 'amp':
      return ampIdArb;
    case 'pedal':
      return pedalIdArb;
    case 'cabinet':
      return cabinetIdArb;
  }
}

/** Free-tier content sets derived from the actual data. */
const freeAmpIds = new Set([ampModels[0].id]);
const freePedalIds = new Set(
  fxPedals.filter((p) => p.tierRequired === 'free').map((p) => p.id),
);
const freeCabinetIds = new Set([cabinets[0].id]);

describe('Property 1: Subscription tier access control', () => {
  // ── Property 1a: Classic and Next Gen tiers always allow valid content ──
  it('classic and next_gen tiers always allow access to any valid content', () => {
    const paidTierArb = fc.constantFrom<SubscriptionTier>('classic', 'next_gen');

    fc.assert(
      fc.property(
        paidTierArb,
        contentTypeArb.chain((ct) => fc.tuple(fc.constant(ct), validContentIdArb(ct))),
        (tier, [contentType, contentId]) => {
          const result = checkContentAccess(tier, contentType, contentId);
          expect(result.allowed).toBe(true);
          expect(result.requiredTier).toBeUndefined();
          expect(result.upgradeMessage).toBeUndefined();
        },
      ),
      { numRuns: 200 },
    );
  });

  // ── Property 1b: Free tier allows only designated free-tier content ──
  it('free tier allows access only to designated free-tier content', () => {
    fc.assert(
      fc.property(
        contentTypeArb.chain((ct) => fc.tuple(fc.constant(ct), validContentIdArb(ct))),
        ([contentType, contentId]) => {
          const result = checkContentAccess('free', contentType, contentId);
          let isFreeContent: boolean;
          switch (contentType) {
            case 'amp':
              isFreeContent = freeAmpIds.has(contentId);
              break;
            case 'pedal':
              isFreeContent = freePedalIds.has(contentId);
              break;
            case 'cabinet':
              isFreeContent = freeCabinetIds.has(contentId);
              break;
          }
          expect(result.allowed).toBe(isFreeContent);
        },
      ),
      { numRuns: 200 },
    );
  });

  // ── Property 1c: Denied free-tier access includes requiredTier and upgradeMessage ──
  it('denied free-tier access always includes requiredTier and upgradeMessage', () => {
    // Build arbitraries for non-free content only
    const nonFreeAmpIds = allAmpIds.filter((id) => !freeAmpIds.has(id));
    const nonFreePedalIds = allPedalIds.filter((id) => !freePedalIds.has(id));
    const nonFreeCabinetIds = allCabinetIds.filter((id) => !freeCabinetIds.has(id));

    const nonFreeContentArb = fc.oneof(
      ...(nonFreeAmpIds.length > 0
        ? [fc.tuple(fc.constant<ContentType>('amp'), fc.constantFrom(...nonFreeAmpIds))]
        : []),
      ...(nonFreePedalIds.length > 0
        ? [fc.tuple(fc.constant<ContentType>('pedal'), fc.constantFrom(...nonFreePedalIds))]
        : []),
      ...(nonFreeCabinetIds.length > 0
        ? [fc.tuple(fc.constant<ContentType>('cabinet'), fc.constantFrom(...nonFreeCabinetIds))]
        : []),
    );

    fc.assert(
      fc.property(nonFreeContentArb, ([contentType, contentId]) => {
        const result = checkContentAccess('free', contentType, contentId);
        expect(result.allowed).toBe(false);
        expect(result.requiredTier).toBeDefined();
        expect(['classic', 'next_gen']).toContain(result.requiredTier);
        expect(result.upgradeMessage).toBeDefined();
        expect(typeof result.upgradeMessage).toBe('string');
        expect(result.upgradeMessage!.length).toBeGreaterThan(0);
      }),
      { numRuns: 200 },
    );
  });

  // ── Property 1d: Free tier allows exactly 1 amp, free-tier pedals, and 1 cabinet ──
  it('free tier allows exactly 1 amp, the free-tier pedals, and exactly 1 cabinet', () => {
    // Count allowed amps
    const allowedAmps = allAmpIds.filter(
      (id) => checkContentAccess('free', 'amp', id).allowed,
    );
    expect(allowedAmps).toHaveLength(1);

    // Count allowed pedals — must match exactly the pedals with tierRequired='free'
    const allowedPedals = allPedalIds.filter(
      (id) => checkContentAccess('free', 'pedal', id).allowed,
    );
    const expectedFreePedals = fxPedals
      .filter((p) => p.tierRequired === 'free')
      .map((p) => p.id);
    expect(allowedPedals.sort()).toEqual(expectedFreePedals.sort());

    // Count allowed cabinets
    const allowedCabinets = allCabinetIds.filter(
      (id) => checkContentAccess('free', 'cabinet', id).allowed,
    );
    expect(allowedCabinets).toHaveLength(1);
  });

  // ── Property 1e: Unknown content IDs are always denied for any tier ──
  it('unknown content IDs are always denied regardless of tier', () => {
    const knownIds = new Set([...allAmpIds, ...allPedalIds, ...allCabinetIds]);

    // Generate random strings that are NOT in the known set
    const unknownIdArb = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => !knownIds.has(s));

    fc.assert(
      fc.property(tierArb, contentTypeArb, unknownIdArb, (tier, contentType, unknownId) => {
        const result = checkContentAccess(tier, contentType, unknownId);
        expect(result.allowed).toBe(false);
        expect(result.upgradeMessage).toBeDefined();
      }),
      { numRuns: 200 },
    );
  });
});
