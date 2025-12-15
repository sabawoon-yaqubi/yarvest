"use client"

import { memo } from "react"

interface CartItemSkeletonProps {
  count?: number
}

export const CartItemSkeleton = memo(function CartItemSkeleton({ count = 3 }: CartItemSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-3xl border-2 border-gray-100 animate-pulse bg-white"
        >
          <div className="flex gap-6">
            {/* Image Skeleton */}
            <div className="w-32 h-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-2xl flex-shrink-0" />
            
            {/* Content Skeleton */}
            <div className="flex-1 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-4 bg-gray-100 rounded-full p-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="w-12 h-6 bg-gray-200 rounded" />
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20 ml-auto" />
                  <div className="h-7 bg-gray-200 rounded w-24 ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
})




