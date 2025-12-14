// lib/earnings-api.ts
// API service for earnings-related operations

import api from './axios'
import { toast } from 'sonner'

export interface DailyEarning {
  date: string
  deliveries: number
  basePay: number
  tips: number
  total: number
}

export interface EarningsSummary {
  total_earnings: number
  total_base_pay: number
  total_tips: number
  total_deliveries: number
  estimated_hours: number
  average_per_delivery: number
  hourly_rate: number
  deliveries_per_hour: number
  tip_percentage: number
}

export interface EarningsData {
  summary: EarningsSummary
  daily_earnings: DailyEarning[]
  period: string
}

/**
 * Get earnings for authenticated user
 */
export async function getEarnings(period: 'week' | 'month' | 'year' | 'all' = 'week'): Promise<EarningsData | null> {
  try {
    const response = await api.get('/earnings', {
      params: { period }
    })
    if (response.data?.success) {
      return response.data.data || null
    }
    return null
  } catch (error: any) {
    console.error('Error fetching earnings:', error)
    const errorMessage = error.response?.data?.message || 'Failed to fetch earnings'
    toast.error(errorMessage, { duration: 3000 })
    return null
  }
}

