"use client"

import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { ampModels as staticAmpModels } from "@/data/amp-models"
import type { AmpModel } from "@/types/amp"

/**
 * Query amp models from Convex, falling back to static data when
 * the query is loading or Convex is not configured.
 */
export function useAmpModels(): { data: AmpModel[]; isLoading: boolean } {
  let convexAmps: unknown[] | undefined

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    convexAmps = useQuery(api.catalog.getAmps)
  } catch {
    // Convex provider not available — use static fallback
    return { data: staticAmpModels, isLoading: false }
  }

  if (convexAmps === undefined) {
    return { data: staticAmpModels, isLoading: true }
  }

  if (convexAmps.length === 0) {
    return { data: staticAmpModels, isLoading: false }
  }

  // Map Convex documents to AmpModel shape
  const mapped: AmpModel[] = convexAmps.map((doc: any) => ({
    id: doc._id,
    name: doc.name,
    originalBrand: doc.brandRename,
    brandRename: doc.brandRename,
    channels: doc.channels,
    preampStageCount: doc.preampStageCount,
    powerAmpTubeType: doc.powerAmpTubeType,
    controls: doc.controls.map((c: any) => ({
      ...c,
      step: 0.1,
    })),
    toggleSwitches: (doc.toggleSwitches ?? []).map((t: any) => ({
      ...t,
      applicableToModel: true,
    })),
    visualConfig: doc.visualConfig ?? {
      panelColor: "#1a1a1a",
      knobStyle: "chicken-head",
      fontFamily: "serif",
      logoSvgPath: "/icons/logo.svg",
      layoutGrid: [],
    },
  }))

  return { data: mapped, isLoading: false }
}
