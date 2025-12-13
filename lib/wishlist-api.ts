import api from './axios'

export interface WishlistProduct {
  id: number
  product_id: number
  product_unique_id: string
  name: string
  price: string
  original_price: string
  discount: string
  main_image: string
  excerpt?: string
  details?: string
  sku?: string
  stock: number
  seller: {
    id: number
    unique_id: string
    full_name: string
    image?: string
  }
  product_category?: {
    id: number
    unique_id: string
    name: string
  } | null
  product_type?: {
    id: number
    unique_id: string
    name: string
  } | null
  unit?: {
    id: number
    unique_id: string
    name: string
  } | null
  reviews: {
    total: number
    average_rating: number
  }
  created_at: string
  updated_at: string
}

export interface WishlistResponse {
  success: boolean
  message: string
  data: WishlistProduct[]
  count: number
}

export interface WishlistToggleResponse {
  success: boolean
  message: string
  data: {
    id?: number
    product_id: number
    is_favorite: boolean
  }
}

export interface WishlistCheckResponse {
  success: boolean
  data: {
    product_id: number
    is_favorite: boolean
  }
}

/**
 * Get all wishlist items
 */
export async function getWishlistItems(): Promise<WishlistProduct[]> {
  const response = await api.get<WishlistResponse>('/wishlist')
  return response.data.data || []
}

/**
 * Get wishlist product IDs
 */
export async function getWishlistProductIds(): Promise<number[]> {
  const response = await api.get<{ success: boolean; data: number[] }>('/wishlist/product-ids')
  return response.data.data || []
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId: number): Promise<{ id: number; product_id: number }> {
  const response = await api.post<{ success: boolean; data: { id: number; product_id: number } }>('/wishlist', {
    product_id: productId,
  })
  return response.data.data
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(productId: number): Promise<void> {
  await api.delete(`/wishlist/${productId}`)
}

/**
 * Toggle wishlist item (add if not exists, remove if exists)
 */
export async function toggleWishlist(productId: number): Promise<{ is_favorite: boolean }> {
  const response = await api.post<WishlistToggleResponse>('/wishlist/toggle', {
    product_id: productId,
  })
  return { is_favorite: response.data.data.is_favorite }
}

/**
 * Check if product is in wishlist
 */
export async function checkWishlist(productId: number): Promise<boolean> {
  try {
    const response = await api.get<WishlistCheckResponse>(`/wishlist/check/${productId}`)
    return response.data.data.is_favorite
  } catch (error) {
    console.error('Error checking wishlist:', error)
    return false
  }
}

