import type { SpeakerImpedanceModel } from '@/types/tone-stack';

/**
 * Speaker impedance models derived from Duncan Amps SPICE subcircuits.
 * These models represent the frequency-dependent impedance characteristics
 * of real guitar speakers, used by the cabinet DSP processor for accurate
 * speaker interaction modeling.
 *
 * Source data: /public/speakers/*.md
 */

export const celestionVintage30: SpeakerImpedanceModel = {
  id: 'spk-celestion-v30',
  name: 'Celestion Vintage 30',
  manufacturer: 'Celestion',
  dcResistance: 7.5,
  nominalImpedance: 8,
  resonantFrequencyHz: 75,
  powerRating: 60,
  spiceSource: '/speakers/Celestion Vintage 30.md',
};

export const celestionG12M: SpeakerImpedanceModel = {
  id: 'spk-celestion-g12m',
  name: 'Celestion G12M',
  manufacturer: 'Celestion',
  dcResistance: 7.5,
  nominalImpedance: 8,
  resonantFrequencyHz: 75,
  powerRating: 25,
  spiceSource: '/speakers/Celestion G12M.md',
};

export const celestionG12T75: SpeakerImpedanceModel = {
  id: 'spk-celestion-g12t75',
  name: 'Celestion G12T-75',
  manufacturer: 'Celestion',
  dcResistance: 7.5,
  nominalImpedance: 8,
  resonantFrequencyHz: 75,
  powerRating: 75,
  spiceSource: '/speakers/Celestion G12T-75.md',
};

export const celestionG12H100: SpeakerImpedanceModel = {
  id: 'spk-celestion-g12h100',
  name: 'Celestion G12H-100',
  manufacturer: 'Celestion',
  dcResistance: 6.5,
  nominalImpedance: 8,
  resonantFrequencyHz: 75,
  powerRating: 100,
  spiceSource: '/speakers/Celestion G12H-100.md',
};

export const celestionVintage10: SpeakerImpedanceModel = {
  id: 'spk-celestion-v10',
  name: 'Celestion Vintage 10',
  manufacturer: 'Celestion',
  dcResistance: 7.5,
  nominalImpedance: 8,
  resonantFrequencyHz: 80,
  powerRating: 60,
  spiceSource: '/speakers/Celestion Vintage 10.md',
};

export const genericSpeaker8Ohm: SpeakerImpedanceModel = {
  id: 'spk-generic-8ohm',
  name: 'Generic 8Ω Speaker',
  manufacturer: 'Generic',
  dcResistance: 8,
  nominalImpedance: 8,
  spiceSource: '/speakers/Generic Speaker.md',
};

export const speakerModels: SpeakerImpedanceModel[] = [
  celestionVintage30,
  celestionG12M,
  celestionG12T75,
  celestionG12H100,
  celestionVintage10,
  genericSpeaker8Ohm,
];

/** Lookup a speaker model by ID. */
export function getSpeakerModel(id: string): SpeakerImpedanceModel | undefined {
  return speakerModels.find((s) => s.id === id);
}

/** Get all speakers from a specific manufacturer. */
export function getSpeakersByManufacturer(manufacturer: string): SpeakerImpedanceModel[] {
  return speakerModels.filter(
    (s) => s.manufacturer.toLowerCase() === manufacturer.toLowerCase(),
  );
}
