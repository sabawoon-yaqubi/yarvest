// lib/harvest-requests-api.ts
// Reusable API service for harvest request-related operations

import api from './axios'
import { toast } from 'sonner'

export interface HarvestRequest {
  id: number
  unique_id?: string
  title: string
  description?: string
  date: string
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  number_of_people?: number
  products_count?: number
  accepted_count?: number
  created_at?: string
  updated_at?: string
  store?: {
    id: number
    unique_id: string
    name: string
    logo?: string
  }
  address?: {
    id: number
    street_address: string
    city: string
    state: string
    postal_code: string
    country: string
    full_address: string
  }
  products?: Array<{
    id: number
    unique_id: string
    name: string
    main_image?: string
    unit?: {
      id: number
      unique_id: string
      name: string
    }
  }>
  product?: {
    id: number
    unique_id: string
    name: string
    main_image?: string
    unit?: {
      id: number
      unique_id: string
      name: string
    }
  }
  // Legacy fields for backward compatibility
  product_id?: number
  quantity?: number
  unit?: string
  requested_date?: string
  requestedDate?: string
  location?: string
  notes?: string
  createdAt?: string
}

export interface CreateHarvestRequestPayload {
  product_id?: number
  product_ids?: number[]
  date: string
  user_address_id: number
  number_of_people?: number
  description?: string
}

export interface UpdateHarvestRequestPayload {
  product_id?: number
  product_ids?: number[]
  date?: string
  user_address_id?: number
  number_of_people?: number
  description?: string
  status?: 'pending' | 'accepted' | 'completed' | 'cancelled'
}

/**
 * Fetch all harvest requests (index)
 */
export async function fetchHarvestRequests(): Promise<HarvestRequest[]> {
  try {
    const response = await api.get('/harvest-requests')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching harvest requests:', error)
    toast.error('Failed to fetch harvest requests')
    return []
  }
}

/**
 * Fetch user's harvest requests
 */
export async function fetchUserHarvestRequests(): Promise<HarvestRequest[]> {
  try {
    const response = await api.get('/harvest-requests/my-requests')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching user harvest requests:', error)
    toast.error('Failed to fetch your harvest requests')
    return []
  }
}

/**
 * Fetch a single harvest request by ID
 */
export async function fetchHarvestRequest(id: string | number): Promise<HarvestRequest | null> {
  try {
    const response = await api.get(`/harvest-requests/${id}`)
    // Handle different response structures
    const request = response.data?.data || response.data
    return request
  } catch (error: any) {
    console.error('Error fetching harvest request:', error)
    const errorMessage = error.response?.data?.message || 'Failed to fetch harvest request'
    toast.error(errorMessage)
    return null
  }
}

/**
 * Create a new harvest request
 */
export async function createHarvestRequest(payload: CreateHarvestRequestPayload): Promise<HarvestRequest | null> {
  try {
    const response = await api.post('/harvest-requests', payload)
    // Handle different response structures
    const request = response.data?.data || response.data
    toast.success('Harvest request created successfully!')
    return request
  } catch (error: any) {
    console.error('Error creating harvest request:', error)
    const errorMessage = error.response?.data?.message || 'Failed to create harvest request'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Update an existing harvest request
 */
export async function updateHarvestRequest(id: string | number, payload: UpdateHarvestRequestPayload): Promise<HarvestRequest | null> {
  try {
    const response = await api.put(`/harvest-requests/${id}`, payload)
    const request = response.data?.data || response.data
    toast.success('Harvest request updated successfully!')
    return request
  } catch (error: any) {
    console.error('Error updating harvest request:', error)
    const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update harvest request'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Delete a harvest request
 */
export async function deleteHarvestRequest(id: string | number): Promise<void> {
  try {
    await api.delete(`/harvest-requests/${id}`)
    toast.success('Harvest request deleted successfully!')
  } catch (error: any) {
    console.error('Error deleting harvest request:', error)
    const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete harvest request'
    toast.error(errorMessage)
    throw error
  }
}

