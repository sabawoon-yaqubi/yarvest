"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/axios"
import {
  ShoppingCart,
  Package,
  Truck,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Store,
  ExternalLink,
  Star,
} from "lucide-react"
import { getImageUrl } from "@/lib/utils"
import { ProductReviewModal } from "@/components/product-review-modal"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50 border-indigo-200",
    icon: CheckCircle2,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: XCircle,
  },
}

interface Order {
  id: number
  unique_id: string
  sellers: Array<{
    seller: {
      id: number
      unique_id: string
      full_name: string
      email: string
      phone: string
      image?: string
      address?: string
      latitude?: number | null
      longitude?: number | null
    } | null
    items: Array<{
      id: number
      product: {
        id: number
        unique_id: string
        name: string
        main_image?: string
        unit?: { name: string }
        category?: { name: string }
      }
      price: number
      discount: number
      quantity: number
      total: number
    }>
  }>
  items_count: number
  service_fee: number
  delivery_fee: number
  tax: number
  total_price: number
  status: string
  delivery_type: string
  payment_type: string
  address?: {
    full_address: string
    street_address: string
    city: string
    state: string
    postal_code: string
    latitude?: number | null
    longitude?: number | null
  }
  courier?: {
    full_name: string
    phone: string
  }
  created_at: string
}

export default function MyOrdersPage() {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedProductForReview, setSelectedProductForReview] = useState<{
    id: number
    unique_id: string
    name: string
    main_image?: string
  } | null>(null)
  const [reviewedProducts, setReviewedProducts] = useState<Set<number>>(new Set())
  const [checkingReviews, setCheckingReviews] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/")
      return
    }

    fetchOrders()
  }, [user, router, isLoading, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params: any = { limit: 50, order_by: 'created_at', order_dir: 'desc' }
      if (statusFilter !== "all") {
        params.status = statusFilter
      }
      if (searchQuery) {
        params.search = searchQuery
      }
      
      const response = await api.get('/orders/my-orders', { params })
      const ordersData = response.data?.data || []
      setOrders(ordersData)
      
      // Check which products have been reviewed for completed orders
      if (user) {
        checkReviewedProducts(ordersData)
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkReviewedProducts = async (ordersData: Order[]) => {
    if (!user) return
    
    try {
      setCheckingReviews(true)
      const productIds = new Set<number>()
      
      // Collect all product IDs from completed orders
      ordersData.forEach(order => {
        if (order.status === 'completed') {
          order.sellers.forEach(sellerGroup => {
            sellerGroup.items.forEach(item => {
              productIds.add(item.product.id)
            })
          })
        }
      })

      // Check reviews for each product
      const reviewedSet = new Set<number>()
      await Promise.all(
        Array.from(productIds).map(async (productId) => {
          try {
            const response = await api.get(`/products/${productId}/reviews`)
            if (response.data.success && response.data.data) {
              const hasReviewed = response.data.data.some(
                (review: any) => review.buyer?.id === user.id
              )
              if (hasReviewed) {
                reviewedSet.add(productId)
              }
            }
          } catch (error) {
            // Silently fail - product might not have reviews endpoint or other error
            console.error(`Error checking reviews for product ${productId}:`, error)
          }
        })
      )
      
      setReviewedProducts(reviewedSet)
    } catch (error) {
      console.error('Error checking reviewed products:', error)
    } finally {
      setCheckingReviews(false)
    }
  }

  const handleOpenReviewModal = (product: { id: number; unique_id: string; name: string; main_image?: string }) => {
    setSelectedProductForReview(product)
    setReviewModalOpen(true)
  }

  const handleReviewSubmitted = () => {
    if (selectedProductForReview) {
      setReviewedProducts(prev => new Set(prev).add(selectedProductForReview.id))
    }
    // Refresh orders to get updated data
    fetchOrders()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrders()
  }

  const toggleOrder = (orderId: number) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'N/A'
    }
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status.toLowerCase()] || {
      label: status,
      color: "text-gray-700",
      bgColor: "bg-gray-50 border-gray-200",
      icon: AlertCircle,
    }
  }

  const openGoogleMaps = (address: string, latitude?: number | null, longitude?: number | null, orderId?: number) => {
    // Collapse the order card if it's expanded
    if (orderId !== undefined && expandedOrders.has(orderId)) {
      toggleOrder(orderId)
    }
    
    let googleMapsUrl: string
    
    // Use coordinates if available (more accurate)
    if (latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined) {
      googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    } else {
      // Fallback to address search
      const encodedAddress = encodeURIComponent(address)
      googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    }
    
    window.open(googleMapsUrl, '_blank')
  }

  // Filter orders by search query
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      order.unique_id.toLowerCase().includes(query) ||
      order.sellers.some(sellerGroup => 
        sellerGroup.seller?.full_name.toLowerCase().includes(query) ||
        sellerGroup.seller?.email.toLowerCase().includes(query) ||
        sellerGroup.items.some(item => item.product.name.toLowerCase().includes(query))
      )
    )
  })

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: COLORS.primary }} />
          <p className="text-sm text-gray-500 font-medium">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 mt-0.5 text-sm">View and track all your orders</p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 h-9 w-48 text-sm border-gray-200 focus:border-[#5a9c3a] focus:ring-1 focus:ring-[#5a9c3a]"
                />
              </div>
            </form>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a] h-9"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "No orders match your search criteria."
                  : "You haven't placed any orders yet."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button asChild style={{ backgroundColor: COLORS.primary }} className="text-white hover:opacity-90">
                  <Link href="/">Start Shopping</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrders.has(order.id)
              const statusInfo = getStatusConfig(order.status)
              const StatusIcon = statusInfo.icon
              const isPickup = order.delivery_type === 'pickup'

              return (
                <div key={order.id} className="border-0 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    {/* Order Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleOrder(order.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-mono text-sm font-semibold text-gray-900">
                              #{order.unique_id}
                            </p>
                            <Badge 
                              className={`${statusInfo.bgColor} ${statusInfo.color} border flex items-center gap-1 px-2 py-0.5 text-xs`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" />
                              <span>{order.items_count} item{order.items_count > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {isPickup ? (
                                <>
                                  <Store className="w-3.5 h-3.5" />
                                  <span>Pickup</span>
                                </>
                              ) : (
                                <>
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Delivery</span>
                                </>
                              )}
                            </div>
                            <span className="text-gray-400">•</span>
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-bold" style={{ color: COLORS.primary }}>
                            {formatCurrency(order.total_price)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 text-xs text-gray-500 hover:text-gray-900 h-7"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5 mr-1" />
                                Details
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                        {/* Sellers and Items */}
                        <div className="space-y-4 mb-4">
                          {order.sellers.map((sellerGroup, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 border border-gray-100">
                              {/* Seller Info */}
                              {sellerGroup.seller && (
                                <div className="flex items-start gap-3 mb-3 pb-3 border-b border-gray-100">
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] flex items-center justify-center flex-shrink-0">
                                    {sellerGroup.seller.image ? (
                                      <img
                                        src={getImageUrl(sellerGroup.seller.image)}
                                        alt={sellerGroup.seller.full_name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-white font-semibold text-sm">
                                        {sellerGroup.seller.full_name[0]?.toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                      {sellerGroup.seller.full_name}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{sellerGroup.seller.email}</span>
                                      </div>
                                      {sellerGroup.seller.phone && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            <span>{sellerGroup.seller.phone}</span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Items */}
                              <div className="space-y-2">
                                {sellerGroup.items.map((item) => {
                                  const isCompleted = order.status === 'completed'
                                  const hasReviewed = reviewedProducts.has(item.product.id)
                                  
                                  return (
                                    <div key={item.id} className="flex items-start gap-3">
                                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        {item.product.main_image ? (
                                          <img
                                            src={getImageUrl(item.product.main_image)}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-5 h-5 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-medium text-gray-900 text-sm mb-0.5">
                                          {item.product.name}
                                        </h5>
                                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                                          {item.product.category && (
                                            <span>{item.product.category.name}</span>
                                          )}
                                          {item.product.unit && (
                                            <>
                                              <span>•</span>
                                              <span>{item.product.unit.name}</span>
                                            </>
                                          )}
                                        </div>
                                        {/* Review Button for Completed Orders */}
                                        {isCompleted && (
                                          <div className="mt-2">
                                            {hasReviewed ? (
                                              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span className="font-medium">Reviewed</span>
                                              </div>
                                            ) : (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  handleOpenReviewModal({
                                                    id: item.product.id,
                                                    unique_id: item.product.unique_id,
                                                    name: item.product.name,
                                                    main_image: item.product.main_image,
                                                  })
                                                }}
                                                className="h-7 text-xs px-3 border-[#5a9c3a] text-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white"
                                              >
                                                <Star className="w-3 h-3 mr-1.5" />
                                                Write Review
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-gray-500">
                                          Qty: {item.quantity}
                                        </p>
                                        <p className="font-semibold text-gray-900 text-sm mt-0.5">
                                          {formatCurrency(item.total)}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Address Info */}
                        <div className="space-y-3 mb-4">
                          {/* Seller Pickup Addresses (for pickup orders) */}
                          {isPickup && order.sellers.some(sg => sg.seller?.address) && (
                            <div className="bg-white rounded-lg p-4 border border-gray-100">
                              <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
                                <Store className="w-4 h-4" style={{ color: COLORS.primary }} />
                                Pickup Addresses
                              </h4>
                              <div className="space-y-3">
                                {order.sellers.map((sellerGroup, idx) => (
                                  sellerGroup.seller?.address && (
                                    <div key={idx} className="pl-3 border-l-2" style={{ borderColor: COLORS.accent }}>
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <p className="text-xs font-medium text-gray-900">
                                          {sellerGroup.seller.full_name}
                                        </p>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openGoogleMaps(
                                              sellerGroup.seller!.address || '',
                                              sellerGroup.seller!.latitude,
                                              sellerGroup.seller!.longitude,
                                              order.id
                                            )
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                          style={{
                                            backgroundColor: COLORS.primary,
                                            color: 'white',
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = COLORS.primaryDark
                                            e.currentTarget.style.transform = 'translateY(-1px)'
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = COLORS.primary
                                            e.currentTarget.style.transform = 'translateY(0)'
                                          }}
                                        >
                                          <MapPin className="w-4 h-4" fill="white" stroke="white" strokeWidth={2} />
                                          <span>View Map</span>
                                        </button>
                                      </div>
                                      <p className="text-xs text-gray-600 leading-relaxed">
                                        {sellerGroup.seller.address}
                                      </p>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Delivery Address (for delivery orders) */}
                          {!isPickup && order.address && (
                            <div className="bg-white rounded-lg p-4 border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4" style={{ color: COLORS.primary }} />
                                  Delivery Address
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openGoogleMaps(
                                      order.address!.full_address,
                                      order.address!.latitude,
                                      order.address!.longitude,
                                      order.id
                                    )
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                  style={{
                                    backgroundColor: COLORS.primary,
                                    color: 'white',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = COLORS.primaryDark
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = COLORS.primary
                                    e.currentTarget.style.transform = 'translateY(0)'
                                  }}
                                >
                                  <MapPin className="w-4 h-4" fill="white" stroke="white" strokeWidth={2} />
                                  <span>View Map</span>
                                </button>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {order.address.full_address}
                              </p>
                            </div>
                          )}

                          {/* Courier Info */}
                          {order.courier && (
                            <div className="bg-white rounded-lg p-4 border border-gray-100">
                              <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                                <Truck className="w-4 h-4" style={{ color: COLORS.primary }} />
                                Courier
                              </h4>
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                {order.courier.full_name}
                              </p>
                              {order.courier.phone && (
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {order.courier.phone}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <h4 className="font-semibold text-gray-900 text-sm mb-3">Price Breakdown</h4>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(order.total_price - order.service_fee - order.delivery_fee - order.tax)}
                              </span>
                            </div>
                            {order.service_fee > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Service Fee</span>
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(order.service_fee)}
                                </span>
                              </div>
                            )}
                            {order.delivery_fee > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(order.delivery_fee)}
                                </span>
                              </div>
                            )}
                            {order.tax > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(order.tax)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
                              <span>Total</span>
                              <span style={{ color: COLORS.primary }}>
                                {formatCurrency(order.total_price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedProductForReview && (
        <ProductReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          product={selectedProductForReview}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  )
}
