import { describe, it, expect } from 'vitest';
import { clampValue, validateAmpParameters, validatePreampTubeCount } from '@/lib/parameter-utils';
import type { AmpParameters } from '@/types/amp';
import { ampModels } from '@/data/amp-models';

function makeValidParams(overrides?: Partial<AmpParameters>): AmpParameters {
  return {
    preampGain: 5,
    volume: 5,
    masterVolume: 5,
    masterGain: 5,
    bass: 5,
    middle: 5,
    treble: 5,
    tone: 5,
    presence: 5,
    resonance: 5,
    channel: 'clean',
    toggles: {},
    ...overrides,
  };
}

describe('clampValue', () => {
  it('returns the value when within range', () => {
    expect(clampValue(5, 1, 10)).toBe(5);
  });

  it('clamps to min when value is below range', () => {
    expect(clampValue(0, 1, 10)).toBe(1);
    expect(clampValue(-100, 1, 10)).toBe(1);
  });

  it('clamps to max when value is above range', () => {
    expect(clampValue(11, 1, 10)).toBe(10);
    expect(clampValue(999, 1, 10)).toBe(10);
  });

  it('returns min when value equals min', () => {
    expect(clampValue(1, 1, 10)).toBe(1);
  });

  it('returns max when value equals max', () => {
    expect(clampValue(10, 1, 10)).toBe(10);
  });
});

describe('validateAmpParameters', () => {
  it('accepts valid parameters', () => {
    const result = validateAmpParameters(makeValidParams());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects numeric params below 1', () => {
    const result = validateAmpParameters(makeValidParams({ bass: 0 }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('bass'));
  });

  it('rejects numeric params above 10', () => {
    const result = validateAmpParameters(makeValidParams({ treble: 11 }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('treble'));
  });

  it('rejects NaN numeric params', () => {
    const result = validateAmpParameters(makeValidParams({ volume: NaN }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('volume'));
  });

  it('rejects invalid channel', () => {
    const result = validateAmpParameters(
      makeValidParams({ channel: 'distortion' as never })
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('channel'));
  });

  it('accepts all valid channels', () => {
    for (const channel of ['clean', 'crunch', 'overdrive'] as const) {
      const result = validateAmpParameters(makeValidParams({ channel }));
      expect(result.valid).toBe(true);
    }
  });

  it('rejects non-boolean toggle values', () => {
    const result = validateAmpParameters(
      makeValidParams({ toggles: { deep: 'yes' as unknown as boolean } })
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('deep'));
  });

  it('accepts valid boolean toggles', () => {
    const result = validateAmpParameters(
      makeValidParams({ toggles: { deep: true, bright: false } })
    );
    expect(result.valid).toBe(true);
  });

  it('collects multiple errors', () => {
    const result = validateAmpParameters(
      makeValidParams({ bass: 0, treble: 11, channel: 'bad' as never })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('validatePreampTubeCount', () => {
  const winstonCHL = ampModels.find((m) => m.id === 'winston-chl')!;
  const usSteelPlate = ampModels.find((m) => m.id === 'us-steel-plate')!;

  it('accepts tube count of 1', () => {
    expect(validatePreampTubeCount(1, winstonCHL).valid).toBe(true);
  });

  it('accepts tube count equal to preampStageCount', () => {
    expect(validatePreampTubeCount(winstonCHL.preampStageCount, winstonCHL).valid).toBe(true);
  });

  it('rejects tube count of 0', () => {
    const result = validatePreampTubeCount(0, winstonCHL);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects tube count exceeding preampStageCount', () => {
    const result = validatePreampTubeCount(winstonCHL.preampStageCount + 1, winstonCHL);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(String(winstonCHL.preampStageCount));
  });

  it('rejects non-integer tube count', () => {
    const result = validatePreampTubeCount(2.5, winstonCHL);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('integer');
  });

  it('rejects negative tube count', () => {
    const result = validatePreampTubeCount(-1, usSteelPlate);
    expect(result.valid).toBe(false);
  });

  it('works correctly for different amp models', () => {
    // US Steel Plate has preampStageCount of 5
    expect(validatePreampTubeCount(5, usSteelPlate).valid).toBe(true);
    expect(validatePreampTubeCount(6, usSteelPlate).valid).toBe(false);
  });
});
