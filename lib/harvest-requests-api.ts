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
  accepted?: Array<{
    id: number
    harvest_id: number
    status: string
    harvester?: {
      id: number
      name: string
      email: string
      phone?: string
    }
    created_at: string
  }>
  created_at?: string
  updated_at?: string
  user?: {
    id: number
    name: string
    email: string
  }
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

export interface Address {
  id: number
  street_address: string
  city: string
  state: string
  country: string
  postal_code: string
  latitude?: number | string | null
  longitude?: number | string | null
  apt?: string
  business_name?: string
  status?: boolean | string
  full_address?: string
}

export interface CreateHarvestRequestPayload {
  product_id?: number
  product_ids?: number[]
  date: string
  user_address_id?: number
  user_address_ids?: number[]
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
 * Fetch harvest requests where user has offered help
 */
export async function fetchMyHarvestOffers(): Promise<HarvestRequest[]> {
  try {
    const response = await api.get('/harvest-requests/my-offers')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching my harvest offers:', error)
    return []
  }
}

/**
 * Fetch user's addresses for harvest requests
 */
export async function fetchUserAddresses(): Promise<Address[]> {
  try {
    const response = await api.get('/addresses')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching user addresses:', error)
    toast.error('Failed to fetch your addresses')
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

/**
 * Offer help for a harvest request (volunteer offers to help)
 */
export async function offerHelpForHarvestRequest(id: string | number): Promise<any> {
  try {
    const response = await api.post(`/harvest-requests/${id}/offer-help`)
    toast.success(response.data?.message || 'Your offer has been submitted successfully!', { duration: 3000 })
    return response.data?.data || response.data
  } catch (error: any) {
    console.error('Error offering help:', error)
    const errorMessage = error.response?.data?.message || 'Failed to submit offer'
    toast.error(errorMessage, { duration: 3000 })
    throw error
  }
}

