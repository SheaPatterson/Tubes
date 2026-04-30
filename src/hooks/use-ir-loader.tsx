"use client"

import * as React from "react"
import { findBestIR, getCabinetIRs } from "@/data/ir-catalog"
import type { MicType } from "@/types/cabinet"
import type { IREntry } from "@/data/ir-catalog"

interface IRLoaderState {
  /** Decoded IR audio data ready for the cabinet processor. */
  irData: Float32Array | null
  /** The IR entry that was loaded. */
  entry: IREntry | null
  /** Whether a fetch/decode is in progress. */
  isLoading: boolean
  /** Error message if loading failed. */
  error: string | null
}

/**
 * Fetches and decodes a WAV IR file for a given cabinet + mic + position.
 * Returns a Float32Array suitable for sending to the cabinet-processor
 * via `port.postMessage({ type: 'loadIR', irData })`.
 *
 * Caches decoded IRs in memory to avoid redundant fetches.
 */
export function useIRLoader(
  cabinetId: string | null,
  micType: MicType,
  position: 'center' | 'offaxis' | 'edge' | 'mix',
): IRLoaderState {
  const [state, setState] = React.useState<IRLoaderState>({
    irData: null,
    entry: null,
    isLoading: false,
    error: null,
  })

  // In-memory cache shared across renders
  const cacheRef = React.useRef<Map<string, Float32Array>>(new Map())

  React.useEffect(() => {
    if (!cabinetId) return

    const entry = findBestIR(cabinetId, micType, position)
    if (!entry) {
      // Fall back to the cabinet's default IR
      const set = getCabinetIRs(cabinetId)
      if (!set) {
        setState({ irData: null, entry: null, isLoading: false, error: null })
        return
      }
      const defaultEntry = set.irs[0]
      if (!defaultEntry) {
        setState({ irData: null, entry: null, isLoading: false, error: null })
        return
      }
      loadIR(defaultEntry)
      return
    }

    loadIR(entry)

    async function loadIR(ir: IREntry) {
      // Check cache
      const cached = cacheRef.current.get(ir.path)
      if (cached) {
        setState({ irData: cached, entry: ir, isLoading: false, error: null })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetch(ir.path)
        if (!response.ok) {
          throw new Error(`Failed to fetch IR: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()

        // Decode the WAV to raw audio samples
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
        await audioCtx.close()

        // Extract the first channel as Float32Array
        const irData = audioBuffer.getChannelData(0)

        // Cache it
        cacheRef.current.set(ir.path, irData)

        setState({ irData, entry: ir, isLoading: false, error: null })
      } catch (err) {
        setState({
          irData: null,
          entry: ir,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load IR",
        })
      }
    }
  }, [cabinetId, micType, position])

  return state
}

/**
 * Returns all available IR entries for a cabinet.
 * Useful for building a mic/position selector UI.
 */
export function useCabinetIRList(cabinetId: string | null) {
  return React.useMemo(() => {
    if (!cabinetId) return []
    const set = getCabinetIRs(cabinetId)
    return set?.irs ?? []
  }, [cabinetId])
}
