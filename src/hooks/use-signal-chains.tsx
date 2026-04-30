"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import type { SavedSignalChain, SignalChainState } from "@/types/signal-chain"

/**
 * Query saved signal chains for a user from Convex.
 * Returns undefined while loading, empty array if no chains exist.
 */
export function useSignalChains(userId: Id<"userProfiles"> | null) {
  let raw: any[] | undefined

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    raw = useQuery(
      api.signalChains.getUserSignalChains,
      userId ? { userId } : "skip",
    )
  } catch {
    return { data: undefined, isLoading: false }
  }

  if (raw === undefined) {
    return { data: undefined, isLoading: true }
  }

  const chains: SavedSignalChain[] = raw.map((doc) => ({
    id: doc._id,
    userId: doc.userId,
    name: doc.name,
    config: doc.config as SignalChainState,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }))

  return { data: chains, isLoading: false }
}

/**
 * Returns Convex mutation functions for signal chain CRUD.
 * Falls back to no-ops if Convex provider is unavailable.
 */
export function useSignalChainMutations() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const save = useMutation(api.signalChains.saveSignalChain)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const rename = useMutation(api.signalChains.renameSignalChain)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const remove = useMutation(api.signalChains.deleteSignalChain)

    return {
      saveChain: (userId: Id<"userProfiles">, name: string, config: SignalChainState) =>
        save({ userId, name, config }),
      renameChain: (chainId: Id<"savedUserSignalChain">, newName: string) =>
        rename({ chainId, newName }),
      deleteChain: (chainId: Id<"savedUserSignalChain">) =>
        remove({ chainId }),
      available: true as const,
    }
  } catch {
    return {
      saveChain: async () => undefined,
      renameChain: async () => undefined,
      deleteChain: async () => undefined,
      available: false as const,
    }
  }
}
