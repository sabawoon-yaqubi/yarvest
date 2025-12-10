"use client"

import { Card } from "@/components/ui/card"

interface ProducerCardSkeletonProps {
  count?: number
}

export function ProducerCardSkeleton({ count = 4 }: ProducerCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden animate-pulse flex flex-col bg-card border-2 border-gray-100 rounded-2xl"
        >
          {/* Image Skeleton */}
          <div className="h-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
          
          {/* Content Skeleton */}
          <div className="p-5 space-y-4">
            {/* Name */}
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            
            {/* Specialty */}
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            
            {/* Location */}
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            
            {/* Rating and Products */}
            <div className="flex justify-between items-center py-3 border-t border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
            
            {/* Button Skeleton */}
            <div className="h-10 bg-gray-200 rounded-xl" />
          </div>
        </Card>
      ))}
    </>
  )
}

