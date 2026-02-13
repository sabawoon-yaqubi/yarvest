"use client"

interface ArticleCardSkeletonProps {
  count?: number
}

export function ArticleCardSkeleton({ count = 6 }: ArticleCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white flex flex-col h-full animate-pulse"
        >
          {/* Image skeleton with shimmer */}
          <div className="h-56 animate-shimmer rounded-t-2xl" />
          <div className="p-5 flex flex-col flex-1">
            <div className="h-3.5 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-5 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-4/5 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3 flex-1" />
            <div className="h-4 bg-gray-200 rounded w-28 mt-4" />
          </div>
        </div>
      ))}
    </>
  )
}
