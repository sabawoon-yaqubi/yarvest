"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Sparkles, Star, Plus, Minus, Heart, Trash2 } from "lucide-react"
import { getImageUrl } from "@/lib/utils"
import { calculateProductPrices } from "@/lib/product-utils"
import { ApiProduct, ApiProductCardProps } from "@/types/product"
import { ProductModal } from "./product-modal"
import { useCartStore } from "@/stores/cart-store"
import { useCartHandler } from "@/hooks/use-cart-handler"
import { useWishlistStore } from "@/stores/wishlist-store"
import { useAuthStore } from "@/stores/auth-store"

// Re-export types for convenience
export type { ApiProduct, ApiProductCardProps } from "@/types/product"

export function ApiProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite: propIsFavorite = false,
  className = "",
}: ApiProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const { items, updateItemQuantity, removeItem } = useCartStore()
  const { handleAddToCart } = useCartHandler()
  const { isLoggedIn } = useAuthStore()
  const { toggleItem, isFavorite: isFavoriteInStore, fetchProductIds } = useWishlistStore()
  
  // Determine if favorite: use prop if provided, otherwise use store
  const isFavorite = propIsFavorite || (isLoggedIn ? isFavoriteInStore(product.id) : false)
  
  // Fetch wishlist product IDs on mount if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchProductIds()
    }
  }, [isLoggedIn, fetchProductIds])
  
  const { price, discountAmount, originalPrice, discountPercentage, hasDiscount } = calculateProductPrices(product)
  const imageUrl = getImageUrl(product.main_image, product.name)
  const inStock = product.stock > 0

  // Check if product is already in cart
  const cartItem = useMemo(() => {
    return items.find(item => item.product_id === product.id)
  }, [items, product.id])

  const cartQuantity = cartItem?.quantity || 0
  const isInCart = cartQuantity > 0

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
      if (onAddToCart) {
        onAddToCart(product, 1)
      } else {
        handleAddToCart(product, 1)
      }
    }
  }

  const handleIncreaseQuantity = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (cartItem && cartQuantity < product.stock) {
      try {
        await updateItemQuantity(cartItem.id, cartQuantity + 1)
      } catch (error) {
        console.error('Failed to update quantity:', error)
      }
    }
  }

  const handleDecreaseQuantity = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (cartItem && cartQuantity > 1) {
      try {
        await updateItemQuantity(cartItem.id, cartQuantity - 1)
      } catch (error) {
        console.error('Failed to update quantity:', error)
      }
    }
  }

  const handleRemoveFromCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (cartItem) {
      try {
        await removeItem(cartItem.id)
      } catch (error) {
        console.error('Failed to remove item:', error)
      }
    }
  }

  // Get dynamic review data from API
  const rating = product.reviews?.average_rating ?? 0
  const reviewCount = product.reviews?.total ?? 0

  return (
    <>
      <div
        className={`group relative w-full max-w-[200px] overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-md flex flex-col ${className}`}
      >
        {/* Product Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-emerald-50/60 to-green-50/60">
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
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/60 via-white to-green-100/60 animate-pulse" />
            )}
            <img
              src={imageUrl}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              loading="lazy"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>

          {/* Favorite Button */}
          <button
            onClick={async (e) => {
              e.stopPropagation()
              if (isLoggedIn) {
                try {
                  const newFavoriteState = await toggleItem(product.id)
                  // Call prop callback if provided
                  if (onToggleFavorite) {
                    onToggleFavorite(product.id)
                  }
                } catch (error) {
                  console.error('Error toggling favorite:', error)
                }
              } else {
                // If not logged in, just call the prop callback
                onToggleFavorite?.(product.id)
              }
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 z-10"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`h-3 w-3 transition-colors ${
                isFavorite 
                  ? "fill-red-500 text-red-500" 
                  : "text-gray-400 hover:text-red-400"
              }`}
            />
          </button>

          {/* Add to Cart Button */}
          {isInCart ? (
            <div className="absolute bottom-2 right-2 z-10 flex items-center gap-0.5 bg-white rounded-full shadow-md border border-[#0A5D31]/20">
              {cartQuantity === 1 ? (
                <button
                  onClick={handleRemoveFromCart}
                  className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-all duration-300 active:scale-95"
                  aria-label="Remove from cart"
                >
                  <Trash2 className="h-3 w-3 text-red-600" strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  onClick={handleDecreaseQuantity}
                  className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-green-50 transition-all duration-300 active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3 text-[#0A5D31]" strokeWidth={2.5} />
                </button>
              )}
              <span className="text-xs font-bold text-[#0A5D31] min-w-[18px] text-center">
                {cartQuantity}
              </span>
              <button
                onClick={handleIncreaseQuantity}
                disabled={cartQuantity >= product.stock}
                className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-green-50 disabled:opacity-50 transition-all duration-300 active:scale-95"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3 text-[#0A5D31]" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCartClick}
              disabled={!inStock}
              className={`absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#0A5D31] shadow-md transition-all duration-300 hover:scale-110 active:scale-95 ${
                inStock 
                  ? "text-white" 
                  : "bg-gray-400 cursor-not-allowed text-white"
              }`}
              aria-label="Add to cart"
            >
              <Plus className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Product Details */}
        <div className="px-3 py-2 min-w-0 w-full">
          {/* Product Name and Weight */}
          <div className="mb-1.5">
            <h3 
              onClick={handleCardClick}
              className="text-sm font-semibold leading-tight text-gray-900 cursor-pointer hover:text-[#0A5D31] transition-colors"
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
            {product.unit?.name && (
              <p className="mt-0.5 text-xs text-gray-500">
                {product.unit.name}
              </p>
            )}
          </div>

          {/* Price and Rating Section */}
          <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
            <div className="flex items-baseline gap-1 min-w-0 flex-1 overflow-hidden">
              <span className="text-lg font-bold text-red-600 truncate">${price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through flex-shrink-0 hidden sm:inline">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {/* Rating */}
            {reviewCount > 0 ? (
              <div className="flex items-center gap-0.5 flex-shrink-0 ml-auto">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">{rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500 whitespace-nowrap">({reviewCount})</span>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 flex-shrink-0 ml-auto">
                <Star className="h-2.5 w-2.5 text-gray-300 flex-shrink-0" />
                <span className="text-xs text-gray-400 whitespace-nowrap">No reviews</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={product}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAddToCart={onAddToCart || handleAddToCart}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite}
      />
    </>
  )
}

