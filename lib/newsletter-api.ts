// lib/newsletter-api.ts
// Reusable API service for newsletter-related operations

import api from './axios'
import { toast } from 'sonner'

export interface NewsletterSubscription {
  id: number
  email: string
  status: boolean
  created_at?: string
  updated_at?: string
}

export interface SubscribeResponse {
  success: boolean
  message: string
  data?: NewsletterSubscription
}

export interface CheckStatusResponse {
  success: boolean
  subscribed: boolean
  message?: string
  data?: NewsletterSubscription
}

/**
 * Subscribe to newsletter
 */
export async function subscribeToNewsletter(email: string): Promise<SubscribeResponse> {
  try {
    const response = await api.post('/newsletter/subscribe', { email })
    
    if (response.data?.success) {
      toast.success(response.data.message || 'Successfully subscribed to newsletter!')
      return response.data
    }
    
    throw new Error(response.data?.message || 'Failed to subscribe')
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to subscribe to newsletter'
    
    // Handle specific error cases
    if (error.response?.status === 409) {
      toast.error(errorMessage)
    } else if (error.response?.status === 422) {
      const errors = error.response?.data?.errors
      if (errors?.email) {
        toast.error(errors.email[0])
      } else {
        toast.error('Please enter a valid email address')
      }
    } else {
      toast.error(errorMessage)
    }
    
    throw error
  }
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(email: string): Promise<SubscribeResponse> {
  try {
    const response = await api.post('/newsletter/unsubscribe', { email })
    
    if (response.data?.success) {
      toast.success(response.data.message || 'Successfully unsubscribed from newsletter')
      return response.data
    }
    
    throw new Error(response.data?.message || 'Failed to unsubscribe')
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to unsubscribe from newsletter'
    
    if (error.response?.status === 404) {
      toast.error('Email not found in newsletter subscriptions')
    } else if (error.response?.status === 409) {
      toast.error(errorMessage)
    } else if (error.response?.status === 422) {
      const errors = error.response?.data?.errors
      if (errors?.email) {
        toast.error(errors.email[0])
      } else {
        toast.error('Please enter a valid email address')
      }
    } else {
      toast.error(errorMessage)
    }
    
    throw error
  }
}

/**
 * Check newsletter subscription status
 */
export async function checkNewsletterStatus(email: string): Promise<CheckStatusResponse> {
  try {
    const response = await api.post('/newsletter/check-status', { email })
    return response.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to check subscription status'
    
    if (error.response?.status === 422) {
      const errors = error.response?.data?.errors
      if (errors?.email) {
        toast.error(errors.email[0])
      }
    }
    
    throw error
  }
}
