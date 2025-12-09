"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Heart, ShoppingCart, Truck, Shield, Minus, Plus, X } from "lucide-react"
import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { ProductInfo } from "./product-info"
import { ProductDetails } from "./product-details"
import { ProductPrice } from "./product-price"
import { ProductReviews } from "./product-reviews"
import { RelatedProducts } from "./related-products"

interface Product {
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

interface ProductDetailsModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  relatedProducts?: Product[]
  onAddToCart?: (productId: number, quantity: number) => void
  onToggleFavorite?: (productId: number) => void
  favorites?: number[]
}

export function ProductDetailsModal({
  product,
  open,
  onOpenChange,
  relatedProducts = [],
  onAddToCart,
  onToggleFavorite,
  favorites = [],
}: ProductDetailsModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [imgSrc, setImgSrc] = useState("/placeholder.svg")

  useEffect(() => {
    if (product) {
      setImgSrc(product.image || "/placeholder.svg")
      setImgError(false)
    }
  }, [product])

  if (!product) return null

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    onToggleFavorite?.(product.id)
  }

  const handleAddToCart = () => {
    onAddToCart?.(product.id, quantity)
  }

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
      setImgSrc("/placeholder.svg")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Image */}
          <div className="relative bg-gray-50 lg:min-h-[600px]">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
            {product.badge && (
              <Badge className="absolute top-4 left-4 bg-[#0A5D31] text-white px-3 py-1 rounded-full text-xs font-bold">
                {product.badge}
              </Badge>
            )}
            {product.organic && (
              <Badge className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                Organic
              </Badge>
            )}
          </div>

          {/* Right: Content */}
          <div className="p-6 lg:p-8 flex flex-col relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <ProductInfo product={product} />
            <ProductPrice product={product} />
            
            <div className="my-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 w-fit">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 rounded-md hover:bg-white"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 rounded-md hover:bg-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 gap-2 h-12 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white rounded-lg font-semibold"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-lg border hover:bg-gray-50"
                  onClick={handleFavorite}
                >
                  <Heart className={`w-5 h-5 ${isFavorite || favorites.includes(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4 text-[#0A5D31]" />
                <span>Free delivery on orders over $50</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-[#0A5D31]" />
                <span>100% Satisfaction Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="px-6 lg:px-8 pb-6 border-t border-gray-200">
          <ProductDetails product={product} />
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="px-6 lg:px-8 pb-6 border-t border-gray-200">
            <RelatedProducts 
              products={relatedProducts} 
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        )}

        {/* Reviews */}
        <div className="px-6 lg:px-8 pb-6 border-t border-gray-200">
          <ProductReviews product={product} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

