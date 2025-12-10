"use client"

import { useEffect, useRef, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { usePaginatedApi } from "@/hooks/use-paginated-api"

interface InfiniteScrollFetcherProps<T> {
  url: string
  limit?: number
  renderItem: (item: T, index: number) => ReactNode
  renderLoading?: () => ReactNode
  renderError?: (error: string, retry: () => void) => ReactNode
  renderEmpty?: () => ReactNode
  gridClassName?: string
  enabled?: boolean
  onSuccess?: (data: T[]) => void
  onError?: (error: string) => void
}

export function InfiniteScrollFetcher<T extends { id: number | string }>({
  url,
  limit = 12,
  renderItem,
  renderLoading,
  renderError,
  renderEmpty,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
  enabled = true,
  onSuccess,
  onError,
}: InfiniteScrollFetcherProps<T>) {
  const { data, loading, error, hasMore, loadMore, refetch } = usePaginatedApi<T>(url, {
    limit,
    enabled,
    onSuccess,
    onError,
  })

  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loading, loadMore])

  // Initial loading state
  if (loading && data.length === 0) {
    return (
      <>
        <div className={gridClassName}>
          {renderLoading ? renderLoading() : <div>Loading...</div>}
        </div>
      </>
    )
  }

  // Error state
  if (error && data.length === 0) {
    return renderError ? (
      renderError(error, refetch)
    ) : (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          onClick={refetch}
          variant="outline"
          className="bg-[#0A5D31] text-white hover:bg-[#0d7a3f]"
        >
          Retry
        </Button>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data available at the moment.</p>
      </div>
    )
  }

  // Success state - render items with infinite scroll
  return (
    <>
      <div className={gridClassName}>
        {data.map((item, index) => renderItem(item, index))}
      </div>
      
      {/* Loading more indicator */}
      {loading && data.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#0A5D31]" />
          <span className="ml-2 text-muted-foreground">Loading more...</span>
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && !loading && (
        <div ref={observerTarget} className="h-10 w-full" />
      )}

      {/* End of list message */}
      {!hasMore && data.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">You've reached the end of the list</p>
        </div>
      )}
    </>
  )
}

