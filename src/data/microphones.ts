import type { MicType } from '@/types/cabinet';

export interface MicrophoneDefinition {
  id: string;
  name: string;
  /** Display name for the mic model (e.g., 'SM57', 'U67') */
  modelName: string;
  type: MicType;
  frequencyResponse: number[];
  polarPattern: string;
  sensitivityDb: number;
  /** Brief description of the mic character */
  description: string;
}

// ── Dynamic Microphones ──

export const sm57: MicrophoneDefinition = {
  id: 'mic-sm57',
  name: 'SM57 Dynamic',
  modelName: 'SM57',
  type: 'dynamic',
  frequencyResponse: [
    20, 0.4, 50, 0.6, 100, 0.85, 250, 1.0, 500, 1.0,
    1000, 1.0, 2000, 1.1, 4000, 1.2, 6000, 1.25, 8000, 1.1,
    10000, 0.9, 12000, 0.6, 16000, 0.3, 20000, 0.15,
  ],
  polarPattern: 'cardioid',
  sensitivityDb: -56,
  description: 'Industry-standard instrument mic. Presence peak around 5-6kHz gives guitar cabs bite and clarity. The go-to for close-miking.',
};

export const md421: MicrophoneDefinition = {
  id: 'mic-md421',
  name: 'MD421 Dynamic',
  modelName: 'MD421',
  type: 'dynamic',
  frequencyResponse: [
    20, 0.5, 50, 0.7, 100, 0.9, 250, 1.0, 500, 1.0,
    1000, 1.0, 2000, 1.05, 4000, 1.1, 6000, 1.0, 8000, 0.9,
    10000, 0.8, 12000, 0.65, 16000, 0.4, 20000, 0.2,
  ],
  polarPattern: 'cardioid',
  sensitivityDb: -54,
  description: 'Full-bodied dynamic with extended low end. Smoother top end than SM57 — great for thick, warm cab tones.',
};

export const sm58: MicrophoneDefinition = {
  id: 'mic-sm58',
  name: 'SM58 Dynamic',
  modelName: 'SM58',
  type: 'dynamic',
  frequencyResponse: [
    20, 0.3, 50, 0.5, 100, 0.8, 250, 1.0, 500, 1.0,
    1000, 1.0, 2000, 1.05, 4000, 1.1, 6000, 1.15, 8000, 1.0,
    10000, 0.8, 12000, 0.5, 16000, 0.25, 20000, 0.1,
  ],
  polarPattern: 'cardioid',
  sensitivityDb: -54.5,
  description: 'Vocal mic with built-in pop filter. Slightly rolled-off compared to SM57 — produces a rounder, less aggressive cab tone.',
};

// ── Condenser Microphones ──

export const u67: MicrophoneDefinition = {
  id: 'mic-u67',
  name: 'U67 Condenser',
  modelName: 'U67',
  type: 'condenser',
  frequencyResponse: [
    20, 0.85, 50, 0.9, 100, 1.0, 250, 1.0, 500, 1.0,
    1000, 1.05, 2000, 1.1, 4000, 1.15, 6000, 1.1, 8000, 1.05,
    10000, 1.0, 12000, 0.95, 16000, 0.85, 20000, 0.7,
  ],
  polarPattern: 'cardioid',
  sensitivityDb: -33,
  description: 'Classic large-diaphragm tube condenser. Silky top end with natural warmth — captures the full spectrum of a cabinet.',
};

export const at4050: MicrophoneDefinition = {
  id: 'mic-at4050',
  name: 'AT4050 Condenser',
  modelName: 'AT4050',
  type: 'condenser',
  frequencyResponse: [
    20, 0.8, 50, 0.9, 100, 1.0, 250, 1.0, 500, 1.0,
    1000, 1.0, 2000, 1.05, 4000, 1.1, 6000, 1.15, 8000, 1.2,
    10000, 1.15, 12000, 1.05, 16000, 0.9, 20000, 0.75,
  ],
  polarPattern: 'cardioid',
  sensitivityDb: -36,
  description: 'Multi-pattern studio condenser. Detailed and transparent with a slight presence lift — excellent for capturing cab nuance.',
};

export const u87: MicrophoneDefinition = {
  id: 'mic-u87',
  name: 'U87 Condenser',
  modelName: 'U87',
  type: 'condenser',
  frequencyResponse: [
    20, 0.85, 50, 0.9, 100, 1.0, 250, 1.0, 500, 1.0,
    1000, 1.05, 2000, 1.1, 4000, 1.12, 6000, 1.08, 8000, 1.0,
    10000, 0.95, 12000, 0.9, 16000, 0.8, 20000, 0.65,
  ],
  polarPattern: 'cardioid',
  sensitivityDb: -31,
  description: 'Legendary studio condenser. Smooth, natural response with subtle presence boost — the reference standard for recording.',
};

// ── Ribbon Microphones ──

export const royerR121: MicrophoneDefinition = {
  id: 'mic-royer-r121',
  name: 'Royer R-121 Ribbon',
  modelName: 'R-121',
  type: 'ribbon',
  frequencyResponse: [
    20, 0.7, 50, 0.85, 100, 0.95, 250, 1.0, 500, 1.0,
    1000, 1.0, 2000, 0.98, 4000, 0.9, 6000, 0.8, 8000, 0.7,
    10000, 0.6, 12000, 0.5, 16000, 0.35, 20000, 0.2,
  ],
  polarPattern: 'figure-8',
  sensitivityDb: -47,
  description: 'Modern ribbon mic with smooth, dark character. Tames harsh high frequencies — pairs beautifully with bright amps.',
};

export const classicRibbon: MicrophoneDefinition = {
  id: 'mic-ribbon',
  name: 'Classic Ribbon',
  modelName: 'Ribbon',
  type: 'ribbon',
  frequencyResponse: [
    20, 0.7, 50, 0.85, 100, 0.95, 250, 1.0, 500, 1.0,
    1000, 1.0, 2000, 0.95, 4000, 0.85, 8000, 0.7,
    12000, 0.55, 16000, 0.4, 20000, 0.25,
  ],
  polarPattern: 'figure-8',
  sensitivityDb: -50,
  description: 'Vintage-style ribbon with warm, rolled-off top end. Natural compression and smooth transients.',
};

// ── Legacy aliases for backward compatibility ──

export const condenserMic = u67;
export const ribbonMic = classicRibbon;
export const dynamicMic = sm57;

export const microphones: MicrophoneDefinition[] = [
  // Dynamic
  sm57,
  md421,
  sm58,
  // Condenser
  u67,
  at4050,
  u87,
  // Ribbon
  royerR121,
  classicRibbon,
];

/** Lookup a microphone by its model name (e.g., 'SM57', 'U67'). */
export function getMicByModel(modelName: string): MicrophoneDefinition | undefined {
  return microphones.find(
    (m) => m.modelName.toLowerCase() === modelName.toLowerCase(),
  );
}

/** Get all microphones of a specific type. */
export function getMicsByType(type: MicType): MicrophoneDefinition[] {
  return microphones.filter((m) => m.type === type);
}
