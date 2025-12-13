// lib/product-api.ts
// Reusable API service for product-related operations

import api from './axios'
import { toast } from 'sonner'

export interface Unit {
  id: number
  name: string
  symbol?: string
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface ProductType {
  id: number
  name: string
  description?: string
}

export interface CreateProductPayload {
  name: string
  product_category_id: number
  product_type_id: number
  unite_id: number
  price: number
  discount: number
  stock: number
  sku: string
  status: boolean
  main_image: string
  excerpt: string
  details: string
}

export interface Product {
  id: number
  unique_id?: string
  name: string
  product_category_id: number
  product_type_id: number
  unite_id: number
  price: number
  discount: number
  stock: number
  sku: string
  status: boolean
  main_image: string
  excerpt: string
  details: string
}

// Transformed product interface for frontend display
export interface TransformedProduct {
  id: number
  name: string
  price: number | string
  unit: string
  code?: string
  image?: string
  producer?: string
  rating?: number
  reviews?: number
  badge?: string | null
  organic?: boolean
  category?: string
  category_id?: number
  stock?: number
  discount?: number
  originalPrice?: number
  [key: string]: any
}

// Product details interface for modal/detail view
export interface ProductDetails {
  id: number
  name: string
  price: number
  unit: string
  code: string
  image: string
  producer: string
  producerImage?: string
  rating: number
  reviews: number
  inStock: boolean
  badge?: string | null
  organic?: boolean
  description: string
  details?: {
    origin: string
    organic: boolean
    pesticide_free: boolean
    season: string
    harvested: string
  }
  nutritionFacts?: {
    calories: number
    protein: string
    carbs: string
    fiber: string
  }
  category?: string
}

/**
 * Fetch all units from the backend
 */
export async function fetchUnits(): Promise<Unit[]> {
  try {
    const response = await api.get('/units')
    // Handle different response structures
    if (response.data?.data) {
      return Array.isArray(response.data.data) ? response.data.data : []
    }
    return Array.isArray(response.data) ? response.data : []
  } catch (error: any) {
    console.error('Error fetching units:', error)
    toast.error('Failed to fetch units')
    return []
  }
}

/**
 * Fetch all categories from the backend
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await api.get('/categories')
    // Handle different response structures
    if (response.data?.data) {
      return Array.isArray(response.data.data) ? response.data.data : []
    }
    return Array.isArray(response.data) ? response.data : []
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    toast.error('Failed to fetch categories')
    return []
  }
}

/**
 * Fetch all product types from the backend
 * Handles pagination to fetch all product types
 */
export async function fetchProductTypes(): Promise<ProductType[]> {
  try {
    // Request a high per_page to get all items, or handle pagination
    const response = await api.get('/product-types', {
      params: {
        per_page: 100 // Request more items per page
      }
    })
    
    console.log('Product Types API Response:', response.data)
    
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      const productTypes = response.data.data
      console.log('Extracted product types:', productTypes)
      return productTypes
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    console.warn('Unexpected response structure:', response.data)
    return []
  } catch (error: any) {
    console.error('Error fetching product types:', error)
    console.error('Error details:', error.response?.data)
    toast.error('Failed to fetch product types')
    return []
  }
}

/**
 * Fetch all products from the backend
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await api.get('/products')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching products:', error)
    toast.error('Failed to fetch products')
    return []
  }
}


// fetch user products
export async function fetchUserProducts(): Promise<Product[]> {
  try {
    const response = await api.get('/products/my-products')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching user products:', error)
    toast.error('Failed to fetch user products')
    return []
  }
}


/**
 * Create a new product
 */
export async function createProduct(payload: CreateProductPayload): Promise<Product | null> {
  try {
    const response = await api.post('/products', payload)
    // Handle different response structures
    const product = response.data?.data || response.data
    toast.success('Product created successfully!')
    return product
  } catch (error: any) {
    console.error('Error creating product:', error)
    const errorMessage = error.response?.data?.message || 'Failed to create product'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Update an existing product using unique_id
 */
export async function updateProduct(uniqueId: string, payload: Partial<CreateProductPayload>): Promise<Product | null> {
  try {
    const response = await api.put(`/products/${uniqueId}`, payload)
    const product = response.data?.data || response.data
    toast.success('Product updated successfully!')
    return product
  } catch (error: any) {
    console.error('Error updating product:', error)
    const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update product'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Delete a product using unique_id
 */
export async function deleteProduct(uniqueId: string): Promise<void> {
  try {
    await api.delete(`/products/${uniqueId}`)
    toast.success('Product deleted successfully!')
  } catch (error: any) {
    console.error('Error deleting product:', error)
    const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete product'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Transform raw API product to component format
 * Handles various API response structures and normalizes the data
 */
export function transformProduct(product: any): TransformedProduct {
  // Get image - use main_image or first image from images array
  let productImage = product.main_image
  if (!productImage && product.images && Array.isArray(product.images) && product.images.length > 0) {
    productImage = product.images[0].image
  }
  
  // Get producer name from seller
  let producerName = "Unknown Producer"
  if (product.seller) {
    const firstName = product.seller.first_name || ""
    const lastName = product.seller.last_name || ""
    producerName = `${firstName} ${lastName}`.trim() || product.seller.email || "Unknown Producer"
  }
  
  // Get unit from product_type
  const unit = product.product_type?.name || "/unit"
  
  // Get category name
  const categoryName = product.category?.name || product.product_category?.name || ""
  
  // Calculate price with discount
  const basePrice = parseFloat(product.price || "0")
  const discount = parseFloat(product.discount || "0")
  const finalPrice = discount > 0 ? basePrice - discount : basePrice
  
  // Handle rating - can be a number or an object with average_rating
  let ratingValue = 0
  if (product.rating) {
    if (typeof product.rating === 'object' && product.rating.average_rating !== undefined) {
      ratingValue = parseFloat(product.rating.average_rating) || 0
    } else if (typeof product.rating === 'number') {
      ratingValue = product.rating
    }
  } else if (product.average_rating) {
    ratingValue = parseFloat(product.average_rating) || 0
  }
  
  // Handle reviews - can be a number or from rating object
  let reviewsValue = 0
  if (product.reviews_count !== undefined) {
    reviewsValue = parseInt(product.reviews_count) || 0
  } else if (product.reviews !== undefined) {
    reviewsValue = parseInt(product.reviews) || 0
  } else if (product.rating && typeof product.rating === 'object' && product.rating.total !== undefined) {
    reviewsValue = parseInt(product.rating.total) || 0
  }
  
  return {
    id: product.id,
    name: product.name || "Unnamed Product",
    price: finalPrice,
    unit: unit,
    code: product.sku || product.unique_id || "",
    image: productImage || null, // Return raw image path or null, let components handle with getImageUrl
    producer: producerName,
    rating: ratingValue,
    reviews: reviewsValue,
    badge: discount > 0 ? "On Sale" : null,
    organic: product.organic || product.is_organic || false,
    category: categoryName,
    category_id: product.product_category_id,
    stock: product.stock || 0,
    discount: discount,
    originalPrice: basePrice,
  }
}

/**
 * Transform product details for modal/detail view
 * Returns null if product is invalid
 */
export function transformProductDetails(product: any): ProductDetails | null {
  if (!product) return null
  
  let productImage = product.main_image
  if (!productImage && product.images && Array.isArray(product.images) && product.images.length > 0) {
    productImage = product.images[0].image
  }
  
  let producerName = "Unknown Producer"
  let producerImage = ""
  if (product.seller) {
    const firstName = product.seller.first_name || ""
    const lastName = product.seller.last_name || ""
    producerName = `${firstName} ${lastName}`.trim() || product.seller.email || "Unknown Producer"
    producerImage = product.seller.profile_image || ""
  }
  
  const unit = product.product_type?.name || "per unit"
  const basePrice = parseFloat(product.price || "0")
  const discount = parseFloat(product.discount || "0")
  const finalPrice = discount > 0 ? basePrice - discount : basePrice
  
  // Handle rating - can be a number or an object with average_rating
  let ratingValue = 0
  if (product.rating) {
    if (typeof product.rating === 'object' && product.rating.average_rating !== undefined) {
      ratingValue = parseFloat(product.rating.average_rating) || 0
    } else if (typeof product.rating === 'number') {
      ratingValue = product.rating
    }
  } else if (product.average_rating) {
    ratingValue = parseFloat(product.average_rating) || 0
  }
  
  // Handle reviews - can be a number or from rating object
  let reviewsValue = 0
  if (product.reviews_count !== undefined) {
    reviewsValue = parseInt(product.reviews_count) || 0
  } else if (product.reviews !== undefined) {
    reviewsValue = parseInt(product.reviews) || 0
  } else if (product.rating && typeof product.rating === 'object' && product.rating.total !== undefined) {
    reviewsValue = parseInt(product.rating.total) || 0
  }
  
  return {
    id: product.id,
    name: product.name || "Unnamed Product",
    price: finalPrice,
    unit: unit,
    code: product.sku || product.unique_id || "",
    image: productImage || "", // Return raw image path or empty string, let components handle with getImageUrl
    producer: producerName,
    producerImage: producerImage || undefined, // Return raw image path or undefined
    rating: ratingValue,
    reviews: reviewsValue,
    inStock: (product.stock || 0) > 0,
    badge: discount > 0 ? "On Sale" : null,
    organic: product.organic || product.is_organic || false,
    description: product.details || product.excerpt || "No description available",
    details: {
      origin: product.origin || "Unknown",
      organic: product.organic || product.is_organic || false,
      pesticide_free: product.organic || product.is_organic || false,
      season: product.season || "Year-round",
      harvested: product.harvested || "Regular",
    },
    nutritionFacts: product.nutrition_facts || {
      calories: 0,
      protein: "0g",
      carbs: "0g",
      fiber: "0g",
    },
    category: product.category?.name || product.product_category?.name || "",
  }
}

/**
 * Transform array of products
 */
export function transformProducts(products: any[]): TransformedProduct[] {
  return products.map(transformProduct)
}

