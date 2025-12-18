"use client"

import { useState, useMemo, useEffect } from "react"
import { Star, Plus, Minus, Heart, Trash2, Ban } from "lucide-react"
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
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { items, updateItemQuantity, removeItem } = useCartStore()
  const { handleAddToCart } = useCartHandler()
  const { isLoggedIn, user } = useAuthStore()
  const { toggleItem, isFavorite: isFavoriteInStore, fetchProductIds } = useWishlistStore()
  
  // Determine if favorite: use prop if provided, otherwise use store
  const isFavorite = propIsFavorite || (isLoggedIn ? isFavoriteInStore(product.id) : false)
  
  // Check if this is the seller's own product
  const isOwnProduct = Boolean(
    isLoggedIn && 
    user && 
    product.seller && 
    product.seller.id && 
    user.id && 
    String(product.seller.id) === String(user.id)
  )
  
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

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    // Prevent sellers from adding their own products to cart
    if (isOwnProduct || !inStock || isAddingToCart || isInCart) return
    
    setIsAddingToCart(true)
    try {
      if (onAddToCart) {
        // onAddToCart is synchronous, call it immediately for instant feedback
        onAddToCart(product, 1)
        // Reset loading state after a short delay for visual feedback
        setTimeout(() => setIsAddingToCart(false), 200)
      } else {
        await handleAddToCart(product, 1)
        setIsAddingToCart(false)
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      setIsAddingToCart(false)
    }
  }

  const handleIncreaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (cartItem && cartQuantity < product.stock) {
      // Fire and forget - cart store handles optimistic updates
      // Don't await to prevent blocking rapid clicks
      updateItemQuantity(cartItem.id, cartQuantity + 1).catch(error => {
        console.error('Failed to update quantity:', error)
      })
    }
  }

  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (cartItem && cartQuantity > 1) {
      // Fire and forget - cart store handles optimistic updates
      // Don't await to prevent blocking rapid clicks
      updateItemQuantity(cartItem.id, cartQuantity - 1).catch(error => {
        console.error('Failed to update quantity:', error)
      })
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
        className={`group relative w-full bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-[#5a9c3a]/5 flex flex-col cursor-pointer border border-gray-100 hover:border-[#5a9c3a]/20 ${className}`}
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
        {/* Product Image Container - Full and nicely displayed */}
        <div className="relative w-full h-[240px] overflow-hidden bg-gray-50">
          {isImageLoading && !imgError && (
            <div className="absolute inset-0 bg-white  animate-pulse" />
          )}
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute left-3 top-3 z-10">
              <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-md">
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
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 border border-gray-200 shadow-md hover:bg-white hover:scale-105 transition-all duration-200 z-10"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${
                isFavorite 
                  ? "fill-red-500 text-red-500" 
                  : "text-gray-400 hover:text-red-500"
              }`}
            />
          </button>

          {/* Stock Badge */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
              <span className="bg-gray-900/95 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-2xl">
                Out of Stock
              </span>
            </div>
          )}

          {/* Add to Cart Button */}
          {isInCart && !isOwnProduct ? (
            <div 
              className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-2 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              {cartQuantity === 1 ? (
                <button
                  onClick={handleRemoveFromCart}
                  className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-all duration-200"
                  aria-label="Remove from cart"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                </button>
              ) : (
                <button
                  onClick={handleDecreaseQuantity}
                  className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#5a9c3a]/10 transition-all duration-200"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5 text-[#5a9c3a]" />
                </button>
              )}
              <span className="text-sm font-bold text-gray-900 min-w-[24px] text-center">
                {cartQuantity}
              </span>
              <button
                onClick={handleIncreaseQuantity}
                disabled={cartQuantity >= product.stock}
                className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-[#5a9c3a]/10 disabled:opacity-40 transition-all duration-200"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5 text-[#5a9c3a]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCartClick}
              disabled={!inStock || isAddingToCart || isOwnProduct}
              className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 z-10 ${
                isOwnProduct 
                  ? 'bg-gray-100 border border-gray-300 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] text-white shadow-md hover:shadow-lg hover:scale-105'
              } ${isAddingToCart ? 'opacity-75' : ''} disabled:cursor-not-allowed disabled:hover:scale-100`}
              aria-label={isOwnProduct ? "Your product" : "Add to cart"}
              title={isOwnProduct ? "This is your product" : undefined}
            >
              {isAddingToCart ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isOwnProduct ? (
                <Ban className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
              ) : (
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              )}
            </button>
          )}
          
          {/* Own Product Badge */}
          {isOwnProduct && (
            <div className="absolute top-3 left-3 z-10 bg-blue-500/95 backdrop-blur-sm text-white px-2 py-1 rounded-lg shadow-lg border border-blue-400 text-xs font-semibold">
              Your Product
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 bg-white">
          {/* Product Name */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-[#5a9c3a] transition-colors">
            {product.name}
          </h3>

          {/* Rating - Above Price */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-700">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#5a9c3a]">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
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

