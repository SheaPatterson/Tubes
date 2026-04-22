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
    logoSvgPath: '/logos/winston-cab.svg',
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
    logoSvgPath: '/logos/winston-cab.svg',
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
    logoSvgPath: '/logos/winston-cab.svg',
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
    logoSvgPath: '/logos/fuzzy-cab.svg',
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
    logoSvgPath: '/logos/fuzzy-cab.svg',
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
    logoSvgPath: '/logos/us-steel-cab.svg',
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
    logoSvgPath: '/logos/twanger-cab.svg',
    width: 500,
    height: 480,
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
];
