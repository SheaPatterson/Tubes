import type { AmpChannel } from '@/types/amp';

export interface ToneStackJSON {
  version: number;
  ampModelId: string;
  parameters: {
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
  };
  channel: AmpChannel;
  toggles: Record<string, boolean>;
}

export interface FxChainJSON {
  version: number;
  pedals: Array<{
    definitionId: string;
    enabled: boolean;
    parameters: Record<string, number>;
    position: number;
  }>;
}
