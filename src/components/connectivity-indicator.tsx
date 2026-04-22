"use client"

import { Wifi, WifiOff } from "lucide-react"
import { useConnectivity } from "@/hooks/use-connectivity"
import { cn } from "@/lib/utils"

export function ConnectivityIndicator() {
  const status = useConnectivity()
  const isOnline = status === "online"

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={isOnline ? "Connected" : "Offline"}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        isOnline
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-destructive/15 text-destructive"
      )}
    >
      {isOnline ? (
        <Wifi className="h-3.5 w-3.5" />
      ) : (
        <WifiOff className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
    </div>
  )
}
