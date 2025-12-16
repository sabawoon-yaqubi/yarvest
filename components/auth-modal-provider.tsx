"use client"

import { AuthModal } from "@/components/auth-modal"
import { useAuthModalStore } from "@/stores/auth-modal-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"

export function AuthModalProvider() {
  const { isOpen, mode, returnUrl, closeModal } = useAuthModalStore()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  // Close modal when user logs in and redirect if returnUrl exists
  useEffect(() => {
    if (isOpen && user) {
      closeModal()
      if (returnUrl) {
        // returnUrl is already a path, not encoded
        router.push(returnUrl)
      }
    }
  }, [user, isOpen, returnUrl, closeModal, router])

  return (
    <AuthModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeModal()
        }
      }}
      initialMode={mode}
    />
  )
}

