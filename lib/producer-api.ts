// lib/producer-api.ts
// Reusable API service for producer/store-related operations

import api from './axios'
import { toast } from 'sonner'
import { getImageUrl } from './utils'

export interface Producer {
  id: number
  unique_id?: string
  name: string
  location?: string
  full_address?: string
  specialty?: string
  description?: string
  image?: string
  rating?: number
  verified?: boolean
  products?: number
  years_in_business?: number
  email?: string
  phone?: string
  website?: string
  certifications?: string[]
  activities?: string[]
  delivery_areas?: string[]
  established?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

// Transformed producer interface for frontend display
export interface TransformedProducer {
  id: number
  name: string
  location: string
  fullAddress?: string
  specialty: string
  description: string
  image: string
  rating: number
  verified: boolean
  products: number
  yearsInBusiness: number
  email?: string
  phone?: string
  website?: string
  certifications: string[]
  activities: string[]
  deliveryAreas: string[]
  established: string
  totalReviews?: number
  [key: string]: any
}

/**
 * Fetch all producers/stores from the backend
 */
export async function fetchProducers(): Promise<Producer[]> {
  try {
    const response = await api.get('/stores')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching producers:', error)
    toast.error('Failed to fetch producers')
    return []
  }
}

/**
 * Fetch top sellers (producers with most products)
 */
export async function fetchTopSellers(): Promise<Producer[]> {
  try {
    const response = await api.get('/stores/top-sellers')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching top sellers:', error)
    toast.error('Failed to fetch top sellers')
    return []
  }
}

/**
 * Fetch certified organic producers
 */
export async function fetchCertifiedOrganic(): Promise<Producer[]> {
  try {
    const response = await api.get('/stores/certified-organic')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching certified organic producers:', error)
    toast.error('Failed to fetch certified organic producers')
    return []
  }
}

/**
 * Fetch most reviewed producers
 */
export async function fetchMostReviewed(): Promise<Producer[]> {
  try {
    const response = await api.get('/stores/most-reviewed')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching most reviewed producers:', error)
    toast.error('Failed to fetch most reviewed producers')
    return []
  }
}

/**
 * Fetch new producers (recently joined)
 */
export async function fetchNewThisSeason(): Promise<Producer[]> {
  try {
    const response = await api.get('/stores/new-this-season')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching new producers:', error)
    toast.error('Failed to fetch new producers')
    return []
  }
}

/**
 * Fetch a single producer by ID
 */
export async function fetchProducerById(id: number | string): Promise<Producer | null> {
  try {
    const response = await api.get(`/stores/${id}`)
    // Handle different response structures
    if (response.data?.data) {
      return response.data.data
    }
    if (response.data) {
      return response.data
    }
    return null
  } catch (error: any) {
    console.error('Error fetching producer:', error)
    toast.error('Failed to fetch producer details')
    return null
  }
}

/**
 * Fetch products for a specific producer
 */
export async function fetchProducerProducts(producerId: number | string): Promise<any[]> {
  try {
    const response = await api.get(`/stores/${producerId}/products`)
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    if (response.data?.products && Array.isArray(response.data.products)) {
      return response.data.products
    }
    return []
  } catch (error: any) {
    console.error('Error fetching producer products:', error)
    toast.error('Failed to fetch producer products')
    return []
  }
}

/**
 * Transform raw API producer to component format
 * Handles various API response structures and normalizes the data
 */
export function transformProducer(producer: any): TransformedProducer {
  // Get image
  const producerImage = producer.image || producer.profile_image || producer.main_image || ""
  
  // Get location - handle both string and object formats
  let location = "Unknown Location"
  if (producer.location) {
    if (typeof producer.location === 'string') {
      location = producer.location
    } else if (typeof producer.location === 'object') {
      // Handle location object with city, state, country, full_location
      location = producer.location.full_location || 
                 producer.location.fullLocation ||
                 [producer.location.city, producer.location.state, producer.location.country]
                   .filter(Boolean)
                   .join(', ') ||
                 producer.location.city ||
                 producer.location.state ||
                 "Unknown Location"
    }
  } else if (producer.city || producer.address) {
    location = producer.city || producer.address || "Unknown Location"
  }
  
  // Get specialty
  const specialty = producer.specialty || producer.category || producer.type || "General"
  
  // Get description
  const description = producer.description || producer.bio || producer.about || ""
  
  // Handle rating - can be a number or an object
  let ratingValue = 0
  if (producer.rating) {
    if (typeof producer.rating === 'object' && producer.rating.average !== undefined) {
      ratingValue = parseFloat(producer.rating.average) || 0
    } else if (typeof producer.rating === 'number') {
      ratingValue = producer.rating
    }
  } else if (producer.average_rating) {
    ratingValue = parseFloat(producer.average_rating) || 0
  }
  
  // Calculate years in business
  let yearsInBusiness = 0
  if (producer.years_in_business !== undefined) {
    yearsInBusiness = parseInt(producer.years_in_business) || 0
  } else if (producer.established) {
    const establishedYear = parseInt(producer.established)
    if (!isNaN(establishedYear)) {
      const currentYear = new Date().getFullYear()
      yearsInBusiness = currentYear - establishedYear
    }
  } else if (producer.created_at) {
    const createdYear = new Date(producer.created_at).getFullYear()
    const currentYear = new Date().getFullYear()
    yearsInBusiness = currentYear - createdYear
  }
  
  // Handle certifications - can be array of strings, array of objects, or comma-separated string
  let certifications: string[] = []
  if (Array.isArray(producer.certifications)) {
    certifications = producer.certifications.map((cert: any) => {
      // Handle both string and object formats
      if (typeof cert === 'string') {
        return cert
      } else if (typeof cert === 'object' && cert !== null) {
        return cert.name || cert.title || cert.id || String(cert)
      }
      return String(cert)
    }).filter(Boolean)
  } else if (typeof producer.certifications === 'string') {
    certifications = producer.certifications.split(',').map(c => c.trim()).filter(Boolean)
  }
  
  // Handle activities - can be array or comma-separated string
  let activities: string[] = []
  if (Array.isArray(producer.activities)) {
    activities = producer.activities
  } else if (typeof producer.activities === 'string') {
    activities = producer.activities.split(',').map(a => a.trim()).filter(Boolean)
  }
  
  // Handle delivery areas - can be array or comma-separated string
  let deliveryAreas: string[] = []
  if (Array.isArray(producer.delivery_areas)) {
    deliveryAreas = producer.delivery_areas
  } else if (typeof producer.delivery_areas === 'string') {
    deliveryAreas = producer.delivery_areas.split(',').map(a => a.trim()).filter(Boolean)
  } else if (Array.isArray(producer.deliveryAreas)) {
    deliveryAreas = producer.deliveryAreas
  }
  
  return {
    id: producer.id,
    name: producer.name || producer.business_name || producer.store_name || "Unknown Producer",
    location: location,
    fullAddress: producer.full_address || producer.fullAddress || producer.address || "",
    specialty: specialty,
    description: description,
    image: getImageUrl(producerImage),
    rating: ratingValue,
    verified: producer.verified || producer.is_verified || false,
    products: parseInt(producer.products || producer.products_count || producer.total_products || "0") || 0,
    yearsInBusiness: yearsInBusiness,
    email: producer.email || "",
    phone: producer.phone || producer.phone_number || "",
    website: producer.website || producer.website_url || "",
    certifications: certifications,
    activities: activities,
    deliveryAreas: deliveryAreas,
    established: producer.established || producer.founded || "",
    totalReviews: producer.total_reviews || producer.reviews_count || producer.reviews || 0,
  }
}

/**
 * Transform array of producers
 */
export function transformProducers(producers: any[]): TransformedProducer[] {
  return producers.map(transformProducer)
}
