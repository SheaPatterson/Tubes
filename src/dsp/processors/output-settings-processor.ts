/**
 * OutputSettingsProcessor — AudioWorklet processor for the final stage
 * of the signal chain.
 *
 * Responsibilities:
 *   • Master volume control
 *   • Output gain control
 *
 * Processes 128-sample blocks on the audio thread.
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

// ─── Processor ───────────────────────────────────────────────────────

const PARAM_DESCRIPTORS: AudioParamDescriptor[] = [
  { name: 'masterVolume', defaultValue: 0.8, minValue: 0, maxValue: 1, automationRate: 'a-rate' },
  { name: 'outputGain', defaultValue: 1, minValue: 0, maxValue: 1, automationRate: 'a-rate' },
];

export class OutputSettingsProcessor extends AudioWorkletProcessor {
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

    const masterVolumeParam = parameters['masterVolume'];
    const outputGainParam = parameters['outputGain'];

    for (let ch = 0; ch < output.length; ch++) {
      const inp = input[ch] ?? input[0];
      const out = output[ch];

      for (let i = 0; i < blockSize; i++) {
        const masterVolume = masterVolumeParam.length > 1
          ? masterVolumeParam[i]
          : masterVolumeParam[0];
        const outputGain = outputGainParam.length > 1
          ? outputGainParam[i]
          : outputGainParam[0];

        // Apply master volume then output gain.
        out[i] = inp[i] * clamp(masterVolume, 0, 1) * clamp(outputGain, 0, 1);
      }
    }

    return true;
  }
}

// Register in AudioWorklet scope (global `registerProcessor` exists there).
if (typeof registerProcessor === 'function') {
  registerProcessor('output-settings-processor', OutputSettingsProcessor);
}
