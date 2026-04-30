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

// ── Tone Stack Circuit Model ──

export type PotTaper = 'A' | 'L' | 'C';

export interface PotComponent {
  value: string;
  taper: PotTaper;
  control: number;
}

export interface ToneStackCircuit {
  id: string;
  components: Record<string, string | PotComponent>;
}

export interface ToneStackConfig {
  id: string;
  name: string;
  description: string;
  /** Amp model IDs this tone stack applies to */
  ampModelIds: string[];
  globalControlValues: Record<string, number>;
  tonestacks: ToneStackCircuit[];
}

// ── Tube Data Model ──

export interface TubeRating {
  heaterVoltage: number;
  heaterCurrent: number;
  maxPlateVoltage: number;
  maxScreenVoltage?: number;
  maxHeaterCathodeVoltage?: number;
  maxPlateWatts: number;
  maxScreenWatts?: number;
  maxCathodeCurrent?: number;
}

export interface TubeApplicationData {
  class: string;
  plateVoltage: number;
  screenVoltage?: number;
  gridVoltage?: number;
  plateCurrent: number;
  screenCurrent?: number;
  plateResistance?: number;
  transconductance?: number;
  cathodeResistance?: number;
  loadImpedance?: number;
  outputPower?: number;
  thd?: number;
  notes?: string;
}

export interface TubeModel {
  id: string;
  designation: string;
  type: 'preamp-triode' | 'power-pentode' | 'power-beam-tetrode' | 'rectifier';
  description: string;
  substitutes: string[];
  ratings: TubeRating;
  applicationData: TubeApplicationData[];
}

// ── Speaker Impedance Model ──

export interface SpeakerImpedanceModel {
  id: string;
  name: string;
  manufacturer: string;
  /** DC resistance in ohms */
  dcResistance: number;
  /** Nominal impedance in ohms */
  nominalImpedance: number;
  /** SPICE subcircuit source */
  spiceSource: string;
  /** Resonant frequency in Hz (approximate) */
  resonantFrequencyHz?: number;
  /** Power rating in watts */
  powerRating?: number;
}
