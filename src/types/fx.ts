import type { SubscriptionTier } from '@/types/user';

export type FxCategory =
  | 'overdrive'
  | 'distortion'
  | 'delay'
  | 'modulation'
  | 'compression'
  | 'eq'
  | 'gate'
  | 'multi';

export type FxBrandRename = 'MAC' | 'KING' | 'Manhattan' | 'TOKYO';

export interface FxPedalDefinition {
  id: string;
  name: string;
  brand: FxBrandRename;
  originalBrand: string;
  category: FxCategory;
  controls: FxControlDefinition[];
  circuitType: string;
  visualConfig: FxPedalVisualConfig;
  tierRequired: SubscriptionTier;
}

export interface FxPedalInstance {
  definitionId: string;
  instanceId: string;
  enabled: boolean;
  parameters: Record<string, number>;
  position: number;
}

export interface FxControlDefinition {
  name: string;
  paramKey: string;
  type: 'knob' | 'switch' | 'slider';
  min: number;
  max: number;
  defaultValue: number;
  step: number;
}

export interface FxPedalVisualConfig {
  bodyColor: string;
  knobStyle: string;
  labelFont: string;
  logoSvgPath: string;
  width: number;
  height: number;
}
