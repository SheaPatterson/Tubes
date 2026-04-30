import type { ToneStackConfig } from '@/types/tone-stack';

/**
 * Tone stack circuit configurations derived from real amplifier schematics.
 * Each config maps to one or more amp models and contains the component values
 * used by the DSP tone stack processor for accurate frequency response modeling.
 *
 * Source data: /public/tonestack/*.json
 */

export const bassmanToneStack: ToneStackConfig = {
  id: 'bassman-5f6a',
  name: 'Bassman 5F6-A',
  description: 'Classic Fender Bassman tone stack — the foundation of most guitar amp EQ circuits. Scooped mid character with interactive bass/middle/treble controls.',
  ampModelIds: ['twanger-banger'],
  globalControlValues: { RB: 0.31, RM: 0.32, RT: 0.61 },
  tonestacks: [
    {
      id: '5f6a',
      components: {
        RIN: '1.3k',
        RL: '1M',
        RB: { value: '1M', taper: 'A', control: 0.31 },
        RM: { value: '25k', taper: 'L', control: 0.65 },
        RT: { value: '250k', taper: 'L', control: 0.35 },
        R1: '56k',
        C1: '250p',
        C2: '20n',
        C3: '20n',
      },
    },
  ],
};

export const voxToneStack: ToneStackConfig = {
  id: 'vox',
  name: 'Vox AC30',
  description: 'Vox-style tone stack with distinctive chime and jangle. Uses a cut-only treble control and interactive bass for the classic British invasion sound.',
  ampModelIds: ['chimera-30'],
  globalControlValues: { RB: 0.31, RM: 0.32, RT: 0.61, RV: 0.5 },
  tonestacks: [
    {
      id: 'vox',
      components: {
        RIN: '717',
        RL: '600k',
        RB: { value: '1M', taper: 'A', control: 0.5 },
        RT: { value: '1M', taper: 'A', control: 0.5 },
        R1: '100k',
        R2: '10k',
        C1: '47p',
        C2: '22n',
        C3: '22n',
      },
    },
    {
      id: 'crte',
      components: {
        RIN: '1k',
        RL: '1M',
        RB: { value: '250k', taper: 'A', control: 0.5 },
        RM: { value: '50k', taper: 'A', control: 0.5 },
        RT: { value: '250k', taper: 'L', control: 0.5 },
        R1: '68k',
        R2: '47k',
        R3: '22k',
        R4: '10k',
        C1: '220p',
        C2: '47n',
        C3: '220n',
        C4: '4.7n',
      },
    },
  ],
};

export const drZToneStack: ToneStackConfig = {
  id: 'drz',
  name: 'Dr. Z',
  description: 'Simplified tone stack with treble-only control. Produces a warm, full-bodied tone with natural midrange emphasis — favored for blues and classic rock.',
  ampModelIds: [],
  globalControlValues: { RB: 0.31, RM: 0.32, RT: 0.61, RV: 0.5 },
  tonestacks: [
    {
      id: 'drz',
      components: {
        RIN: '38k',
        RL: '1M',
        RT: { value: '1M', taper: 'A', control: 0.5 },
        R1: '330k',
        R2: '330k',
        C1: '10n',
        C2: '120p',
        C3: '4.7n',
      },
    },
  ],
};

export const fenderTrebleBassToneStack: ToneStackConfig = {
  id: 'fender-tb',
  name: 'Fender Treble-Bass',
  description: 'Early Fender two-knob tone stack. Simple treble/bass interaction with a fixed midrange — the sound of 1950s tweed amps.',
  ampModelIds: ['twanger-banger'],
  globalControlValues: { RB: 0.31, RM: 0.32, RT: 0.61 },
  tonestacks: [
    {
      id: 'ftb',
      components: {
        RIN: '38k',
        RL: '1M',
        RB: { value: '250k', taper: 'A', control: 0.5 },
        RM: '6.8k',
        RT: { value: '250k', taper: 'A', control: 0.5 },
        R1: '100k',
        C1: '250p',
        C2: '100n',
        C3: '47n',
      },
    },
  ],
};

export const fenderTMBToneStack: ToneStackConfig = {
  id: 'fender-tmb',
  name: 'Fender Treble-Mid-Bass',
  description: 'Full three-knob Fender tone stack used in Blackface and Silverface amps. Scooped midrange with wide tonal range.',
  ampModelIds: ['twanger-deluxe', 'twanger-twin'],
  globalControlValues: { RB: 0.31, RM: 0.32, RT: 0.61 },
  tonestacks: [
    {
      id: 'ftmb',
      components: {
        RIN: '38k',
        RL: '1M',
        RB: { value: '250k', taper: 'A', control: 0.5 },
        RM: { value: '10k', taper: 'L', control: 0.5 },
        RT: { value: '250k', taper: 'A', control: 0.5 },
        R1: '100k',
        C1: '250p',
        C2: '100n',
        C3: '47n',
      },
    },
  ],
};

/** Marshall-style tone stack — derived from the Bassman with modified component values */
export const marshallToneStack: ToneStackConfig = {
  id: 'marshall',
  name: 'Marshall',
  description: 'Marshall-derived tone stack with tighter bass and more aggressive midrange than the Bassman. The backbone of British rock tone.',
  ampModelIds: ['winston-chl'],
  globalControlValues: { RB: 0.5, RM: 0.5, RT: 0.5 },
  tonestacks: [
    {
      id: 'marshall',
      components: {
        RIN: '33k',
        RL: '1M',
        RB: { value: '1M', taper: 'A', control: 0.5 },
        RM: { value: '25k', taper: 'L', control: 0.5 },
        RT: { value: '250k', taper: 'L', control: 0.5 },
        R1: '33k',
        C1: '470p',
        C2: '22n',
        C3: '22n',
      },
    },
  ],
};

export const toneStacks: ToneStackConfig[] = [
  bassmanToneStack,
  marshallToneStack,
  voxToneStack,
  drZToneStack,
  fenderTrebleBassToneStack,
  fenderTMBToneStack,
];

/** Lookup a tone stack config by its ID. */
export function getToneStack(id: string): ToneStackConfig | undefined {
  return toneStacks.find((ts) => ts.id === id);
}

/** Find the tone stack(s) associated with an amp model. */
export function getToneStacksForAmp(ampModelId: string): ToneStackConfig[] {
  return toneStacks.filter((ts) => ts.ampModelIds.includes(ampModelId));
}
