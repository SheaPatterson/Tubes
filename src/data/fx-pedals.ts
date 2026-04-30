import type { FxPedalDefinition } from '@/types/fx';

// ═══════════════════════════════════════════════════════════════
// MAC (MXR) Pedals
// ═══════════════════════════════════════════════════════════════

export const macSuperComp: FxPedalDefinition = {
  id: 'mac-super-comp',
  name: 'Super Comp',
  brand: 'MAC',
  originalBrand: 'MXR',
  category: 'compression',
  controls: [
    { name: 'Output', paramKey: 'output', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Sensitivity', paramKey: 'sensitivity', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Attack', paramKey: 'attack', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'opto-compressor',
  visualConfig: {
    bodyColor: '#ff4444',
    knobStyle: 'small-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 120,
    height: 200,
  },
  tierRequired: 'free',
};

export const macDynaComp: FxPedalDefinition = {
  id: 'mac-dyna-comp',
  name: 'Dyna Comp',
  brand: 'MAC',
  originalBrand: 'MXR',
  category: 'compression',
  controls: [
    { name: 'Output', paramKey: 'output', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Sensitivity', paramKey: 'sensitivity', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'ota-compressor',
  visualConfig: {
    bodyColor: '#ff6600',
    knobStyle: 'small-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 120,
    height: 200,
  },
  tierRequired: 'free',
};

export const macSmartGate: FxPedalDefinition = {
  id: 'mac-smartgate',
  name: 'SmartGate',
  brand: 'MAC',
  originalBrand: 'MXR',
  category: 'gate',
  controls: [
    { name: 'Trigger', paramKey: 'trigger', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Release', paramKey: 'release', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Mode', paramKey: 'mode', type: 'switch', min: 0, max: 2, defaultValue: 0, step: 1 },
  ],
  circuitType: 'noise-gate',
  visualConfig: {
    bodyColor: '#00cc44',
    knobStyle: 'small-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 120,
    height: 200,
  },
  tierRequired: 'classic',
};

export const macPhase90: FxPedalDefinition = {
  id: 'mac-phase-90',
  name: 'Phase 90',
  brand: 'MAC',
  originalBrand: 'MXR',
  category: 'modulation',
  controls: [
    { name: 'Speed', paramKey: 'speed', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'phase-shifter',
  visualConfig: {
    bodyColor: '#ff8800',
    knobStyle: 'small-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 120,
    height: 200,
  },
  tierRequired: 'classic',
};

export const macDistortionPlus: FxPedalDefinition = {
  id: 'mac-distortion-plus',
  name: 'Distortion+',
  brand: 'MAC',
  originalBrand: 'MXR',
  category: 'distortion',
  controls: [
    { name: 'Output', paramKey: 'output', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Distortion', paramKey: 'distortion', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'opamp-clipper',
  visualConfig: {
    bodyColor: '#ffcc00',
    knobStyle: 'small-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 120,
    height: 200,
  },
  tierRequired: 'classic',
};

export const macCarbonDelay: FxPedalDefinition = {
  id: 'mac-carbon-delay',
  name: 'Carbon Delay',
  brand: 'MAC',
  originalBrand: 'MXR',
  category: 'delay',
  controls: [
    { name: 'Delay', paramKey: 'delay', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Regen', paramKey: 'regen', type: 'knob', min: 0, max: 10, defaultValue: 4, step: 0.1 },
    { name: 'Mix', paramKey: 'mix', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Mod', paramKey: 'mod', type: 'knob', min: 0, max: 10, defaultValue: 3, step: 0.1 },
  ],
  circuitType: 'analog-delay',
  visualConfig: {
    bodyColor: '#333333',
    knobStyle: 'small-white',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 120,
    height: 200,
  },
  tierRequired: 'classic',
};

export const macTimmy: FxPedalDefinition = {
  id: 'mac-timmy',
  name: 'Timmy',
  brand: 'MAC',
  originalBrand: 'MXR',
  category: 'overdrive',
  controls: [
    { name: 'Volume', paramKey: 'volume', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Gain', paramKey: 'gain', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Bass', paramKey: 'bass', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Treble', paramKey: 'treble', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'transparent-overdrive',
  visualConfig: {
    bodyColor: '#e8e0d0',
    knobStyle: 'small-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 120,
    height: 200,
  },
  tierRequired: 'classic',
};

// ═══════════════════════════════════════════════════════════════
// KING (BOSS) Pedals
// ═══════════════════════════════════════════════════════════════

export const kingSuperOverdrive: FxPedalDefinition = {
  id: 'king-super-overdrive',
  name: 'Super Overdrive',
  brand: 'KING',
  originalBrand: 'BOSS',
  category: 'overdrive',
  controls: [
    { name: 'Level', paramKey: 'level', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Tone', paramKey: 'tone', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Drive', paramKey: 'drive', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'asymmetric-overdrive',
  visualConfig: {
    bodyColor: '#ffaa00',
    knobStyle: 'boss-style',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-king.svg',
    width: 130,
    height: 210,
  },
  tierRequired: 'free',
};

export const kingDistortion: FxPedalDefinition = {
  id: 'king-distortion',
  name: 'Distortion',
  brand: 'KING',
  originalBrand: 'BOSS',
  category: 'distortion',
  controls: [
    { name: 'Level', paramKey: 'level', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Tone', paramKey: 'tone', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Distortion', paramKey: 'distortion', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'hard-clipper',
  visualConfig: {
    bodyColor: '#ff6600',
    knobStyle: 'boss-style',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-king.svg',
    width: 130,
    height: 210,
  },
  tierRequired: 'classic',
};

export const kingTurboDistortion: FxPedalDefinition = {
  id: 'king-turbo-distortion',
  name: 'Turbo Distortion',
  brand: 'KING',
  originalBrand: 'BOSS',
  category: 'distortion',
  controls: [
    { name: 'Level', paramKey: 'level', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Tone', paramKey: 'tone', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Distortion', paramKey: 'distortion', type: 'knob', min: 0, max: 10, defaultValue: 7, step: 0.1 },
    { name: 'Turbo', paramKey: 'turbo', type: 'switch', min: 0, max: 1, defaultValue: 0, step: 1 },
  ],
  circuitType: 'turbo-clipper',
  visualConfig: {
    bodyColor: '#cc3300',
    knobStyle: 'boss-style',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-king.svg',
    width: 130,
    height: 210,
  },
  tierRequired: 'classic',
};

export const kingDigitalDelay: FxPedalDefinition = {
  id: 'king-digital-delay',
  name: 'Digital Delay',
  brand: 'KING',
  originalBrand: 'BOSS',
  category: 'delay',
  controls: [
    { name: 'E.Level', paramKey: 'effectLevel', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'F.Back', paramKey: 'feedback', type: 'knob', min: 0, max: 10, defaultValue: 4, step: 0.1 },
    { name: 'D.Time', paramKey: 'delayTime', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'digital-delay',
  visualConfig: {
    bodyColor: '#0066cc',
    knobStyle: 'boss-style',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-king.svg',
    width: 130,
    height: 210,
  },
  tierRequired: 'classic',
};

export const kingEQ: FxPedalDefinition = {
  id: 'king-eq',
  name: 'EQ',
  brand: 'KING',
  originalBrand: 'BOSS',
  category: 'eq',
  controls: [
    { name: '100Hz', paramKey: 'band100', type: 'slider', min: -12, max: 12, defaultValue: 0, step: 1 },
    { name: '200Hz', paramKey: 'band200', type: 'slider', min: -12, max: 12, defaultValue: 0, step: 1 },
    { name: '400Hz', paramKey: 'band400', type: 'slider', min: -12, max: 12, defaultValue: 0, step: 1 },
    { name: '800Hz', paramKey: 'band800', type: 'slider', min: -12, max: 12, defaultValue: 0, step: 1 },
    { name: '1.6kHz', paramKey: 'band1600', type: 'slider', min: -12, max: 12, defaultValue: 0, step: 1 },
    { name: '3.2kHz', paramKey: 'band3200', type: 'slider', min: -12, max: 12, defaultValue: 0, step: 1 },
    { name: '6.4kHz', paramKey: 'band6400', type: 'slider', min: -12, max: 12, defaultValue: 0, step: 1 },
    { name: 'Level', paramKey: 'level', type: 'knob', min: -12, max: 12, defaultValue: 0, step: 1 },
  ],
  circuitType: 'graphic-eq',
  visualConfig: {
    bodyColor: '#ffffff',
    knobStyle: 'boss-style',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-king.svg',
    width: 130,
    height: 210,
  },
  tierRequired: 'classic',
};

export const kingChorus: FxPedalDefinition = {
  id: 'king-chorus',
  name: 'Chorus',
  brand: 'KING',
  originalBrand: 'BOSS',
  category: 'modulation',
  controls: [
    { name: 'E.Level', paramKey: 'effectLevel', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Rate', paramKey: 'rate', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Depth', paramKey: 'depth', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'bbd-chorus',
  visualConfig: {
    bodyColor: '#66ccff',
    knobStyle: 'boss-style',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-king.svg',
    width: 130,
    height: 210,
  },
  tierRequired: 'classic',
};

export const kingFlanger: FxPedalDefinition = {
  id: 'king-flanger',
  name: 'Flanger',
  brand: 'KING',
  originalBrand: 'BOSS',
  category: 'modulation',
  controls: [
    { name: 'Rate', paramKey: 'rate', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Depth', paramKey: 'depth', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Manual', paramKey: 'manual', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Resonance', paramKey: 'resonance', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'bbd-flanger',
  visualConfig: {
    bodyColor: '#cc66ff',
    knobStyle: 'boss-style',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-king.svg',
    width: 130,
    height: 210,
  },
  tierRequired: 'classic',
};

export const kingME90: FxPedalDefinition = {
  id: 'king-me-90',
  name: 'ME-90',
  brand: 'KING',
  originalBrand: 'BOSS',
  category: 'multi',
  controls: [
    { name: 'Comp', paramKey: 'comp', type: 'knob', min: 0, max: 10, defaultValue: 0, step: 0.1 },
    { name: 'OD/DS', paramKey: 'odDs', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'EQ Low', paramKey: 'eqLow', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'EQ High', paramKey: 'eqHigh', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Mod', paramKey: 'mod', type: 'knob', min: 0, max: 10, defaultValue: 0, step: 0.1 },
    { name: 'Delay', paramKey: 'delay', type: 'knob', min: 0, max: 10, defaultValue: 0, step: 0.1 },
    { name: 'Reverb', paramKey: 'reverb', type: 'knob', min: 0, max: 10, defaultValue: 3, step: 0.1 },
  ],
  circuitType: 'multi-fx',
  visualConfig: {
    bodyColor: '#222222',
    knobStyle: 'boss-style',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-king.svg',
    width: 300,
    height: 180,
  },
  tierRequired: 'next_gen',
};

// ═══════════════════════════════════════════════════════════════
// Manhattan (Electro-Harmonix) Pedals
// ═══════════════════════════════════════════════════════════════

export const manhattanBigMuff: FxPedalDefinition = {
  id: 'manhattan-big-muff',
  name: 'Big Muff',
  brand: 'Manhattan',
  originalBrand: 'Electro-Harmonix',
  category: 'distortion',
  controls: [
    { name: 'Volume', paramKey: 'volume', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Tone', paramKey: 'tone', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Sustain', paramKey: 'sustain', type: 'knob', min: 0, max: 10, defaultValue: 7, step: 0.1 },
  ],
  circuitType: 'fuzz-sustainer',
  visualConfig: {
    bodyColor: '#cc0000',
    knobStyle: 'large-black',
    labelFont: 'serif',
    logoSvgPath: '/icons/logo-manhattan.svg',
    width: 140,
    height: 240,
  },
  tierRequired: 'classic',
};

export const manhattanSmallClone: FxPedalDefinition = {
  id: 'manhattan-small-clone',
  name: 'Small Clone',
  brand: 'Manhattan',
  originalBrand: 'Electro-Harmonix',
  category: 'modulation',
  controls: [
    { name: 'Rate', paramKey: 'rate', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Depth', paramKey: 'depth', type: 'switch', min: 0, max: 1, defaultValue: 0, step: 1 },
  ],
  circuitType: 'analog-chorus',
  visualConfig: {
    bodyColor: '#6699cc',
    knobStyle: 'large-black',
    labelFont: 'serif',
    logoSvgPath: '/icons/logo-manhattan.svg',
    width: 140,
    height: 240,
  },
  tierRequired: 'classic',
};

// ═══════════════════════════════════════════════════════════════
// TOKYO (Ibanez) Pedals
// ═══════════════════════════════════════════════════════════════

export const tokyoTubeScreamer: FxPedalDefinition = {
  id: 'tokyo-tube-screamer',
  name: 'Tube Screamer',
  brand: 'TOKYO',
  originalBrand: 'Ibanez',
  category: 'overdrive',
  controls: [
    { name: 'Drive', paramKey: 'drive', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Tone', paramKey: 'tone', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Level', paramKey: 'level', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'symmetric-overdrive',
  visualConfig: {
    bodyColor: '#00cc44',
    knobStyle: 'small-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-tokyo.svg',
    width: 120,
    height: 200,
  },
  tierRequired: 'free',
};

// ═══════════════════════════════════════════════════════════════
// Independent / Boutique Pedals
// (Circuit analysis sources in /public/circuts/)
// ═══════════════════════════════════════════════════════════════

/** Klon Centaur — transparent overdrive, source: /public/circuts/Klon Centaur Analysis.pdf */
export const klonGoldenHorse: FxPedalDefinition = {
  id: 'golden-horse',
  name: 'Golden Horse',
  brand: 'MAC',
  originalBrand: 'Klon',
  category: 'overdrive',
  controls: [
    { name: 'Gain', paramKey: 'gain', type: 'knob', min: 0, max: 10, defaultValue: 3, step: 0.1 },
    { name: 'Treble', paramKey: 'treble', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Output', paramKey: 'output', type: 'knob', min: 0, max: 10, defaultValue: 6, step: 0.1 },
  ],
  circuitType: 'germanium-diode-overdrive',
  visualConfig: {
    bodyColor: '#c9a84c',
    knobStyle: 'small-black',
    labelFont: 'serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 140,
    height: 220,
  },
  tierRequired: 'classic',
};

/** ProCo Rat — distortion, source: /public/circuts/ProCo Rat Analysis.pdf */
export const ratDistortion: FxPedalDefinition = {
  id: 'rat-distortion',
  name: 'Rat',
  brand: 'MAC',
  originalBrand: 'ProCo',
  category: 'distortion',
  controls: [
    { name: 'Distortion', paramKey: 'distortion', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Filter', paramKey: 'filter', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Volume', paramKey: 'volume', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'opamp-hard-clipper',
  visualConfig: {
    bodyColor: '#1a1a1a',
    knobStyle: 'small-white',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 130,
    height: 210,
  },
  tierRequired: 'classic',
};

/** Fuzz Face — germanium fuzz, source: /public/circuts/Fuzz Face Analysis.pdf */
export const fuzzFace: FxPedalDefinition = {
  id: 'fuzz-face',
  name: 'Fuzz Face',
  brand: 'MAC',
  originalBrand: 'Dallas Arbiter',
  category: 'distortion',
  controls: [
    { name: 'Volume', paramKey: 'volume', type: 'knob', min: 0, max: 10, defaultValue: 7, step: 0.1 },
    { name: 'Fuzz', paramKey: 'fuzz', type: 'knob', min: 0, max: 10, defaultValue: 8, step: 0.1 },
  ],
  circuitType: 'germanium-fuzz',
  visualConfig: {
    bodyColor: '#4169e1',
    knobStyle: 'large-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 160,
    height: 160,
  },
  tierRequired: 'classic',
};

/** Dallas Rangemaster — treble booster, source: /public/circuts/Dallas Rangemaster Treble Booster Circuit Analysis.pdf */
export const rangemasterBoost: FxPedalDefinition = {
  id: 'rangemaster-boost',
  name: 'Rangemaster',
  brand: 'MAC',
  originalBrand: 'Dallas',
  category: 'overdrive',
  controls: [
    { name: 'Range', paramKey: 'range', type: 'knob', min: 0, max: 10, defaultValue: 7, step: 0.1 },
  ],
  circuitType: 'germanium-treble-booster',
  visualConfig: {
    bodyColor: '#8b8b8b',
    knobStyle: 'small-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 100,
    height: 140,
  },
  tierRequired: 'classic',
};

/** Dunlop Crybaby — wah pedal, source: /public/circuts/Dunlop Crybaby GCB-95 Circuit Analysis..pdf */
export const crybabyWah: FxPedalDefinition = {
  id: 'crybaby-wah',
  name: 'Crybaby Wah',
  brand: 'MAC',
  originalBrand: 'Dunlop',
  category: 'modulation',
  controls: [
    { name: 'Position', paramKey: 'position', type: 'slider', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Q', paramKey: 'q', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Range', paramKey: 'range', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'inductor-wah',
  visualConfig: {
    bodyColor: '#2a2a2a',
    knobStyle: 'small-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 140,
    height: 280,
  },
  tierRequired: 'classic',
};

/** Vox V847 — wah pedal, source: /public/circuts/Vox V847 Analysis.pdf */
export const voxWah: FxPedalDefinition = {
  id: 'vox-wah',
  name: 'V847 Wah',
  brand: 'MAC',
  originalBrand: 'Vox',
  category: 'modulation',
  controls: [
    { name: 'Position', paramKey: 'position', type: 'slider', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'inductor-wah',
  visualConfig: {
    bodyColor: '#1a1a1a',
    knobStyle: 'small-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 140,
    height: 280,
  },
  tierRequired: 'classic',
};

/** Boss CE-2 Chorus — source: /public/circuts/Boss CE-2 Analysis.pdf */
export const kingCE2Chorus: FxPedalDefinition = {
  id: 'king-ce2-chorus',
  name: 'CE-2 Chorus',
  brand: 'KING',
  originalBrand: 'BOSS',
  category: 'modulation',
  controls: [
    { name: 'Rate', paramKey: 'rate', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Depth', paramKey: 'depth', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'bbd-chorus',
  visualConfig: {
    bodyColor: '#4488cc',
    knobStyle: 'boss-style',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-king.svg',
    width: 130,
    height: 210,
  },
  tierRequired: 'classic',
};

/** PT2399-based delay — source: /public/circuts/PT2399 Analysis.pdf */
export const echoDelay: FxPedalDefinition = {
  id: 'echo-delay',
  name: 'Echo Delay',
  brand: 'MAC',
  originalBrand: 'Generic',
  category: 'delay',
  controls: [
    { name: 'Time', paramKey: 'time', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
    { name: 'Feedback', paramKey: 'feedback', type: 'knob', min: 0, max: 10, defaultValue: 4, step: 0.1 },
    { name: 'Mix', paramKey: 'mix', type: 'knob', min: 0, max: 10, defaultValue: 5, step: 0.1 },
  ],
  circuitType: 'pt2399-delay',
  visualConfig: {
    bodyColor: '#556b2f',
    knobStyle: 'small-black',
    labelFont: 'sans-serif',
    logoSvgPath: '/icons/logo-mac.svg',
    width: 120,
    height: 200,
  },
  tierRequired: 'classic',
};

// ═══════════════════════════════════════════════════════════════
// Aggregated exports
// ═══════════════════════════════════════════════════════════════

export const fxPedals: FxPedalDefinition[] = [
  // MAC (MXR)
  macSuperComp,
  macDynaComp,
  macSmartGate,
  macPhase90,
  macDistortionPlus,
  macCarbonDelay,
  macTimmy,
  // KING (BOSS)
  kingSuperOverdrive,
  kingDistortion,
  kingTurboDistortion,
  kingDigitalDelay,
  kingEQ,
  kingChorus,
  kingFlanger,
  kingCE2Chorus,
  kingME90,
  // Manhattan (Electro-Harmonix)
  manhattanBigMuff,
  manhattanSmallClone,
  // TOKYO (Ibanez)
  tokyoTubeScreamer,
  // Boutique / Independent
  klonGoldenHorse,
  ratDistortion,
  fuzzFace,
  rangemasterBoost,
  crybabyWah,
  voxWah,
  echoDelay,
];
