import { describe, it, expect } from 'vitest';
import { checkContentAccess } from '@/lib/access-control';
import type { SubscriptionTier } from '@/types/user';
import { ampModels } from '@/data/amp-models';
import { fxPedals } from '@/data/fx-pedals';
import { cabinets } from '@/data/cabinets';

describe('checkContentAccess', () => {
  // ── Free tier ──

  it('allows the first amp model on free tier', () => {
    const result = checkContentAccess('free', 'amp', ampModels[0].id);
    expect(result.allowed).toBe(true);
  });

  it('denies non-free amp models on free tier', () => {
    const result = checkContentAccess('free', 'amp', ampModels[1].id);
    expect(result.allowed).toBe(false);
    expect(result.requiredTier).toBe('classic');
    expect(result.upgradeMessage).toBeDefined();
  });

  it('allows free-tier pedals on free tier', () => {
    const freePedals = fxPedals.filter((p) => p.tierRequired === 'free');
    for (const pedal of freePedals) {
      const result = checkContentAccess('free', 'pedal', pedal.id);
      expect(result.allowed).toBe(true);
    }
  });

  it('denies classic-tier pedals on free tier', () => {
    const classicPedal = fxPedals.find((p) => p.tierRequired === 'classic');
    expect(classicPedal).toBeDefined();
    const result = checkContentAccess('free', 'pedal', classicPedal!.id);
    expect(result.allowed).toBe(false);
    expect(result.requiredTier).toBe('classic');
  });

  it('denies next_gen pedals on free tier with correct required tier', () => {
    const ngPedal = fxPedals.find((p) => p.tierRequired === 'next_gen');
    expect(ngPedal).toBeDefined();
    const result = checkContentAccess('free', 'pedal', ngPedal!.id);
    expect(result.allowed).toBe(false);
    expect(result.requiredTier).toBe('next_gen');
  });

  it('allows the first cabinet on free tier', () => {
    const result = checkContentAccess('free', 'cabinet', cabinets[0].id);
    expect(result.allowed).toBe(true);
  });

  it('denies non-free cabinets on free tier', () => {
    const result = checkContentAccess('free', 'cabinet', cabinets[1].id);
    expect(result.allowed).toBe(false);
    expect(result.requiredTier).toBe('classic');
  });

  // ── Classic tier ──

  it('allows all amps on classic tier', () => {
    for (const amp of ampModels) {
      expect(checkContentAccess('classic', 'amp', amp.id).allowed).toBe(true);
    }
  });

  it('allows all pedals on classic tier', () => {
    for (const pedal of fxPedals) {
      expect(checkContentAccess('classic', 'pedal', pedal.id).allowed).toBe(true);
    }
  });

  it('allows all cabinets on classic tier', () => {
    for (const cab of cabinets) {
      expect(checkContentAccess('classic', 'cabinet', cab.id).allowed).toBe(true);
    }
  });

  // ── Next Gen tier ──

  it('allows all content on next_gen tier', () => {
    for (const amp of ampModels) {
      expect(checkContentAccess('next_gen', 'amp', amp.id).allowed).toBe(true);
    }
    for (const pedal of fxPedals) {
      expect(checkContentAccess('next_gen', 'pedal', pedal.id).allowed).toBe(true);
    }
    for (const cab of cabinets) {
      expect(checkContentAccess('next_gen', 'cabinet', cab.id).allowed).toBe(true);
    }
  });

  // ── Unknown content ──

  it('denies unknown content IDs', () => {
    const result = checkContentAccess('classic', 'amp', 'nonexistent-amp');
    expect(result.allowed).toBe(false);
    expect(result.upgradeMessage).toContain('Unknown');
  });

  // ── Upgrade message ──

  it('includes an upgrade message when access is denied', () => {
    const result = checkContentAccess('free', 'amp', ampModels[1].id);
    expect(result.allowed).toBe(false);
    expect(result.upgradeMessage).toMatch(/Upgrade to Classic/);
  });
});
