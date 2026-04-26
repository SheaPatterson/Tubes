/**
 * AmplifierProcessor — AudioWorklet processor modeling the amplifier's
 * tone stack EQ and channel switching.
 *
 * Responsibilities:
 *   • 5-band parametric EQ (bass, mid, treble, presence, resonance)
 *     using biquad filter approximations
 *   • Channel switching (clean, crunch, overdrive) with per-channel
 *     gain/saturation characteristics
 *   • Accept manufacturer-specific tone stack configuration via
 *     MessagePort (center frequencies, Q values, gain ranges)
 *
 * Structural changes (channel, tone stack config) arrive via
 * MessagePort. The 5 EQ band levels are AudioParams for
 * sample-accurate automation.
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

// ─── Biquad filter implementation ────────────────────────────────────

/**
 * Second-order biquad filter (Direct Form II Transposed).
 * Used to approximate each EQ band in the tone stack.
 */
interface BiquadState {
  b0: number; b1: number; b2: number;
  a1: number; a2: number;
  z1: number; z2: number;
}

function createBiquadPeaking(
  frequency: number,
  q: number,
  gainDb: number,
  sampleRate: number,
): BiquadState {
  const A = Math.pow(10, gainDb / 40);
  const w0 = 2 * Math.PI * frequency / sampleRate;
  const sinW0 = Math.sin(w0);
  const cosW0 = Math.cos(w0);
  const alpha = sinW0 / (2 * q);

  const b0 = 1 + alpha * A;
  const b1 = -2 * cosW0;
  const b2 = 1 - alpha * A;
  const a0 = 1 + alpha / A;
  const a1 = -2 * cosW0;
  const a2 = 1 - alpha / A;

  return {
    b0: b0 / a0, b1: b1 / a0, b2: b2 / a0,
    a1: a1 / a0, a2: a2 / a0,
    z1: 0, z2: 0,
  };
}

function processBiquad(state: BiquadState, sample: number): number {
  const out = state.b0 * sample + state.z1;
  state.z1 = state.b1 * sample - state.a1 * out + state.z2;
  state.z2 = state.b2 * sample - state.a2 * out;
  return out;
}

function updateBiquadPeaking(
  state: BiquadState,
  frequency: number,
  q: number,
  gainDb: number,
  sampleRate: number,
): void {
  const A = Math.pow(10, gainDb / 40);
  const w0 = 2 * Math.PI * frequency / sampleRate;
  const sinW0 = Math.sin(w0);
  const cosW0 = Math.cos(w0);
  const alpha = sinW0 / (2 * q);

  const b0 = 1 + alpha * A;
  const b1 = -2 * cosW0;
  const b2 = 1 - alpha * A;
  const a0 = 1 + alpha / A;
  const a1 = -2 * cosW0;
  const a2 = 1 - alpha / A;

  state.b0 = b0 / a0;
  state.b1 = b1 / a0;
  state.b2 = b2 / a0;
  state.a1 = a1 / a0;
  state.a2 = a2 / a0;
  // Preserve z1, z2 to avoid clicks on parameter changes
}

// ─── Channel types and saturation ────────────────────────────────────

type ChannelType = 'clean' | 'crunch' | 'overdrive';

interface ChannelCharacteristics {
  /** Pre-EQ gain multiplier. */
  preGain: number;
  /** Post-saturation makeup gain. */
  postGain: number;
  /** Saturation drive amount (0 = none, higher = more). */
  saturationDrive: number;
  /** Compression ratio (1 = none). */
  compressionRatio: number;
}

const CHANNEL_DEFAULTS: Record<ChannelType, ChannelCharacteristics> = {
  clean: {
    preGain: 1.0,
    postGain: 1.0,
    saturationDrive: 0.0,
    compressionRatio: 1.0,
  },
  crunch: {
    preGain: 1.8,
    postGain: 0.85,
    saturationDrive: 2.0,
    compressionRatio: 1.5,
  },
  overdrive: {
    preGain: 3.5,
    postGain: 0.65,
    saturationDrive: 6.0,
    compressionRatio: 3.0,
  },
};

/**
 * Apply channel-specific saturation to a sample.
 *   - Clean: pass-through (minimal coloring)
 *   - Crunch: moderate tanh saturation
 *   - Overdrive: heavy tanh saturation with compression
 */
function applySaturation(sample: number, chars: ChannelCharacteristics): number {
  let s = sample * chars.preGain;

  if (chars.saturationDrive > 0) {
    // Drive into tanh waveshaper
    s = Math.tanh(s * chars.saturationDrive) / Math.tanh(chars.saturationDrive || 1);
  }

  // Simple soft-knee compression
  if (chars.compressionRatio > 1) {
    const threshold = 0.5;
    const abs = Math.abs(s);
    if (abs > threshold) {
      const excess = abs - threshold;
      const compressed = threshold + excess / chars.compressionRatio;
      s = s > 0 ? compressed : -compressed;
    }
  }

  return s * chars.postGain;
}

// ─── Tone stack band configuration ───────────────────────────────────

interface ToneStackBandConfig {
  frequency: number;  // Center frequency in Hz
  q: number;          // Q factor
  minGain: number;    // Min gain in dB (when knob = 0)
  maxGain: number;    // Max gain in dB (when knob = 1)
}

/** Default tone stack configuration (generic amp). */
const DEFAULT_TONE_STACK: Record<string, ToneStackBandConfig> = {
  bass:      { frequency: 100,   q: 0.7,  minGain: -15, maxGain: 15 },
  mid:       { frequency: 800,   q: 1.0,  minGain: -12, maxGain: 12 },
  treble:    { frequency: 3200,  q: 0.8,  minGain: -15, maxGain: 15 },
  presence:  { frequency: 5500,  q: 0.9,  minGain: -10, maxGain: 10 },
  resonance: { frequency: 80,    q: 0.5,  minGain: -10, maxGain: 10 },
};

const BAND_NAMES = ['bass', 'mid', 'treble', 'presence', 'resonance'] as const;

// ─── Processor ───────────────────────────────────────────────────────

const PARAM_DESCRIPTORS: AudioParamDescriptor[] = [
  { name: 'bass',      defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
  { name: 'mid',       defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
  { name: 'treble',    defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
  { name: 'presence',  defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
  { name: 'resonance', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
];

export class AmplifierProcessor extends AudioWorkletProcessor {
  /** Whether the processor is still active. */
  private alive = true;

  /** Current channel type. */
  private channel: ChannelType = 'clean';

  /** Current channel characteristics. */
  private channelChars: ChannelCharacteristics = { ...CHANNEL_DEFAULTS.clean };

  /** Tone stack band configurations (manufacturer-specific). */
  private toneStackConfig: Record<string, ToneStackBandConfig> = { ...DEFAULT_TONE_STACK };

  /** Per-channel, per-band biquad filter states. */
  private channelFilters: Record<string, BiquadState>[] = [];

  /** Cached sample rate. */
  private sampleRate: number;

  /** Last known parameter values for change detection. */
  private lastParamValues: Record<string, number> = {};

  static get parameterDescriptors(): AudioParamDescriptor[] {
    return PARAM_DESCRIPTORS;
  }

  constructor() {
    super();
    this.sampleRate = (globalThis as unknown as { sampleRate: number }).sampleRate ?? 44100;

    this.lastParamValues = {};
    for (const band of BAND_NAMES) {
      this.lastParamValues[band] = 0.5;
    }

    this.port.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      switch (data.type) {
        case 'dispose':
          this.alive = false;
          break;

        case 'setChannel':
          this.setChannel(data.channel as ChannelType);
          break;

        case 'configureToneStack':
          this.configureToneStack(data.config);
          break;

        case 'configure':
          if (data.channel !== undefined) {
            this.setChannel(data.channel as ChannelType);
          }
          if (data.toneStack !== undefined) {
            this.configureToneStack(data.toneStack);
          }
          break;
      }
    };
  }

  /**
   * Switch the amplifier channel, updating gain/saturation characteristics.
   */
  private setChannel(channel: ChannelType): void {
    if (channel !== 'clean' && channel !== 'crunch' && channel !== 'overdrive') return;
    this.channel = channel;
    this.channelChars = { ...CHANNEL_DEFAULTS[channel] };
  }

  /**
   * Update tone stack configuration with manufacturer-specific values.
   * Expects an object with band names as keys, each containing
   * { frequency, q, gain } where gain maps to maxGain range.
   */
  private configureToneStack(config: Record<string, Partial<ToneStackBandConfig>>): void {
    if (!config || typeof config !== 'object') return;

    for (const band of BAND_NAMES) {
      const bandConfig = config[band];
      if (!bandConfig) continue;

      const current = this.toneStackConfig[band];
      if (bandConfig.frequency !== undefined) current.frequency = bandConfig.frequency;
      if (bandConfig.q !== undefined) current.q = bandConfig.q;
      if (bandConfig.minGain !== undefined) current.minGain = bandConfig.minGain;
      if (bandConfig.maxGain !== undefined) current.maxGain = bandConfig.maxGain;
    }

    // Rebuild filters with updated config
    this.rebuildFilters();
  }

  /**
   * Rebuild all biquad filters using current tone stack config and
   * last known parameter values.
   */
  private rebuildFilters(): void {
    for (const chFilters of this.channelFilters) {
      for (const band of BAND_NAMES) {
        const cfg = this.toneStackConfig[band];
        const normalized = this.lastParamValues[band] ?? 0.5;
        const gainDb = cfg.minGain + normalized * (cfg.maxGain - cfg.minGain);
        chFilters[band] = createBiquadPeaking(cfg.frequency, cfg.q, gainDb, this.sampleRate);
      }
    }
  }

  /** Ensure we have per-channel filter state for the given channel count. */
  private ensureChannelFilters(numChannels: number): void {
    while (this.channelFilters.length < numChannels) {
      const filters: Record<string, BiquadState> = {};
      for (const band of BAND_NAMES) {
        const cfg = this.toneStackConfig[band];
        const normalized = this.lastParamValues[band] ?? 0.5;
        const gainDb = cfg.minGain + normalized * (cfg.maxGain - cfg.minGain);
        filters[band] = createBiquadPeaking(cfg.frequency, cfg.q, gainDb, this.sampleRate);
      }
      this.channelFilters.push(filters);
    }
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

    const numChannels = output.length;
    this.ensureChannelFilters(numChannels);

    // Update biquad coefficients if parameters changed (k-rate: once per block)
    for (const band of BAND_NAMES) {
      const param = parameters[band];
      const normalized = clamp(param ? param[0] : 0.5, 0, 1);

      if (normalized !== this.lastParamValues[band]) {
        this.lastParamValues[band] = normalized;
        const cfg = this.toneStackConfig[band];
        const gainDb = cfg.minGain + normalized * (cfg.maxGain - cfg.minGain);
        for (let ch = 0; ch < numChannels; ch++) {
          updateBiquadPeaking(this.channelFilters[ch][band], cfg.frequency, cfg.q, gainDb, this.sampleRate);
        }
      }
    }

    const chars = this.channelChars;

    for (let ch = 0; ch < numChannels; ch++) {
      const inp = input[ch] ?? input[0];
      const out = output[ch];
      const chFilters = this.channelFilters[ch];

      for (let i = 0; i < blockSize; i++) {
        let sample = inp[i];

        // Apply tone stack EQ (5 bands in series)
        for (const band of BAND_NAMES) {
          sample = processBiquad(chFilters[band], sample);
        }

        // Apply channel saturation/compression
        sample = applySaturation(sample, chars);

        out[i] = sample;
      }
    }

    return true;
  }
}

// ── Exported helpers for testing ─────────────────────────────────────

export {
  createBiquadPeaking,
  processBiquad,
  updateBiquadPeaking,
  applySaturation,
  CHANNEL_DEFAULTS,
  DEFAULT_TONE_STACK,
  BAND_NAMES,
};
export type {
  BiquadState,
  ChannelType,
  ChannelCharacteristics,
  ToneStackBandConfig,
};

// Register in AudioWorklet scope (global `registerProcessor` exists there).
if (typeof registerProcessor === 'function') {
  registerProcessor('amplifier-processor', AmplifierProcessor);
}
