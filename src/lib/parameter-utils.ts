import type { AmpParameters, AmpModel, AmpChannel } from '@/types/amp';

/**
 * Clamps a numeric value to the given [min, max] range.
 */
export function clampValue(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

const VALID_CHANNELS: AmpChannel[] = ['clean', 'crunch', 'overdrive'];

const NUMERIC_PARAM_KEYS: (keyof AmpParameters)[] = [
  'preampGain',
  'volume',
  'masterVolume',
  'masterGain',
  'bass',
  'middle',
  'treble',
  'tone',
  'presence',
  'resonance',
];

/**
 * Validates that all amp parameter values are within their defined ranges.
 * Numeric params must be in [1, 10], channel must be a valid AmpChannel,
 * and toggles must be boolean values.
 */
export function validateAmpParameters(params: AmpParameters): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const key of NUMERIC_PARAM_KEYS) {
    const value = params[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      errors.push(`${key} must be a finite number, got ${String(value)}`);
    } else if (value < 1 || value > 10) {
      errors.push(`${key} must be between 1 and 10, got ${value}`);
    }
  }

  if (!VALID_CHANNELS.includes(params.channel)) {
    errors.push(
      `channel must be one of ${VALID_CHANNELS.join(', ')}, got "${String(params.channel)}"`
    );
  }

  if (params.toggles === null || typeof params.toggles !== 'object' || Array.isArray(params.toggles)) {
    errors.push('toggles must be a Record<string, boolean>');
  } else {
    for (const [key, value] of Object.entries(params.toggles)) {
      if (typeof value !== 'boolean') {
        errors.push(`toggle "${key}" must be a boolean, got ${typeof value}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates that the tube count is between 1 and the model's preampStageCount.
 */
export function validatePreampTubeCount(
  count: number,
  model: AmpModel
): { valid: boolean; error?: string } {
  if (!Number.isInteger(count)) {
    return {
      valid: false,
      error: `Tube count must be an integer, got ${count}`,
    };
  }
  if (count < 1 || count > model.preampStageCount) {
    return {
      valid: false,
      error: `Tube count must be between 1 and ${model.preampStageCount} for ${model.name}, got ${count}`,
    };
  }
  return { valid: true };
}
