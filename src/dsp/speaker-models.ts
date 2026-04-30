/**
 * Speaker Impedance Models — SPICE-derived impedance curves for speaker simulation.
 *
 * Source data: public/speakers/*.md (Duncan Amps SPICE models)
 *
 * Each speaker model is a lumped-element equivalent circuit that represents
 * how the speaker's impedance changes with frequency. This is critical for
 * accurate power amp simulation — the amp "sees" this impedance and responds
 * differently at different frequencies.
 *
 * The SPICE subcircuit topology (common to all Celestion models):
 *   RL  — DC voice coil resistance (Ω)
 *   RD1 — Parallel resistance for resonance peak (Ω)
 *   LD1 — Inductance for resonance peak (H)
 *   CD1 — Capacitance for resonance peak (F)
 *   RD2 — Series resistance for HF rise (Ω)
 *   CD2 — Capacitance for HF impedance (F)
 *   LD2 — Inductance for HF impedance (H)
 *   LD3 — Output inductance (H)
 *   RD3 — HF damping resistance (Ω)
 *
 * For DSP, we convert these into a frequency-domain impedance curve
 * that the power amp processor uses to model load-dependent behavior.
 */

export interface SpeakerImpedanceModel {
  name: string
  /** DC resistance of voice coil (Ω). */
  rl: number
  /** Resonance peak parallel resistance (Ω). */
  rd1: number
  /** Resonance peak inductance (H). */
  ld1: number
  /** Resonance peak capacitance (F). */
  cd1: number
  /** HF series resistance (Ω). */
  rd2: number
  /** HF capacitance (F). */
  cd2: number
  /** HF inductance (H). */
  ld2: number
  /** Output inductance (H). */
  ld3: number
  /** HF damping resistance (Ω). */
  rd3: number
}

// ─── Speaker Models from SPICE ───────────────────────────────────────

export const SPEAKER_MODELS: Record<string, SpeakerImpedanceModel> = {
  'G12T-75': {
    name: 'Celestion G12T-75',
    rl: 7.5, rd1: 15, ld1: 20e-3, cd1: 190e-6,
    rd2: 0.5, cd2: 50e-6, ld2: 100e-6, ld3: 100e-6, rd3: 20,
  },
  'Vintage 30': {
    name: 'Celestion Vintage 30',
    rl: 7.5, rd1: 12.5, ld1: 20e-3, cd1: 250e-6,
    rd2: 0.5, cd2: 50e-6, ld2: 100e-6, ld3: 100e-6, rd3: 20,
  },
  'G12M': {
    name: 'Celestion G12M (Greenback)',
    rl: 7.5, rd1: 12, ld1: 20e-3, cd1: 225e-6,
    rd2: 0.5, cd2: 50e-6, ld2: 100e-6, ld3: 100e-6, rd3: 20,
  },
  'G12H-100': {
    name: 'Celestion G12H-100',
    rl: 6.5, rd1: 13, ld1: 20e-3, cd1: 190e-6,
    rd2: 1, cd2: 50e-6, ld2: 100e-6, ld3: 100e-6, rd3: 20,
  },
  'Vintage 10': {
    name: 'Celestion Vintage 10',
    rl: 7.5, rd1: 12.5, ld1: 20e-3, cd1: 195e-6,
    rd2: 0.5, cd2: 50e-6, ld2: 120e-6, ld3: 120e-6, rd3: 20,
  },
  'Jensen P12R': {
    name: 'Jensen P12R (Generic 8Ω)',
    rl: 8, rd1: 12, ld1: 20e-3, cd1: 200e-6,
    rd2: 0.5, cd2: 50e-6, ld2: 100e-6, ld3: 100e-6, rd3: 20,
  },
}

/**
 * Compute the impedance magnitude at a given frequency for a speaker model.
 * Returns impedance in ohms.
 *
 * This models the classic guitar speaker impedance curve:
 * - Low resonance peak around 75-100Hz (from LD1/CD1/RD1)
 * - Minimum impedance around 400Hz (near RL)
 * - Rising impedance above 1kHz (from voice coil inductance LD2/LD3)
 */
export function computeImpedance(model: SpeakerImpedanceModel, frequencyHz: number): number {
  const w = 2 * Math.PI * frequencyHz

  // Resonance tank: RD1 in parallel with series LD1+CD1
  const xlD1 = w * model.ld1
  const xcD1 = 1 / (w * model.cd1)
  const zTankReactive = xlD1 - xcD1
  const zTankMag = Math.sqrt(model.rd1 * model.rd1 + zTankReactive * zTankReactive)
  // Parallel combination magnitude (simplified)
  const zResonance = (model.rd1 * zTankMag) / Math.sqrt(model.rd1 * model.rd1 + zTankMag * zTankMag)

  // HF section: RD2 + CD2 + LD2
  const xlD2 = w * model.ld2
  const xcD2 = 1 / (w * model.cd2)
  const zHF = Math.sqrt(model.rd2 * model.rd2 + (xlD2 - xcD2) * (xlD2 - xcD2))

  // Output: LD3 + RD3
  const xlD3 = w * model.ld3
  const zOut = Math.sqrt(model.rd3 * model.rd3 + xlD3 * xlD3)

  // Total: RL + resonance + HF + output (series approximation)
  return model.rl + zResonance + zHF + zOut * 0.1
}

/**
 * Generate a frequency spectrum array for seeding speakerToneValues.
 * Returns [freq1, magnitude1, freq2, magnitude2, ...] pairs.
 * Magnitudes are normalized to 1.0 at the minimum impedance point.
 */
export function generateFrequencySpectrum(model: SpeakerImpedanceModel): number[] {
  const freqs = [20, 40, 60, 80, 100, 150, 200, 300, 400, 600, 800, 1000,
    1500, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 16000, 20000]

  const impedances = freqs.map(f => computeImpedance(model, f))
  const minZ = Math.min(...impedances)

  const result: number[] = []
  for (let i = 0; i < freqs.length; i++) {
    result.push(freqs[i], impedances[i] / minZ)
  }
  return result
}

/**
 * Generate an impedance curve array for seeding speakerToneValues.
 * Returns [freq1, impedanceOhms1, freq2, impedanceOhms2, ...] pairs.
 */
export function generateImpedanceCurve(model: SpeakerImpedanceModel): number[] {
  const freqs = [20, 50, 80, 100, 150, 200, 400, 800, 1000, 2000, 4000, 8000, 16000]
  const result: number[] = []
  for (const f of freqs) {
    result.push(f, Math.round(computeImpedance(model, f) * 100) / 100)
  }
  return result
}
