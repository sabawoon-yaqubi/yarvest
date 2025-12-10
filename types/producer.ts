/**
 * Producer/Store-related TypeScript interfaces
 * Reusable across the application
 */

// API Producer interface
export interface ApiProducer {
  id: number
  unique_id?: string
  name: string
  location?: string | Location | null
  specialty: string
  image: string | null
  rating: number
  verified: boolean
  products: number
  created_at?: string
  updated_at?: string
}

// Location interface for shops/producers
export interface Location {
  city?: string
  state?: string
  country?: string
  full_location?: string
}

// API Shop/Store interface
export interface ApiShop {
  id: number
  unique_id?: string
  name: string
  location?: string | Location | null
  specialty: string
  image: string | null
  rating: number
  verified?: boolean
  products: number
  distance?: string
  badge?: string
  created_at?: string
  updated_at?: string
}

