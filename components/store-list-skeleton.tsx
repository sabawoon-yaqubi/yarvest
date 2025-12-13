import { Card } from "@/components/ui/card"

export function StoreListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden border-2 border-gray-200 rounded-3xl animate-pulse">
          <div className="relative h-64 bg-gray-200"></div>
          <div className="p-7 space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="flex items-center gap-2 pt-4 border-t-2 border-gray-200">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

