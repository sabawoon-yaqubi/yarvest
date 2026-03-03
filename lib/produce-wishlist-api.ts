import api from './axios'

export type ProduceWishlistInquiryType = 'can_supply' | 'want' | 'question'

export interface ProduceWishlistOffer {
  id: number
  message: string | null
  price: number | null
  status: 'pending' | 'accepted' | 'rejected'
  provider: {
    id: number
    unique_id: string | null
    full_name: string
    image: string | null
  } | null
  created_at: string
}

export interface ProduceWishlistInquiry {
  id: number
  name: string
  email: string
  type?: ProduceWishlistInquiryType
  message: string
  status: string
  created_at: string
}

export interface ProduceWishlistItem {
  id: number
  item_name: string
  image: string | null
  quantity: string | null
  notes: string | null
  unit: string | null
  status: 'pending' | 'fulfilled'
  offers: ProduceWishlistOffer[]
  inquiries?: ProduceWishlistInquiry[]
  created_at: string
}

export interface ProduceWishlist {
  id: number
  name: string
  description: string | null
  image: string | null
  is_public: boolean
  items: ProduceWishlistItem[]
  created_at: string
  updated_at: string
}

export interface PublicProduceWishlist {
  id: number
  name: string
  description: string | null
  image: string | null
  items_count: number
  items: {
    id: number
    item_name: string
    image: string | null
    quantity: string | null
    notes: string | null
    unit: string | null
  }[]
  owner: {
    id: number
    unique_id: string | null
    full_name: string
    image: string | null
  }
  created_at: string
  updated_at: string
}

export interface PublicWishlistsResponse {
  success: boolean
  data: PublicProduceWishlist[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

/**
 * Get all produce wishlists for authenticated user
 */
export async function getProduceWishlists(): Promise<ProduceWishlist[]> {
  const response = await api.get<{ success: boolean; data: ProduceWishlist[] }>('/produce-wishlists')
  return response.data.data || []
}

/**
 * Get public produce wishlists (for sellers to browse)
 */
export async function getPublicProduceWishlists(page = 1): Promise<PublicWishlistsResponse> {
  const response = await api.get<PublicWishlistsResponse>('/produce-wishlists/public', {
    params: { page },
  })
  return response.data
}

/**
 * Get a single public produce wishlist by id (no auth required)
 */
export async function getPublicProduceWishlist(id: number): Promise<PublicProduceWishlist> {
  const response = await api.get<{ success: boolean; data: PublicProduceWishlist }>(
    `/produce-wishlists/public/${id}`
  )
  return response.data.data
}

/**
 * Create a new produce wishlist
 */
export async function createProduceWishlist(data: {
  name?: string
  description?: string
  image?: string
  is_public?: boolean
}): Promise<ProduceWishlist> {
  const response = await api.post<{ success: boolean; data: ProduceWishlist }>('/produce-wishlists', data)
  return response.data.data
}

/**
 * Get a single produce wishlist
 */
export async function getProduceWishlist(id: number): Promise<ProduceWishlist> {
  const response = await api.get<{ success: boolean; data: ProduceWishlist }>(`/produce-wishlists/${id}`)
  return response.data.data
}

/**
 * Update a produce wishlist
 */
export async function updateProduceWishlist(
  id: number,
  data: { name?: string; description?: string; image?: string; is_public?: boolean }
): Promise<ProduceWishlist> {
  const response = await api.put<{ success: boolean; data: ProduceWishlist }>(`/produce-wishlists/${id}`, data)
  return response.data.data
}

/**
 * Delete a produce wishlist
 */
export async function deleteProduceWishlist(id: number): Promise<void> {
  await api.delete(`/produce-wishlists/${id}`)
}

/**
 * Add item to produce wishlist
 */
export async function addProduceWishlistItem(
  wishlistId: number,
  data: { item_name: string; image?: string; quantity?: string; notes?: string; unit?: string }
): Promise<ProduceWishlistItem> {
  const response = await api.post<{ success: boolean; data: ProduceWishlistItem }>(
    `/produce-wishlists/${wishlistId}/items`,
    data
  )
  return response.data.data
}

/**
 * Remove item from produce wishlist
 */
export async function removeProduceWishlistItem(wishlistId: number, itemId: number): Promise<void> {
  await api.delete(`/produce-wishlists/${wishlistId}/items/${itemId}`)
}

/**
 * Create an offer for a wishlist item (sellers)
 */
export async function createProduceWishlistOffer(
  itemId: number,
  data: { message?: string; price?: number }
): Promise<{ id: number; message: string | null; price: number | null; status: string }> {
  const response = await api.post<{ success: boolean; data: any }>(
    `/produce-wishlist-items/${itemId}/offers`,
    data
  )
  return response.data.data
}

/**
 * Send inquiry for a wishlist item (public - no auth required)
 */
export async function sendProduceWishlistInquiry(
  itemId: number,
  data: { name: string; email: string; message: string; type?: ProduceWishlistInquiryType }
): Promise<void> {
  await api.post(`/produce-wishlist-items/${itemId}/inquiries`, data)
}

/**
 * Accept or reject an offer (wishlist owner)
 */
export async function respondToProduceWishlistOffer(
  offerId: number,
  status: 'accepted' | 'rejected'
): Promise<void> {
  await api.post(`/produce-wishlist-offers/${offerId}/respond`, { status })
}
