import { useState, useEffect, useCallback, useRef } from "react"
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
  const [isMounted, setIsMounted] = useState(false)
  
  // Use refs to store callbacks to avoid infinite re-renders
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  // Set mounted state only on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchData = useCallback(async () => {
    // Only fetch on client side when mounted
    if (!enabled || !isMounted) {
      // Keep loading true if we're waiting to mount
      if (!isMounted && enabled) {
        setLoading(true)
      }
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Fetch data without artificial delay for better performance
      const response = await api.get<ApiResponse<T>>(url)
      
      if (response.data.success && response.data.data) {
        setData(response.data.data)
        onSuccessRef.current?.(response.data.data)
      } else {
        const errorMessage = response.data.message || "Failed to load data"
        setError(errorMessage)
        onErrorRef.current?.(errorMessage)
      }
    } catch (err: any) {
      // Don't log 404 errors to console (they're expected in some cases)
      if (err.response?.status !== 404) {
        console.error("Error fetching data:", err)
      }
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch data"
      setError(errorMessage)
      onErrorRef.current?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [url, enabled, isMounted]) // Removed onSuccess and onError from dependencies

  useEffect(() => {
    if (isMounted && enabled) {
      fetchData()
    }
  }, [fetchData, isMounted, enabled])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

