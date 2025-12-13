import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function ProductDetailModalSkeleton() {
  return (
    <Dialog open={true}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Image Skeleton */}
          <div className="relative bg-gray-50 lg:min-h-[600px]">
            <Skeleton className="w-full h-full" />
          </div>

          {/* Right: Content Skeleton */}
          <div className="p-6 lg:p-8 flex flex-col relative">
            {/* Close button skeleton */}
            <Skeleton className="absolute top-4 right-4 h-8 w-8 rounded-full" />

            {/* Product Info Skeleton */}
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-5 w-40" />
              </div>

              {/* Badges Skeleton */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              {/* Price Skeleton */}
              <div className="py-4 border-y border-gray-200">
                <Skeleton className="h-10 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>

              {/* Description Skeleton */}
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>

              {/* Quantity Selector Skeleton */}
              <div>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>

              {/* Actions Skeleton */}
              <div className="flex gap-3 pt-4">
                <Skeleton className="flex-1 h-12 rounded-lg" />
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>

              {/* Seller Info Skeleton */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

