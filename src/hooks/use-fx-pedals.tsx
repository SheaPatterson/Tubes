"use client"

import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { fxPedals as staticFxPedals } from "@/data/fx-pedals"
import type { FxPedalDefinition } from "@/types/fx"

/**
 * Query FX pedals from Convex, falling back to static data when
 * the query is loading or Convex is not configured.
 */
export function useFxPedals(): { data: FxPedalDefinition[]; isLoading: boolean } {
  let convexPedals: unknown[] | undefined

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    convexPedals = useQuery(api.catalog.getPedals)
  } catch {
    return { data: staticFxPedals, isLoading: false }
  }

  if (convexPedals === undefined) {
    return { data: staticFxPedals, isLoading: true }
  }

  if (convexPedals.length === 0) {
    return { data: staticFxPedals, isLoading: false }
  }

  const brandLogoMap: Record<string, string> = {
    MAC: "/icons/logo-mac.svg",
    KING: "/icons/logo-king.svg",
    Manhattan: "/icons/logo-manhattan.svg",
    TOKYO: "/icons/logo-tokyo.svg",
  }

  const mapped: FxPedalDefinition[] = convexPedals.map((doc: any) => ({
    id: doc._id,
    name: doc.name,
    brand: doc.brand,
    originalBrand: doc.brand,
    category: doc.category,
    controls: doc.controls.map((c: any) => ({
      ...c,
      step: c.type === "slider" || c.type === "switch" ? 1 : 0.1,
    })),
    circuitType: "",
    visualConfig: {
      bodyColor: doc.visualConfig?.bodyColor ?? "#333",
      knobStyle: doc.brand === "KING" ? "boss-style" : "small-black",
      labelFont: doc.brand === "Manhattan" ? "serif" : "sans-serif",
      logoSvgPath: brandLogoMap[doc.brand] ?? "/icons/logo.svg",
      width: doc.category === "multi" ? 300 : doc.brand === "Manhattan" ? 140 : doc.brand === "KING" ? 130 : 120,
      height: doc.category === "multi" ? 180 : doc.brand === "Manhattan" ? 240 : doc.brand === "KING" ? 210 : 200,
    },
    tierRequired: doc.tierRequired,
  }))

  return { data: mapped, isLoading: false }
}
