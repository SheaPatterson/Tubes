"use client"

import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

// ═══════════════════════════════════════════════════════════════
// Amp Tone Stack — manufacturer-specific EQ center frequencies
// ═══════════════════════════════════════════════════════════════

export interface ToneStackData {
  bass: { frequency: number; gain: number; q: number }
  middle: { frequency: number; gain: number; q: number }
  treble: { frequency: number; gain: number; q: number }
  presence: { frequency: number; gain: number; q: number }
  resonance: { frequency: number; gain: number; q: number }
}

/**
 * Query manufacturer tone stack values for a specific amp.
 * Returns null while loading or if no data exists.
 */
export function useAmpToneStack(ampId: Id<"ampList"> | null) {
  let raw: any

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    raw = useQuery(
      api.catalog.getAmpToneStack,
      ampId ? { ampId } : "skip",
    )
  } catch {
    return null
  }

  if (!raw) return null

  return {
    bass: raw.bass,
    middle: raw.middle,
    treble: raw.treble,
    presence: raw.presence,
    resonance: raw.resonance,
  } as ToneStackData
}

// ═══════════════════════════════════════════════════════════════
// Preamp Tube Stages — per-amp, per-stage gain + frequency curves
// ═══════════════════════════════════════════════════════════════

export interface PreampStageData {
  stageIndex: number
  gain: number
  frequencyResponse: number[]
  harmonicContent: number[]
}

/**
 * Query preamp tube stage data for a specific amp.
 * Returns sorted by stageIndex.
 */
export function usePreampStages(ampId: Id<"ampList"> | null) {
  let raw: any[] | undefined

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    raw = useQuery(
      api.catalog.getPreampStages,
      ampId ? { ampId } : "skip",
    )
  } catch {
    return null
  }

  if (!raw) return null

  return raw
    .map((doc: any) => ({
      stageIndex: doc.stageIndex as number,
      gain: doc.gain as number,
      frequencyResponse: doc.frequencyResponse as number[],
      harmonicContent: doc.harmonicContent as number[],
    }))
    .sort((a, b) => a.stageIndex - b.stageIndex) as PreampStageData[]
}

// ═══════════════════════════════════════════════════════════════
// Power Amp Tube — per-tube-type sag, bias, voltage, compression
// ═══════════════════════════════════════════════════════════════

export interface PowerAmpTubeData {
  tubeType: string
  masterVolumeResponse: number[]
  biasDefault: number
  sagCoefficient: number
  voltageDefault: number
  compressionCurve: number[]
  dynamicRange: { min: number; max: number }
}

/**
 * Query power amp tube characteristics for a specific tube type.
 */
export function usePowerAmpTube(tubeType: string | null) {
  let raw: any

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    raw = useQuery(
      api.catalog.getPowerAmpTubeData,
      tubeType ? { tubeType } : "skip",
    )
  } catch {
    return null
  }

  if (!raw) return null

  return {
    tubeType: raw.tubeType,
    masterVolumeResponse: raw.masterVolumeResponse,
    biasDefault: raw.biasDefault,
    sagCoefficient: raw.sagCoefficient,
    voltageDefault: raw.voltageDefault,
    compressionCurve: raw.compressionCurve,
    dynamicRange: raw.dynamicRange,
  } as PowerAmpTubeData
}

// ═══════════════════════════════════════════════════════════════
// FX Pedal Circuit — component-level simulation data
// ═══════════════════════════════════════════════════════════════

export interface PedalCircuitData {
  circuitType: string
  componentValues: Record<string, unknown>
  transferFunction: number[]
}

/**
 * Query circuit-level component values for a specific FX pedal.
 */
export function usePedalCircuit(pedalId: Id<"fxPedalList"> | null) {
  let raw: any

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    raw = useQuery(
      api.catalog.getPedalCircuit,
      pedalId ? { pedalId } : "skip",
    )
  } catch {
    return null
  }

  if (!raw) return null

  return {
    circuitType: raw.circuitType,
    componentValues: raw.componentValues,
    transferFunction: raw.transferFunction,
  } as PedalCircuitData
}

// ═══════════════════════════════════════════════════════════════
// Cabinet Tone — body resonance data
// ═══════════════════════════════════════════════════════════════

export interface CabinetToneData {
  depth: number
  dimension: number
  airSimulation: number[]
}

/**
 * Query cabinet body tone values (depth, dimension, air simulation).
 */
export function useCabinetTone(cabId: Id<"cabList"> | null) {
  let raw: any

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    raw = useQuery(
      api.catalog.getCabinetTone,
      cabId ? { cabId } : "skip",
    )
  } catch {
    return null
  }

  if (!raw) return null

  return {
    depth: raw.depth,
    dimension: raw.dimension,
    airSimulation: raw.airSimulation,
  } as CabinetToneData
}

// ═══════════════════════════════════════════════════════════════
// Mic Tone — manufacturer frequency response data
// ═══════════════════════════════════════════════════════════════

export interface MicToneData {
  frequencyResponse: number[]
  polarPattern: string
  sensitivityDb: number
}

/**
 * Query mic manufacturer frequency response, polar pattern, sensitivity.
 */
export function useMicToneData(micId: Id<"micList"> | null) {
  let raw: any

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    raw = useQuery(
      api.catalog.getMicToneData,
      micId ? { micId } : "skip",
    )
  } catch {
    return null
  }

  if (!raw) return null

  return {
    frequencyResponse: raw.frequencyResponse,
    polarPattern: raw.polarPattern,
    sensitivityDb: raw.sensitivityDb,
  } as MicToneData
}
