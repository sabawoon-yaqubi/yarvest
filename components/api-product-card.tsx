"use client"

import { useState, useMemo, useEffect } from "react"
import { Star, Plus, Minus, Heart, Trash2 } from "lucide-react"
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
        onClick={handleCardClick}
        className={`group relative w-full bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col cursor-pointer border border-gray-100 ${className}`}
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
        {/* Product Image Container - Bigger and shows full image */}
        <div className="relative w-full h-[280px] overflow-hidden bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
          {isImageLoading && !imgError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-110 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 group-hover:from-black/0 group-hover:via-black/0 group-hover:to-black/5 transition-all duration-300 pointer-events-none" />

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute left-3 top-3 z-10">
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                -{discountPercentage}%
              </span>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={async (e) => {
              e.stopPropagation()
              if (isLoggedIn) {
                try {
                  const newFavoriteState = await toggleItem(product.id)
                  if (onToggleFavorite) {
                    onToggleFavorite(product.id)
                  }
                } catch (error) {
                  console.error('Error toggling favorite:', error)
                }
              } else {
                onToggleFavorite?.(product.id)
              }
            }}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-white/50 shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 z-10"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`h-5 w-5 transition-all duration-300 ${
                isFavorite 
                  ? "fill-red-500 text-red-500 scale-110" 
                  : "text-gray-600 hover:text-red-400"
              }`}
            />
          </button>

          {/* Stock Badge */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
              <span className="bg-gray-900/95 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-2xl">
                Out of Stock
              </span>
            </div>
          )}

          {/* Add to Cart Button */}
          {isInCart ? (
            <div 
              className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 px-2 py-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {cartQuantity === 1 ? (
                <button
                  onClick={handleRemoveFromCart}
                  className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-red-50 transition-all duration-200 hover:scale-105"
                  aria-label="Remove from cart"
                >
                  <Trash2 className="h-4.5 w-4.5 text-red-600" />
                </button>
              ) : (
                <button
                  onClick={handleDecreaseQuantity}
                  className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4.5 w-4.5 text-gray-700" />
                </button>
              )}
              <span className="text-base font-bold text-gray-900 min-w-[32px] text-center">
                {cartQuantity}
              </span>
              <button
                onClick={handleIncreaseQuantity}
                disabled={cartQuantity >= product.stock}
                className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-[#5a9c3a]/10 disabled:opacity-40 transition-all duration-200 hover:scale-105"
                aria-label="Increase quantity"
              >
                <Plus className="h-4.5 w-4.5 text-[#5a9c3a]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCartClick}
              disabled={!inStock}
              className={`absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] text-white shadow-2xl hover:shadow-[#5a9c3a]/50 hover:scale-110 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 z-10`}
              aria-label="Add to cart"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Product Details */}
        <div className="p-5 space-y-3 bg-white">
          {/* Product Name */}
          <div>
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#5a9c3a] transition-colors duration-300">
              {product.name}
            </h3>
            {product.unit?.name && (
              <p className="mt-2 text-xs text-gray-500 font-medium uppercase tracking-wide">
                {product.unit.name}
              </p>
            )}
          </div>

          {/* Price and Rating */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#5a9c3a]">${price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through font-semibold">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {/* Rating - Only show if there are reviews */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/50 shadow-sm">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold text-gray-900">{rating.toFixed(1)}</span>
                <span className="text-xs text-gray-600">({reviewCount})</span>
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

