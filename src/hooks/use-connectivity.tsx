"use client"

import * as React from "react"

export type ConnectivityStatus = "online" | "offline"

export function useConnectivity(): ConnectivityStatus {
  const [status, setStatus] = React.useState<ConnectivityStatus>(
    typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "online"
  )

  React.useEffect(() => {
    const handleOnline = () => setStatus("online")
    const handleOffline = () => setStatus("offline")

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return status
}
