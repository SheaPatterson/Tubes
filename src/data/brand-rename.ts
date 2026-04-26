import type { FxBrandRename } from '@/types/fx';

export interface BrandRenameMapping {
  original: string;
  renamed: FxBrandRename;
}

export const brandRenameMap: Record<string, FxBrandRename> = {
  MXR: 'MAC',
  BOSS: 'KING',
  'Electro-Harmonix': 'Manhattan',
  Ibanez: 'TOKYO',
};

export const brandRenameMappings: BrandRenameMapping[] = [
  { original: 'MXR', renamed: 'MAC' },
  { original: 'BOSS', renamed: 'KING' },
  { original: 'Electro-Harmonix', renamed: 'Manhattan' },
  { original: 'Ibanez', renamed: 'TOKYO' },
];

export function getBrandRename(originalBrand: string): FxBrandRename | undefined {
  return brandRenameMap[originalBrand];
}

export function getOriginalBrand(renamed: FxBrandRename): string | undefined {
  const entry = brandRenameMappings.find((m) => m.renamed === renamed);
  return entry?.original;
}
