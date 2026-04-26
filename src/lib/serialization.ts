import type { AmpParameters, AmpChannel } from '@/types/amp';
import type { FxPedalInstance } from '@/types/fx';
import type { ToneStackJSON, FxChainJSON } from '@/types/tone-stack';

const TONE_STACK_VERSION = 1;
const FX_CHAIN_VERSION = 1;

const VALID_CHANNELS: AmpChannel[] = ['clean', 'crunch', 'overdrive'];

const AMP_PARAM_KEYS = [
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
] as const;

const AMP_PARAM_MIN = 1;
const AMP_PARAM_MAX = 10;

/**
 * Serializes amp parameters and model ID into a ToneStackJSON object.
 */
export function serializeToneStack(
  params: AmpParameters,
  modelId: string
): ToneStackJSON {
  return {
    version: TONE_STACK_VERSION,
    ampModelId: modelId,
    parameters: {
      preampGain: params.preampGain,
      volume: params.volume,
      masterVolume: params.masterVolume,
      masterGain: params.masterGain,
      bass: params.bass,
      middle: params.middle,
      treble: params.treble,
      tone: params.tone,
      presence: params.presence,
      resonance: params.resonance,
    },
    channel: params.channel,
    toggles: { ...params.toggles },
  };
}

/**
 * Deserializes a ToneStackJSON object into amp parameters and model ID.
 * Validates all fields and throws descriptive errors for invalid data.
 */
export function deserializeToneStack(json: ToneStackJSON): {
  modelId: string;
  params: AmpParameters;
} {
  if (json == null || typeof json !== 'object') {
    throw new Error('Invalid tone stack JSON: expected an object');
  }

  if (typeof json.version !== 'number') {
    throw new Error(
      `Invalid field "version": expected a number, got ${typeof json.version}`
    );
  }

  if (typeof json.ampModelId !== 'string' || json.ampModelId.length === 0) {
    throw new Error(
      `Invalid field "ampModelId": expected a non-empty string, got ${JSON.stringify(json.ampModelId)}`
    );
  }

  if (json.parameters == null || typeof json.parameters !== 'object') {
    throw new Error(
      `Invalid field "parameters": expected an object, got ${typeof json.parameters}`
    );
  }

  for (const key of AMP_PARAM_KEYS) {
    const value = json.parameters[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(
        `Invalid field "parameters.${key}": expected a finite number, got ${JSON.stringify(value)}`
      );
    }
    if (value < AMP_PARAM_MIN || value > AMP_PARAM_MAX) {
      throw new Error(
        `Invalid field "parameters.${key}": expected a number between ${AMP_PARAM_MIN} and ${AMP_PARAM_MAX}, got ${value}`
      );
    }
  }

  if (!VALID_CHANNELS.includes(json.channel as AmpChannel)) {
    throw new Error(
      `Invalid field "channel": expected one of ${VALID_CHANNELS.map((c) => `"${c}"`).join(', ')}, got ${JSON.stringify(json.channel)}`
    );
  }

  if (json.toggles == null || typeof json.toggles !== 'object') {
    throw new Error(
      `Invalid field "toggles": expected an object, got ${typeof json.toggles}`
    );
  }

  for (const [key, value] of Object.entries(json.toggles)) {
    if (typeof value !== 'boolean') {
      throw new Error(
        `Invalid field "toggles.${key}": expected a boolean, got ${typeof value}`
      );
    }
  }

  return {
    modelId: json.ampModelId,
    params: {
      preampGain: json.parameters.preampGain,
      volume: json.parameters.volume,
      masterVolume: json.parameters.masterVolume,
      masterGain: json.parameters.masterGain,
      bass: json.parameters.bass,
      middle: json.parameters.middle,
      treble: json.parameters.treble,
      tone: json.parameters.tone,
      presence: json.parameters.presence,
      resonance: json.parameters.resonance,
      channel: json.channel,
      toggles: { ...json.toggles },
    },
  };
}

/**
 * Serializes an array of FxPedalInstance into an FxChainJSON object.
 */
export function serializeFxChain(pedals: FxPedalInstance[]): FxChainJSON {
  return {
    version: FX_CHAIN_VERSION,
    pedals: pedals.map((pedal) => ({
      definitionId: pedal.definitionId,
      enabled: pedal.enabled,
      parameters: { ...pedal.parameters },
      position: pedal.position,
    })),
  };
}

/**
 * Deserializes an FxChainJSON object into an array of FxPedalInstance.
 * Validates all fields and throws descriptive errors for invalid data.
 */
export function deserializeFxChain(json: FxChainJSON): FxPedalInstance[] {
  if (json == null || typeof json !== 'object') {
    throw new Error('Invalid FX chain JSON: expected an object');
  }

  if (typeof json.version !== 'number') {
    throw new Error(
      `Invalid field "version": expected a number, got ${typeof json.version}`
    );
  }

  if (!Array.isArray(json.pedals)) {
    throw new Error(
      `Invalid field "pedals": expected an array, got ${typeof json.pedals}`
    );
  }

  return json.pedals.map((pedal, index) => {
    if (pedal == null || typeof pedal !== 'object') {
      throw new Error(
        `Invalid field "pedals[${index}]": expected an object, got ${typeof pedal}`
      );
    }

    if (
      typeof pedal.definitionId !== 'string' ||
      pedal.definitionId.length === 0
    ) {
      throw new Error(
        `Invalid field "pedals[${index}].definitionId": expected a non-empty string, got ${JSON.stringify(pedal.definitionId)}`
      );
    }

    if (typeof pedal.enabled !== 'boolean') {
      throw new Error(
        `Invalid field "pedals[${index}].enabled": expected a boolean, got ${typeof pedal.enabled}`
      );
    }

    if (pedal.parameters == null || typeof pedal.parameters !== 'object') {
      throw new Error(
        `Invalid field "pedals[${index}].parameters": expected an object, got ${typeof pedal.parameters}`
      );
    }

    for (const [key, value] of Object.entries(pedal.parameters)) {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(
          `Invalid field "pedals[${index}].parameters.${key}": expected a finite number, got ${JSON.stringify(value)}`
        );
      }
    }

    if (
      typeof pedal.position !== 'number' ||
      !Number.isFinite(pedal.position)
    ) {
      throw new Error(
        `Invalid field "pedals[${index}].position": expected a finite number, got ${JSON.stringify(pedal.position)}`
      );
    }

    return {
      definitionId: pedal.definitionId,
      instanceId: `${pedal.definitionId}-${index}`,
      enabled: pedal.enabled,
      parameters: { ...pedal.parameters },
      position: pedal.position,
    };
  });
}
