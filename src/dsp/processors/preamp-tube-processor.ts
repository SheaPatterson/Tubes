/**
 * PreampTubeProcessor — AudioWorklet processor modeling 12AX7 preamp
 * tube gain stages with cumulative gain and per-stage frequency
 * response shaping.
 *
 * Responsibilities:
 *   • Cumulative gain across N 12AX7 stages
 *   • Per-stage frequency response shaping (low-shelf / high-shelf)
 *   • Soft-clipping via tanh waveshaping to model tube saturation
 *   • Recalculate gain model within 10ms on tube count change
 *
 * Structural changes (tube count, per-stage gain, frequency response)
 * arrive via MessagePort. The overall preamp gain knob is an AudioParam
 * for sample-accurate automation.
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

// ─── Per-stage frequency response filter ─────────────────────────────

/**
 * Simple one-pole low-pass / high-pass filter pair used to shape the
 * frequency response of each 12AX7 stage.  The curve is defined as
 * [lowCutHz, highCutHz] — frequencies below lowCut are attenuated and
 * frequencies above highCut are attenuated, modeling the coupling
 * capacitor and Miller capacitance of a real tube stage.
 */
interface StageFilter {
  /** One-pole high-pass state (removes low frequencies). */
  hpState: number;
  /** One-pole low-pass state (removes high frequencies). */
  lpState: number;
  /** High-pass coefficient derived from lowCutHz. */
  hpCoeff: number;
  /** Low-pass coefficient derived from highCutHz. */
  lpCoeff: number;
}

function createStageFilter(lowCutHz: number, highCutHz: number, sampleRate: number): StageFilter {
  // One-pole HP coefficient: higher value = more bass passes through
  const hpCoeff = lowCutHz > 0
    ? Math.exp(-2 * Math.PI * lowCutHz / sampleRate)
    : 1;
  // One-pole LP coefficient: higher value = more treble passes through
  const lpCoeff = highCutHz > 0 && highCutHz < sampleRate / 2
    ? Math.exp(-2 * Math.PI * highCutHz / sampleRate)
    : 0;

  return { hpState: 0, lpState: 0, hpCoeff, lpCoeff };
}

function applyStageFilter(filter: StageFilter, sample: number): number {
  // High-pass: remove frequencies below lowCut
  filter.hpState = filter.hpCoeff * filter.hpState + (1 - filter.hpCoeff) * sample;
  let out = sample - filter.hpState;

  // Low-pass: remove frequencies above highCut
  filter.lpState = filter.lpCoeff * filter.lpState + (1 - filter.lpCoeff) * out;
  out = filter.lpState;

  return out;
}

// ─── Gain stage model ────────────────────────────────────────────────

interface GainStage {
  /** Linear gain for this stage. */
  gain: number;
  /** Low-cut Hz for this stage. */
  lowCutHz: number;
  /** High-cut Hz for this stage. */
  highCutHz: number;
}

/** Per-channel filter state for all stages. */
interface ChannelFilterState {
  filters: StageFilter[];
}

// ─── Processor ───────────────────────────────────────────────────────

const PARAM_DESCRIPTORS: AudioParamDescriptor[] = [
  { name: 'preampGain', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'a-rate' },
];

export class PreampTubeProcessor extends AudioWorkletProcessor {
  /** Whether the processor is still active. */
  private alive = true;

  /** Number of active 12AX7 stages (1–N). */
  private tubeCount = 1;

  /** Per-stage gain values (linear). */
  private stageGains: number[] = [1.0];

  /** Per-stage frequency response curves as [lowCutHz, highCutHz]. */
  private frequencyResponse: number[][] = [[80, 12000]];

  /** Computed gain stages (gains + frequency config, no filter state). */
  private stages: GainStage[] = [];

  /** Per-channel filter states for each stage. */
  private channelFilterStates: ChannelFilterState[] = [];

  /** Sample rate cached for filter coefficient calculation. */
  private sampleRate: number;

  static get parameterDescriptors(): AudioParamDescriptor[] {
    return PARAM_DESCRIPTORS;
  }

  constructor() {
    super();
    this.sampleRate = (globalThis as unknown as { sampleRate: number }).sampleRate ?? 44100;
    this.rebuildStages();

    this.port.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      switch (data.type) {
        case 'dispose':
          this.alive = false;
          break;

        case 'setTubeCount':
          this.tubeCount = clamp(Math.round(data.count ?? 1), 1, 12);
          this.rebuildStages();
          break;

        case 'setStageGains':
          if (Array.isArray(data.gains)) {
            this.stageGains = data.gains.map((g: number) => Math.max(0, g));
            this.rebuildStages();
          }
          break;

        case 'setFrequencyResponse':
          if (Array.isArray(data.curves)) {
            this.frequencyResponse = data.curves;
            this.rebuildStages();
          }
          break;

        case 'configure':
          // Bulk configuration: tube count + gains + frequency response
          if (data.tubeCount !== undefined) {
            this.tubeCount = clamp(Math.round(data.tubeCount), 1, 12);
          }
          if (Array.isArray(data.stageGains)) {
            this.stageGains = data.stageGains.map((g: number) => Math.max(0, g));
          }
          if (Array.isArray(data.frequencyResponse)) {
            this.frequencyResponse = data.frequencyResponse;
          }
          this.rebuildStages();
          break;
      }
    };
  }

  /**
   * Rebuild the internal gain stage models. This is called whenever
   * tube count, per-stage gains, or frequency response curves change.
   * Designed to complete well within the 10ms recalculation budget.
   */
  private rebuildStages(): void {
    const count = this.tubeCount;
    this.stages = [];

    for (let i = 0; i < count; i++) {
      const gain = i < this.stageGains.length ? this.stageGains[i] : 1.0;
      const curve = i < this.frequencyResponse.length
        ? this.frequencyResponse[i]
        : [80, 12000];

      this.stages.push({
        gain,
        lowCutHz: curve[0] ?? 80,
        highCutHz: curve[1] ?? 12000,
      });
    }

    // Rebuild per-channel filter states
    for (const chState of this.channelFilterStates) {
      chState.filters = this.stages.map((s) =>
        createStageFilter(s.lowCutHz, s.highCutHz, this.sampleRate)
      );
    }
  }

  /** Ensure we have per-channel filter state for the given channel count. */
  private ensureChannelStates(numChannels: number): void {
    while (this.channelFilterStates.length < numChannels) {
      this.channelFilterStates.push({
        filters: this.stages.map((s) =>
          createStageFilter(s.lowCutHz, s.highCutHz, this.sampleRate)
        ),
      });
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
    const gainParam = parameters['preampGain'];
    const stages = this.stages;
    const stageCount = stages.length;
    const numChannels = output.length;

    this.ensureChannelStates(numChannels);

    for (let ch = 0; ch < numChannels; ch++) {
      const inp = input[ch] ?? input[0];
      const out = output[ch];
      const chFilters = this.channelFilterStates[ch].filters;

      for (let i = 0; i < blockSize; i++) {
        const preampGain = gainParam.length > 1 ? gainParam[i] : gainParam[0];
        let sample = inp[i] * clamp(preampGain, 0, 1);

        // Apply each 12AX7 stage cumulatively
        for (let s = 0; s < stageCount; s++) {
          // Apply stage gain
          sample *= stages[s].gain;

          // Apply per-stage frequency response shaping
          sample = applyStageFilter(chFilters[s], sample);

          // Soft-clip via tanh waveshaping (tube saturation)
          sample = Math.tanh(sample);
        }

        out[i] = sample;
      }
    }

    return true;
  }
}

// Register in AudioWorklet scope (global `registerProcessor` exists there).
if (typeof registerProcessor === 'function') {
  registerProcessor('preamp-tube-processor', PreampTubeProcessor);
}
