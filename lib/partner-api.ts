// lib/partner-api.ts
// API service for partner application submissions

import api from './axios'
import { toast } from 'sonner'

export interface PartnerApplicationData {
  company?: string
  name: string
  phone?: string
  email: string
  message?: string
  type_of_business?: string
  website?: string
}

export interface PartnerApplicationResponse {
  success: boolean
  message: string
  data?: any
  errors?: Record<string, string[]>
}

/**
 * Submit a partner application
 */
export async function submitPartnerApplication(
  data: PartnerApplicationData
): Promise<PartnerApplicationResponse> {
  try {
    const response = await api.post<PartnerApplicationResponse>('/partners/apply', data)
    
    if (response.data.success) {
      toast.success(response.data.message || 'Application submitted successfully!')
      return response.data
    } else {
      throw new Error(response.data.message || 'Failed to submit application')
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to submit your application. Please try again.'
    
    // Handle validation errors
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const firstError = Object.values(errors)[0] as string[]
      toast.error(firstError?.[0] || errorMessage)
    } else {
      toast.error(errorMessage)
    }
    
    throw error
  }
}





