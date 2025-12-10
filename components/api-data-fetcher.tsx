"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { useApiFetch } from "@/hooks/use-api-fetch"

interface ApiDataFetcherProps<T> {
  url: string
  renderItem: (item: T, index: number) => ReactNode
  renderLoading?: () => ReactNode
  renderError?: (error: string, retry: () => void) => ReactNode
  renderEmpty?: () => ReactNode
  gridClassName?: string
  enabled?: boolean
  onSuccess?: (data: T[]) => void
  onError?: (error: string) => void
}

export function ApiDataFetcher<T extends { id: number | string }>({
  url,
  renderItem,
  renderLoading,
  renderError,
  renderEmpty,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
  enabled = true,
  onSuccess,
  onError,
}: ApiDataFetcherProps<T>) {
  const { data, loading, error, refetch } = useApiFetch<T[]>(url, {
    enabled,
    onSuccess,
    onError,
  })

  // Loading state
  if (loading) {
    return (
      <div className={gridClassName}>
        {renderLoading ? renderLoading() : <div>Loading...</div>}
      </div>
    )
  }

  // Error state
  if (error) {
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
  if (!data || data.length === 0) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data available at the moment.</p>
      </div>
    )
  }

  // Success state - render items
  return <div className={gridClassName}>{data.map((item, index) => renderItem(item, index))}</div>
}

