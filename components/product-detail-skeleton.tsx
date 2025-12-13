import { Card } from "@/components/ui/card"

export function ProductDetailSkeleton() {
  return (
    <div className="px-6 py-12 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <span className="text-gray-400">/</span>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Image */}
          <Card className="p-6">
            <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
          </Card>

          {/* Right - Details */}
          <div className="space-y-6">
            {/* Producer */}
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            
            {/* Title */}
            <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            
            {/* SKU */}
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Price */}
            <div className="h-12 w-32 bg-gray-200 rounded animate-pulse"></div>
            
            {/* Description */}
            <Card className="p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </Card>
            
            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Seller Info */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

