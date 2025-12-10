"use client"

import { Card } from "@/components/ui/card"

interface EventCardSkeletonProps {
  count?: number
}

export function EventCardSkeleton({ count = 3 }: EventCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden animate-pulse flex flex-col bg-card border-2 border-gray-100 rounded-2xl"
        >
          {/* Image Skeleton */}
          <div className="h-52 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
          
          {/* Content Skeleton */}
          <div className="p-5 space-y-4">
            {/* Title */}
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            
            {/* Event Details */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            
            {/* Button Skeleton */}
            <div className="h-10 bg-gray-200 rounded-xl mt-4" />
          </div>
        </Card>
      ))}
    </>
  )
}

