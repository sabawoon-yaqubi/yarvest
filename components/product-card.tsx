"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Star } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { getImageUrl } from "@/lib/utils"

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
}: ProductCardProps) {
  const priceDisplay = typeof price === "number" ? price.toFixed(2) : price
  const [imgError, setImgError] = useState(false)
  const imageUrl = getImageUrl(image, name)

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
          <div className="absolute top-3 left-3 bg-[#0A5D31] text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
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
        <p className="text-xs font-bold text-[#0A5D31] mb-1 uppercase tracking-wider">{producer}</p>
        <h3 
          className="font-bold text-foreground mb-2 hover:text-[#0A5D31] cursor-pointer leading-snug line-clamp-2 text-sm"
          onClick={() => onClick?.(id)}
        >
          {name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2 font-mono">SKU: {code}</p>

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
              <span className="font-bold text-xl text-[#0A5D31]">${priceDisplay}</span>
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
          </div>
          <Button 
            className="w-full gap-2 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white rounded-xl font-semibold transition-all h-10"
            onClick={() => onAddToCart?.(id)}
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  )
}

