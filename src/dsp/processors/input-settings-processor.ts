/**
 * InputSettingsProcessor — AudioWorklet processor for the first stage
 * of the signal chain.
 *
 * Responsibilities:
 *   • Input gain control
 *   • Noise gate (threshold + release)
 *
 * Processes 128-sample blocks on the audio thread.
 *
 * NOTE: AudioWorklet processors run in a special scope where
 * `AudioWorkletProcessor` and `registerProcessor` are globally available.
 * This file is self-contained for `addModule()` loading but also exports
 * the class for testability.
 */

// ─── Inline helpers (no imports in worklet scope) ────────────────────

function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// ─── Processor ───────────────────────────────────────────────────────

/**
 * AudioWorkletProcessor parameter descriptors exposed as AudioParams.
 */
const PARAM_DESCRIPTORS: AudioParamDescriptor[] = [
  { name: 'inputGain', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'a-rate' },
  { name: 'noiseGateEnabled', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
  { name: 'noiseGateThreshold', defaultValue: -60, minValue: -100, maxValue: 0, automationRate: 'k-rate' },
  { name: 'noiseGateRelease', defaultValue: 50, minValue: 1, maxValue: 1000, automationRate: 'k-rate' },
];

/** Per-channel noise gate state. */
interface GateChannelState {
  envelopeLevel: number;
  gateGain: number;
}

export class InputSettingsProcessor extends AudioWorkletProcessor {
  /** Per-channel gate state to avoid cross-channel bleed. */
  private channelStates: GateChannelState[] = [];
  /** Whether the processor is still active. */
  private alive = true;

  static get parameterDescriptors(): AudioParamDescriptor[] {
    return PARAM_DESCRIPTORS;
  }

  constructor() {
    super();
    this.port.onmessage = (event: MessageEvent) => {
      if (event.data?.type === 'dispose') {
        this.alive = false;
      }
    };
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

    const blockSize = input[0].length; // typically 128
    const numChannels = output.length;

    // Ensure we have per-channel state
    while (this.channelStates.length < numChannels) {
      this.channelStates.push({ envelopeLevel: 0, gateGain: 1 });
    }

    // Read parameters — a-rate params have per-sample values,
    // k-rate params have a single value for the block.
    const gainParam = parameters['inputGain'];
    const gateEnabledParam = parameters['noiseGateEnabled'];
    const thresholdParam = parameters['noiseGateThreshold'];
    const releaseParam = parameters['noiseGateRelease'];

    const gateEnabled = (gateEnabledParam[0] ?? 0) >= 0.5;
    const thresholdDb = thresholdParam[0] ?? -60;
    const thresholdLinear = dbToLinear(thresholdDb);
    const releaseMs = releaseParam[0] ?? 50;

    // Compute release coefficient (one-pole envelope follower).
    // Attack is instant (gate opens immediately when signal exceeds threshold).
    const sampleRate = (globalThis as unknown as { sampleRate: number }).sampleRate ?? 44100;
    const releaseCoeff = releaseMs > 0 ? Math.exp(-1 / ((releaseMs / 1000) * sampleRate)) : 0;

    for (let ch = 0; ch < numChannels; ch++) {
      const inp = input[ch] ?? input[0]; // fall back to first channel
      const out = output[ch];
      const cs = this.channelStates[ch];

      for (let i = 0; i < blockSize; i++) {
        // ── Input gain ──
        const gain = gainParam.length > 1 ? gainParam[i] : gainParam[0];
        let sample = inp[i] * clamp(gain, 0, 1);

        // ── Noise gate ──
        if (gateEnabled) {
          const absSample = Math.abs(sample);

          // Envelope follower: instant attack, exponential release.
          if (absSample > cs.envelopeLevel) {
            cs.envelopeLevel = absSample;
          } else {
            cs.envelopeLevel = releaseCoeff * cs.envelopeLevel;
          }

          // Gate decision.
          if (cs.envelopeLevel >= thresholdLinear) {
            cs.gateGain = 1;
          } else {
            // Smooth close using the release coefficient to avoid clicks.
            cs.gateGain *= releaseCoeff;
          }

          sample *= cs.gateGain;
        }

        out[i] = sample;
      }
    }

    return true;
  }
}

// Register in AudioWorklet scope (global `registerProcessor` exists there).
if (typeof registerProcessor === 'function') {
  registerProcessor('input-settings-processor', InputSettingsProcessor);
}
