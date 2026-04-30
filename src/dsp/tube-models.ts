/**
 * Tube Models — SPICE-derived transfer functions for vacuum tube simulation.
 *
 * Source data: public/models/*.md (Duncan Amps / Leach SPICE models)
 *
 * Each model encodes the real tube's nonlinear V-I relationship as extracted
 * from the SPICE .SUBCKT definitions. The key parameters are:
 *
 * Triodes (12AX7A, 12AU7A, 12BH7A):
 *   Mu     — amplification factor (grid voltage multiplier)
 *   Kp     — plate current coefficient (Gp VALUE in SPICE)
 *   Kvb    — plate voltage offset (E1 VALUE constant)
 *   Cgk/Cgp/Cpk — interelectrode capacitances (pF)
 *
 * Pentodes/Beam Tetrodes (EL34, EL84, 6L6GC, KT88):
 *   Mu     — screen-to-grid ratio
 *   Kp     — plate current coefficient
 *   Ks     — screen current coefficient
 *   Cgk/Cak/Cga — interelectrode capacitances (pF)
 *   atanDiv — ATAN divisor controlling knee sharpness
 *
 * The process() function on each model computes plate current (Ia) from
 * plate voltage (Va), grid voltage (Vg), and optionally screen voltage (Vs).
 * This replaces the generic tanh() waveshaping in the current processors.
 */

// ─── Triode Model ────────────────────────────────────────────────────

export interface TriodeParams {
  /** Amplification factor (Mu). From SPICE: coefficient of V(G,K) in E1. */
  mu: number
  /** Plate current coefficient. From SPICE: Gp VALUE multiplier. */
  kp: number
  /** DC offset in the combined voltage equation. From SPICE: E1 constant. */
  kvb: number
  /** Grid-cathode capacitance (pF). */
  cgk: number
  /** Grid-plate capacitance (pF). */
  cgp: number
  /** Plate-cathode capacitance (pF). */
  cpk: number
}

/**
 * Compute triode plate current using the Leach model.
 * Derived from: E1 = Kvb + V(P,K) + Mu * V(G,K)
 *               Gp = Kp * (PWR(E1, 1.5) + PWRS(E1, 1.5)) / 2
 *
 * The (PWR + PWRS)/2 construct clamps negative values to zero
 * (PWR = |x|^1.5, PWRS = sign(x)*|x|^1.5, average = x^1.5 for x>0, 0 for x<0).
 */
export function triodePlateCurrentNormalized(
  vgNormalized: number,
  params: TriodeParams,
): number {
  // vgNormalized: -1 to 0 (grid voltage, 0 = no bias, -1 = full cutoff)
  // We simulate at a fixed operating point and return normalized current 0..1
  const va = 250 // typical plate voltage
  const vg = vgNormalized * (params.mu > 50 ? 3.5 : 18) // scale by tube type
  const e1 = params.kvb + va + params.mu * vg
  if (e1 <= 0) return 0
  return Math.min(params.kp * Math.pow(e1, 1.5), 1.0)
}

/**
 * Apply triode waveshaping to an audio sample.
 * Models the asymmetric soft-clipping characteristic of a real triode stage.
 */
export function triodeWaveshape(sample: number, params: TriodeParams, gain: number): number {
  // Scale input to grid voltage range
  const vg = sample * gain
  // Compute transfer function
  const e1 = params.kvb + 250 + params.mu * vg
  if (e1 <= 0) return 0
  // Normalized plate current with soft limiting
  const ip = params.kp * Math.pow(Math.max(e1, 0), 1.5)
  // Normalize to -1..1 range (plate current inverts the signal)
  return Math.max(Math.min(ip, 1.0), -1.0)
}

// ─── Pentode/Beam Tetrode Model ──────────────────────────────────────

export interface PentodeParams {
  /** Screen-to-grid voltage ratio. */
  mu: number
  /** Plate current coefficient. */
  kp: number
  /** Screen current coefficient. */
  ks: number
  /** ATAN divisor — controls knee sharpness of plate current. */
  atanDiv: number
  /** Grid-cathode capacitance (pF). */
  cgk: number
  /** Anode-cathode capacitance (pF). */
  cak: number
  /** Grid-anode capacitance (pF). */
  cga: number
  /** Plate dissipation max (W). */
  maxPlateDissipation: number
}

/**
 * Compute pentode plate current using the Duncan/Leach model.
 * Derived from the SPICE subcircuit equations:
 *   Eat = 0.636 * ATAN(V(A,K) / atanDiv)
 *   Egs = LIMIT(V(S,K)/screenDiv + V(G,K)*gridMul, 0, 1E6)
 *   Ia  = Kp * PWRS(Egs, 1.5) * Eat
 */
export function pentodePlateCurrentNormalized(
  vgNormalized: number,
  driveLevel: number,
  params: PentodeParams,
): number {
  const va = 400 // typical plate voltage
  const vs = 350 // typical screen voltage
  const vg = vgNormalized * 40 // grid voltage range

  // Plate current knee (ATAN saturation)
  const eat = 0.636 * Math.atan(va / params.atanDiv)

  // Combined grid-screen voltage
  const egs = Math.max(vs / (params.mu * 0.5) + vg * params.mu / 100 + va / 1400, 0)

  // Plate current
  const ip = params.kp * Math.pow(egs, 1.5) * eat * (1 + driveLevel)

  return Math.max(Math.min(ip, 1.0), 0)
}

// ─── Tube Parameter Database ─────────────────────────────────────────
// Extracted directly from public/models/*.md SPICE subcircuits

export const TRIODE_MODELS: Record<string, TriodeParams> = {
  /** 12AX7A — High-mu preamp triode. Mu=95.43, Kp=1.147E-6. */
  '12AX7A': {
    mu: 95.43,
    kp: 1.147e-6,
    kvb: 45,
    cgk: 1.6,
    cgp: 1.7,
    cpk: 0.46,
  },
  /** 12AU7A — Medium-mu triode. Mu=18.28, Kp=10.88E-6. */
  '12AU7A': {
    mu: 18.28,
    kp: 10.88e-6,
    kvb: 0,
    cgk: 1.6,
    cgp: 1.5,
    cpk: 0.5,
  },
  /** 12BH7A — Medium-mu triode. Mu=16.64, Kp=22.34E-6. */
  '12BH7A': {
    mu: 16.64,
    kp: 22.34e-6,
    kvb: 0,
    cgk: 3.2,
    cgp: 2.6,
    cpk: 0.5,
  },
}

export const PENTODE_MODELS: Record<string, PentodeParams> = {
  /** EL34/6CA7 — Power pentode. From 6ca7.inc. */
  EL34: {
    mu: 9.3,
    kp: 1.86e-3,
    ks: 1.518e-3,
    atanDiv: 23,
    cgk: 15.4,
    cak: 8.4,
    cga: 1.1,
    maxPlateDissipation: 25,
  },
  /** EL84/6BQ5 — Power pentode. From 6bq5.inc. */
  EL84: {
    mu: 19,
    kp: 3.2e-3,
    ks: 2.0e-3,
    atanDiv: 15,
    cgk: 10.8,
    cak: 6.5,
    cga: 0.5,
    maxPlateDissipation: 12,
  },
  /** 6L6GC — Beam power tube. From 6l6gc.inc (Leach model). */
  '6L6': {
    mu: 15.15,
    kp: 7.731e-7,
    ks: 7.731e-7,
    atanDiv: 60,
    cgk: 5.0,
    cak: 6.5,
    cga: 0.6,
    maxPlateDissipation: 30,
  },
  /** KT88 — Beam power tube. From kt88.inc (Leach model). */
  KT88: {
    mu: 24.49,
    kp: 8.301e-7,
    ks: 8.301e-7,
    atanDiv: 40,
    cgk: 8.0,
    cak: 12.0,
    cga: 1.2,
    maxPlateDissipation: 42,
  },
}

// ─── Tube Data Sheets (for seed script) ──────────────────────────────
// Extracted from public/tubes/*.md (Duncan Amps TDSL)

export interface TubeDataSheet {
  tubeType: string
  /** Heater voltage (V). */
  vh: number
  /** Heater current (A). */
  ih: number
  /** Max plate voltage (V). */
  vaMax: number
  /** Max plate dissipation (W). */
  paMax: number
  /** Plate resistance at typical operating point (Ω). */
  ra: number
  /** Transconductance (mA/V). */
  gm: number
}

export const TUBE_DATA_SHEETS: Record<string, TubeDataSheet> = {
  '12AX7': { tubeType: '12AX7', vh: 6.3, ih: 0.3, vaMax: 300, paMax: 1, ra: 62500, gm: 1.6 },
  '12AU7': { tubeType: '12AU7', vh: 6.3, ih: 0.3, vaMax: 300, paMax: 2.75, ra: 7200, gm: 2.5 },
  '12BH7': { tubeType: '12BH7', vh: 6.3, ih: 0.6, vaMax: 300, paMax: 3.5, ra: 5500, gm: 3.1 },
  '6L6': { tubeType: '6L6', vh: 6.3, ih: 0.9, vaMax: 360, paMax: 19, ra: 33000, gm: 5.2 },
  EL34: { tubeType: 'EL34', vh: 6.3, ih: 1.5, vaMax: 800, paMax: 25, ra: 15000, gm: 11 },
  EL84: { tubeType: 'EL84', vh: 6.3, ih: 0.76, vaMax: 300, paMax: 12, ra: 38000, gm: 11 },
  KT88: { tubeType: 'KT88', vh: 6.3, ih: 1.6, vaMax: 800, paMax: 42, ra: 9000, gm: 11 },
}
