export type MicType = 'condenser' | 'ribbon' | 'dynamic';
export type MicPreset = 'center' | 'middle' | 'outside';

export interface Cabinet {
  id: string;
  name: string;
  speakerConfig: string;
  speakers: Speaker[];
  irData: Float32Array;
  visualConfig: CabinetVisualConfig;
}

export interface Speaker {
  id: string;
  name: string;
  frequencyResponse: number[];
  powerRating: number;
}

export interface MicPosition {
  x: number;
  y: number;
  z: number;
}

export interface MicConfiguration {
  type: MicType;
  position: MicPosition;
  distance: number;
  preset?: MicPreset;
}

export interface CabinetVisualConfig {
  bodyColor: string;
  grillPattern: string;
  logoSvgPath: string;
  width: number;
  height: number;
}
