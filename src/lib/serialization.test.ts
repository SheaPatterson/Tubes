import { describe, it, expect } from 'vitest';
import {
  serializeToneStack,
  deserializeToneStack,
  serializeFxChain,
  deserializeFxChain,
} from '@/lib/serialization';
import type { AmpParameters } from '@/types/amp';
import type { FxPedalInstance } from '@/types/fx';
import type { ToneStackJSON, FxChainJSON } from '@/types/tone-stack';

const validParams: AmpParameters = {
  preampGain: 5,
  volume: 6,
  masterVolume: 7,
  masterGain: 4,
  bass: 5,
  middle: 6,
  treble: 7,
  tone: 5,
  presence: 6,
  resonance: 4,
  channel: 'crunch',
  toggles: { toneShift: true, deep: false },
};

const validModelId = 'winston-chl';

describe('serializeToneStack', () => {
  it('produces a valid ToneStackJSON from AmpParameters', () => {
    const json = serializeToneStack(validParams, validModelId);
    expect(json.version).toBe(1);
    expect(json.ampModelId).toBe(validModelId);
    expect(json.channel).toBe('crunch');
    expect(json.parameters.bass).toBe(5);
    expect(json.toggles).toEqual({ toneShift: true, deep: false });
  });
});

describe('deserializeToneStack', () => {
  it('round-trips correctly', () => {
    const json = serializeToneStack(validParams, validModelId);
    const result = deserializeToneStack(json);
    expect(result.modelId).toBe(validModelId);
    expect(result.params).toEqual(validParams);
  });

  it('throws for missing version', () => {
    const json = serializeToneStack(validParams, validModelId);
    const bad = { ...json, version: undefined } as unknown as ToneStackJSON;
    expect(() => deserializeToneStack(bad)).toThrow('"version"');
  });

  it('throws for missing ampModelId', () => {
    const json = serializeToneStack(validParams, validModelId);
    const bad = { ...json, ampModelId: '' } as ToneStackJSON;
    expect(() => deserializeToneStack(bad)).toThrow('"ampModelId"');
  });

  it('throws for parameter out of range', () => {
    const json = serializeToneStack(validParams, validModelId);
    json.parameters.bass = 11;
    expect(() => deserializeToneStack(json)).toThrow('"parameters.bass"');
  });

  it('throws for parameter below range', () => {
    const json = serializeToneStack(validParams, validModelId);
    json.parameters.treble = 0;
    expect(() => deserializeToneStack(json)).toThrow('"parameters.treble"');
  });

  it('throws for invalid channel', () => {
    const json = serializeToneStack(validParams, validModelId);
    const bad = { ...json, channel: 'distortion' } as unknown as ToneStackJSON;
    expect(() => deserializeToneStack(bad)).toThrow('"channel"');
  });

  it('throws for non-boolean toggle value', () => {
    const json = serializeToneStack(validParams, validModelId);
    const bad = {
      ...json,
      toggles: { toneShift: 'yes' },
    } as unknown as ToneStackJSON;
    expect(() => deserializeToneStack(bad)).toThrow('"toggles.toneShift"');
  });

  it('throws for missing parameters object', () => {
    const json = serializeToneStack(validParams, validModelId);
    const bad = { ...json, parameters: null } as unknown as ToneStackJSON;
    expect(() => deserializeToneStack(bad)).toThrow('"parameters"');
  });

  it('throws for NaN parameter value', () => {
    const json = serializeToneStack(validParams, validModelId);
    json.parameters.volume = NaN;
    expect(() => deserializeToneStack(json)).toThrow('"parameters.volume"');
  });
});

const validPedals: FxPedalInstance[] = [
  {
    definitionId: 'mac-super-comp',
    instanceId: 'inst-1',
    enabled: true,
    parameters: { level: 5, attack: 3 },
    position: 0,
  },
  {
    definitionId: 'king-super-overdrive',
    instanceId: 'inst-2',
    enabled: false,
    parameters: { drive: 7, tone: 6, level: 5 },
    position: 1,
  },
];

describe('serializeFxChain', () => {
  it('produces a valid FxChainJSON', () => {
    const json = serializeFxChain(validPedals);
    expect(json.version).toBe(1);
    expect(json.pedals).toHaveLength(2);
    expect(json.pedals[0].definitionId).toBe('mac-super-comp');
    expect(json.pedals[1].enabled).toBe(false);
  });
});

describe('deserializeFxChain', () => {
  it('round-trips correctly (preserving definitionId, enabled, parameters, position)', () => {
    const json = serializeFxChain(validPedals);
    const result = deserializeFxChain(json);
    expect(result).toHaveLength(2);
    expect(result[0].definitionId).toBe('mac-super-comp');
    expect(result[0].enabled).toBe(true);
    expect(result[0].parameters).toEqual({ level: 5, attack: 3 });
    expect(result[0].position).toBe(0);
    expect(result[1].definitionId).toBe('king-super-overdrive');
  });

  it('throws for missing version', () => {
    const bad = { pedals: [] } as unknown as FxChainJSON;
    expect(() => deserializeFxChain(bad)).toThrow('"version"');
  });

  it('throws for non-array pedals', () => {
    const bad = { version: 1, pedals: 'not-array' } as unknown as FxChainJSON;
    expect(() => deserializeFxChain(bad)).toThrow('"pedals"');
  });

  it('throws for pedal with missing definitionId', () => {
    const bad: FxChainJSON = {
      version: 1,
      pedals: [{ definitionId: '', enabled: true, parameters: {}, position: 0 }],
    };
    expect(() => deserializeFxChain(bad)).toThrow('"pedals[0].definitionId"');
  });

  it('throws for pedal with non-boolean enabled', () => {
    const bad = {
      version: 1,
      pedals: [
        { definitionId: 'test', enabled: 1, parameters: {}, position: 0 },
      ],
    } as unknown as FxChainJSON;
    expect(() => deserializeFxChain(bad)).toThrow('"pedals[0].enabled"');
  });

  it('throws for pedal with non-object parameters', () => {
    const bad = {
      version: 1,
      pedals: [
        { definitionId: 'test', enabled: true, parameters: null, position: 0 },
      ],
    } as unknown as FxChainJSON;
    expect(() => deserializeFxChain(bad)).toThrow('"pedals[0].parameters"');
  });

  it('throws for pedal with non-number parameter value', () => {
    const bad = {
      version: 1,
      pedals: [
        {
          definitionId: 'test',
          enabled: true,
          parameters: { drive: 'high' },
          position: 0,
        },
      ],
    } as unknown as FxChainJSON;
    expect(() => deserializeFxChain(bad)).toThrow(
      '"pedals[0].parameters.drive"'
    );
  });

  it('throws for pedal with non-number position', () => {
    const bad = {
      version: 1,
      pedals: [
        {
          definitionId: 'test',
          enabled: true,
          parameters: {},
          position: 'first',
        },
      ],
    } as unknown as FxChainJSON;
    expect(() => deserializeFxChain(bad)).toThrow('"pedals[0].position"');
  });

  it('deserializes empty pedal array', () => {
    const json: FxChainJSON = { version: 1, pedals: [] };
    const result = deserializeFxChain(json);
    expect(result).toEqual([]);
  });
});
