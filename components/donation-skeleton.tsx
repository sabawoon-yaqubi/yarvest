import { Card } from "@/components/ui/card"

export function DonationSkeleton() {
  return (
    <div className="px-6 py-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-6 animate-pulse"></div>
          <div className="h-12 w-96 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-2xl bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>

        {/* Campaigns Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="overflow-hidden border-2 border-gray-200 animate-pulse">
              <div className="h-56 bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Donate Section Skeleton */}
        <div className="p-8 rounded-2xl border-2 border-gray-200 mb-12 animate-pulse">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded mx-auto"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="flex flex-wrap justify-center gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 w-20 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-12 w-48 bg-gray-200 rounded-xl mx-auto"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="mt-12 mb-12">
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6 rounded-2xl border-2 border-gray-200 text-center animate-pulse">
                <div className="w-14 h-14 bg-gray-200 rounded-xl mx-auto mb-4"></div>
                <div className="h-8 w-24 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

