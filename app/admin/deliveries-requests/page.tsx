"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  MessageSquare,
  AlertCircle,
  Plus
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fetchOrders, requestCourier, getOrderCourierRequests, type Order } from "@/lib/orders-api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
}

interface CourierRequest {
  id: number
  order?: {
    unique_id: string
    buyer?: {
      name: string
      email: string
    }
    address?: {
      full_address: string
    }
    delivery_fee: number
    status: string
  }
  order_unique_id?: string // Fallback when order object is not available
  courier?: {
    id: number
    name: string
    email: string
  }
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  notes?: string
  created_at: string
  accepted_at?: string
}

interface UserReview {
  id: number
  from_id: number
  to_id: number
  review: string
  star: number
  fromUser?: {
    id: number
    name: string
    email: string
  }
  created_at: string
}

export default function DeliveriesRequestsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pending' | 'requests' | 'reviews'>('pending')
  const [courierRequestsLoaded, setCourierRequestsLoaded] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [courierRequests, setCourierRequests] = useState<CourierRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestNotes, setRequestNotes] = useState("")
  const [requestingCourier, setRequestingCourier] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [orderToReview, setOrderToReview] = useState<Order | null>(null)
  const [reviewErrors, setReviewErrors] = useState<{review?: string, star?: string, order_id?: string, to_id?: string}>({})

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      setIsLoading(true)
      try {
        const fetchedOrders = await fetchOrders()
        if (!isMounted) return
        
        setOrders(fetchedOrders)
        
        // Don't load courier requests on initial load - load them lazily when needed
        // This reduces initial API calls significantly
      } catch (error) {
        console.error('Error loading data:', error)
        if (isMounted) {
          toast.error('Failed to load data')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [])

  // Filter pending orders that can request courier
  const pendingOrders = useMemo(() => {
    return orders.filter(order => {
      const status = order.status?.toLowerCase()
      return (status === 'pending' || status === 'confirmed' || status === 'processing') &&
             !order.courier_id // No courier assigned yet
    })
  }, [orders])

  // Filter orders that have courier requests
  const ordersWithRequests = useMemo(() => {
    const orderIds = new Set(courierRequests.map(req => req.order_unique_id))
    return orders.filter(order => {
      const orderId = order.unique_id || `ORD-${order.id}`
      return orderIds.has(orderId)
    })
  }, [orders, courierRequests])

  // Filter completed orders with courier that can be reviewed
  const reviewableOrders = useMemo(() => {
    return orders.filter(order => {
      const status = order.status?.toLowerCase()
      const hasCourier = order.courier?.id || order.courier_id
      // Check if review exists - handle both boolean true and truthy values
      const hasDeliveryReview = (order as any).has_delivery_review === true || (order as any).has_delivery_review === 1
      
      // Only show orders that:
      // 1. Are delivered or completed
      // 2. Have a courier assigned
      // 3. Don't have a delivery review yet
      const isReviewable = (status === 'delivered' || status === 'completed') &&
                          hasCourier && 
                          !hasDeliveryReview
      
      return isReviewable
    })
  }, [orders])

  const filteredPendingOrders = pendingOrders.filter((order) => {
    const matchesSearch = 
      (order.unique_id || `ORD-${order.id}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address?.full_address?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const filteredRequests = courierRequests.filter((request) => {
    if (!request) return false
    const orderId = request.order?.unique_id || request.order_unique_id || ''
    const buyerName = request.order?.buyer?.name || ''
    const courierName = request.courier?.name || ''
    const matchesSearch = 
      orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courierName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const stats = {
    pendingOrders: pendingOrders.length,
    totalRequests: courierRequests.length,
    pendingRequests: courierRequests.filter(r => r.status === 'pending').length,
    acceptedRequests: courierRequests.filter(r => r.status === 'accepted').length,
    reviewableOrders: reviewableOrders.length,
  }

  // Load courier requests when user switches to requests tab (lazy loading)
  useEffect(() => {
    if (activeTab === 'requests' && !courierRequestsLoaded && orders.length > 0) {
      const loadCourierRequests = async () => {
        try {
          // Only load courier requests for orders that might have them
          const ordersWithPossibleRequests = orders.filter(order => {
            const status = order.status?.toLowerCase()
            return status === 'pending' || status === 'confirmed' || status === 'processing' || 
                   status === 'shipped' || status === 'delivered' || status === 'completed'
          })
          
          // Load courier requests in parallel (batch requests)
          const requestPromises = ordersWithPossibleRequests.map(async (order) => {
            try {
              const requests = await getOrderCourierRequests(order.unique_id || `ORD-${order.id}`)
              if (Array.isArray(requests) && requests.length > 0) {
                const orderId = order.unique_id || `ORD-${order.id}`
                return requests.map((req: any) => ({
                  ...req,
                  order_unique_id: orderId,
                  order: {
                    unique_id: orderId,
                    buyer: order.buyer || req.order?.buyer,
                    address: order.address || req.order?.address,
                    delivery_fee: order.delivery_fee || req.order?.delivery_fee || 0,
                    status: order.status || req.order?.status,
                    ...req.order
                  }
                }))
              }
              return []
            } catch (error) {
              console.error(`Error loading requests for order ${order.unique_id}:`, error)
              return []
            }
          })
          
          const requestResults = await Promise.all(requestPromises)
          const allRequests: CourierRequest[] = requestResults.flat()
          setCourierRequests(allRequests)
          setCourierRequestsLoaded(true)
        } catch (error) {
          console.error('Error loading courier requests:', error)
        }
      }
      
      loadCourierRequests()
    }
  }, [activeTab, courierRequestsLoaded, orders])

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredPendingOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(filteredPendingOrders.map(o => o.unique_id || `ORD-${o.id}`)))
    }
  }

  const handleRequestCourier = async () => {
    if (selectedOrders.size === 0) {
      toast.error('Please select at least one order')
      return
    }

    setRequestingCourier(true)
    try {
      let successCount = 0
      let failCount = 0

      for (const orderId of selectedOrders) {
        try {
          await requestCourier(orderId, requestNotes)
          successCount++
        } catch (error) {
          console.error(`Error requesting courier for ${orderId}:`, error)
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Courier requested for ${successCount} order(s)`)
      }
      if (failCount > 0) {
        toast.error(`Failed to request courier for ${failCount} order(s)`)
      }

      // Reload data
      const fetchedOrders = await fetchOrders()
      setOrders(fetchedOrders)
      
      // Only reload requests for orders that might have them (optimize)
      const ordersWithPossibleRequests = fetchedOrders.filter(order => {
        const status = order.status?.toLowerCase()
        return status === 'pending' || status === 'confirmed' || status === 'processing' || 
               status === 'shipped' || status === 'delivered' || status === 'completed'
      })
      
      // Load requests in parallel
      const requestPromises = ordersWithPossibleRequests.map(async (order) => {
        try {
          const requests = await getOrderCourierRequests(order.unique_id || `ORD-${order.id}`)
          if (Array.isArray(requests) && requests.length > 0) {
            return requests.map((req: any) => ({
              ...req,
              order_unique_id: order.unique_id || `ORD-${order.id}`
            }))
          }
          return []
        } catch (error) {
          return []
        }
      })
      
      const requestResults = await Promise.all(requestPromises)
      const allRequests: CourierRequest[] = requestResults.flat()
      setCourierRequests(allRequests)
      setCourierRequestsLoaded(true)

      setSelectedOrders(new Set())
      setRequestNotes("")
      setShowRequestModal(false)
    } catch (error) {
      console.error('Error requesting courier:', error)
    } finally {
      setRequestingCourier(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!orderToReview || !reviewText.trim()) {
      toast.error('Please provide a review text')
      return
    }

    // Get courier ID from courier object or courier_id property
    const courierId = orderToReview.courier?.id || orderToReview.courier_id
    
    if (!courierId) {
      toast.error('No courier found for this order')
      console.error('Order courier info:', orderToReview.courier, 'courier_id:', orderToReview.courier_id)
      return
    }

    setSubmittingReview(true)
    try {
      // The backend expects the numeric order ID (not unique_id string)
      // From OrderController transformOrder, 'id' is the numeric ID from database
      // Find the order in our list to get the correct numeric ID
      const orderFromList = orders.find(o => 
        o.unique_id === orderToReview.unique_id || 
        o.id === orderToReview.id ||
        (o.unique_id && orderToReview.unique_id && o.unique_id === orderToReview.unique_id)
      )
      
      const orderId = orderFromList?.id || orderToReview.id
      
      if (!orderId || typeof orderId !== 'number') {
        toast.error('Invalid order ID. Please refresh the page and try again.')
        setSubmittingReview(false)
        return
      }
      
      console.log('Submitting review:', {
        to_id: courierId,
        review: reviewText,
        star: reviewRating,
        order_id: orderId,
        type: 'delivery',
        orderFromList: orderFromList,
        orderToReview: orderToReview
      })
      
      const response = await api.post('/user-reviews', {
        to_id: courierId,
        review: reviewText,
        star: reviewRating,
        order_id: orderId,
        type: 'delivery'
      })

      toast.success('Review submitted successfully')
      setShowReviewModal(false)
      setReviewText("")
      setReviewRating(5)
      setOrderToReview(null)
      setReviewErrors({})

      // Reload orders to update review status
      const fetchedOrders = await fetchOrders()
      setOrders(fetchedOrders)
    } catch (error: any) {
      console.error('Error submitting review:', error)
      
      // Handle validation errors - show field-specific errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
        const fieldErrors: {review?: string, star?: string, order_id?: string, to_id?: string} = {}
        
        if (validationErrors.review) {
          fieldErrors.review = Array.isArray(validationErrors.review) 
            ? validationErrors.review[0] 
            : validationErrors.review
        }
        if (validationErrors.star) {
          fieldErrors.star = Array.isArray(validationErrors.star) 
            ? validationErrors.star[0] 
            : validationErrors.star
        }
        if (validationErrors.order_id) {
          fieldErrors.order_id = Array.isArray(validationErrors.order_id) 
            ? validationErrors.order_id[0] 
            : validationErrors.order_id
        }
        if (validationErrors.to_id) {
          fieldErrors.to_id = Array.isArray(validationErrors.to_id) 
            ? validationErrors.to_id[0] 
            : validationErrors.to_id
        }
        
        setReviewErrors(fieldErrors)
        
        // Show general error message
        const errorMessage = error.response?.data?.message || 'Please fix the errors below'
        toast.error(errorMessage)
      } else {
        // Other errors
        const errorMessage = error.response?.data?.message || 'Failed to submit review'
        toast.error(errorMessage)
        setReviewErrors({})
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleOpenReview = (order: Order) => {
    console.log('Opening review for order:', order)
    console.log('Courier info:', order.courier)
    console.log('Courier ID:', order.courier_id)
    
    // Verify courier exists
    const courierId = order.courier?.id || order.courier_id
    if (!courierId) {
      toast.error('No courier found for this order. Cannot review.')
      return
    }
    
    setOrderToReview(order)
    setReviewText("")
    setReviewRating(5)
    setReviewErrors({})
    setShowReviewModal(true)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#5a9c3a]" />
          <p className="text-gray-600">Loading deliveries requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-8xl mx-auto px-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Delivery Requests</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage courier requests for your orders</p>
        </div>
        {selectedOrders.size > 0 && activeTab === 'pending' && (
          <Button
            onClick={() => setShowRequestModal(true)}
            className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Request Courier ({selectedOrders.size})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Pending Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Accepted</p>
          <p className="text-2xl font-bold text-green-600">{stats.acceptedRequests}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Reviewable</p>
          <p className="text-2xl font-bold text-blue-600">{stats.reviewableOrders}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Orders</TabsTrigger>
          <TabsTrigger value="requests">Courier Requests</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by order ID, customer, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Pending Orders Tab */}
        <TabsContent value="pending" className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {filteredPendingOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No pending orders available for delivery request</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Select Orders to Request Courier ({filteredPendingOrders.length})
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedOrders.size === filteredPendingOrders.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          <input
                            type="checkbox"
                            checked={selectedOrders.size === filteredPendingOrders.length && filteredPendingOrders.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-[#5a9c3a] border-gray-300 rounded"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Fee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPendingOrders.map((order) => {
                        const orderId = order.unique_id || `ORD-${order.id}`
                        const isSelected = selectedOrders.has(orderId)
                        const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
                        return (
                          <tr key={order.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-green-50' : ''}`}>
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectOrder(orderId)}
                                className="w-4 h-4 text-[#5a9c3a] border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm font-semibold text-gray-900">{orderId}</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">{order.buyer?.name || 'N/A'}</p>
                                {order.buyer?.email && (
                                  <p className="text-gray-500 text-xs">{order.buyer.email}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-start gap-1 max-w-xs">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {order.address?.full_address || 'N/A'}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-sm font-semibold text-[#5a9c3a]">
                                <DollarSign className="w-4 h-4" />
                                <span>${parseFloat(String(order.delivery_fee || 0)).toFixed(2)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge className={`${statusConfig[order.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'} gap-1 px-3 py-1`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowDetailsModal(true)
                                }}
                                className="h-8"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Courier Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No courier requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => {
                      const StatusIcon = statusConfig[request.status as keyof typeof statusConfig]?.icon || Clock
                      return (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm font-semibold text-gray-900">
                              {request.order?.unique_id || request.order_unique_id || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{request.order?.buyer?.name || 'N/A'}</p>
                              {request.order?.buyer?.email && (
                                <p className="text-gray-500 text-xs">{request.order.buyer.email}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {request.courier ? (
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">{request.courier.name}</p>
                                {request.courier.email && (
                                  <p className="text-gray-500 text-xs">{request.courier.email}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No courier assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge className={`${
                              request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            } gap-1 px-3 py-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {request.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/orders/${request.order?.unique_id || request.order_unique_id}`)}
                              className="h-8"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {reviewableOrders.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No orders available for review</p>
                <p className="text-gray-400 text-sm mt-2">Complete orders with couriers can be reviewed here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviewableOrders.map((order) => {
                      const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm font-semibold text-gray-900">
                              {order.unique_id || `ORD-${order.id}`}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{order.buyer?.name || 'N/A'}</p>
                              {order.buyer?.email && (
                                <p className="text-gray-500 text-xs">{order.buyer.email}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {order.courier ? (
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">
                                  {order.courier.name || order.courier.full_name || order.courier.email || 'Courier'}
                                </p>
                                {order.courier.email && (
                                  <p className="text-gray-500 text-xs">{order.courier.email}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No courier</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge className={`${statusConfig[order.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'} gap-1 px-3 py-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {order.updated_at ? new Date(order.updated_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {(order as any).has_delivery_review ? (
                              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                                <CheckCircle className="w-3 h-3 mr-1 inline" />
                                Reviewed
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white h-8"
                                onClick={() => handleOpenReview(order)}
                              >
                                <Star className="w-3 h-3 mr-1" />
                                Review
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Courier Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold">Request Courier</DialogTitle>
            <DialogDescription className="pt-2">
              Request courier for {selectedOrders.size} selected order(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or notes for the courier..."
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Courier requests will be sent to available couriers. They can accept or reject your request.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRequestModal(false)
                setRequestNotes("")
              }}
              disabled={requestingCourier}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestCourier}
              disabled={requestingCourier}
              className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
            >
              {requestingCourier ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                "Request Courier"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Review Courier
            </DialogTitle>
            <DialogDescription className="pt-2">
              {orderToReview?.courier ? (
                <span>Review courier: <strong>{orderToReview.courier.name || orderToReview.courier.full_name || orderToReview.courier.email || 'Courier'}</strong></span>
              ) : orderToReview?.courier_id ? (
                <span className="text-yellow-600">Courier ID: {orderToReview.courier_id} (Details loading...)</span>
              ) : (
                <span className="text-red-600">No courier information available for this order</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setReviewRating(star)
                      // Clear error when user selects rating
                      if (reviewErrors.star) {
                        setReviewErrors({...reviewErrors, star: undefined})
                      }
                    }}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewRating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {reviewErrors.star && (
                <p className="mt-1 text-sm text-red-600">{reviewErrors.star}</p>
              )}
            </div>

            <div>
              <Label htmlFor="review-text" className="text-sm font-semibold text-gray-700">
                Review
              </Label>
              <Textarea
                id="review-text"
                placeholder="Write your review about the courier's service..."
                value={reviewText}
                onChange={(e) => {
                  setReviewText(e.target.value)
                  // Clear error when user starts typing
                  if (reviewErrors.review) {
                    setReviewErrors({...reviewErrors, review: undefined})
                  }
                }}
                className={`mt-2 min-h-[120px] ${reviewErrors.review ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {reviewErrors.review && (
                <p className="mt-1 text-sm text-red-600">{reviewErrors.review}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewModal(false)
                setReviewText("")
                setReviewRating(5)
                setOrderToReview(null)
                setReviewErrors({})
              }}
              disabled={submittingReview}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submittingReview || !reviewText.trim() || (!orderToReview?.courier?.id && !orderToReview?.courier_id)}
              className="bg-[#5a9c3a] hover:bg-[#0d7a3a] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingReview ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
              <DialogDescription>
                Order ID: {selectedOrder.unique_id || `ORD-${selectedOrder.id}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.buyer?.name || 'N/A'}</p>
                  {selectedOrder.buyer?.email && (
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.buyer.email}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <Badge className={statusConfig[selectedOrder.status as keyof typeof statusConfig]?.color}>
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.label || selectedOrder.status}
                  </Badge>
                </div>
                {selectedOrder.address && (
                  <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.address.full_address}</p>
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Fee</p>
                  <p className="font-bold text-[#5a9c3a] text-lg">
                    ${parseFloat(String(selectedOrder.delivery_fee || 0)).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Price</p>
                  <p className="font-bold text-gray-900 text-lg">
                    ${parseFloat(String(selectedOrder.total_price || selectedOrder.total || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-3 border-t mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              <Button
                className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                onClick={() => {
                  router.push(`/admin/orders/${selectedOrder.unique_id || selectedOrder.id}`)
                  setShowDetailsModal(false)
                }}
              >
                View Full Details
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

