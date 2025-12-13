"use client"

import { Card } from "@/components/ui/card"

interface SponsorCardSkeletonProps {
  count?: number
}

export function SponsorCardSkeleton({ count = 4 }: SponsorCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="group cursor-pointer h-full animate-pulse"
        >
          <div className="relative overflow-hidden rounded-2xl h-48 shadow-md bg-secondary border-2 border-transparent">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="h-4 bg-white/20 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/20 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}


