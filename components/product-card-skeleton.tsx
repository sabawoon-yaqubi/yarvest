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
        <div
          key={i}
          className={`overflow-hidden animate-pulse bg-white border border-gray-100 rounded-3xl ${className}`}
        >
          {/* Image Skeleton */}
          <div className="h-[280px] bg-gradient-to-br from-gray-100 to-gray-50" />
          
          {/* Content Skeleton */}
          <div className="p-5 space-y-3 bg-white">
            {/* Product Name */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
            
            {/* Unit Skeleton */}
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            
            {/* Price Skeleton */}
            <div className="pt-1 flex items-center justify-between">
              <div className="h-7 bg-gray-200 rounded w-1/3" />
              <div className="h-6 bg-amber-100 rounded-xl w-16" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

