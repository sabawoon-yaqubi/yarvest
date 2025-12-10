"use client"

import { Card } from "@/components/ui/card"

interface ProductCardSkeletonProps {
  count?: number
  className?: string
}

export function ProductCardSkeleton({ count = 1, className = "" }: ProductCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className={`overflow-hidden animate-pulse bg-card border-2 border-gray-100 rounded-2xl ${className}`}
        >
          {/* Image Skeleton */}
          <div className="h-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
          
          {/* Content Skeleton */}
          <div className="p-4 space-y-3">
            {/* Seller Name */}
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            
            {/* Product Name */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
            
            {/* Price Skeleton */}
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <div className="h-7 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              {/* Button Skeleton */}
              <div className="h-10 bg-gray-200 rounded-xl mt-2" />
            </div>
          </div>
        </Card>
      ))}
    </>
  )
}

