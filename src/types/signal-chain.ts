import type { AmpParameters } from '@/types/amp';
import type { FxPedalInstance } from '@/types/fx';
import type { MicConfiguration } from '@/types/cabinet';

export interface SignalChainState {
  inputSettings: InputSettings;
  preampFx: FxPedalInstance[];
  preampTubes: PreampTubeConfig;
  amplifier: AmplifierConfig;
  fxLoop: FxPedalInstance[];
  cabinet: CabinetConfig;
  outputSettings: OutputSettings;
}

export interface InputSettings {
  inputGain: number;
  noiseGateEnabled: boolean;
  noiseGateThreshold: number;
  noiseGateRelease: number;
}

export interface PreampTubeConfig {
  tubeCount: number;
  stageGains: number[];
}

export interface AmplifierConfig {
  modelId: string;
  parameters: AmpParameters;
}

export interface CabinetConfig {
  cabinetId: string;
  mic: MicConfiguration;
}

export interface OutputSettings {
  masterVolume: number;
  outputGain: number;
}

export interface SavedSignalChain {
  id: string;
  userId: string;
  name: string;
  config: SignalChainState;
  createdAt: number;
  updatedAt: number;
}
