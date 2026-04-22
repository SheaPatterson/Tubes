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
    logoSvgPath: '/logos/mac.svg',
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
    logoSvgPath: '/logos/mac.svg',
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
    logoSvgPath: '/logos/mac.svg',
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
    logoSvgPath: '/logos/mac.svg',
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
    logoSvgPath: '/logos/mac.svg',
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
    logoSvgPath: '/logos/mac.svg',
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
    logoSvgPath: '/logos/mac.svg',
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
    logoSvgPath: '/logos/king.svg',
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
    logoSvgPath: '/logos/king.svg',
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
    logoSvgPath: '/logos/king.svg',
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
    logoSvgPath: '/logos/king.svg',
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
    logoSvgPath: '/logos/king.svg',
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
    logoSvgPath: '/logos/king.svg',
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
    logoSvgPath: '/logos/king.svg',
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
    logoSvgPath: '/logos/king.svg',
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
    logoSvgPath: '/logos/manhattan.svg',
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
    logoSvgPath: '/logos/manhattan.svg',
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
    logoSvgPath: '/logos/tokyo.svg',
    width: 120,
    height: 200,
  },
  tierRequired: 'free',
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
  kingME90,
  // Manhattan (Electro-Harmonix)
  manhattanBigMuff,
  manhattanSmallClone,
  // TOKYO (Ibanez)
  tokyoTubeScreamer,
];
