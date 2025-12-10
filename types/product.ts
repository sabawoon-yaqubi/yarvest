/**
 * Product-related TypeScript interfaces
 * Reusable across the application
 */

// Seller/Producer interface
export interface Seller {
  id: number
  unique_id: string
  full_name: string
  image: string | null
}

// Product Category interface
export interface ProductCategory {
  id: number
  unique_id: string
  name: string
}

// Product Type interface
export interface ProductType {
  id: number
  unique_id: string
  name: string
}

// Main API Product interface
export interface ApiProduct {
  id: number
  unique_id: string
  name: string
  price: string
  discount: string
  main_image: string | null
  excerpt: string | null
  details: string | null
  seller: Seller
  product_category: ProductCategory
  product_type: ProductType
  status: number | boolean
  sku: string
  stock: number
  created_at: string
  updated_at: string
}

// Product Price Calculation Result
export interface ProductPriceInfo {
  price: number
  discountAmount: number
  originalPrice: number
  discountPercentage: number
  hasDiscount: boolean
}

// Product Modal Props
export interface ProductModalProps {
  product: ApiProduct | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToCart?: (product: ApiProduct, quantity: number) => void
  onToggleFavorite?: (productId: number) => void
  isFavorite?: boolean
}

// Product Card Props
export interface ApiProductCardProps {
  product: ApiProduct
  onAddToCart?: (product: ApiProduct, quantity: number) => void
  onToggleFavorite?: (productId: number) => void
  isFavorite?: boolean
  className?: string
}

