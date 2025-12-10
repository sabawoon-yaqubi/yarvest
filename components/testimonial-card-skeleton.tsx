"use client"

import { Card } from "@/components/ui/card"

interface TestimonialCardSkeletonProps {
  count?: number
}

export function TestimonialCardSkeleton({ count = 4 }: TestimonialCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="p-6 animate-pulse bg-card border border-border rounded-2xl flex flex-col"
        >
          {/* Quote icon */}
          <div className="w-8 h-8 bg-gray-200 rounded mb-4" />
          
          {/* Rating stars */}
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
            ))}
          </div>
          
          {/* Text */}
          <div className="space-y-2 mb-6 flex-1">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
          
          {/* Profile section */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </>
  )
}

