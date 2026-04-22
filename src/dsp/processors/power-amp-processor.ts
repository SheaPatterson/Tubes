/**
 * PowerAmpProcessor — AudioWorklet processor modeling tube power amp
 * behavior with sag, bias, voltage response, and dynamic compression.
 *
 * Responsibilities:
 *   • Model 6 tube types: KT88, 6L6, EL34, EL84, 12BH7, 12AU7
 *   • Each tube type has characteristic sag coefficient, bias default,
 *     voltage default, compression curve, and dynamic range
 *   • masterVolume AudioParam (a-rate) controls output level
 *   • drive AudioParam (k-rate) controls power amp saturation (0–1)
 *   • bias AudioParam (k-rate) affects operating point
 *   • Drive 0–0.69: clean-to-lightly-overdriven, minimal compression
 *   • Drive 0.70–1.0: progressive sag-based compression reducing
 *     pick-attack transients proportionally to drive level
 *   • Sag modeled as slow envelope follower reducing headroom under
 *     sustained high-level signals
 *
 * Tube type selection arrives via MessagePort. masterVolume is a-rate
 * for sample-accurate automation; drive and bias are k-rate.
 *
 * NOTE: AudioWorklet processors run in a special scope where
 * `AudioWorkletProcessor` and `registerProcessor` are globally available.
 * This file is self-contained for `addModule()` loading but also exports
 * the class for testability.
 */

// ─── Inline helpers (no imports in worklet scope) ────────────────────

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// ─── Tube type definitions ───────────────────────────────────────────

type PowerAmpTubeType = 'KT88' | '6L6' | 'EL34' | 'EL84' | '12BH7' | '12AU7';

interface TubeCharacteristics {
  /** Sag coefficient — higher = more sag compression under load. */
  sagCoefficient: number;
  /** Default bias operating point (0–1). */
  biasDefault: number;
  /** Default plate voltage (normalized 0–1). */
  voltageDefault: number;
  /** Compression curve knee points [threshold, ratio]. */
  compressionCurve: [number, number];
  /** Dynamic range bounds [min, max] in linear amplitude. */
  dynamicRange: { min: number; max: number };
}

const TUBE_CHARACTERISTICS: Record<PowerAmpTubeType, TubeCharacteristics> = {
  KT88: {
    sagCoefficient: 0.15,
    biasDefault: 0.65,
    voltageDefault: 0.85,
    compressionCurve: [0.6, 4.0],
    dynamicRange: { min: 0.01, max: 1.0 },
  },
  '6L6': {
    sagCoefficient: 0.20,
    biasDefault: 0.60,
    voltageDefault: 0.80,
    compressionCurve: [0.55, 3.5],
    dynamicRange: { min: 0.01, max: 1.0 },
  },
  EL34: {
    sagCoefficient: 0.25,
    biasDefault: 0.55,
    voltageDefault: 0.75,
    compressionCurve: [0.50, 3.0],
    dynamicRange: { min: 0.01, max: 1.0 },
  },
  EL84: {
    sagCoefficient: 0.35,
    biasDefault: 0.50,
    voltageDefault: 0.70,
    compressionCurve: [0.45, 2.5],
    dynamicRange: { min: 0.02, max: 1.0 },
  },
  '12BH7': {
    sagCoefficient: 0.30,
    biasDefault: 0.55,
    voltageDefault: 0.72,
    compressionCurve: [0.48, 2.8],
    dynamicRange: { min: 0.02, max: 1.0 },
  },
  '12AU7': {
    sagCoefficient: 0.40,
    biasDefault: 0.45,
    voltageDefault: 0.65,
    compressionCurve: [0.40, 2.0],
    dynamicRange: { min: 0.03, max: 1.0 },
  },
};

const VALID_TUBE_TYPES: PowerAmpTubeType[] = ['KT88', '6L6', 'EL34', 'EL84', '12BH7', '12AU7'];

// ─── Sag envelope follower ───────────────────────────────────────────

/**
 * Slow envelope follower that tracks signal level and models power
 * supply sag. Under sustained high-level signals the sag value rises,
 * reducing available headroom.
 */
interface SagState {
  /** Current sag envelope value (0 = no sag, approaches 1 under load). */
  envelope: number;
  /** Attack coefficient (how fast sag builds up). */
  attackCoeff: number;
  /** Release coefficient (how fast sag recovers). */
  releaseCoeff: number;
}

function createSagState(sagCoefficient: number, sampleRate: number): SagState {
  // Sag is a slow phenomenon — attack ~50ms, release ~200ms
  // Scale by sagCoefficient to differentiate tube types
  const attackMs = 50 * (1 + sagCoefficient);
  const releaseMs = 200 * (1 + sagCoefficient);
  return {
    envelope: 0,
    attackCoeff: 1 - Math.exp(-1 / (sampleRate * attackMs / 1000)),
    releaseCoeff: 1 - Math.exp(-1 / (sampleRate * releaseMs / 1000)),
  };
}

function updateSagEnvelope(state: SagState, inputLevel: number, sagCoefficient: number): number {
  const target = inputLevel * sagCoefficient;
  if (target > state.envelope) {
    state.envelope += state.attackCoeff * (target - state.envelope);
  } else {
    state.envelope += state.releaseCoeff * (target - state.envelope);
  }
  state.envelope = clamp(state.envelope, 0, 1);
  return state.envelope;
}

// ─── Processor ───────────────────────────────────────────────────────

/** Drive threshold above which sag compression kicks in. */
const SAG_DRIVE_THRESHOLD = 0.70;

const PARAM_DESCRIPTORS: AudioParamDescriptor[] = [
  { name: 'masterVolume', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'a-rate' },
  { name: 'drive', defaultValue: 0.3, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
  { name: 'bias', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
];

export class PowerAmpProcessor extends AudioWorkletProcessor {
  /** Whether the processor is still active. */
  private alive = true;

  /** Current tube type. */
  private tubeType: PowerAmpTubeType = 'EL34';

  /** Current tube characteristics. */
  private tubeChars: TubeCharacteristics = { ...TUBE_CHARACTERISTICS.EL34 };

  /** Sag envelope follower state. */
  private sagState: SagState;

  /** Cached sample rate. */
  private sampleRate: number;

  static get parameterDescriptors(): AudioParamDescriptor[] {
    return PARAM_DESCRIPTORS;
  }

  constructor() {
    super();
    this.sampleRate = (globalThis as unknown as { sampleRate: number }).sampleRate ?? 44100;
    this.sagState = createSagState(this.tubeChars.sagCoefficient, this.sampleRate);

    this.port.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      switch (data.type) {
        case 'dispose':
          this.alive = false;
          break;

        case 'setTubeType':
          this.setTubeType(data.tubeType as string);
          break;

        case 'configure':
          if (data.tubeType !== undefined) {
            this.setTubeType(data.tubeType as string);
          }
          break;
      }
    };
  }

  /**
   * Switch the power amp tube type, updating all characteristics.
   */
  private setTubeType(tubeType: string): void {
    if (!VALID_TUBE_TYPES.includes(tubeType as PowerAmpTubeType)) return;
    this.tubeType = tubeType as PowerAmpTubeType;
    this.tubeChars = { ...TUBE_CHARACTERISTICS[this.tubeType] };
    this.sagState = createSagState(this.tubeChars.sagCoefficient, this.sampleRate);
  }

  /**
   * Compute the compression ratio for a given drive level.
   *
   * - Drive 0–0.69: minimal compression (ratio near 1.0)
   * - Drive 0.70–1.0: progressive compression scaling from base
   *   to the tube's max compression ratio
   */
  private getCompressionRatio(drive: number): number {
    const [, maxRatio] = this.tubeChars.compressionCurve;
    if (drive < SAG_DRIVE_THRESHOLD) {
      // Clean zone: very light compression, linearly scaled
      // from 1.0 at drive=0 to 1.1 at drive=0.69
      return 1.0 + (drive / SAG_DRIVE_THRESHOLD) * 0.1;
    }
    // High-drive zone: progressive compression
    // Normalized position within the high-drive range [0.70, 1.0]
    const t = (drive - SAG_DRIVE_THRESHOLD) / (1.0 - SAG_DRIVE_THRESHOLD);
    // Ramp from 1.1 to the tube's max compression ratio
    return 1.1 + t * (maxRatio - 1.1);
  }

  /**
   * Apply bias-dependent waveshaping.
   *
   * Low bias → crossover distortion (asymmetric clipping near zero).
   * High bias → more saturation (symmetric soft-clip).
   */
  private applyBiasWaveshaping(sample: number, bias: number, drive: number): number {
    // Bias shifts the operating point
    const biasOffset = (bias - 0.5) * 0.3;
    let s = sample + biasOffset;

    // Drive-dependent saturation amount
    const satAmount = 1.0 + drive * 4.0;
    s = Math.tanh(s * satAmount);

    // At low bias, introduce crossover distortion (dead zone near zero)
    if (bias < 0.4) {
      const deadZone = (0.4 - bias) * 0.15;
      if (Math.abs(s) < deadZone) {
        s = 0;
      } else {
        s = s > 0 ? s - deadZone : s + deadZone;
      }
    }

    return s;
  }

  /**
   * Apply sag-based compression to reduce pick-attack transients.
   * Only active when drive > 70%.
   */
  private applySagCompression(
    sample: number,
    sagAmount: number,
    compressionRatio: number,
  ): number {
    const threshold = this.tubeChars.compressionCurve[0];

    // Reduce headroom based on sag
    const headroom = 1.0 - sagAmount * 0.5;
    const scaledSample = sample * headroom;

    const abs = Math.abs(scaledSample);
    if (abs <= threshold) return scaledSample;

    // Compress above threshold
    const excess = abs - threshold;
    const compressed = threshold + excess / compressionRatio;
    return scaledSample > 0 ? compressed : -compressed;
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    if (!this.alive) return false;

    const input = inputs[0];
    const output = outputs[0];

    // No input connected — output silence.
    if (!input || input.length === 0) {
      for (let ch = 0; ch < output.length; ch++) {
        output[ch].fill(0);
      }
      return true;
    }

    const blockSize = input[0].length;
    const masterVolumeParam = parameters['masterVolume'];
    const driveParam = parameters['drive'];
    const biasParam = parameters['bias'];

    // k-rate: read once per block
    const drive = clamp(driveParam ? driveParam[0] : 0.3, 0, 1);
    const bias = clamp(biasParam ? biasParam[0] : this.tubeChars.biasDefault, 0, 1);

    const compressionRatio = this.getCompressionRatio(drive);
    const isHighDrive = drive >= SAG_DRIVE_THRESHOLD;
    const { min: dynMin, max: dynMax } = this.tubeChars.dynamicRange;

    for (let ch = 0; ch < output.length; ch++) {
      const inp = input[ch] ?? input[0];
      const out = output[ch];

      for (let i = 0; i < blockSize; i++) {
        const masterVolume = masterVolumeParam.length > 1
          ? masterVolumeParam[i]
          : masterVolumeParam[0];

        let sample = inp[i];

        // Apply bias-dependent waveshaping
        sample = this.applyBiasWaveshaping(sample, bias, drive);

        // Compute instantaneous signal level for sag envelope
        const level = Math.abs(sample);

        // Update sag envelope (slow follower)
        const sagAmount = updateSagEnvelope(
          this.sagState,
          level,
          this.tubeChars.sagCoefficient,
        );

        // Apply sag compression when in high-drive zone
        if (isHighDrive) {
          sample = this.applySagCompression(sample, sagAmount, compressionRatio);
        }

        // Apply master volume
        sample *= clamp(masterVolume, 0, 1);

        // Clamp to tube's dynamic range
        sample = clamp(sample, -dynMax, dynMax);
        if (Math.abs(sample) < dynMin) {
          sample = 0;
        }

        out[i] = sample;
      }
    }

    return true;
  }
}

// ── Exported helpers for testing ─────────────────────────────────────

export {
  TUBE_CHARACTERISTICS,
  VALID_TUBE_TYPES,
  SAG_DRIVE_THRESHOLD,
  createSagState,
  updateSagEnvelope,
};
export type { PowerAmpTubeType, TubeCharacteristics, SagState };

// Register in AudioWorklet scope (global `registerProcessor` exists there).
if (typeof registerProcessor === 'function') {
  registerProcessor('power-amp-processor', PowerAmpProcessor);
}
