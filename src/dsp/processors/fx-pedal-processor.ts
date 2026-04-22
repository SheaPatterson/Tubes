/**
 * FxPedalProcessor — Generic AudioWorklet processor that models
 * different FX pedal types based on circuit configuration.
 *
 * Responsibilities:
 *   • Load circuit behavior per pedal type (overdrive, distortion,
 *     delay, modulation, compression, eq, gate, multi, fuzz)
 *   • Enable/disable toggle via MessagePort — when disabled, pass
 *     audio through unchanged (true bypass)
 *   • Accept pedal parameters (knob values) via MessagePort
 *   • Smooth parameter changes to avoid clicks
 *
 * Circuit types and their DSP algorithms:
 *   - overdrive/distortion: soft/hard clipping with tone control
 *   - delay: simple delay line with feedback
 *   - modulation (chorus/flanger/phaser): LFO-modulated delay or allpass
 *   - compression: envelope follower with threshold/ratio
 *   - eq: parametric EQ band
 *   - gate: noise gate
 *   - fuzz: heavy asymmetric clipping
 *   - multi: combined compression + overdrive + EQ + modulation + delay
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

// ─── Parameter Smoother ──────────────────────────────────────────────

class ParamSmoother {
  private current: number;
  private target: number;
  private coeff: number;

  constructor(initial: number, smoothMs: number, sampleRate: number) {
    this.current = initial;
    this.target = initial;
    this.coeff = smoothMs <= 0 ? 1 : 1 - Math.exp(-1 / ((smoothMs / 1000) * sampleRate));
  }

  setTarget(v: number): void {
    this.target = v;
  }

  next(): number {
    this.current += this.coeff * (this.target - this.current);
    return this.current;
  }

  getValue(): number {
    return this.current;
  }

  snap(): void {
    this.current = this.target;
  }
}

// ─── Circuit type definitions ────────────────────────────────────────

type CircuitCategory =
  | 'overdrive'
  | 'distortion'
  | 'delay'
  | 'modulation'
  | 'compression'
  | 'eq'
  | 'gate'
  | 'multi'
  | 'fuzz';

// ─── Biquad filter for tone/EQ ──────────────────────────────────────

interface BiquadState {
  b0: number; b1: number; b2: number;
  a1: number; a2: number;
  z1: number; z2: number;
}

function createLowpass(freq: number, q: number, sr: number): BiquadState {
  const w0 = 2 * Math.PI * freq / sr;
  const sinW0 = Math.sin(w0);
  const cosW0 = Math.cos(w0);
  const alpha = sinW0 / (2 * q);
  const a0 = 1 + alpha;
  return {
    b0: ((1 - cosW0) / 2) / a0,
    b1: (1 - cosW0) / a0,
    b2: ((1 - cosW0) / 2) / a0,
    a1: (-2 * cosW0) / a0,
    a2: (1 - alpha) / a0,
    z1: 0, z2: 0,
  };
}

function createPeaking(freq: number, q: number, gainDb: number, sr: number): BiquadState {
  const A = Math.pow(10, gainDb / 40);
  const w0 = 2 * Math.PI * freq / sr;
  const sinW0 = Math.sin(w0);
  const cosW0 = Math.cos(w0);
  const alpha = sinW0 / (2 * q);
  const a0 = 1 + alpha / A;
  return {
    b0: (1 + alpha * A) / a0,
    b1: (-2 * cosW0) / a0,
    b2: (1 - alpha * A) / a0,
    a1: (-2 * cosW0) / a0,
    a2: (1 - alpha / A) / a0,
    z1: 0, z2: 0,
  };
}

function processBiquad(st: BiquadState, x: number): number {
  const y = st.b0 * x + st.z1;
  st.z1 = st.b1 * x - st.a1 * y + st.z2;
  st.z2 = st.b2 * x - st.a2 * y;
  return y;
}

function updateLowpass(st: BiquadState, freq: number, q: number, sr: number): void {
  const w0 = 2 * Math.PI * freq / sr;
  const sinW0 = Math.sin(w0);
  const cosW0 = Math.cos(w0);
  const alpha = sinW0 / (2 * q);
  const a0 = 1 + alpha;
  st.b0 = ((1 - cosW0) / 2) / a0;
  st.b1 = (1 - cosW0) / a0;
  st.b2 = ((1 - cosW0) / 2) / a0;
  st.a1 = (-2 * cosW0) / a0;
  st.a2 = (1 - alpha) / a0;
}

function updatePeaking(st: BiquadState, freq: number, q: number, gainDb: number, sr: number): void {
  const A = Math.pow(10, gainDb / 40);
  const w0 = 2 * Math.PI * freq / sr;
  const sinW0 = Math.sin(w0);
  const cosW0 = Math.cos(w0);
  const alpha = sinW0 / (2 * q);
  const a0 = 1 + alpha / A;
  st.b0 = (1 + alpha * A) / a0;
  st.b1 = (-2 * cosW0) / a0;
  st.b2 = (1 - alpha * A) / a0;
  st.a1 = (-2 * cosW0) / a0;
  st.a2 = (1 - alpha / A) / a0;
}

// ─── Delay line ──────────────────────────────────────────────────────

class DelayLine {
  private buffer: Float32Array;
  private writeIndex = 0;
  private length: number;

  constructor(maxSamples: number) {
    this.length = maxSamples;
    this.buffer = new Float32Array(maxSamples);
  }

  write(sample: number): void {
    this.buffer[this.writeIndex] = sample;
    this.writeIndex = (this.writeIndex + 1) % this.length;
  }

  /** Read with fractional delay using linear interpolation. */
  read(delaySamples: number): number {
    const d = clamp(delaySamples, 0, this.length - 1);
    const readPos = this.writeIndex - d - 1;
    const idx = readPos < 0 ? readPos + this.length : readPos;
    const i0 = Math.floor(idx) % this.length;
    const i1 = (i0 + 1) % this.length;
    const frac = idx - Math.floor(idx);
    return this.buffer[i0 < 0 ? i0 + this.length : i0] * (1 - frac) +
           this.buffer[i1] * frac;
  }

  clear(): void {
    this.buffer.fill(0);
    this.writeIndex = 0;
  }
}

// ─── Allpass filter for phaser ───────────────────────────────────────

interface AllpassState {
  x1: number;
  y1: number;
}

function processAllpass(st: AllpassState, x: number, coeff: number): number {
  const y = -coeff * x + st.x1 + coeff * st.y1;
  st.x1 = x;
  st.y1 = y;
  return y;
}

// ─── Processor ───────────────────────────────────────────────────────

const SMOOTHING_MS = 5;
const MAX_DELAY_SECONDS = 1.5;
const ALLPASS_STAGES = 4;

export class FxPedalProcessor extends AudioWorkletProcessor {
  private alive = true;
  private enabled = true;
  private circuitCategory: CircuitCategory = 'overdrive';
  private sampleRate: number;

  // Smoothed parameters (knob values, normalized 0–1 unless noted)
  private params: Map<string, ParamSmoother> = new Map();

  // Enable/disable crossfade smoother (for click-free toggling)
  private enableSmoother: ParamSmoother;

  // ── Delay state ──
  private delayLine: DelayLine;

  // ── Modulation state ──
  private lfoPhase = 0;
  private modDelayLine: DelayLine;
  private allpassStates: AllpassState[] = [];

  // ── Compression state ──
  private envelope = 0;

  // ── Gate state ──
  private gateOpen = false;
  private gateGain = 0;

  // ── EQ state ──
  private eqFilter: BiquadState;

  // ── Tone filter (for overdrive/distortion/fuzz) ──
  private toneFilter: BiquadState;

  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [];
  }

  constructor() {
    super();
    this.sampleRate = (globalThis as unknown as { sampleRate: number }).sampleRate ?? 44100;

    const maxDelaySamples = Math.ceil(MAX_DELAY_SECONDS * this.sampleRate);
    this.delayLine = new DelayLine(maxDelaySamples);
    this.modDelayLine = new DelayLine(Math.ceil(0.05 * this.sampleRate)); // 50ms max mod delay
    this.eqFilter = createPeaking(1000, 1.0, 0, this.sampleRate);
    this.toneFilter = createLowpass(4000, 0.707, this.sampleRate);
    this.enableSmoother = new ParamSmoother(1, SMOOTHING_MS, this.sampleRate);

    for (let i = 0; i < ALLPASS_STAGES; i++) {
      this.allpassStates.push({ x1: 0, y1: 0 });
    }

    this.port.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      switch (data.type) {
        case 'dispose':
          this.alive = false;
          break;

        case 'setEnabled':
          this.enabled = !!data.enabled;
          this.enableSmoother.setTarget(this.enabled ? 1 : 0);
          break;

        case 'setCircuit':
          this.setCircuit(data.category as CircuitCategory);
          break;

        case 'setParams':
          this.updateParams(data.params as Record<string, number>);
          break;

        case 'configure':
          if (data.category !== undefined) {
            this.setCircuit(data.category as CircuitCategory);
          }
          if (data.enabled !== undefined) {
            this.enabled = !!data.enabled;
            this.enableSmoother.setTarget(this.enabled ? 1 : 0);
          }
          if (data.params !== undefined) {
            this.updateParams(data.params as Record<string, number>);
          }
          break;
      }
    };
  }

  private setCircuit(category: CircuitCategory): void {
    const valid: CircuitCategory[] = [
      'overdrive', 'distortion', 'delay', 'modulation',
      'compression', 'eq', 'gate', 'multi', 'fuzz',
    ];
    if (!valid.includes(category)) return;
    this.circuitCategory = category;
    // Reset state for new circuit
    this.delayLine.clear();
    this.modDelayLine.clear();
    this.lfoPhase = 0;
    this.envelope = 0;
    this.gateOpen = false;
    this.gateGain = 0;
    for (const ap of this.allpassStates) {
      ap.x1 = 0;
      ap.y1 = 0;
    }
    this.eqFilter.z1 = 0;
    this.eqFilter.z2 = 0;
    this.toneFilter.z1 = 0;
    this.toneFilter.z2 = 0;
  }

  private getParam(key: string, defaultVal: number): number {
    const s = this.params.get(key);
    if (s) return s.next();
    return defaultVal;
  }

  private updateParams(params: Record<string, number>): void {
    for (const [key, val] of Object.entries(params)) {
      const existing = this.params.get(key);
      if (existing) {
        existing.setTarget(val);
      } else {
        const s = new ParamSmoother(val, SMOOTHING_MS, this.sampleRate);
        this.params.set(key, s);
      }
    }
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    _parameters: Record<string, Float32Array>,
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

    for (let ch = 0; ch < output.length; ch++) {
      const inp = input[ch] ?? input[0];
      const out = output[ch];

      for (let i = 0; i < blockSize; i++) {
        const dry = inp[i];
        const wetMix = this.enableSmoother.next();

        // When fully bypassed, pass through dry signal
        if (wetMix < 0.0001) {
          out[i] = dry;
          // Still advance smoothers to keep them in sync
          this.advanceSmoothers();
          continue;
        }

        const wet = this.processCircuit(dry);

        // Crossfade between dry and wet for click-free enable/disable
        out[i] = dry * (1 - wetMix) + wet * wetMix;
      }
    }

    return true;
  }

  /** Advance all parameter smoothers by one sample (for bypass path). */
  private advanceSmoothers(): void {
    for (const s of this.params.values()) {
      s.next();
    }
  }

  /** Route to the appropriate circuit DSP algorithm. */
  private processCircuit(sample: number): number {
    switch (this.circuitCategory) {
      case 'overdrive':
        return this.processOverdrive(sample);
      case 'distortion':
        return this.processDistortion(sample);
      case 'fuzz':
        return this.processFuzz(sample);
      case 'delay':
        return this.processDelay(sample);
      case 'modulation':
        return this.processModulation(sample);
      case 'compression':
        return this.processCompression(sample);
      case 'eq':
        return this.processEQ(sample);
      case 'gate':
        return this.processGate(sample);
      case 'multi':
        return this.processMulti(sample);
      default:
        return sample;
    }
  }

  // ── Overdrive: soft clipping with tone control ─────────────────────

  private processOverdrive(sample: number): number {
    const drive = this.getParam('drive', 0.5);
    const tone = this.getParam('tone', 0.5);
    const level = this.getParam('level', 0.5);

    // Pre-gain based on drive
    const preGain = 1 + drive * 8;
    let s = sample * preGain;

    // Soft clipping via tanh
    s = Math.tanh(s);

    // Tone control: lowpass filter cutoff 500–8000 Hz
    const cutoff = 500 + tone * 7500;
    updateLowpass(this.toneFilter, cutoff, 0.707, this.sampleRate);
    s = processBiquad(this.toneFilter, s);

    // Output level
    return s * level;
  }

  // ── Distortion: hard clipping with tone control ────────────────────

  private processDistortion(sample: number): number {
    const distortion = this.getParam('distortion', 0.5);
    const tone = this.getParam('tone', 0.5);
    const level = this.getParam('level', 0.5);

    const preGain = 1 + distortion * 20;
    let s = sample * preGain;

    // Hard clipping
    s = clamp(s, -1, 1);

    // Tone control
    const cutoff = 400 + tone * 6000;
    updateLowpass(this.toneFilter, cutoff, 0.707, this.sampleRate);
    s = processBiquad(this.toneFilter, s);

    return s * level;
  }

  // ── Fuzz: heavy asymmetric clipping ────────────────────────────────

  private processFuzz(sample: number): number {
    const sustain = this.getParam('sustain', 0.7);
    const tone = this.getParam('tone', 0.5);
    const volume = this.getParam('volume', 0.5);

    const preGain = 1 + sustain * 30;
    let s = sample * preGain;

    // Asymmetric clipping: positive side clips harder
    if (s > 0) {
      s = Math.tanh(s * 2) * 0.8;
    } else {
      s = Math.tanh(s * 1.2);
    }

    // Tone control
    const cutoff = 300 + tone * 5000;
    updateLowpass(this.toneFilter, cutoff, 0.707, this.sampleRate);
    s = processBiquad(this.toneFilter, s);

    return s * volume;
  }

  // ── Delay: simple delay line with feedback ─────────────────────────

  private processDelay(sample: number): number {
    const delayTime = this.getParam('delay', 0.5);
    const feedback = this.getParam('feedback', 0.4);
    const mix = this.getParam('mix', 0.5);

    // Delay time: 50ms to 1200ms
    const delaySamples = (0.05 + delayTime * 1.15) * this.sampleRate;
    const fbk = clamp(feedback * 0.85, 0, 0.85); // cap feedback to prevent runaway

    const delayed = this.delayLine.read(delaySamples);
    const toWrite = sample + delayed * fbk;
    this.delayLine.write(toWrite);

    return sample * (1 - mix) + delayed * mix;
  }

  // ── Modulation: LFO-modulated delay (chorus/flanger) or allpass (phaser) ──

  private processModulation(sample: number): number {
    const rate = this.getParam('rate', 0.5);
    const depth = this.getParam('depth', 0.5);
    const mix = this.getParam('mix', 0.5);

    // LFO: 0.1 Hz to 10 Hz
    const lfoFreq = 0.1 + rate * 9.9;
    this.lfoPhase += lfoFreq / this.sampleRate;
    if (this.lfoPhase >= 1) this.lfoPhase -= 1;
    const lfo = Math.sin(2 * Math.PI * this.lfoPhase);

    // Modulated delay: 1ms to 20ms
    const baseDelay = 0.005 * this.sampleRate; // 5ms center
    const modAmount = depth * 0.015 * this.sampleRate; // up to 15ms swing
    const delaySamples = baseDelay + lfo * modAmount;

    this.modDelayLine.write(sample);
    const delayed = this.modDelayLine.read(Math.max(1, delaySamples));

    return sample * (1 - mix) + delayed * mix;
  }

  // ── Compression: envelope follower with threshold/ratio ────────────

  private processCompression(sample: number): number {
    const threshold = this.getParam('threshold', 0.5);
    const ratio = this.getParam('ratio', 0.5);
    const output = this.getParam('output', 0.5);
    const attack = this.getParam('attack', 0.5);

    // Envelope follower
    const abs = Math.abs(sample);
    const attackCoeff = 0.0001 + (1 - attack) * 0.005;
    const releaseCoeff = 0.0005;

    if (abs > this.envelope) {
      this.envelope += attackCoeff * (abs - this.envelope);
    } else {
      this.envelope += releaseCoeff * (abs - this.envelope);
    }

    // Threshold: -40dB to 0dB mapped from 0–1
    const threshLinear = Math.pow(10, (-40 + threshold * 40) / 20);
    // Ratio: 1:1 to 20:1
    const compRatio = 1 + ratio * 19;

    let gain = 1;
    if (this.envelope > threshLinear && threshLinear > 0) {
      const overDb = 20 * Math.log10(this.envelope / threshLinear);
      const compressedDb = overDb / compRatio;
      gain = Math.pow(10, (compressedDb - overDb) / 20);
    }

    // Output/makeup gain: 0 to 2x
    return sample * gain * (output * 2);
  }

  // ── EQ: parametric EQ band ─────────────────────────────────────────

  private processEQ(sample: number): number {
    const frequency = this.getParam('frequency', 0.5);
    const gain = this.getParam('gain', 0.5);
    const q = this.getParam('q', 0.5);
    const level = this.getParam('level', 0.5);

    // Frequency: 80Hz to 12kHz
    const freq = 80 + frequency * 11920;
    // Gain: -12dB to +12dB
    const gainDb = -12 + gain * 24;
    // Q: 0.3 to 10
    const qVal = 0.3 + q * 9.7;

    updatePeaking(this.eqFilter, freq, qVal, gainDb, this.sampleRate);
    let s = processBiquad(this.eqFilter, sample);

    // Output level: 0 to 2x
    s *= level * 2;

    return s;
  }

  // ── Gate: noise gate ───────────────────────────────────────────────

  private processGate(sample: number): number {
    const threshold = this.getParam('threshold', 0.3);
    const release = this.getParam('release', 0.5);

    // Threshold: -80dB to -20dB
    const threshLinear = Math.pow(10, (-80 + threshold * 60) / 20);
    // Release: 5ms to 500ms
    const releaseTime = 0.005 + release * 0.495;
    const releaseCoeff = 1 - Math.exp(-1 / (releaseTime * this.sampleRate));

    const abs = Math.abs(sample);

    if (abs > threshLinear) {
      this.gateOpen = true;
      this.gateGain = 1;
    } else if (this.gateOpen) {
      this.gateGain -= releaseCoeff;
      if (this.gateGain <= 0) {
        this.gateGain = 0;
        this.gateOpen = false;
      }
    }

    return sample * this.gateGain;
  }

  // ── Multi: combined effects chain ──────────────────────────────────

  private processMulti(sample: number): number {
    const comp = this.getParam('comp', 0);
    const odDs = this.getParam('odDs', 0.5);
    const eqLow = this.getParam('eqLow', 0.5);
    const eqHigh = this.getParam('eqHigh', 0.5);
    const mod = this.getParam('mod', 0);
    const delay = this.getParam('delay', 0);

    let s = sample;

    // Light compression if comp > 0
    if (comp > 0.01) {
      const abs = Math.abs(s);
      if (abs > this.envelope) {
        this.envelope += 0.001 * (abs - this.envelope);
      } else {
        this.envelope += 0.0005 * (abs - this.envelope);
      }
      const thresh = 0.3;
      if (this.envelope > thresh) {
        const over = this.envelope - thresh;
        const ratio = 1 + comp * 5;
        const gain = thresh + over / ratio;
        s *= gain / (this.envelope || 1);
      }
    }

    // Overdrive/distortion
    if (odDs > 0.01) {
      const preGain = 1 + odDs * 10;
      s = Math.tanh(s * preGain) * (0.5 + odDs * 0.5);
    }

    // Simple 2-band EQ (low shelf + high shelf approximation)
    // Low: boost/cut at 200Hz
    const lowGainDb = (eqLow - 0.5) * 24;
    if (Math.abs(lowGainDb) > 0.5) {
      updatePeaking(this.eqFilter, 200, 0.7, lowGainDb, this.sampleRate);
      s = processBiquad(this.eqFilter, s);
    }
    // High: tone filter
    const highCutoff = 1000 + eqHigh * 8000;
    updateLowpass(this.toneFilter, highCutoff, 0.707, this.sampleRate);
    s = processBiquad(this.toneFilter, s);

    // Modulation
    if (mod > 0.01) {
      const lfoFreq = 0.5 + mod * 5;
      this.lfoPhase += lfoFreq / this.sampleRate;
      if (this.lfoPhase >= 1) this.lfoPhase -= 1;
      const lfo = Math.sin(2 * Math.PI * this.lfoPhase);
      const modDelay = 3 + lfo * mod * 5;
      this.modDelayLine.write(s);
      const modulated = this.modDelayLine.read(Math.max(1, modDelay * this.sampleRate / 1000));
      s = s * 0.7 + modulated * 0.3 * mod;
    }

    // Delay
    if (delay > 0.01) {
      const delaySamples = (0.1 + delay * 0.5) * this.sampleRate;
      const delayed = this.delayLine.read(delaySamples);
      this.delayLine.write(s + delayed * 0.3);
      s = s * 0.7 + delayed * 0.3 * delay;
    }

    return s;
  }
}

// ── Exported helpers for testing ─────────────────────────────────────

export {
  clamp as fxClamp,
  ParamSmoother,
  DelayLine,
  createLowpass,
  createPeaking,
  processBiquad,
  updateLowpass,
  updatePeaking,
  processAllpass,
};
export type {
  CircuitCategory,
  BiquadState,
  AllpassState,
};

// Register in AudioWorklet scope
if (typeof registerProcessor === 'function') {
  registerProcessor('fx-pedal-processor', FxPedalProcessor);
}
