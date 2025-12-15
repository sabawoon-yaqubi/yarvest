"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, CheckCircle, Heart, ShoppingCart, Plus, Minus, Trash2, Package, User, Tag, Truck, Shield, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { getImageUrl } from "@/lib/utils"
import { calculateProductPrices } from "@/lib/product-utils"
import { ApiProduct } from "@/types/product"
import { useCartStore } from "@/stores/cart-store"
import { useCartHandler } from "@/hooks/use-cart-handler"
import { useWishlistStore } from "@/stores/wishlist-store"
import { useAuthStore } from "@/stores/auth-store"

interface ProductDetail {
  id: number
  unique_id: string
  name: string
  price: string
  discount: string
  main_image: string | null
  excerpt: string | null
  details: string | null
  seller: {
    id: number
    unique_id: string
    full_name: string
    image: string | null
    email?: string
    phone?: string
  } | null
  product_category: {
    id: number
    unique_id: string
    name: string
    image?: string | null
  } | null
  product_type: {
    id: number
    unique_id: string
    name: string
  } | null
  unit: {
    id: number
    unique_id: string
    name: string
  } | null
  reviews: {
    total: number
    average_rating: number
    list: Array<{
      id: number
      stars: number
      message: string | null
      buyer: {
        id: number
        full_name: string
        image: string | null
      } | null
      created_at: string
    }>
  }
  images: Array<{
    id: number
    image: string
  }>
  status: number | boolean
  sku: string
  stock: number
  created_at: string
  updated_at: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { items, updateItemQuantity, removeItem } = useCartStore()
  const { handleAddToCart } = useCartHandler()
  const { isLoggedIn } = useAuthStore()
  const { toggleItem, isFavorite: isFavoriteInStore, fetchProductIds } = useWishlistStore()

  // Fetch product details
  const { data: productResponse, loading, error, refetch } = useApiFetch<ProductDetail>(
    `/products/${productId}`,
    {
      enabled: !!productId,
    }
  )

  const product = (productResponse as any)?.data || productResponse

  // Fetch wishlist product IDs on mount if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchProductIds()
    }
  }, [isLoggedIn, fetchProductIds])

  const isFavorite = isLoggedIn ? isFavoriteInStore(product?.id || 0) : false

  // Convert product to ApiProduct format for calculations
  const apiProduct: ApiProduct | null = product ? {
    id: product.id,
    unique_id: product.unique_id,
    name: product.name,
    price: product.price,
    discount: product.discount,
    main_image: product.main_image,
    excerpt: product.excerpt,
    details: product.details,
    seller: product.seller ? {
      id: product.seller.id,
      unique_id: product.seller.unique_id,
      full_name: product.seller.full_name,
      image: product.seller.image,
    } : {
      id: 0,
      unique_id: '',
      full_name: '',
      image: null,
    },
    product_category: product.product_category ? {
      id: product.product_category.id,
      unique_id: product.product_category.unique_id,
      name: product.product_category.name,
    } : {
      id: 0,
      unique_id: '',
      name: '',
    },
    product_type: product.product_type ? {
      id: product.product_type.id,
      unique_id: product.product_type.unique_id,
      name: product.product_type.name,
    } : {
      id: 0,
      unique_id: '',
      name: '',
    },
    unit: product.unit ? {
      id: product.unit.id,
      unique_id: product.unit.unique_id,
      name: product.unit.name,
    } : null,
    reviews: product.reviews ? {
      total: product.reviews.total,
      average_rating: product.reviews.average_rating,
    } : undefined,
    status: product.status,
    sku: product.sku,
    stock: product.stock,
    created_at: product.created_at,
    updated_at: product.updated_at,
  } : null

  const { price, discountAmount, originalPrice, discountPercentage, hasDiscount } = apiProduct ? calculateProductPrices(apiProduct) : { price: 0, discountAmount: 0, originalPrice: 0, discountPercentage: 0, hasDiscount: false }
  
  const allImages = product ? [
    product.main_image,
    ...product.images.map((img: any) => img.image)
  ].filter(Boolean) : []
  
  const mainImageUrl = product ? getImageUrl(allImages[selectedImageIndex] || product.main_image, product.name) : ''
  const inStock = product ? product.stock > 0 : false

  // Check if product is in cart
  const cartItem = items.find(item => item.product_id === product?.id)
  const cartQuantity = cartItem?.quantity || 0
  const isInCart = cartQuantity > 0

  const handleIncreaseQuantity = async () => {
    if (cartItem && cartQuantity < (product?.stock || 0)) {
      try {
        await updateItemQuantity(cartItem.id, cartQuantity + 1)
      } catch (error) {
        console.error('Failed to update quantity:', error)
      }
    }
  }

  const handleDecreaseQuantity = async () => {
    if (cartItem && cartQuantity > 1) {
      try {
        await updateItemQuantity(cartItem.id, cartQuantity - 1)
      } catch (error) {
        console.error('Failed to update quantity:', error)
      }
    }
  }

  const handleRemoveFromCart = async () => {
    if (cartItem) {
      try {
        await removeItem(cartItem.id)
      } catch (error) {
        console.error('Failed to remove item:', error)
      }
    }
  }

  const handleAddToCartClick = () => {
    if (inStock && apiProduct) {
      handleAddToCart(apiProduct, quantity)
    }
  }

  const handleToggleFavorite = async () => {
    if (isLoggedIn && product) {
      try {
        await toggleItem(product.id)
      } catch (error) {
        console.error('Error toggling favorite:', error)
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-96 bg-gray-200 rounded-xl"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
              <p className="text-gray-600 mb-6">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
                <Button onClick={() => router.push('/products')} className="bg-[#5a9c3a] hover:bg-[#0d7a3f]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Products
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const rating = product.reviews?.average_rating ?? 0
  const reviewCount = product.reviews?.total ?? 0

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-white pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border border-gray-200">
                <img
                  src={mainImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.png"
                  }}
                />
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.slice(0, 4).map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-[#5a9c3a]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(img, product.name)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Seller */}
              <div className="flex flex-wrap items-center gap-3">
                {product.product_category && (
                  <Link href={`/categories/${product.product_category.unique_id}/products`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-[#5a9c3a]/10">
                      <Tag className="w-3 h-3 mr-1" />
                      {product.product_category.name}
                    </Badge>
                  </Link>
                )}
                {product.seller && (
                  <Link href={`/producers/${product.seller.unique_id}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-[#5a9c3a]/10">
                      <User className="w-3 h-3 mr-1" />
                      {product.seller.full_name}
                    </Badge>
                  </Link>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>

              {/* Rating */}
              {reviewCount > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-lg">{rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-500">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-gray-300" />
                  <span className="text-gray-400">No reviews yet</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-red-600">${price.toFixed(2)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                    <Badge className="bg-red-500 text-white">
                      -{discountPercentage}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Unit */}
              {product.unit && (
                <p className="text-gray-600">Per {product.unit.name}</p>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {inStock ? (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    In Stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge className="bg-red-500 text-white">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Description */}
              {product.excerpt && (
                <p className="text-gray-700 leading-relaxed">{product.excerpt}</p>
              )}

              {/* Cart Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                {isInCart ? (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    {cartQuantity === 1 ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFromCart}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDecreaseQuantity}
                        className="h-8 w-8"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                    <span className="font-bold text-lg min-w-[2rem] text-center">{cartQuantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleIncreaseQuantity}
                      disabled={cartQuantity >= product.stock}
                      className="h-8 w-8 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-8 w-8"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-bold min-w-[2rem] text-center">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="h-8 w-8 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleAddToCartClick}
                      disabled={!inStock}
                      className="flex-1 bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white h-10"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={`h-10 w-10 ${isFavorite ? 'text-red-500 border-red-500' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#5a9c3a]/10 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-[#5a9c3a]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Free Delivery</h3>
                    <p className="text-sm text-gray-600">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#5a9c3a]/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#5a9c3a]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Quality Guaranteed</h3>
                    <p className="text-sm text-gray-600">Fresh from local farmers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          {product.details && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Details</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{product.details}</p>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {product.reviews && product.reviews.list.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Reviews ({product.reviews.total})
              </h2>
              <div className="space-y-4">
                {product.reviews.list.map((review: any) => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {review.buyer?.image ? (
                          <img
                            src={getImageUrl(review.buyer.image, review.buyer.full_name)}
                            alt={review.buyer.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#5a9c3a]/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-[#5a9c3a]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{review.buyer?.full_name || 'Anonymous'}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.stars
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.message && (
                          <p className="text-gray-700 mb-2">{review.message}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

