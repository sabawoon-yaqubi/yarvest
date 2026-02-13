"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ArticleDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Skeleton className="h-10 w-32 mb-8 rounded-lg" />
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full max-w-2xl mb-4 rounded-lg" />
      <div className="flex flex-wrap gap-4 mb-8">
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-5 w-36 rounded" />
      </div>
      <Skeleton className="w-full h-80 rounded-2xl mb-8" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
    </div>
  )
}
