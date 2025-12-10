/**
 * Product utility functions
 * Reusable across the application
 */

import { ApiProduct, ProductPriceInfo } from "@/types/product"

/**
 * Calculate product prices and discount information
 * @param product - The product object
 * @returns Calculated price information
 */
export function calculateProductPrices(product: ApiProduct): ProductPriceInfo {
  const price = parseFloat(product.price)
  const discountAmount = parseFloat(product.discount)
  const originalPrice = price + discountAmount
  const discountPercentage = Math.round((discountAmount / originalPrice) * 100)
  const hasDiscount = discountAmount > 0
  
  return {
    price,
    discountAmount,
    originalPrice,
    discountPercentage,
    hasDiscount,
  }
}

