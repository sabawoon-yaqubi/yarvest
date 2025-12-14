"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"

export default function ProfilePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/")
      } else {
        // Redirect to settings page
        router.push("/settings")
      }
    }
  }, [user, isLoading, router])

  return null
}
