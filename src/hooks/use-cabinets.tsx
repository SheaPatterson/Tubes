"use client"

import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { cabinets as staticCabinets } from "@/data/cabinets"
import type { Cabinet } from "@/types/cabinet"

/**
 * Query cabinets from Convex, falling back to static data when
 * the query is loading or Convex is not configured.
 */
export function useCabinets(): { data: Cabinet[]; isLoading: boolean } {
  let convexCabs: unknown[] | undefined

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    convexCabs = useQuery(api.catalog.getCabinets)
  } catch {
    return { data: staticCabinets, isLoading: false }
  }

  if (convexCabs === undefined) {
    return { data: staticCabinets, isLoading: true }
  }

  if (convexCabs.length === 0) {
    return { data: staticCabinets, isLoading: false }
  }

  const mapped: Cabinet[] = convexCabs.map((doc: any) => {
    const config = doc.speakerConfig ?? "4x12"
    return {
      id: doc._id,
      name: doc.name,
      speakerConfig: config,
      speakers: [],
      irData: new Float32Array(0),
      visualConfig: {
        bodyColor: doc.visualConfig?.bodyColor ?? "#1a1a1a",
        grillPattern: doc.visualConfig?.grillPattern ?? "basket-weave",
        logoSvgPath: "/icons/logo.svg",
        width: config === "1x12" ? 500 : config === "2x12" ? 620 : config === "4x10" ? 620 : 760,
        height: config === "1x12" ? 480 : config === "2x12" ? 520 : config === "4x10" ? 600 : 840,
      },
    }
  })

  return { data: mapped, isLoading: false }
}
