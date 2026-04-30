import type { Cabinet } from '@/types/cabinet';

export const winston4x12: Cabinet = {
  id: 'cab-winston-4x12',
  name: 'Winston 4x12',
  speakerConfig: '4x12',
  speakers: [
    { id: 'spk-winston-g12t75-1', name: 'G12T-75', frequencyResponse: [80, 0.9, 200, 1.0, 800, 1.1, 2500, 1.2, 5000, 1.0, 8000, 0.7], powerRating: 75 },
    { id: 'spk-winston-g12t75-2', name: 'G12T-75', frequencyResponse: [80, 0.9, 200, 1.0, 800, 1.1, 2500, 1.2, 5000, 1.0, 8000, 0.7], powerRating: 75 },
    { id: 'spk-winston-g12t75-3', name: 'G12T-75', frequencyResponse: [80, 0.9, 200, 1.0, 800, 1.1, 2500, 1.2, 5000, 1.0, 8000, 0.7], powerRating: 75 },
    { id: 'spk-winston-g12t75-4', name: 'G12T-75', frequencyResponse: [80, 0.9, 200, 1.0, 800, 1.1, 2500, 1.2, 5000, 1.0, 8000, 0.7], powerRating: 75 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#1a1a1a',
    grillPattern: 'basket-weave',
    logoSvgPath: '/icons/logo.svg',
    width: 760,
    height: 840,
  },
};

export const winston4x12v: Cabinet = {
  id: 'cab-winston-4x12v',
  name: 'Winston 4x12V',
  speakerConfig: '4x12',
  speakers: [
    { id: 'spk-winston-v30-1', name: 'Vintage 30', frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.15, 2500, 1.25, 5000, 1.05, 8000, 0.65], powerRating: 60 },
    { id: 'spk-winston-v30-2', name: 'Vintage 30', frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.15, 2500, 1.25, 5000, 1.05, 8000, 0.65], powerRating: 60 },
    { id: 'spk-winston-v30-3', name: 'Vintage 30', frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.15, 2500, 1.25, 5000, 1.05, 8000, 0.65], powerRating: 60 },
    { id: 'spk-winston-v30-4', name: 'Vintage 30', frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.15, 2500, 1.25, 5000, 1.05, 8000, 0.65], powerRating: 60 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#1a1a1a',
    grillPattern: 'basket-weave',
    logoSvgPath: '/icons/logo.svg',
    width: 760,
    height: 840,
  },
};

export const winston2x12v: Cabinet = {
  id: 'cab-winston-2x12v',
  name: 'Winston 2x12V',
  speakerConfig: '2x12',
  speakers: [
    { id: 'spk-winston-2x12-v30-1', name: 'Vintage 30', frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.15, 2500, 1.25, 5000, 1.05, 8000, 0.65], powerRating: 60 },
    { id: 'spk-winston-2x12-v30-2', name: 'Vintage 30', frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.15, 2500, 1.25, 5000, 1.05, 8000, 0.65], powerRating: 60 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#1a1a1a',
    grillPattern: 'basket-weave',
    logoSvgPath: '/icons/logo.svg',
    width: 620,
    height: 520,
  },
};

export const fuzzy4x12: Cabinet = {
  id: 'cab-fuzzy-4x12',
  name: 'Fuzzy 4x12',
  speakerConfig: '4x12',
  speakers: [
    { id: 'spk-fuzzy-v30-1', name: 'Vintage 30', frequencyResponse: [80, 0.9, 200, 1.05, 800, 1.1, 2500, 1.2, 5000, 0.95, 8000, 0.6], powerRating: 60 },
    { id: 'spk-fuzzy-v30-2', name: 'Vintage 30', frequencyResponse: [80, 0.9, 200, 1.05, 800, 1.1, 2500, 1.2, 5000, 0.95, 8000, 0.6], powerRating: 60 },
    { id: 'spk-fuzzy-v30-3', name: 'Vintage 30', frequencyResponse: [80, 0.9, 200, 1.05, 800, 1.1, 2500, 1.2, 5000, 0.95, 8000, 0.6], powerRating: 60 },
    { id: 'spk-fuzzy-v30-4', name: 'Vintage 30', frequencyResponse: [80, 0.9, 200, 1.05, 800, 1.1, 2500, 1.2, 5000, 0.95, 8000, 0.6], powerRating: 60 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#e85d00',
    grillPattern: 'diamond-mesh',
    logoSvgPath: '/icons/logo.svg',
    width: 760,
    height: 840,
  },
};

export const fuzzy2x12: Cabinet = {
  id: 'cab-fuzzy-2x12',
  name: 'Fuzzy 2x12',
  speakerConfig: '2x12',
  speakers: [
    { id: 'spk-fuzzy-2x12-v30-1', name: 'Vintage 30', frequencyResponse: [80, 0.9, 200, 1.05, 800, 1.1, 2500, 1.2, 5000, 0.95, 8000, 0.6], powerRating: 60 },
    { id: 'spk-fuzzy-2x12-v30-2', name: 'Vintage 30', frequencyResponse: [80, 0.9, 200, 1.05, 800, 1.1, 2500, 1.2, 5000, 0.95, 8000, 0.6], powerRating: 60 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#e85d00',
    grillPattern: 'diamond-mesh',
    logoSvgPath: '/icons/logo.svg',
    width: 620,
    height: 520,
  },
};

export const usSteel4x12: Cabinet = {
  id: 'cab-us-steel-4x12',
  name: 'US Steel 4x12',
  speakerConfig: '4x12',
  speakers: [
    { id: 'spk-us-steel-v30-1', name: 'Vintage 30', frequencyResponse: [80, 0.95, 200, 1.0, 800, 1.05, 2500, 1.15, 5000, 1.0, 8000, 0.7], powerRating: 60 },
    { id: 'spk-us-steel-v30-2', name: 'Vintage 30', frequencyResponse: [80, 0.95, 200, 1.0, 800, 1.05, 2500, 1.15, 5000, 1.0, 8000, 0.7], powerRating: 60 },
    { id: 'spk-us-steel-v30-3', name: 'Vintage 30', frequencyResponse: [80, 0.95, 200, 1.0, 800, 1.05, 2500, 1.15, 5000, 1.0, 8000, 0.7], powerRating: 60 },
    { id: 'spk-us-steel-v30-4', name: 'Vintage 30', frequencyResponse: [80, 0.95, 200, 1.0, 800, 1.05, 2500, 1.15, 5000, 1.0, 8000, 0.7], powerRating: 60 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#2a2a2a',
    grillPattern: 'wicker',
    logoSvgPath: '/icons/logo.svg',
    width: 760,
    height: 840,
  },
};

export const twanger1: Cabinet = {
  id: 'cab-twanger-1',
  name: 'Twanger 1',
  speakerConfig: '1x12',
  speakers: [
    { id: 'spk-twanger-jensen-1', name: 'Jensen P12R', frequencyResponse: [80, 0.75, 200, 0.95, 800, 1.0, 2500, 1.1, 5000, 1.15, 8000, 0.85], powerRating: 25 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#d4a76a',
    grillPattern: 'tweed-cloth',
    logoSvgPath: '/icons/logo.svg',
    width: 500,
    height: 480,
  },
};

// ── Chimera 2x12 (Vox AC30 cabinet) ──
export const chimera2x12: Cabinet = {
  id: 'cab-chimera-2x12',
  name: 'Chimera 2x12',
  speakerConfig: '2x12',
  speakers: [
    { id: 'spk-chimera-blue-1', name: 'Alnico Blue', frequencyResponse: [80, 0.8, 200, 0.95, 800, 1.1, 2500, 1.3, 5000, 1.1, 8000, 0.75], powerRating: 15 },
    { id: 'spk-chimera-blue-2', name: 'Alnico Blue', frequencyResponse: [80, 0.8, 200, 0.95, 800, 1.1, 2500, 1.3, 5000, 1.1, 8000, 0.75], powerRating: 15 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#c4a265',
    grillPattern: 'diamond-mesh',
    logoSvgPath: '/icons/logo.svg',
    width: 620,
    height: 520,
  },
};

// ── Twanger Twin 2x12 (Fender Twin Reverb cabinet) ──
export const twangerTwin2x12: Cabinet = {
  id: 'cab-twanger-twin-2x12',
  name: 'Twanger Twin 2x12',
  speakerConfig: '2x12',
  speakers: [
    { id: 'spk-twanger-twin-jbl-1', name: 'JBL D120F', frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.05, 2500, 1.15, 5000, 1.1, 8000, 0.8], powerRating: 100 },
    { id: 'spk-twanger-twin-jbl-2', name: 'JBL D120F', frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.05, 2500, 1.15, 5000, 1.1, 8000, 0.8], powerRating: 100 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#1a1a1a',
    grillPattern: 'silverface-cloth',
    logoSvgPath: '/icons/logo.svg',
    width: 620,
    height: 520,
  },
};

// ── Twanger Bassman 4x10 (Fender Bassman cabinet) ──
export const twangerBassman4x10: Cabinet = {
  id: 'cab-twanger-bassman-4x10',
  name: 'Twanger Bassman 4x10',
  speakerConfig: '4x10',
  speakers: [
    { id: 'spk-twanger-bm-jensen-1', name: 'Jensen P10R', frequencyResponse: [80, 0.7, 200, 0.9, 800, 1.0, 2500, 1.15, 5000, 1.2, 8000, 0.9], powerRating: 25 },
    { id: 'spk-twanger-bm-jensen-2', name: 'Jensen P10R', frequencyResponse: [80, 0.7, 200, 0.9, 800, 1.0, 2500, 1.15, 5000, 1.2, 8000, 0.9], powerRating: 25 },
    { id: 'spk-twanger-bm-jensen-3', name: 'Jensen P10R', frequencyResponse: [80, 0.7, 200, 0.9, 800, 1.0, 2500, 1.15, 5000, 1.2, 8000, 0.9], powerRating: 25 },
    { id: 'spk-twanger-bm-jensen-4', name: 'Jensen P10R', frequencyResponse: [80, 0.7, 200, 0.9, 800, 1.0, 2500, 1.15, 5000, 1.2, 8000, 0.9], powerRating: 25 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#d4a76a',
    grillPattern: 'tweed-cloth',
    logoSvgPath: '/icons/logo.svg',
    width: 620,
    height: 600,
  },
};

// ── Twanger Blackface 1x12 (Fender Deluxe Reverb cabinet) ──
export const twangerBlackface1x12: Cabinet = {
  id: 'cab-twanger-blackface-1x12',
  name: 'Twanger Blackface 1x12',
  speakerConfig: '1x12',
  speakers: [
    { id: 'spk-twanger-bf-jensen-1', name: 'Jensen C12N', frequencyResponse: [80, 0.75, 200, 0.95, 800, 1.05, 2500, 1.15, 5000, 1.1, 8000, 0.8], powerRating: 50 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#1a1a1a',
    grillPattern: 'silverface-cloth',
    logoSvgPath: '/icons/logo.svg',
    width: 500,
    height: 480,
  },
};

// ── Hiwatt 4x12 ──
export const hiwatt4x12: Cabinet = {
  id: 'cab-hiwatt-4x12',
  name: 'Hiwatt 4x12',
  speakerConfig: '4x12',
  speakers: [
    { id: 'spk-hiwatt-fane-1', name: 'Fane Crescendo', frequencyResponse: [80, 0.9, 200, 1.0, 800, 1.05, 2500, 1.1, 5000, 0.95, 8000, 0.7], powerRating: 50 },
    { id: 'spk-hiwatt-fane-2', name: 'Fane Crescendo', frequencyResponse: [80, 0.9, 200, 1.0, 800, 1.05, 2500, 1.1, 5000, 0.95, 8000, 0.7], powerRating: 50 },
    { id: 'spk-hiwatt-fane-3', name: 'Fane Crescendo', frequencyResponse: [80, 0.9, 200, 1.0, 800, 1.05, 2500, 1.1, 5000, 0.95, 8000, 0.7], powerRating: 50 },
    { id: 'spk-hiwatt-fane-4', name: 'Fane Crescendo', frequencyResponse: [80, 0.9, 200, 1.0, 800, 1.05, 2500, 1.1, 5000, 0.95, 8000, 0.7], powerRating: 50 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#1e3a5f',
    grillPattern: 'basket-weave',
    logoSvgPath: '/icons/logo.svg',
    width: 760,
    height: 840,
  },
};

// ── Matchless 2x12 ──
export const matchless2x12: Cabinet = {
  id: 'cab-matchless-2x12',
  name: 'Matchless 2x12',
  speakerConfig: '2x12',
  speakers: [
    { id: 'spk-matchless-g12h-1', name: 'G12H-30', frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.1, 2500, 1.2, 5000, 1.0, 8000, 0.65], powerRating: 30 },
    { id: 'spk-matchless-g12h-2', name: 'G12H-30', frequencyResponse: [80, 0.85, 200, 1.0, 800, 1.1, 2500, 1.2, 5000, 1.0, 8000, 0.65], powerRating: 30 },
  ],
  irData: new Float32Array(0),
  visualConfig: {
    bodyColor: '#3d2b1f',
    grillPattern: 'basket-weave',
    logoSvgPath: '/icons/logo.svg',
    width: 620,
    height: 520,
  },
};

export const cabinets: Cabinet[] = [
  winston4x12,
  winston4x12v,
  winston2x12v,
  fuzzy4x12,
  fuzzy2x12,
  usSteel4x12,
  twanger1,
  twangerTwin2x12,
  twangerBlackface1x12,
  twangerBassman4x10,
  chimera2x12,
  hiwatt4x12,
  matchless2x12,
];
