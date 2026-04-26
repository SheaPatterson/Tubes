import type { SubscriptionTier } from '@/types/user';
import { ampModels } from '@/data/amp-models';
import { fxPedals } from '@/data/fx-pedals';
import { cabinets } from '@/data/cabinets';

export type ContentType = 'amp' | 'pedal' | 'cabinet';

export interface AccessCheckResult {
  allowed: boolean;
  requiredTier?: SubscriptionTier;
  upgradeMessage?: string;
}

/** IDs of content available on the Free tier. */
const FREE_AMP_IDS = new Set([ampModels[0].id]);
const FREE_PEDAL_IDS = new Set(
  fxPedals.filter((p) => p.tierRequired === 'free').map((p) => p.id)
);
const FREE_CABINET_IDS = new Set([cabinets[0].id]);

/** All valid content IDs by type. */
const ALL_AMP_IDS = new Set(ampModels.map((a) => a.id));
const ALL_PEDAL_IDS = new Set(fxPedals.map((p) => p.id));
const ALL_CABINET_IDS = new Set(cabinets.map((c) => c.id));

function allContentIds(contentType: ContentType): Set<string> {
  switch (contentType) {
    case 'amp':
      return ALL_AMP_IDS;
    case 'pedal':
      return ALL_PEDAL_IDS;
    case 'cabinet':
      return ALL_CABINET_IDS;
  }
}

function freeContentIds(contentType: ContentType): Set<string> {
  switch (contentType) {
    case 'amp':
      return FREE_AMP_IDS;
    case 'pedal':
      return FREE_PEDAL_IDS;
    case 'cabinet':
      return FREE_CABINET_IDS;
  }
}

const CONTENT_LABELS: Record<ContentType, string> = {
  amp: 'amp model',
  pedal: 'FX pedal',
  cabinet: 'cabinet',
};

/**
 * Check whether a user with the given subscription tier can access
 * a specific piece of content.
 *
 * - Free tier: restricted to a curated subset (1 amp, free-tier pedals, 1 cabinet).
 * - Classic tier: all amps, pedals, and cabinets.
 * - Next Gen tier: everything Classic allows plus AI features.
 */
export function checkContentAccess(
  tier: SubscriptionTier,
  contentType: ContentType,
  contentId: string,
): AccessCheckResult {
  // Unknown content is always denied
  if (!allContentIds(contentType).has(contentId)) {
    return {
      allowed: false,
      requiredTier: 'classic',
      upgradeMessage: `Unknown ${CONTENT_LABELS[contentType]}: "${contentId}".`,
    };
  }

  // Classic and Next Gen tiers have full access to all content
  if (tier === 'classic' || tier === 'next_gen') {
    return { allowed: true };
  }

  // Free tier — check against the allowed free-tier set
  if (freeContentIds(contentType).has(contentId)) {
    return { allowed: true };
  }

  // Determine the minimum tier needed for this content
  let requiredTier: SubscriptionTier = 'classic';
  if (contentType === 'pedal') {
    const pedal = fxPedals.find((p) => p.id === contentId);
    if (pedal && pedal.tierRequired === 'next_gen') {
      requiredTier = 'next_gen';
    }
  }

  return {
    allowed: false,
    requiredTier,
    upgradeMessage: `Upgrade to ${requiredTier === 'next_gen' ? 'Next Gen' : 'Classic'} to unlock this ${CONTENT_LABELS[contentType]}.`,
  };
}
