"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Star, Plus, Minus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useMemo } from "react"
import { getImageUrl } from "@/lib/utils"
import { useCartStore } from "@/stores/cart-store"
import { useCartHandler } from "@/hooks/use-cart-handler"

interface ProductCardProps {
  id: number
  name: string
  price: string | number
  unit: string
  code: string
  image: string | null
  producer: string
  rating: number
  reviews: number
  badge?: string | null
  organic?: boolean
  isFavorite?: boolean
  onToggleFavorite?: (id: number) => void
  onAddToCart?: (id: number) => void
  onClick?: (id: number) => void
  className?: string
  stock?: number // Add stock prop for quantity controls
}

export function ProductCard({
  id,
  name,
  price,
  unit,
  code,
  image,
  producer,
  rating,
  reviews,
  badge,
  organic,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  onClick,
  className = "",
  stock = 999, // Default to high stock if not provided
}: ProductCardProps) {
  const priceDisplay = typeof price === "number" ? price.toFixed(2) : price
  const [imgError, setImgError] = useState(false)
  const imageUrl = getImageUrl(image, name)
  const { items, addItem, updateItemQuantity, removeItem } = useCartStore()
  const { handleAddToCart } = useCartHandler()

  // Check if product is already in cart
  const cartItem = useMemo(() => {
    return items.find(item => item.product_id === id)
  }, [items, id])

  const cartQuantity = cartItem?.quantity || 0
  const isInCart = cartQuantity > 0
  const inStock = stock > 0
  const isQuantityOne = cartQuantity === 1

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
    }
  }

  return (
    <Card
      className={`overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col bg-card shadow-sm rounded-2xl ${className}`}
    >
      {/* Product Image */}
            <div className="relative group overflow-hidden bg-secondary h-52">
              <div className="cursor-pointer" onClick={() => onClick?.(id)}>
                
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
        {badge && (
          <div className="absolute top-3 left-3 bg-[#5a9c3a] text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
            {badge}
          </div>
        )}
        {organic && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
            Organic
          </div>
        )}
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white hover:bg-gray-100 shadow-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onToggleFavorite(id)}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </Button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-bold text-[#5a9c3a] mb-1 uppercase tracking-wider">{producer}</p>
        <h3 
          className="font-bold text-foreground mb-2 hover:text-[#5a9c3a] cursor-pointer leading-snug line-clamp-2 text-sm"
          onClick={() => onClick?.(id)}
        >
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {rating} ({reviews})
          </span>
        </div>

        {/* Price and Action */}
        <div className="mt-auto pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-xl text-[#5a9c3a]">${priceDisplay}</span>
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
          </div>
          {isInCart ? (
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  if (cartItem) {
                    if (isQuantityOne) {
                      // Remove item completely when quantity is 1
                      // Fire and forget - cart store handles updates
                      removeItem(cartItem.id).catch(error => {
                        console.error('Failed to remove item:', error)
                      })
                    } else {
                      // Decrease quantity - Fire and forget for instant feedback
                      updateItemQuantity(cartItem.id, cartQuantity - 1).catch(error => {
                        console.error('Failed to update quantity:', error)
                      })
                    }
                  }
                }}
                className="h-7 w-7 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors p-0"
              >
                {isQuantityOne ? (
                  <Trash2 className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
              </Button>
              <span className="flex-1 text-center font-semibold text-base text-gray-900 min-w-[2rem]">
                {cartQuantity}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  if (cartItem && cartQuantity < stock) {
                    // Fire and forget - cart store handles optimistic updates
                    // Don't await to prevent blocking rapid clicks
                    updateItemQuantity(cartItem.id, cartQuantity + 1).catch(error => {
                      console.error('Failed to update quantity:', error)
                    })
                  }
                }}
                disabled={cartQuantity >= stock}
                className="h-7 w-7 rounded-md hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current p-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full gap-2 bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white rounded-xl font-semibold transition-all h-10"
              onClick={async (e) => {
                e.stopPropagation()
                if (onAddToCart) {
                  onAddToCart(id)
                } else {
                  // If no callback provided, use cart handler
                  // We need to fetch product details first or use the id directly
                  try {
                    await addItem(id, 1)
                  } catch (error) {
                    console.error('Failed to add to cart:', error)
                  }
                }
              }}
              disabled={!inStock}
            >
              <ShoppingCart className="w-4 h-4" />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

