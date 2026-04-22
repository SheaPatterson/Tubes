/**
 * CabinetProcessor — AudioWorklet processor modeling cabinet IR convolution
 * with microphone type, position, and distance blending.
 *
 * Responsibilities:
 *   • Accept IR data (Float32Array) via MessagePort for convolution
 *   • Implement time-domain FIR convolution (short IR kernel suitable
 *     for AudioWorklet scope — full FFT convolution is impractical here)
 *   • Accept mic type (condenser/ribbon/dynamic) via MessagePort —
 *     each type applies a different frequency response curve
 *   • Accept mic position (X/Y/Z) and distance via MessagePort
 *   • Mic position affects output:
 *       X: left-right frequency balance (positive = brighter)
 *       Y: vertical position affects mid-frequency emphasis
 *       Z: distance from cone affects brightness (closer = brighter)
 *   • Distance affects high-frequency attenuation and room ambience
 *   • Support mic presets via MessagePort:
 *       Center: bright (emphasize highs)
 *       Middle: warmer (reduce treble)
 *       Outside: flat (minimal coloring)
 *   • Blend all mic parameters to compute final output
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

// ─── Types ───────────────────────────────────────────────────────────

type MicType = 'condenser' | 'ribbon' | 'dynamic';
type MicPreset = 'center' | 'middle' | 'outside';

const VALID_MIC_TYPES: MicType[] = ['condenser', 'ribbon', 'dynamic'];
const VALID_MIC_PRESETS: MicPreset[] = ['center', 'middle', 'outside'];

// ─── Mic frequency response curves ──────────────────────────────────

/**
 * Simplified frequency response multipliers for each mic type.
 * These represent gain adjustments across 4 frequency bands:
 * [low (< 250Hz), mid (250–2kHz), highMid (2k–8kHz), high (> 8kHz)]
 */
interface MicResponseCurve {
  low: number;
  mid: number;
  highMid: number;
  high: number;
}

const MIC_RESPONSE_CURVES: Record<MicType, MicResponseCurve> = {
  condenser: { low: 1.0, mid: 1.05, highMid: 1.15, high: 1.1 },
  ribbon:    { low: 0.95, mid: 1.0, highMid: 0.85, high: 0.5 },
  dynamic:   { low: 0.9, mid: 1.0, highMid: 1.1, high: 0.6 },
};

// ─── Mic preset positions ────────────────────────────────────────────

interface MicPositionState {
  x: number; // -1 to 1 (left to right)
  y: number; // -1 to 1 (bottom to top)
  z: number; // 0 to 1 (distance from cone, 0 = on-axis close)
}

/**
 * Preset positions for common mic placements.
 * Center: on-axis, close — bright, detailed
 * Middle: slightly off-axis — warmer, reduced treble
 * Outside: far off-axis — flat, minimal coloring
 */
const MIC_PRESETS: Record<MicPreset, { position: MicPositionState; distance: number }> = {
  center:  { position: { x: 0.0, y: 0.0, z: 0.0 }, distance: 0.1 },
  middle:  { position: { x: 0.4, y: 0.0, z: 0.3 }, distance: 0.4 },
  outside: { position: { x: 0.8, y: 0.0, z: 0.7 }, distance: 0.7 },
};

// ─── One-pole low-pass filter for simple HF attenuation ──────────────

interface OnePoleState {
  y1: number;
}

function createOnePole(): OnePoleState {
  return { y1: 0 };
}

function processOnePole(state: OnePoleState, sample: number, coefficient: number): number {
  // coefficient 0..1: 0 = no filtering (pass-through), 1 = heavy low-pass
  // We invert the coefficient so that 0 = pass-through and 1 = max smoothing
  const alpha = 1.0 - coefficient;
  state.y1 = alpha * sample + (1.0 - alpha) * state.y1;
  return state.y1;
}

// ─── Simple biquad for mid-frequency emphasis ────────────────────────

interface SimpleBiquadState {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

function createPeakingEQ(
  freq: number,
  gainDb: number,
  q: number,
  sampleRate: number,
): SimpleBiquadState {
  const A = Math.pow(10, gainDb / 40);
  const w0 = (2 * Math.PI * freq) / sampleRate;
  const sinW0 = Math.sin(w0);
  const cosW0 = Math.cos(w0);
  const alpha = sinW0 / (2 * q);

  const a0 = 1 + alpha / A;
  return {
    x1: 0, x2: 0, y1: 0, y2: 0,
    b0: (1 + alpha * A) / a0,
    b1: (-2 * cosW0) / a0,
    b2: (1 - alpha * A) / a0,
    a1: (-2 * cosW0) / a0,
    a2: (1 - alpha / A) / a0,
  };
}

function processBiquad(st: SimpleBiquadState, x: number): number {
  const y = st.b0 * x + st.b1 * st.x1 + st.b2 * st.x2 - st.a1 * st.y1 - st.a2 * st.y2;
  st.x2 = st.x1;
  st.x1 = x;
  st.y2 = st.y1;
  st.y1 = y;
  return y;
}

// ─── Convolution buffer ──────────────────────────────────────────────

/** Maximum IR kernel length (samples). Longer IRs are truncated. */
const MAX_IR_LENGTH = 512;

// ─── Processor ───────────────────────────────────────────────────────

const PARAM_DESCRIPTORS: AudioParamDescriptor[] = [
  { name: 'mix', defaultValue: 1.0, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
];

/** Per-channel processing state for the cabinet processor. */
interface CabinetChannelState {
  /** Circular buffer for convolution input history. */
  convBuffer: Float32Array;
  /** Write position in the circular buffer. */
  convPos: number;
  /** One-pole filter for distance-based HF attenuation. */
  hfFilter: OnePoleState;
  /** Peaking EQ for mid-frequency emphasis from Y position. */
  midEQ: SimpleBiquadState;
}

export class CabinetProcessor extends AudioWorkletProcessor {
  private alive = true;

  /** IR kernel for convolution. */
  private irKernel: Float32Array = new Float32Array(0);

  /** Per-channel processing state. */
  private channelStates: CabinetChannelState[] = [];

  /** Current mic type. */
  private micType: MicType = 'dynamic';
  /** Current mic response curve. */
  private micCurve: MicResponseCurve = { ...MIC_RESPONSE_CURVES.dynamic };

  /** Current mic position. */
  private micPosition: MicPositionState = { x: 0, y: 0, z: 0 };
  /** Current mic distance (0 = close, 1 = far). */
  private micDistance = 0.1;

  /** Cached sample rate. */
  private sampleRate: number;

  /** Brightness modifier from position/preset blending. */
  private brightnessModifier = 1.0;
  /** Mid emphasis modifier from Y position. */
  private midEmphasis = 0;

  static get parameterDescriptors(): AudioParamDescriptor[] {
    return PARAM_DESCRIPTORS;
  }

  constructor() {
    super();
    this.sampleRate = (globalThis as unknown as { sampleRate: number }).sampleRate ?? 44100;
    this.recalculateBlend();

    this.port.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      switch (data.type) {
        case 'dispose':
          this.alive = false;
          break;

        case 'loadIR':
          this.loadIR(data.irData as Float32Array);
          break;

        case 'setMicType':
          this.setMicType(data.micType as string);
          break;

        case 'setMicPosition':
          this.setMicPosition(
            data.x as number,
            data.y as number,
            data.z as number,
          );
          break;

        case 'setMicDistance':
          this.setMicDistance(data.distance as number);
          break;

        case 'setMicPreset':
          this.applyPreset(data.preset as string);
          break;

        case 'configure':
          if (data.irData !== undefined) this.loadIR(data.irData as Float32Array);
          if (data.micType !== undefined) this.setMicType(data.micType as string);
          if (data.preset !== undefined) this.applyPreset(data.preset as string);
          if (data.x !== undefined && data.y !== undefined && data.z !== undefined) {
            this.setMicPosition(data.x as number, data.y as number, data.z as number);
          }
          if (data.distance !== undefined) this.setMicDistance(data.distance as number);
          break;
      }
    };
  }

  // ─── Configuration methods ───────────────────────────────────────

  private loadIR(irData: Float32Array): void {
    if (!irData || irData.length === 0) {
      this.irKernel = new Float32Array(0);
      return;
    }
    const len = Math.min(irData.length, MAX_IR_LENGTH);
    this.irKernel = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      this.irKernel[i] = irData[i];
    }
    // Reset all channel convolution buffers
    for (const cs of this.channelStates) {
      cs.convBuffer = new Float32Array(MAX_IR_LENGTH);
      cs.convPos = 0;
    }
  }

  private setMicType(micType: string): void {
    if (!VALID_MIC_TYPES.includes(micType as MicType)) return;
    this.micType = micType as MicType;
    this.micCurve = { ...MIC_RESPONSE_CURVES[this.micType] };
    this.recalculateBlend();
  }

  private setMicPosition(x: number, y: number, z: number): void {
    this.micPosition.x = clamp(x, -1, 1);
    this.micPosition.y = clamp(y, -1, 1);
    this.micPosition.z = clamp(z, 0, 1);
    this.recalculateBlend();
  }

  private setMicDistance(distance: number): void {
    this.micDistance = clamp(distance, 0, 1);
    this.recalculateBlend();
  }

  private applyPreset(preset: string): void {
    if (!VALID_MIC_PRESETS.includes(preset as MicPreset)) return;
    const p = MIC_PRESETS[preset as MicPreset];
    this.micPosition = { ...p.position };
    this.micDistance = p.distance;
    this.recalculateBlend();
  }

  // ─── Blend calculation ─────────────────────────────────────────────

  /**
   * Recalculate derived parameters from mic type, position, and distance.
   *
   * X position: affects frequency balance. Positive X = off-axis right,
   *   which reduces high frequencies (speaker beaming effect).
   * Y position: affects mid-frequency emphasis. Higher Y = more mid emphasis.
   * Z position: distance from cone. Higher Z = less brightness.
   * Distance: overall distance, affects HF attenuation and room ambience.
   */
  private recalculateBlend(): void {
    const xAttenuation = 1.0 - Math.abs(this.micPosition.x) * 0.4;
    const zAttenuation = 1.0 - this.micPosition.z * 0.5;
    const distanceAttenuation = 1.0 - this.micDistance * 0.6;
    this.brightnessModifier = xAttenuation * zAttenuation * distanceAttenuation;
    this.midEmphasis = Math.abs(this.micPosition.y) * 6;

    // Update mid EQ on all existing channel states
    for (const cs of this.channelStates) {
      cs.midEQ = createPeakingEQ(1000, this.midEmphasis, 1.0, this.sampleRate);
    }
  }

  /** Ensure we have per-channel state for the given channel count. */
  private ensureChannelStates(numChannels: number): void {
    while (this.channelStates.length < numChannels) {
      this.channelStates.push({
        convBuffer: new Float32Array(MAX_IR_LENGTH),
        convPos: 0,
        hfFilter: createOnePole(),
        midEQ: createPeakingEQ(1000, this.midEmphasis, 1.0, this.sampleRate),
      });
    }
  }

  // ─── Per-sample processing ─────────────────────────────────────────

  /**
   * Apply time-domain FIR convolution with the loaded IR kernel.
   * Uses a per-channel circular buffer for correct stereo processing.
   */
  private convolve(cs: CabinetChannelState, sample: number): number {
    const irLen = this.irKernel.length;
    if (irLen === 0) return sample;

    cs.convBuffer[cs.convPos] = sample;

    let sum = 0;
    for (let k = 0; k < irLen; k++) {
      let idx = cs.convPos - k;
      if (idx < 0) idx += MAX_IR_LENGTH;
      sum += cs.convBuffer[idx] * this.irKernel[k];
    }

    cs.convPos = (cs.convPos + 1) % MAX_IR_LENGTH;
    return sum;
  }

  /**
   * Apply mic type frequency response curve.
   * Uses a simplified 4-band approach: the sample is processed through
   * the one-pole filter and mid EQ, then scaled by the mic curve.
   */
  private applyMicResponse(sample: number): number {
    // Apply mic curve as a weighted blend.
    // The overall gain is a weighted average of the band gains,
    // biased by the brightness modifier.
    const curve = this.micCurve;
    const brightness = this.brightnessModifier;

    // High-frequency content scaling based on brightness and mic curve
    const highGain = curve.high * brightness;
    const highMidGain = curve.highMid * (0.5 + 0.5 * brightness);
    const midGain = curve.mid;
    const lowGain = curve.low;

    // Blend: approximate by weighting the overall gain
    // This is a simplified model — a real implementation would use
    // multi-band crossover filters
    const overallGain = (lowGain * 0.25 + midGain * 0.3 + highMidGain * 0.25 + highGain * 0.2);

    return sample * overallGain;
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    if (!this.alive) return false;

    const input = inputs[0];
    const output = outputs[0];

    if (!input || input.length === 0) {
      for (let ch = 0; ch < output.length; ch++) {
        output[ch].fill(0);
      }
      return true;
    }

    const blockSize = input[0].length;
    const mixParam = parameters['mix'];
    const mix = clamp(mixParam ? mixParam[0] : 1.0, 0, 1);
    const numChannels = output.length;

    this.ensureChannelStates(numChannels);

    // HF attenuation coefficient from distance
    const hfCoeff = this.micDistance * 0.7 + this.micPosition.z * 0.2;

    for (let ch = 0; ch < numChannels; ch++) {
      const inp = input[ch] ?? input[0];
      const out = output[ch];
      const cs = this.channelStates[ch];

      for (let i = 0; i < blockSize; i++) {
        const dry = inp[i];

        // 1. IR convolution
        let wet = this.convolve(cs, dry);

        // 2. Apply mic type frequency response
        wet = this.applyMicResponse(wet);

        // 3. Apply mid-frequency emphasis from Y position
        wet = processBiquad(cs.midEQ, wet);

        // 4. Apply distance-based HF attenuation
        wet = processOnePole(cs.hfFilter, wet, hfCoeff);

        // 5. Mix dry/wet
        out[i] = dry * (1 - mix) + wet * mix;
      }
    }

    return true;
  }
}

// ── Exported helpers for testing ─────────────────────────────────────

export {
  MIC_RESPONSE_CURVES,
  MIC_PRESETS,
  VALID_MIC_TYPES,
  VALID_MIC_PRESETS,
  MAX_IR_LENGTH,
  createOnePole,
  processOnePole,
  createPeakingEQ,
  processBiquad,
};
export type { MicType, MicPreset, MicResponseCurve, MicPositionState, OnePoleState, SimpleBiquadState };

// Register in AudioWorklet scope (global `registerProcessor` exists there).
if (typeof registerProcessor === 'function') {
  registerProcessor('cabinet-processor', CabinetProcessor);
}
