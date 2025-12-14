"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, X } from "lucide-react"
import { AddressModal } from "./address-modal"
import api from "@/lib/axios"
import { useAuthStore } from "@/stores/auth-store"

export function FirstTimeAddressPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const user = useAuthStore((state) => state.user)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  useEffect(() => {
    // Don't show if email is not verified - let email verification blocker handle that
    const isEmailVerified = user?.email_verified_at !== null && user?.email_verified_at !== undefined
    
    if (isLoggedIn && user && isEmailVerified) {
      // Add a small delay to ensure auth is fully initialized
      const timer = setTimeout(() => {
        checkAddresses()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isLoggedIn, user])

  const checkAddresses = async () => {
    setIsChecking(true)
    
    try {
      // Check if user has dismissed this prompt before
      const dismissed = localStorage.getItem(`address_prompt_dismissed_${user?.id}`)
      if (dismissed === 'true') {
        setIsChecking(false)
        return
      }

      // Check if user has any addresses
      const response = await api.get('/addresses')
      const addresses = response.data?.data || []
      
      if (addresses.length === 0) {
        // Show prompt after a short delay
        setTimeout(() => {
          setShowPrompt(true)
        }, 1500)
      } else {
        setIsChecking(false)
      }
    } catch (err: any) {
      // If 401 or not authenticated, don't show prompt
      if (err.response?.status === 401) {
        setIsChecking(false)
        return
      }
      console.error("Error checking addresses:", err)
      // On error, still try to show prompt after delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 2000)
    } finally {
      setIsChecking(false)
    }
  }

  const handleAddAddress = () => {
    setShowPrompt(false)
    setIsModalOpen(true)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    if (user?.id) {
      localStorage.setItem(`address_prompt_dismissed_${user.id}`, 'true')
    }
  }

  const handleModalSuccess = () => {
    setIsModalOpen(false)
    setShowPrompt(false)
    if (user?.id) {
      localStorage.setItem(`address_prompt_dismissed_${user.id}`, 'true')
    }
  }

  // Don't show if email is not verified - let email verification blocker handle that
  const isEmailVerified = user?.email_verified_at !== null && user?.email_verified_at !== undefined
  
  if (!isLoggedIn || !isEmailVerified || isChecking || !showPrompt) {
    return null
  }

  return (
    <>
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2 p-5">
              <div className="p-2 bg-[#0A8542]/10 rounded-lg">
                <MapPin className="w-6 h-6 text-[#0A8542]" />
              </div>
              <DialogTitle className="text-xl font-bold">Add Your Address</DialogTitle>
            </div>
            <DialogDescription className="text-base p-5">
              To get started with deliveries, please add your address. You can search for it or enter it manually.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600 mb-6 p-5">
              Adding your address helps us show you products available in your area and enables faster checkout.
            </p>

            <div className="flex gap-2 p-5">
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                onClick={handleAddAddress}
                className="flex-1 bg-[#0A8542] hover:bg-[#097038] text-white"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddressModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleModalSuccess}
      />
    </>
  )
}

