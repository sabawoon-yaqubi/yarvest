"use client"

import { useState, useEffect } from "react"
import { X, Share2, Check, Leaf } from "lucide-react"

export function ShareBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [shared, setShared] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    const dismissedAt = localStorage.getItem("shareBannerDismissed")
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt).getTime()
      const now = new Date().getTime()
      const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60)
      if (hoursSinceDismissed > 24) {
        setIsVisible(true)
      }
    } else {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("shareBannerDismissed", new Date().toISOString())
  }

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://app.yarvest.health"
  const shareText = "🌱 Discover fresh, locally-grown produce from your neighbors! Join me on Yarvest"

  const handleShare = async () => {
    // Try native share first (works great on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Yarvest",
          text: shareText,
          url: shareUrl,
        })
        setShared(true)
        setTimeout(() => setShared(false), 2000)
        return
      } catch (err) {
        // User cancelled or not supported, fall through to clipboard
      }
    }
    
    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch (err) {
      console.error("Failed to share:", err)
    }
  }

  if (!isHydrated || !isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-[#5a9c3a] via-[#4d8236] to-[#5a9c3a] text-white overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-10">
          <Leaf className="w-20 h-20 rotate-[-30deg]" />
        </div>
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-10">
          <Leaf className="w-16 h-16 rotate-[30deg]" />
        </div>
        <div className="absolute left-1/4 top-0 opacity-5">
          <Leaf className="w-10 h-10 rotate-45" />
        </div>
        <div className="absolute right-1/3 bottom-0 opacity-5">
          <Leaf className="w-8 h-8 -rotate-12" />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
          <Leaf className="w-32 h-32" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-center gap-3">
          {/* Message */}
          <p className="text-sm sm:text-base font-medium flex items-center gap-2">
            <span className="text-lg">🌱</span>
            <span>
              Tell your <span className="font-bold text-yellow-200">green thumb friends</span> about Yarvest!
            </span>
          </p>

          {/* Single Share Button */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-md ${
              shared 
                ? "bg-white text-[#5a9c3a]" 
                : "bg-white/95 text-[#5a9c3a] hover:bg-white hover:scale-105 hover:shadow-lg"
            }`}
          >
            {shared ? (
              <>
                <Check className="w-4 h-4" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors ml-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
