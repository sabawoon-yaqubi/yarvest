// lib/leaderboard-api.ts
// API service for leaderboard and points-related operations

import api from './axios'
import { toast } from 'sonner'

export interface UserRanking {
  rank: number
  id: number
  user_id: number
  store_id: number | null
  logo: string | null
  name: string
  badge: {
    name: string
    color: string
    class: string
  }
  rating: number
  products_count: number
  points: number
  user: {
    id: number
    unique_id: string
    full_name: string
    image: string | null
    email: string
  }
  store: {
    id: number
    unique_id: string
    name: string
    logo: string | null
  } | null
  created_at: string
  updated_at: string
}

export interface PointsBreakdown {
  action: string
  action_name: string
  total_points: number
  count: number
}

export interface PointHistory {
  id: number
  action: string
  points: number
  description: string
  pointable_type: string
  pointable_id: number
  created_at: string
}

export interface UserPoints {
  total_points: number
  breakdown: PointsBreakdown[]
  history: PointHistory[]
  pagination?: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

/**
 * Get user's ranking
 */
export async function getUserRanking(): Promise<UserRanking | null> {
  try {
    const response = await api.get('/leaderboard/my-ranking')
    if (response.data?.success) {
      return response.data.data || null
    }
    return null
  } catch (error: any) {
    console.error('Error fetching user ranking:', error)
    // Don't show error toast if user is not on leaderboard yet
    if (error.response?.status !== 404) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch ranking'
      toast.error(errorMessage, { duration: 3000 })
    }
    return null
  }
}

/**
 * Get user's points with breakdown and history
 */
export async function getUserPoints(page: number = 1, limit: number = 50): Promise<UserPoints | null> {
  try {
    const response = await api.get('/leaderboard/my-points', {
      params: { page, limit }
    })
    if (response.data?.success) {
      return response.data.data || null
    }
    return null
  } catch (error: any) {
    console.error('Error fetching user points:', error)
    const errorMessage = error.response?.data?.message || 'Failed to fetch points'
    toast.error(errorMessage, { duration: 3000 })
    return null
  }
}

/**
 * Get user's points breakdown
 */
export async function getUserPointsBreakdown(): Promise<{ total_points: number; breakdown: PointsBreakdown[] } | null> {
  try {
    const response = await api.get('/leaderboard/my-points-breakdown')
    if (response.data?.success) {
      return response.data.data || null
    }
    return null
  } catch (error: any) {
    console.error('Error fetching points breakdown:', error)
    const errorMessage = error.response?.data?.message || 'Failed to fetch points breakdown'
    toast.error(errorMessage, { duration: 3000 })
    return null
  }
}

