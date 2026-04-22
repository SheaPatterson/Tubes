import type { AmpModel } from '@/types/amp';

/**
 * All amp control definitions share the same base set of 10 required controls
 * (preampGain, volume, masterVolume, masterGain, bass, middle, treble, tone, presence, resonance).
 * Each model may have different defaults and toggle switches.
 */

const baseControls: AmpModel['controls'] = [
  { name: 'Pre-Amp Gain', paramKey: 'preampGain', min: 1, max: 10, defaultValue: 5, step: 0.1 },
  { name: 'Volume', paramKey: 'volume', min: 1, max: 10, defaultValue: 5, step: 0.1 },
  { name: 'Master Volume', paramKey: 'masterVolume', min: 1, max: 10, defaultValue: 5, step: 0.1 },
  { name: 'Master Gain', paramKey: 'masterGain', min: 1, max: 10, defaultValue: 5, step: 0.1 },
  { name: 'Bass', paramKey: 'bass', min: 1, max: 10, defaultValue: 5, step: 0.1 },
  { name: 'Middle', paramKey: 'middle', min: 1, max: 10, defaultValue: 5, step: 0.1 },
  { name: 'Treble', paramKey: 'treble', min: 1, max: 10, defaultValue: 5, step: 0.1 },
  { name: 'Tone', paramKey: 'tone', min: 1, max: 10, defaultValue: 5, step: 0.1 },
  { name: 'Presence', paramKey: 'presence', min: 1, max: 10, defaultValue: 5, step: 0.1 },
  { name: 'Resonance', paramKey: 'resonance', min: 1, max: 10, defaultValue: 5, step: 0.1 },
];

function makeControls(overrides?: Partial<Record<string, number>>): AmpModel['controls'] {
  if (!overrides) return [...baseControls];
  return baseControls.map((c) => {
    const override = overrides[c.paramKey as string];
    return {
      ...c,
      defaultValue: override ?? c.defaultValue,
    };
  });
}

// ── Winston CHL (Marshall DSL) ──
export const winstonCHL: AmpModel = {
  id: 'winston-chl',
  name: 'Winston CHL',
  originalBrand: 'Marshall DSL',
  brandRename: 'Winston',
  channels: ['clean', 'crunch', 'overdrive'],
  preampStageCount: 4,
  powerAmpTubeType: 'EL34',
  controls: makeControls({ preampGain: 6, bass: 5, middle: 6, treble: 6, presence: 5 }),
  toggleSwitches: [
    { name: 'Tone Shift', paramKey: 'toneShift', defaultValue: false, applicableToModel: true },
    { name: 'Deep', paramKey: 'deep', defaultValue: false, applicableToModel: true },
    { name: 'Mid Boost', paramKey: 'midBoost', defaultValue: false, applicableToModel: false },
    { name: 'Mid Cut', paramKey: 'midCut', defaultValue: false, applicableToModel: false },
    { name: 'Bright', paramKey: 'bright', defaultValue: false, applicableToModel: false },
    { name: 'Diode', paramKey: 'diode', defaultValue: false, applicableToModel: false },
  ],
  visualConfig: {
    panelColor: '#1a1a1a',
    knobStyle: 'chicken-head',
    fontFamily: 'serif',
    logoSvgPath: '/icons/logo.svg',
    layoutGrid: [
      { paramKey: 'preampGain', x: 10, y: 50, size: 'lg' },
      { paramKey: 'bass', x: 25, y: 50, size: 'md' },
      { paramKey: 'middle', x: 37, y: 50, size: 'md' },
      { paramKey: 'treble', x: 49, y: 50, size: 'md' },
      { paramKey: 'volume', x: 61, y: 50, size: 'md' },
      { paramKey: 'presence', x: 73, y: 50, size: 'md' },
      { paramKey: 'resonance', x: 82, y: 50, size: 'md' },
      { paramKey: 'masterVolume', x: 91, y: 50, size: 'lg' },
    ],
  },
};

// ── US Steel Plate (Mesa Boogie Rectifier) ──
export const usSteelPlate: AmpModel = {
  id: 'us-steel-plate',
  name: 'US Steel Plate',
  originalBrand: 'Mesa Boogie Rectifier',
  brandRename: 'US Steel',
  channels: ['clean', 'crunch', 'overdrive'],
  preampStageCount: 5,
  powerAmpTubeType: '6L6',
  controls: makeControls({ preampGain: 7, bass: 6, middle: 5, treble: 7, presence: 6 }),
  toggleSwitches: [
    { name: 'Tone Shift', paramKey: 'toneShift', defaultValue: false, applicableToModel: false },
    { name: 'Deep', paramKey: 'deep', defaultValue: false, applicableToModel: true },
    { name: 'Mid Boost', paramKey: 'midBoost', defaultValue: false, applicableToModel: false },
    { name: 'Mid Cut', paramKey: 'midCut', defaultValue: false, applicableToModel: true },
    { name: 'Bright', paramKey: 'bright', defaultValue: true, applicableToModel: true },
    { name: 'Diode', paramKey: 'diode', defaultValue: false, applicableToModel: true },
  ],
  visualConfig: {
    panelColor: '#2b2b2b',
    knobStyle: 'pointer',
    fontFamily: 'sans-serif',
    logoSvgPath: '/icons/logo.svg',
    layoutGrid: [
      { paramKey: 'preampGain', x: 10, y: 50, size: 'lg' },
      { paramKey: 'bass', x: 25, y: 50, size: 'md' },
      { paramKey: 'middle', x: 37, y: 50, size: 'md' },
      { paramKey: 'treble', x: 49, y: 50, size: 'md' },
      { paramKey: 'presence', x: 61, y: 50, size: 'md' },
      { paramKey: 'masterVolume', x: 73, y: 50, size: 'lg' },
      { paramKey: 'volume', x: 85, y: 50, size: 'md' },
    ],
  },
};

// ── Twanger Banger (Fender Bassman) ──
export const twangerBanger: AmpModel = {
  id: 'twanger-banger',
  name: 'Twanger Banger',
  originalBrand: 'Fender Bassman',
  brandRename: 'Twanger',
  channels: ['clean', 'crunch'],
  preampStageCount: 3,
  powerAmpTubeType: '6L6',
  controls: makeControls({ preampGain: 4, bass: 6, middle: 4, treble: 7, tone: 6, presence: 4 }),
  toggleSwitches: [
    { name: 'Tone Shift', paramKey: 'toneShift', defaultValue: false, applicableToModel: false },
    { name: 'Deep', paramKey: 'deep', defaultValue: false, applicableToModel: true },
    { name: 'Mid Boost', paramKey: 'midBoost', defaultValue: false, applicableToModel: false },
    { name: 'Mid Cut', paramKey: 'midCut', defaultValue: false, applicableToModel: false },
    { name: 'Bright', paramKey: 'bright', defaultValue: true, applicableToModel: true },
    { name: 'Diode', paramKey: 'diode', defaultValue: false, applicableToModel: false },
  ],
  visualConfig: {
    panelColor: '#d4a76a',
    knobStyle: 'chicken-head',
    fontFamily: 'serif',
    logoSvgPath: '/icons/logo.svg',
    layoutGrid: [
      { paramKey: 'volume', x: 15, y: 50, size: 'md' },
      { paramKey: 'bass', x: 30, y: 50, size: 'md' },
      { paramKey: 'middle', x: 42, y: 50, size: 'md' },
      { paramKey: 'treble', x: 54, y: 50, size: 'md' },
      { paramKey: 'tone', x: 66, y: 50, size: 'md' },
      { paramKey: 'presence', x: 78, y: 50, size: 'md' },
      { paramKey: 'masterVolume', x: 90, y: 50, size: 'lg' },
    ],
  },
};

// ── Fizzle 0505 (Peavey 5150) ──
export const fizzle0505: AmpModel = {
  id: 'fizzle-0505',
  name: 'Fizzle 0505',
  originalBrand: 'Peavey 5150',
  brandRename: 'Fizzle',
  channels: ['crunch', 'overdrive'],
  preampStageCount: 5,
  powerAmpTubeType: '6L6',
  controls: makeControls({ preampGain: 8, bass: 5, middle: 6, treble: 7, presence: 6, resonance: 5 }),
  toggleSwitches: [
    { name: 'Tone Shift', paramKey: 'toneShift', defaultValue: false, applicableToModel: false },
    { name: 'Deep', paramKey: 'deep', defaultValue: false, applicableToModel: false },
    { name: 'Mid Boost', paramKey: 'midBoost', defaultValue: false, applicableToModel: true },
    { name: 'Mid Cut', paramKey: 'midCut', defaultValue: false, applicableToModel: false },
    { name: 'Bright', paramKey: 'bright', defaultValue: true, applicableToModel: true },
    { name: 'Diode', paramKey: 'diode', defaultValue: false, applicableToModel: false },
  ],
  visualConfig: {
    panelColor: '#0a0a0a',
    knobStyle: 'pointer',
    fontFamily: 'sans-serif',
    logoSvgPath: '/icons/logo.svg',
    layoutGrid: [
      { paramKey: 'preampGain', x: 10, y: 50, size: 'lg' },
      { paramKey: 'bass', x: 25, y: 50, size: 'md' },
      { paramKey: 'middle', x: 37, y: 50, size: 'md' },
      { paramKey: 'treble', x: 49, y: 50, size: 'md' },
      { paramKey: 'volume', x: 61, y: 50, size: 'md' },
      { paramKey: 'presence', x: 73, y: 50, size: 'md' },
      { paramKey: 'resonance', x: 82, y: 50, size: 'md' },
      { paramKey: 'masterVolume', x: 91, y: 50, size: 'lg' },
    ],
  },
};

// ── Fuzzy AcidTrip (Orange Rockerverb) ──
export const fuzzyAcidTrip: AmpModel = {
  id: 'fuzzy-acidtrip',
  name: 'Fuzzy AcidTrip',
  originalBrand: 'Orange Rockerverb',
  brandRename: 'Fuzzy',
  channels: ['clean', 'overdrive'],
  preampStageCount: 4,
  powerAmpTubeType: 'EL34',
  controls: makeControls({ preampGain: 6, bass: 6, middle: 5, treble: 5, volume: 5 }),
  toggleSwitches: [
    { name: 'Tone Shift', paramKey: 'toneShift', defaultValue: false, applicableToModel: false },
    { name: 'Deep', paramKey: 'deep', defaultValue: false, applicableToModel: false },
    { name: 'Mid Boost', paramKey: 'midBoost', defaultValue: false, applicableToModel: false },
    { name: 'Mid Cut', paramKey: 'midCut', defaultValue: false, applicableToModel: false },
    { name: 'Bright', paramKey: 'bright', defaultValue: false, applicableToModel: false },
    { name: 'Diode', paramKey: 'diode', defaultValue: false, applicableToModel: false },
  ],
  visualConfig: {
    panelColor: '#e85d00',
    knobStyle: 'chicken-head',
    fontFamily: 'sans-serif',
    logoSvgPath: '/icons/logo.svg',
    layoutGrid: [
      { paramKey: 'preampGain', x: 15, y: 50, size: 'lg' },
      { paramKey: 'bass', x: 30, y: 50, size: 'md' },
      { paramKey: 'middle', x: 42, y: 50, size: 'md' },
      { paramKey: 'treble', x: 54, y: 50, size: 'md' },
      { paramKey: 'volume', x: 70, y: 50, size: 'md' },
      { paramKey: 'masterVolume', x: 85, y: 50, size: 'lg' },
    ],
  },
};

// ── Blitzkrieg Warfare (Engel Fireball) ──
export const blitzkriegWarfare: AmpModel = {
  id: 'blitzkrieg-warfare',
  name: 'Blitzkrieg Warfare',
  originalBrand: 'Engel Fireball',
  brandRename: 'Blitzkrieg',
  channels: ['clean', 'crunch', 'overdrive'],
  preampStageCount: 4,
  powerAmpTubeType: 'EL34',
  controls: makeControls({ preampGain: 7, bass: 5, middle: 6, treble: 6, presence: 6 }),
  toggleSwitches: [
    { name: 'Tone Shift', paramKey: 'toneShift', defaultValue: false, applicableToModel: false },
    { name: 'Deep', paramKey: 'deep', defaultValue: true, applicableToModel: true },
    { name: 'Mid Boost', paramKey: 'midBoost', defaultValue: false, applicableToModel: true },
    { name: 'Mid Cut', paramKey: 'midCut', defaultValue: false, applicableToModel: true },
    { name: 'Bright', paramKey: 'bright', defaultValue: false, applicableToModel: true },
    { name: 'Diode', paramKey: 'diode', defaultValue: false, applicableToModel: false },
  ],
  visualConfig: {
    panelColor: '#8b0000',
    knobStyle: 'dome',
    fontFamily: 'sans-serif',
    logoSvgPath: '/icons/logo.svg',
    layoutGrid: [
      { paramKey: 'preampGain', x: 10, y: 50, size: 'lg' },
      { paramKey: 'bass', x: 25, y: 50, size: 'md' },
      { paramKey: 'middle', x: 37, y: 50, size: 'md' },
      { paramKey: 'treble', x: 49, y: 50, size: 'md' },
      { paramKey: 'presence', x: 61, y: 50, size: 'md' },
      { paramKey: 'volume', x: 73, y: 50, size: 'md' },
      { paramKey: 'masterVolume', x: 88, y: 50, size: 'lg' },
    ],
  },
};

// ── Berlin Wall (Diezel VH4) ──
export const berlinWall: AmpModel = {
  id: 'berlin-wall',
  name: 'Berlin Wall',
  originalBrand: 'Diezel VH4',
  brandRename: 'Berlin',
  channels: ['clean', 'crunch', 'overdrive'],
  preampStageCount: 5,
  powerAmpTubeType: 'KT88',
  controls: makeControls({ preampGain: 7, bass: 5, middle: 6, treble: 6, presence: 6, resonance: 5 }),
  toggleSwitches: [
    { name: 'Tone Shift', paramKey: 'toneShift', defaultValue: false, applicableToModel: true },
    { name: 'Deep', paramKey: 'deep', defaultValue: true, applicableToModel: true },
    { name: 'Mid Boost', paramKey: 'midBoost', defaultValue: false, applicableToModel: true },
    { name: 'Mid Cut', paramKey: 'midCut', defaultValue: false, applicableToModel: true },
    { name: 'Bright', paramKey: 'bright', defaultValue: true, applicableToModel: true },
    { name: 'Diode', paramKey: 'diode', defaultValue: true, applicableToModel: true },
  ],
  visualConfig: {
    panelColor: '#0d0d0d',
    knobStyle: 'dome',
    fontFamily: 'sans-serif',
    logoSvgPath: '/icons/logo.svg',
    layoutGrid: [
      { paramKey: 'preampGain', x: 8, y: 50, size: 'lg' },
      { paramKey: 'bass', x: 20, y: 50, size: 'md' },
      { paramKey: 'middle', x: 32, y: 50, size: 'md' },
      { paramKey: 'treble', x: 44, y: 50, size: 'md' },
      { paramKey: 'presence', x: 56, y: 50, size: 'md' },
      { paramKey: 'resonance', x: 68, y: 50, size: 'md' },
      { paramKey: 'volume', x: 80, y: 50, size: 'md' },
      { paramKey: 'masterVolume', x: 92, y: 50, size: 'lg' },
    ],
  },
};

export const ampModels: AmpModel[] = [
  winstonCHL,
  usSteelPlate,
  twangerBanger,
  fizzle0505,
  fuzzyAcidTrip,
  blitzkriegWarfare,
  berlinWall,
];
