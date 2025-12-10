import { useState, useEffect, useCallback, useRef } from "react"
import api from "@/lib/axios"
import { ApiResponse } from "@/types/api"

interface UsePaginatedApiOptions {
  limit?: number
  enabled?: boolean
  onSuccess?: (data: any[]) => void
  onError?: (error: any) => void
}

interface UsePaginatedApiReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refetch: () => Promise<void>
}

export function usePaginatedApi<T extends { id: number | string }>(
  url: string,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiReturn<T> {
  const { limit = 12, enabled = true, onSuccess, onError } = options
  
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const isLoadingRef = useRef(false)

  const fetchPage = useCallback(async (page: number, reset: boolean = false) => {
    if (!enabled || isLoadingRef.current) return
    
    try {
      isLoadingRef.current = true
      if (reset) {
        setLoading(true)
      }
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      const response = await api.get<ApiResponse<T[]>>(`${url}?${params}`)
      
      if (response.data.success && response.data.data) {
        const newData = response.data.data
        setData(prev => reset ? newData : [...prev, ...newData])
        setHasMore(newData.length === limit)
        setCurrentPage(page)
        onSuccess?.(newData)
      } else {
        const errorMessage = response.data.message || "Failed to load data"
        setError(errorMessage)
        onError?.(errorMessage)
        setHasMore(false)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch data"
      console.error("Error fetching data:", err)
      setError(errorMessage)
      onError?.(errorMessage)
      setHasMore(false)
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [url, limit, enabled, onSuccess, onError])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || isLoadingRef.current) return
    await fetchPage(currentPage + 1, false)
  }, [hasMore, loading, currentPage, fetchPage])

  const refetch = useCallback(async () => {
    setCurrentPage(1)
    setData([])
    setHasMore(true)
    await fetchPage(1, true)
  }, [fetchPage])

  useEffect(() => {
    if (enabled) {
      fetchPage(1, true)
    }
  }, [enabled]) // Only run on mount or when enabled changes

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
  }
}

