"use client"

import { useEffect } from "react"

export function MarkerInitializer() {
  useEffect(() => {
    const initializeMarker = async () => {
      try {
        const markerSDK = (await import('@marker.io/browser')).default
        await markerSDK.loadWidget({
          project: '693f5d74782a477decfca5df',
        })
      } catch (error) {
        // Silently fail - Marker.io subscription may be inactive
        // No need to log errors for inactive subscriptions
      }
    }

    initializeMarker()
  }, [])

  return null
}
