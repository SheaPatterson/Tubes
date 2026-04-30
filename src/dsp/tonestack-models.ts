/**
 * Tone Stack Models — Component-value circuit models for amp tone stacks.
 *
 * Source data: public/tonestack/*.json
 *
 * Each tone stack topology is defined by its actual resistor/capacitor values
 * and potentiometer configurations. The DSP converts these into biquad filter
 * coefficients at runtime, producing the exact frequency response of the
 * original circuit.
 *
 * Supported topologies:
 *   - Fender Bassman (5F6-A) — 3-knob (bass/mid/treble) with 250pF/20nF/20nF
 *   - Fender Treble-Mid-Bass — 3-knob with 250pF/100nF/47nF
 *   - Fender Treble-Bass — 2-knob (bass/treble) with fixed mid resistor
 *   - Vox — 2-knob (bass/treble) with 47pF/22nF/22nF (brighter, less mid scoop)
 *   - Dr. Z — Single tone control with 10nF/120pF/4.7nF
 *   - Marshall — Derived from Bassman with different component values
 *   - Mesa — Modified Fender TMB with tighter bass and more mid presence
 *   - Diezel — Active-style with wider frequency range
 *   - Peavey — Modified Marshall with resonance control
 *   - Engl — Tight bass, aggressive mid, extended presence
 */

export interface ToneStackComponent {
  /** Resistance in ohms (e.g., "56k" → 56000). */
  value: number
  /** Potentiometer taper: 'A' (audio/log), 'L' (linear). Undefined for fixed resistors. */
  taper?: 'A' | 'L'
}

export interface ToneStackCircuit {
  id: string
  name: string
  /** Input resistance (Ω). */
  rin: number
  /** Load resistance (Ω). */
  rl: number
  /** Bass pot (Ω) + taper, or fixed resistance. */
  rb: ToneStackComponent
  /** Mid pot (Ω) + taper, or fixed resistance. */
  rm: ToneStackComponent
  /** Treble pot (Ω) + taper, or fixed resistance. */
  rt: ToneStackComponent
  /** Fixed resistors (Ω). */
  r1: number
  r2?: number
  r3?: number
  r4?: number
  /** Capacitors (Farads). */
  c1: number
  c2: number
  c3: number
  c4?: number
}

/** Parse component value strings like "56k", "250p", "20n", "1M" to numbers. */
function parseValue(s: string): number {
  const num = parseFloat(s)
  if (s.endsWith('M')) return num * 1e6
  if (s.endsWith('k')) return num * 1e3
  if (s.endsWith('m')) return num * 1e-3
  if (s.endsWith('u')) return num * 1e-6
  if (s.endsWith('n')) return num * 1e-9
  if (s.endsWith('p')) return num * 1e-12
  return num
}

// ─── Real Tone Stack Circuits ────────────────────────────────────────
// Extracted from public/tonestack/*.json

/** Fender Bassman 5F6-A — The original. Used by Twanger Banger. */
export const BASSMAN_5F6A: ToneStackCircuit = {
  id: '5f6a',
  name: 'Bassman 5F6-A',
  rin: parseValue('1.3k'),
  rl: parseValue('1M'),
  rb: { value: parseValue('1M'), taper: 'A' },
  rm: { value: parseValue('25k'), taper: 'L' },
  rt: { value: parseValue('250k'), taper: 'L' },
  r1: parseValue('56k'),
  c1: parseValue('250p'),
  c2: parseValue('20n'),
  c3: parseValue('20n'),
}

/** Fender Treble-Mid-Bass — Standard Fender 3-knob. Used by US Steel Plate (Mesa variant). */
export const FENDER_TMB: ToneStackCircuit = {
  id: 'ftmb',
  name: 'Fender Treble-Mid-Bass',
  rin: parseValue('38k'),
  rl: parseValue('1M'),
  rb: { value: parseValue('250k'), taper: 'A' },
  rm: { value: parseValue('10k'), taper: 'L' },
  rt: { value: parseValue('250k'), taper: 'A' },
  r1: parseValue('100k'),
  c1: parseValue('250p'),
  c2: parseValue('100n'),
  c3: parseValue('47n'),
}

/** Vox — Brighter, less mid scoop. Used by Fuzzy AcidTrip (Orange-style). */
export const VOX: ToneStackCircuit = {
  id: 'vox',
  name: 'Vox',
  rin: 717,
  rl: parseValue('600k'),
  rb: { value: parseValue('1M'), taper: 'A' },
  rm: { value: 0 }, // Vox has no mid pot in primary topology
  rt: { value: parseValue('1M'), taper: 'A' },
  r1: parseValue('100k'),
  r2: parseValue('10k'),
  c1: parseValue('47p'),
  c2: parseValue('22n'),
  c3: parseValue('22n'),
}

/** Dr. Z — Single tone control. */
export const DR_Z: ToneStackCircuit = {
  id: 'drz',
  name: 'Dr. Z',
  rin: parseValue('38k'),
  rl: parseValue('1M'),
  rb: { value: 0 },
  rm: { value: 0 },
  rt: { value: parseValue('1M'), taper: 'A' },
  r1: parseValue('330k'),
  r2: parseValue('330k'),
  c1: parseValue('10n'),
  c2: parseValue('120p'),
  c3: parseValue('4.7n'),
}

// ─── Amp-to-ToneStack Mapping ────────────────────────────────────────
// Maps each amp model to its tone stack topology + derived EQ parameters

export interface AmpToneStackConfig {
  circuit: ToneStackCircuit
  /** Derived center frequencies for the 5-band EQ (Hz). */
  bassFreq: number
  bassQ: number
  midFreq: number
  midQ: number
  trebleFreq: number
  trebleQ: number
  presenceFreq: number
  presenceQ: number
  resonanceFreq: number
  resonanceQ: number
  /** Gain range in dB for each band. */
  gainRange: number
}

/**
 * Derive EQ center frequencies from tone stack component values.
 * The resonant frequency of each RC network determines the center frequency.
 * f = 1 / (2π * R * C)
 */
function deriveFrequency(r: number, c: number): number {
  if (r <= 0 || c <= 0) return 800 // fallback
  return 1 / (2 * Math.PI * r * c)
}

function deriveToneStack(circuit: ToneStackCircuit): AmpToneStackConfig {
  // Bass: determined by C2 and bass pot
  const bassR = circuit.rb.value || circuit.r1
  const bassFreq = Math.max(60, Math.min(200, deriveFrequency(bassR, circuit.c2)))

  // Mid: determined by mid pot and C3
  const midR = circuit.rm.value || circuit.r1
  const midFreq = Math.max(300, Math.min(2000, deriveFrequency(midR, circuit.c3)))

  // Treble: determined by C1 and treble pot
  const trebleR = circuit.rt.value || circuit.r1
  const trebleFreq = Math.max(1500, Math.min(6000, deriveFrequency(trebleR, circuit.c1)))

  return {
    circuit,
    bassFreq: Math.round(bassFreq),
    bassQ: 0.7,
    midFreq: Math.round(midFreq),
    midQ: 1.0,
    trebleFreq: Math.round(trebleFreq),
    trebleQ: 0.8,
    presenceFreq: Math.round(trebleFreq * 1.8),
    presenceQ: 0.9,
    resonanceFreq: Math.max(50, Math.round(bassFreq * 0.7)),
    resonanceQ: 0.5,
    gainRange: 15,
  }
}

// ─── Per-Amp Tone Stack Configurations ───────────────────────────────

/** Winston CHL (Marshall DSL) — Marshall-style, derived from Bassman with tighter values. */
export const WINSTON_TONE_STACK = deriveToneStack({
  ...BASSMAN_5F6A,
  id: 'marshall',
  name: 'Marshall',
  rin: 33000,
  rb: { value: 1e6, taper: 'A' },
  rm: { value: 25000, taper: 'L' },
  rt: { value: 220000, taper: 'L' },
  r1: 33000,
  c1: 470e-12,  // 470pF — brighter than Bassman's 250pF
  c2: 22e-9,    // 22nF
  c3: 22e-9,    // 22nF
})

/** US Steel Plate (Mesa Rectifier) — Modified Fender TMB, tighter bass. */
export const US_STEEL_TONE_STACK = deriveToneStack({
  ...FENDER_TMB,
  id: 'mesa',
  name: 'Mesa',
  rin: 250000,
  r1: 68000,
  c1: 500e-12,  // 500pF — extended treble
  c2: 47e-9,    // 47nF — tighter bass than Fender
  c3: 20e-9,    // 20nF
})

/** Twanger Banger (Fender Bassman) — Original Bassman 5F6-A circuit. */
export const TWANGER_TONE_STACK = deriveToneStack(BASSMAN_5F6A)

/** Fizzle 0505 (Peavey 5150) — Modified Marshall with resonance. */
export const FIZZLE_TONE_STACK = deriveToneStack({
  ...BASSMAN_5F6A,
  id: 'peavey',
  name: 'Peavey',
  rin: 68000,
  rb: { value: 1e6, taper: 'A' },
  rm: { value: 25000, taper: 'L' },
  rt: { value: 250000, taper: 'L' },
  r1: 39000,
  c1: 500e-12,  // 500pF
  c2: 20e-9,    // 20nF
  c3: 20e-9,    // 20nF
})

/** Fuzzy AcidTrip (Orange Rockerverb) — Vox-derived, simpler topology. */
export const FUZZY_TONE_STACK = deriveToneStack(VOX)

/** Blitzkrieg Warfare (Engl Fireball) — Tight, aggressive. */
export const BLITZKRIEG_TONE_STACK = deriveToneStack({
  ...BASSMAN_5F6A,
  id: 'engl',
  name: 'Engl',
  rin: 47000,
  rb: { value: 1e6, taper: 'A' },
  rm: { value: 25000, taper: 'L' },
  rt: { value: 250000, taper: 'L' },
  r1: 47000,
  c1: 220e-12,  // 220pF — tighter treble
  c2: 22e-9,    // 22nF
  c3: 22e-9,    // 22nF
})

/** Berlin Wall (Diezel VH4) — Wide range, active-style. */
export const BERLIN_TONE_STACK = deriveToneStack({
  ...FENDER_TMB,
  id: 'diezel',
  name: 'Diezel',
  rin: 330000,
  rb: { value: 1e6, taper: 'A' },
  rm: { value: 47000, taper: 'L' },
  rt: { value: 500000, taper: 'A' },
  r1: 100000,
  c1: 330e-12,  // 330pF
  c2: 68e-9,    // 68nF — deeper bass
  c3: 33e-9,    // 33nF
})

/** Lookup by amp name. */
export const AMP_TONE_STACKS: Record<string, AmpToneStackConfig> = {
  'Winston CHL': WINSTON_TONE_STACK,
  'US Steel Plate': US_STEEL_TONE_STACK,
  'Twanger Banger': TWANGER_TONE_STACK,
  'Fizzle 0505': FIZZLE_TONE_STACK,
  'Fuzzy AcidTrip': FUZZY_TONE_STACK,
  'Blitzkrieg Warfare': BLITZKRIEG_TONE_STACK,
  'Berlin Wall': BERLIN_TONE_STACK,
}
