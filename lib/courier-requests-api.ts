// lib/courier-requests-api.ts
// API service for courier request-related operations

import api from './axios'
import { toast } from 'sonner'

export interface CourierRequest {
  id: number
  order: {
    id: number
    unique_id: string
    total_price: number
    delivery_fee: number
    delivery_type: string
    status: string
    buyer?: {
      id: number
      name: string
      email: string
      phone?: string
    }
    address?: {
      id: number
      full_address: string
      street_address: string
      city: string
      state: string
      postal_code: string
    }
    items_count: number
  }
  seller?: {
    id: number
    name: string
    email: string
    phone?: string
  }
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  notes?: string
  created_at: string
  accepted_at?: string
}

/**
 * Fetch available courier requests for authenticated courier
 */
export async function fetchCourierRequests(status: 'pending' | 'accepted' | 'rejected' | 'all' = 'pending'): Promise<CourierRequest[]> {
  try {
    const response = await api.get('/courier-requests', {
      params: { status }
    })
    if (response.data?.success) {
      return response.data.data || []
    }
    return []
  } catch (error: any) {
    console.error('Error fetching courier requests:', error)
    const errorMessage = error.response?.data?.message || 'Failed to fetch courier requests'
    toast.error(errorMessage, { duration: 3000 })
    return []
  }
}

/**
 * Accept a courier request
 */
export async function acceptCourierRequest(requestId: number): Promise<any> {
  try {
    const response = await api.post(`/courier-requests/${requestId}/accept`)
    toast.success(response.data?.message || 'Request accepted successfully', { duration: 3000 })
    return response.data?.data || response.data
  } catch (error: any) {
    console.error('Error accepting courier request:', error)
    const errorMessage = error.response?.data?.message || 'Failed to accept request'
    toast.error(errorMessage, { duration: 3000 })
    throw error
  }
}

/**
 * Reject a courier request
 */
export async function rejectCourierRequest(requestId: number): Promise<any> {
  try {
    const response = await api.post(`/courier-requests/${requestId}/reject`)
    toast.success(response.data?.message || 'Request rejected successfully', { duration: 3000 })
    return response.data?.data || response.data
  } catch (error: any) {
    console.error('Error rejecting courier request:', error)
    const errorMessage = error.response?.data?.message || 'Failed to reject request'
    toast.error(errorMessage, { duration: 3000 })
    throw error
  }
}


