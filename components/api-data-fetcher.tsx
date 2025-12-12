"use client"

import { useCallback, ReactNode, useMemo } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { useApiFetch } from "@/hooks/use-api-fetch"

interface ApiDataFetcherProps<T> {
  url: string
  limit?: number
  page?: number
  renderItem: (item: T, index: number) => ReactNode
  renderLoading?: () => ReactNode
  renderError?: (error: string, retry: () => void) => ReactNode
  renderEmpty?: () => ReactNode
  gridClassName?: string
  enabled?: boolean
  onSuccess?: (data: T[]) => void
  onError?: (error: string) => void
  transformResponse?: (response: any) => T[] // Transform API response to array
}

export function ApiDataFetcher<T extends { id: number | string }>({
  url,
  limit,
  page = 1,
  renderItem,
  renderLoading,
  renderError,
  renderEmpty,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
  enabled = true,
  onSuccess,
  onError,
  transformResponse,
}: ApiDataFetcherProps<T>) {
  // Build URL with query parameters
  const params = new URLSearchParams()
  if (limit) params.set('limit', limit.toString())
  if (page) params.set('page', page.toString())
  const queryString = params.toString()
  const finalUrl = queryString ? `${url}?${queryString}` : url

  const { data, loading, error, refetch } = useApiFetch<any>(finalUrl, {
    enabled,
    onSuccess: (responseData) => {
      // Transform response if transformResponse is provided
      const transformedData = transformResponse ? transformResponse(responseData) : (Array.isArray(responseData) ? responseData : [])
      onSuccess?.(transformedData)
    },
    onError,
  })

  // Transform data for rendering
  const transformedData = React.useMemo(() => {
    if (!data) return []
    return transformResponse ? transformResponse(data) : (Array.isArray(data) ? data : [])
  }, [data, transformResponse])

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
  if (!transformedData || transformedData.length === 0) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data available at the moment.</p>
      </div>
    )
  }

  // Success state - render items
  return <div className={gridClassName}>{transformedData.map((item, index) => renderItem(item, index))}</div>
}

