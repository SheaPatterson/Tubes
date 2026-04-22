export type AmpChannel = 'clean' | 'crunch' | 'overdrive';
export type PowerAmpTubeType = 'KT88' | '6L6' | 'EL34' | 'EL84' | '12BH7' | '12AU7';

export interface AmpModel {
  id: string;
  name: string;
  originalBrand: string;
  brandRename: string;
  channels: AmpChannel[];
  preampStageCount: number;
  powerAmpTubeType: PowerAmpTubeType;
  controls: AmpControlDefinition[];
  toggleSwitches: ToggleSwitchDefinition[];
  visualConfig: AmpVisualConfig;
}

export interface AmpParameters {
  preampGain: number;
  volume: number;
  masterVolume: number;
  masterGain: number;
  bass: number;
  middle: number;
  treble: number;
  tone: number;
  presence: number;
  resonance: number;
  channel: AmpChannel;
  toggles: Record<string, boolean>;
}

export interface AmpControlDefinition {
  name: string;
  paramKey: keyof AmpParameters;
  min: number;
  max: number;
  defaultValue: number;
  step: number;
}

export interface ToggleSwitchDefinition {
  name: string;
  paramKey: string;
  defaultValue: boolean;
  applicableToModel: boolean;
}

export interface AmpVisualConfig {
  panelColor: string;
  knobStyle: 'chicken-head' | 'pointer' | 'dome';
  fontFamily: string;
  logoSvgPath: string;
  layoutGrid: KnobPosition[];
}

export interface KnobPosition {
  paramKey: string;
  x: number;
  y: number;
  size: 'sm' | 'md' | 'lg';
}
