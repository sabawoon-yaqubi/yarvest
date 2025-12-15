"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"

export function AuthInitializer() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    // Initialize auth asynchronously without blocking render
    // Use setTimeout to defer to next tick, allowing page to render first
    const timer = setTimeout(() => {
      initializeAuth()
    }, 0)
    
    return () => clearTimeout(timer)
  }, [initializeAuth])

  return null
}

