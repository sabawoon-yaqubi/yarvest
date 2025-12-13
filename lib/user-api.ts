// lib/user-api.ts
// API service for user profile operations

import api from './axios'
import { toast } from 'sonner'

export interface User {
  id: number
  unique_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  image?: string | null
  profile_picture?: string | null
  email_verified_at?: string | null
  phone_verified_at?: string | null
  user_vehicle_id?: number | null
  refferal_code?: string | null
  status: string
  created_at: string
  updated_at: string
  theme?: string
  theme_color?: string | null
  roles?: Array<{
    id: number
    name: string
    created_at: string
    updated_at: string
    pivot: {
      user_id: number
      role_id: number
    }
  }>
}

export interface UpdateUserPayload {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  password?: string
  role_id?: number
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

export interface UpdateAddressPayload {
  city?: string
  country?: string
  state?: string
  street_address?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  apt?: string
  business_name?: string
  status?: boolean
}

/**
 * Fetch current authenticated user profile
 */
export async function fetchUserProfile(): Promise<User | null> {
  try {
    const response = await api.get('/user')
    // Handle different response structures
    const user = response.data?.data || response.data
    return user
  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    const errorMessage = error.response?.data?.message || 'Failed to fetch user profile'
    toast.error(errorMessage)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(payload: UpdateUserPayload): Promise<User | null> {
  try {
    const response = await api.put('/user', payload)
    // Handle different response structures
    const user = response.data?.data || response.data
    toast.success(response.data?.message || 'Profile updated successfully')
    return user
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    const errorMessage = error.response?.data?.message || 'Failed to update profile'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Update address
 */
export async function updateAddress(addressId: number, payload: UpdateAddressPayload): Promise<Address | null> {
  try {
    const response = await api.put(`/addresses/${addressId}`, payload)
    // Handle different response structures
    const address = response.data?.data || response.data
    toast.success('Address updated successfully')
    return address
  } catch (error: any) {
    console.error('Error updating address:', error)
    const errorMessage = error.response?.data?.message || 'Failed to update address'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Fetch user addresses
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
    console.error('Error fetching addresses:', error)
    // Don't show toast for addresses, might not be critical
    return []
  }
}

/**
 * Delete user account
 */
export async function deleteUser(): Promise<void> {
  try {
    await api.delete('/user')
    toast.success('Your account has been deleted successfully')
  } catch (error: any) {
    console.error('Error deleting user account:', error)
    const errorMessage = error.response?.data?.message || 'Failed to delete account'
    toast.error(errorMessage)
    throw error
  }
}



