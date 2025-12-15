"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Truck, Shield, Minus, Plus, X, Package, User, Tag, Star, CheckCircle, Trash2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { getImageUrl } from "@/lib/utils"
import { calculateProductPrices } from "@/lib/product-utils"
import { ApiProduct, ProductModalProps } from "@/types/product"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { ApiProductCard } from "@/components/api-product-card"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import api from "@/lib/axios"
import { useCartStore } from "@/stores/cart-store"

// Re-export types for convenience
export type { ApiProduct, ProductModalProps } from "@/types/product"

interface Review {
  id: number
  stars: number
  message: string | null
  buyer: {
    id: number
    full_name: string
    image: string | null
  } | null
  created_at: string
  updated_at: string
}

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
  const [imgSrc, setImgSrc] = useState("/placeholder.png")
  const [fullProductData, setFullProductData] = useState<ApiProduct | null>(product)
  const { items, removeItem } = useCartStore()
  const fetchedProductIdRef = useRef<string | null>(null)
  
  // Fetch full product details when modal opens
  useEffect(() => {
    if (!open) {
      // Reset when modal closes
      setFullProductData(product)
      fetchedProductIdRef.current = null
      return
    }
    
    if (!product?.unique_id) {
      setFullProductData(product)
      return
    }
    
    // Skip if we already fetched this product
    if (fetchedProductIdRef.current === product.unique_id) {
      return
    }
    
    // Only fetch if we don't already have full data with reviews.list
    const hasFullData = (product as any)?.reviews?.list && Array.isArray((product as any).reviews.list)
    if (hasFullData) {
      setFullProductData(product)
      fetchedProductIdRef.current = product.unique_id
      return
    }
    
    let cancelled = false
    fetchedProductIdRef.current = product.unique_id
    
    const fetchFullProduct = async () => {
      try {
        const response = await api.get(`/products/${product.unique_id}`)
        if (!cancelled && response.data.success && response.data.data) {
          setFullProductData(response.data.data)
        } else if (!cancelled) {
          setFullProductData(product)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching full product details:', error)
          setFullProductData(product)
        }
      }
    }
    
    fetchFullProduct()
    
    return () => {
      cancelled = true
    }
  }, [open, product?.unique_id])
  
  // Use full product data if available, otherwise use product prop
  const displayProduct = fullProductData || product
  
  // Check if product is in cart
  const cartItem = items.find(item => item.product_id === displayProduct?.id)
  const isInCart = !!cartItem

  // Use reviews from product data if available, otherwise fetch from endpoint
  const hasReviews = displayProduct?.reviews && displayProduct.reviews.total > 0
  const productHasReviewsList = (displayProduct as any)?.reviews?.list && Array.isArray((displayProduct as any).reviews.list)
  
  const [reviewsData, setReviewsData] = useState<{ reviews: Review[], summary: { total: number, average_rating: number } } | null>(null)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const fetchedReviewsIdRef = useRef<string | null>(null)
  
  useEffect(() => {
    const productUniqueId = displayProduct?.unique_id
    
    if (!displayProduct || !open || !productUniqueId) {
      setReviewsData(null)
      fetchedReviewsIdRef.current = null
      return
    }
    
    // Skip if we already fetched reviews for this product
    if (fetchedReviewsIdRef.current === productUniqueId) {
      return
    }
    
    // If product already has reviews list, use it directly
    if (productHasReviewsList) {
      const productReviews = (displayProduct as any).reviews.list || []
      setReviewsData({
        reviews: productReviews.map((r: any) => ({
          id: r.id,
          stars: r.stars,
          message: r.message,
          buyer: r.buyer || null,
          created_at: r.created_at,
          updated_at: r.updated_at || r.created_at
        })),
        summary: {
          total: displayProduct.reviews?.total || 0,
          average_rating: displayProduct.reviews?.average_rating || 0
        }
      })
      fetchedReviewsIdRef.current = productUniqueId
      return
    }
    
    // Otherwise fetch from endpoint
    if (!hasReviews) {
      setReviewsData(null)
      return
    }
    
    let cancelled = false
    fetchedReviewsIdRef.current = productUniqueId
    
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true)
        setReviewsError(null)
        const response = await api.get(`/products/${productUniqueId}/reviews`)
        
        if (!cancelled) {
          if (response.data.success) {
            setReviewsData({
              reviews: response.data.data || [],
              summary: response.data.summary || displayProduct.reviews
            })
          } else {
            setReviewsError(response.data.message || "Failed to load reviews")
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error fetching reviews:", err)
          setReviewsError(err.response?.data?.message || err.message || "Failed to fetch reviews")
        }
      } finally {
        if (!cancelled) {
          setLoadingReviews(false)
        }
      }
    }
    
    fetchReviews()
    
    return () => {
      cancelled = true
    }
  }, [displayProduct?.unique_id, open])
  
  // Get reviews list and summary
  const reviews = reviewsData?.reviews || []
  const reviewsSummary = reviewsData?.summary || displayProduct?.reviews
  
  // Debug: Log reviews data
  useEffect(() => {
    if (displayProduct && open) {
      console.log("Reviews Debug:", {
        hasReviews,
        reviewsData,
        reviews,
        reviewsSummary,
        productReviews: displayProduct.reviews,
        loadingReviews,
        reviewsError
      })
    }
  }, [displayProduct, open, hasReviews, reviewsData, reviews, reviewsSummary, loadingReviews, reviewsError])

  // Fetch related products from the same category
  const relatedProductsUrl = displayProduct ? `/products?category_id=${displayProduct.product_category.id}&limit=8` : ""
  const { data: relatedProductsResponse } = useApiFetch<{ data: ApiProduct[] }>(relatedProductsUrl, {
    enabled: !!displayProduct && open,
  })
  
  // Filter out current product from related products
  const relatedProducts = relatedProductsResponse?.data?.filter(p => p.id !== displayProduct?.id).slice(0, 6) || []

  useEffect(() => {
    if (displayProduct) {
      const imageUrl = getImageUrl(displayProduct.main_image)
      setImgSrc(imageUrl)
      setImgError(false)
      // Set quantity to cart quantity if product is in cart, otherwise 1
      const cartItem = items.find(item => item.product_id === displayProduct.id)
      setQuantity(cartItem ? cartItem.quantity : 1)
      
      // Debug: Log product data
      if (process.env.NODE_ENV === 'development') {
        console.log('Product Modal - Product Data:', displayProduct)
        console.log('Product Modal - Reviews:', displayProduct.reviews)
        console.log('Product Modal - Has Reviews List:', (displayProduct as any)?.reviews?.list)
      }
    }
  }, [displayProduct, items])

  if (!displayProduct) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Product Modal - No product provided')
    }
    return null
  }

  const { price, discountAmount, originalPrice, discountPercentage, hasDiscount } = calculateProductPrices(displayProduct)
  const inStock = displayProduct.stock > 0

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
      setImgSrc("/placeholder.png")
    }
  }

  const handleAddToCart = () => {
    onAddToCart?.(displayProduct, quantity)
  }

  const handleRemoveFromCart = async () => {
    if (cartItem) {
      try {
        await removeItem(cartItem.id)
      } catch (error) {
        console.error('Failed to remove from cart:', error)
      }
    }
  }

  const handleFavorite = () => {
    onToggleFavorite?.(displayProduct.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogTitle className="sr-only">{displayProduct.name}</DialogTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Image */}
          <div className="relative bg-gray-50 lg:min-h-[600px]">
            <img
              src={imgSrc}
              alt={displayProduct.name}
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
            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[#5a9c3a] mb-1 uppercase tracking-wider">
                  {displayProduct.seller.full_name}
                </p>
                <h2 className="text-3xl font-bold text-foreground mb-2">{displayProduct.name}</h2>
                <p className="text-sm text-muted-foreground font-mono mb-2">SKU: {displayProduct.sku}</p>
                
                {/* Reviews/Rating */}
                {displayProduct.reviews && displayProduct.reviews.total > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => {
                        const rating = displayProduct.reviews!.average_rating
                        const filled = i < Math.floor(rating)
                        const halfFilled = i === Math.floor(rating) && rating % 1 >= 0.5
                        
                        return (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
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
                    <span className="text-sm text-gray-600 font-medium">
                      {displayProduct.reviews.average_rating.toFixed(1)} ({displayProduct.reviews.total} {displayProduct.reviews.total === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>

              {/* Category & Type */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {displayProduct.product_category.name}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Package className="w-3 h-3 mr-1" />
                  {displayProduct.product_type.name}
                </Badge>
              </div>

              {/* Price */}
              <div className="py-4 border-y border-gray-200">
                <div className="flex items-baseline gap-3 flex-wrap">
                  {hasDiscount ? (
                    <>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-3xl text-[#5a9c3a]">${price.toFixed(2)}</span>
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
                    <span className="font-bold text-3xl text-[#5a9c3a]">${price.toFixed(2)}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Stock: {displayProduct.stock} available
                </p>
              </div>

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
                    onClick={() => setQuantity(Math.min(displayProduct.stock, quantity + 1))}
                    className="h-8 w-8 rounded-md hover:bg-white"
                    disabled={quantity >= displayProduct.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {isInCart ? (
                  <Button
                    onClick={handleRemoveFromCart}
                    className="flex-1 gap-2 h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                  >
                    <Trash2 className="w-5 h-5" />
                    Remove from Cart
                  </Button>
                ) : (
                  <Button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="flex-1 gap-2 h-12 bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white rounded-lg font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                )}
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
                  <div className="w-10 h-10 rounded-full bg-[#5a9c3a]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#5a9c3a]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Seller</p>
                    <p className="text-xs text-muted-foreground">{displayProduct.seller.full_name}</p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-[#5a9c3a]" />
                  <span>Delivery coming soon — pickup only for now</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-[#5a9c3a]" />
                  <span>100% Satisfaction Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Details Section */}
        {(displayProduct.excerpt || displayProduct.details) && (
          <div className="border-t border-gray-200 p-6 lg:p-8 bg-white">
            <h3 className="font-semibold text-lg mb-4">Product Information</h3>
            <div className="space-y-4">
              {displayProduct.excerpt && (
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{displayProduct.excerpt}</p>
                </div>
              )}
              {displayProduct.details && (
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{displayProduct.details}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-200 p-6 lg:p-8 bg-gray-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="transform transition-transform hover:scale-105">
                  <ApiProductCard
                    product={relatedProduct}
                    onAddToCart={onAddToCart}
                    onToggleFavorite={onToggleFavorite}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {hasReviews && (
          <div className="border-t border-gray-200 p-6 lg:p-8 bg-white">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Reviews</h3>
              {loadingReviews ? (
                <div className="flex items-center gap-2">
                  <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>
                </div>
              ) : reviewsSummary ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(reviewsSummary.average_rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {(reviewsSummary.average_rating || 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({(reviewsSummary.total || 0)} {(reviewsSummary.total || 0) === 1 ? "review" : "reviews"})
                  </span>
                </div>
              ) : null}
            </div>

            {loadingReviews ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="pb-4 border-b border-gray-100 animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviewsError ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Failed to load reviews. Please try again later.</p>
                <p className="text-xs mt-1">{reviewsError}</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => {
                const reviewDate = new Date(review.created_at)
                const daysAgo = Math.floor((Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))
                const dateText = daysAgo === 0 ? "Today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`
                const buyerName = review.buyer?.full_name || "Anonymous"
                const buyerInitial = buyerName.charAt(0).toUpperCase()

                return (
                  <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-start gap-3">
                      {review.buyer?.image ? (
                        <img
                          src={getImageUrl(review.buyer.image)}
                          alt={buyerName}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            const target = e.currentTarget
                            target.style.display = 'none'
                            const fallback = target.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-10 h-10 rounded-full bg-[#5a9c3a] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                        style={{ display: review.buyer?.image ? 'none' : 'flex' }}
                      >
                        {buyerInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{buyerName}</span>
                          <span className="text-xs text-gray-500">{dateText}</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {review.message && (
                          <p className="text-sm text-gray-700 leading-relaxed">{review.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No review details available yet.</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

