/**
 * API-related TypeScript interfaces
 * Reusable across the application
 */

// Standard API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// API Fetch Hook Options
export interface UseApiFetchOptions {
  enabled?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

// API Fetch Hook Return Type
export interface UseApiFetchReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

