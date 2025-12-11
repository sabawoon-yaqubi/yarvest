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

