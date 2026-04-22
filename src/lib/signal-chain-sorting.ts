import type { SavedSignalChain } from '@/types/signal-chain';

export type SortField = 'name' | 'updatedAt';

/**
 * Sort saved signal chains by name (case-insensitive alphabetical)
 * or by last modified date (most recent first).
 * The sort is stable — equal elements preserve their relative order.
 */
export function sortSignalChains(
  chains: SavedSignalChain[],
  sortBy: SortField,
): SavedSignalChain[] {
  const copy = [...chains];
  if (sortBy === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  } else {
    copy.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  return copy;
}
