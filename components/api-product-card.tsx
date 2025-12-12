"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Sparkles, Star } from "lucide-react"
import { getImageUrl } from "@/lib/utils"
import { calculateProductPrices } from "@/lib/product-utils"
import { ApiProduct, ApiProductCardProps } from "@/types/product"
import { ProductModal } from "./product-modal"

// Re-export types for convenience
export type { ApiProduct, ApiProductCardProps } from "@/types/product"

export function ApiProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  className = "",
}: ApiProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  
  const { price, discountAmount, originalPrice, discountPercentage, hasDiscount } = calculateProductPrices(product)
  const imageUrl = getImageUrl(product.main_image, product.name)
  const inStock = product.stock > 0

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
      setIsImageLoading(false)
    }
  }

  const handleImageLoad = () => {
    setIsImageLoading(false)
  }

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inStock) {
      onAddToCart?.(product, 1)
    }
  }

  return (
    <>
      <Card
        className={`overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col bg-white shadow-sm rounded-2xl relative group ${className}`}
      >
        {/* Product Image */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 h-52">
          <div
            onClick={handleCardClick}
            className="cursor-pointer h-full w-full relative"
            role="button"
            tabIndex={0}
            aria-label={`View ${product.name} details`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleCardClick()
              }
            }}
          >
            {isImageLoading && !imgError && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            )}
            <img
              src={imageUrl}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              loading="lazy"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>
          
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {discountPercentage}% OFF
            </div>
          )}

          {/* Stock Badge */}
          {!inStock && (
            <div className="absolute top-3 left-3 z-10 bg-gray-500/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5 flex flex-col flex-1 bg-white">
          {/* Seller Name */}
          <p className="text-xs font-semibold text-[#0A5D31] mb-2 uppercase tracking-wider">
            {product.seller.full_name}
          </p>

          {/* Product Name */}
          <h3 
            onClick={handleCardClick}
            className="font-bold text-gray-900 mb-3 hover:text-[#0A5D31] cursor-pointer leading-tight line-clamp-2 text-base transition-colors min-h-[3rem]"
            role="button"
            tabIndex={0}
            aria-label={`View ${product.name} details`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleCardClick()
              }
            }}
          >
            {product.name}
          </h3>

          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-[#0A5D31]/10 text-[#0A5D31] text-xs font-medium rounded-md">
              {product.product_category.name}
            </span>
          </div>

          {/* Reviews/Rating */}
          {product.reviews && product.reviews.total > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => {
                  const rating = product.reviews!.average_rating
                  const filled = i < Math.floor(rating)
                  const halfFilled = i === Math.floor(rating) && rating % 1 >= 0.5
                  
                  return (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        filled
                          ? "fill-yellow-400 text-yellow-400"
                          : halfFilled
                          ? "fill-yellow-400/50 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  )
                })}
              </div>
              <span className="text-xs text-gray-600 font-medium">
                {product.reviews.average_rating.toFixed(1)} ({product.reviews.total} {product.reviews.total === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="mb-4 space-y-1.5">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-3xl text-[#0A5D31]">${price.toFixed(2)}</span>
              </div>
              {hasDiscount && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500 line-through font-medium">${originalPrice.toFixed(2)}</span>
                  <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
                    Save ${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Add to Cart Button */}
            <Button 
              onClick={handleAddToCartClick}
              disabled={!inStock}
              className={`w-full gap-2 text-white rounded-xl font-semibold transition-all h-11 shadow-md hover:shadow-xl ${
                inStock 
                  ? "bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#0A5D31]" 
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Product Modal */}
      <ProductModal
        product={product}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAddToCart={onAddToCart}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite}
      />
    </>
  )
}

