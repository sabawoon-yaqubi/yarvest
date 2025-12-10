"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Truck, Shield, Minus, Plus, X, Package, User, Tag } from "lucide-react"
import { useState, useEffect } from "react"
import { getImageUrl } from "@/lib/utils"
import { calculateProductPrices } from "@/lib/product-utils"
import { ApiProduct, ProductModalProps } from "@/types/product"

// Re-export types for convenience
export type { ApiProduct, ProductModalProps } from "@/types/product"

export function ProductModal({
  product,
  open,
  onOpenChange,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [imgError, setImgError] = useState(false)
  const [imgSrc, setImgSrc] = useState("/placeholder.svg")

  useEffect(() => {
    if (product) {
      const imageUrl = getImageUrl(product.main_image)
      setImgSrc(imageUrl)
      setImgError(false)
      setQuantity(1)
    }
  }, [product])

  if (!product) return null

  const { price, discountAmount, originalPrice, discountPercentage, hasDiscount } = calculateProductPrices(product)
  const inStock = product.stock > 0

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
      setImgSrc("/placeholder.svg")
    }
  }

  const handleAddToCart = () => {
    onAddToCart?.(product, quantity)
  }

  const handleFavorite = () => {
    onToggleFavorite?.(product.id)
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
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                {discountPercentage}% OFF
              </Badge>
            )}
            {!inStock && (
              <Badge className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Right: Content */}
          <div className="p-6 lg:p-8 flex flex-col relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-100 z-10"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[#0A5D31] mb-1 uppercase tracking-wider">
                  {product.seller.full_name}
                </p>
                <h2 className="text-3xl font-bold text-foreground mb-2">{product.name}</h2>
                <p className="text-sm text-muted-foreground font-mono">SKU: {product.sku}</p>
              </div>

              {/* Category & Type */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {product.product_category.name}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Package className="w-3 h-3 mr-1" />
                  {product.product_type.name}
                </Badge>
              </div>

              {/* Price */}
              <div className="py-4 border-y border-gray-200">
                <div className="flex items-baseline gap-3 flex-wrap">
                  {hasDiscount ? (
                    <>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-3xl text-[#0A5D31]">${price.toFixed(2)}</span>
                          <Badge className="bg-red-500 text-white text-xs font-bold">
                            {discountPercentage}% OFF
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg text-muted-foreground line-through">
                            ${originalPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-red-600 font-semibold">
                            Save ${discountAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="font-bold text-3xl text-[#0A5D31]">${price.toFixed(2)}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Stock: {product.stock} available
                </p>
              </div>

              {/* Description */}
              {product.excerpt && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{product.excerpt}</p>
                </div>
              )}

              {product.details && (
                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <p className="text-sm text-muted-foreground">{product.details}</p>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 w-fit">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 rounded-md hover:bg-white"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="h-8 w-8 rounded-md hover:bg-white"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 gap-2 h-12 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white rounded-lg font-semibold"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                {onToggleFavorite && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-lg border hover:bg-gray-50"
                    onClick={handleFavorite}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                      }`}
                    />
                  </Button>
                )}
              </div>

              {/* Seller Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A5D31]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#0A5D31]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Seller</p>
                    <p className="text-xs text-muted-foreground">{product.seller.full_name}</p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

