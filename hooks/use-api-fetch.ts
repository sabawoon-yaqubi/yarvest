import { useState, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { ApiResponse, UseApiFetchOptions, UseApiFetchReturn } from "@/types/api"

export function useApiFetch<T>(
  url: string,
  options: UseApiFetchOptions = {}
): UseApiFetchReturn<T> {
  const { enabled = true, onSuccess, onError } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await api.get<ApiResponse<T>>(url)
      
      if (response.data.success && response.data.data) {
        setData(response.data.data)
        onSuccess?.(response.data.data)
      } else {
        const errorMessage = response.data.message || "Failed to load data"
        setError(errorMessage)
        onError?.(errorMessage)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch data"
      console.error("Error fetching data:", err)
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [url, enabled, onSuccess, onError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

