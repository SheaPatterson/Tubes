import type { MicType } from '@/types/cabinet';

export interface MicrophoneDefinition {
  id: string;
  name: string;
  type: MicType;
  frequencyResponse: number[];
  polarPattern: string;
  sensitivityDb: number;
}

export const condenserMic: MicrophoneDefinition = {
  id: 'mic-condenser',
  name: 'Studio Condenser',
  type: 'condenser',
  frequencyResponse: [
    20, 0.8, 50, 0.9, 100, 1.0, 250, 1.0, 500, 1.0,
    1000, 1.05, 2000, 1.1, 4000, 1.15, 8000, 1.2,
    12000, 1.15, 16000, 1.05, 20000, 0.9,
  ],
  polarPattern: 'cardioid',
  sensitivityDb: -32,
};

export const ribbonMic: MicrophoneDefinition = {
  id: 'mic-ribbon',
  name: 'Classic Ribbon',
  type: 'ribbon',
  frequencyResponse: [
    20, 0.7, 50, 0.85, 100, 0.95, 250, 1.0, 500, 1.0,
    1000, 1.0, 2000, 0.95, 4000, 0.85, 8000, 0.7,
    12000, 0.55, 16000, 0.4, 20000, 0.25,
  ],
  polarPattern: 'figure-8',
  sensitivityDb: -50,
};

export const dynamicMic: MicrophoneDefinition = {
  id: 'mic-dynamic',
  name: 'Stage Dynamic',
  type: 'dynamic',
  frequencyResponse: [
    20, 0.5, 50, 0.7, 100, 0.9, 250, 1.0, 500, 1.0,
    1000, 1.0, 2000, 1.1, 4000, 1.15, 8000, 1.0,
    12000, 0.7, 16000, 0.4, 20000, 0.2,
  ],
  polarPattern: 'cardioid',
  sensitivityDb: -55,
};

export const microphones: MicrophoneDefinition[] = [
  condenserMic,
  ribbonMic,
  dynamicMic,
];
