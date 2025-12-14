"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Truck, 
  Search,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  User,
  Mail,
  Phone,
  DollarSign,
  Calendar
} from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { fetchCourierRequests, acceptCourierRequest, rejectCourierRequest, type CourierRequest } from "@/lib/courier-requests-api"
import { getCourierOrders, type Order } from "@/lib/orders-api"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800", icon: XCircle },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-purple-100 text-purple-800", icon: Clock },
}

export default function CourierDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'requests' | 'deliveries'>('requests')
  const [allCourierRequests, setAllCourierRequests] = useState<CourierRequest[]>([])
  const [courierOrders, setCourierOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('pending')
  const [selectedRequest, setSelectedRequest] = useState<CourierRequest | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [processingRequest, setProcessingRequest] = useState<number | null>(null)

  // Load all data upfront on mount
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true)
      try {
        // Get current user to filter out requests created by them
        const currentUser = getCurrentUser()
        const currentUserId = currentUser?.id ? parseInt(currentUser.id) : null

        // Load pending requests (available to accept) and accepted requests separately
        // Then combine with orders to get accurate counts
        const [pendingRequests, acceptedRequests, orders] = await Promise.all([
          fetchCourierRequests('pending'), // All pending requests not assigned to anyone
          fetchCourierRequests('accepted'), // Requests accepted by current user
          getCourierOrders()
        ])
        
        // Filter out requests created by current user (safety measure - backend already does this)
        const filterOwnRequests = (requests: CourierRequest[]) => {
          if (!currentUserId) return requests
          return requests.filter(req => req.seller?.id !== currentUserId)
        }
        
        const filteredPending = filterOwnRequests(pendingRequests)
        const filteredAccepted = filterOwnRequests(acceptedRequests)
        
        // Combine all requests for display
        const allRequests = [...filteredPending, ...filteredAccepted]
        setAllCourierRequests(allRequests)
        setCourierOrders(orders)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadAllData()
  }, [])

  // Filter requests by status filter
  // For 'pending' tab, show all pending requests (backend already filters to show only unassigned pending)
  // For other statuses, show requests with that status
  const courierRequests = allCourierRequests.filter((request) => {
    if (statusFilter === 'all') return true
    return request.status === statusFilter
  })

  const filteredRequests = courierRequests.filter((request) => {
    const matchesSearch = 
      request.order.unique_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.order.buyer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.order.buyer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.order.address?.full_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const filteredOrders = courierOrders.filter((order) => {
    const matchesSearch = 
      order.unique_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address?.full_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Calculate stats from all loaded data (not just filtered) so counts are accurate
  const stats = {
    totalRequests: allCourierRequests.length,
    pendingRequests: allCourierRequests.filter(r => r.status === 'pending').length,
    acceptedRequests: allCourierRequests.filter(r => r.status === 'accepted').length,
    rejectedRequests: allCourierRequests.filter(r => r.status === 'rejected').length,
    totalDeliveries: courierOrders.length,
    completedDeliveries: courierOrders.filter(o => o.status === 'delivered' || (o.status as string) === 'completed').length,
    totalEarnings: courierOrders.reduce((sum, o) => sum + (parseFloat(String(o.delivery_fee || 0))), 0),
  }

  const handleAcceptRequest = async (requestId: number) => {
    setProcessingRequest(requestId)
    try {
      await acceptCourierRequest(requestId)
      // Reload all data to update counts
      const [pendingRequests, acceptedRequests, orders] = await Promise.all([
        fetchCourierRequests('pending'),
        fetchCourierRequests('accepted'),
        getCourierOrders()
      ])
      setAllCourierRequests([...pendingRequests, ...acceptedRequests])
      setCourierOrders(orders)
      setShowDetailsModal(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error accepting request:', error)
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    setProcessingRequest(requestId)
    try {
      await rejectCourierRequest(requestId)
      // Reload all requests to update counts
      const [pendingRequests, acceptedRequests] = await Promise.all([
        fetchCourierRequests('pending'),
        fetchCourierRequests('accepted')
      ])
      setAllCourierRequests([...pendingRequests, ...acceptedRequests])
      setShowDetailsModal(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error rejecting request:', error)
    } finally {
      setProcessingRequest(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-8xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-500 mt-1 text-sm">View delivery requests and manage your accepted deliveries</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'requests'
              ? 'border-b-2 border-[#5a9c3a] text-[#5a9c3a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Delivery Requests 
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'deliveries'
              ? 'border-b-2 border-[#5a9c3a] text-[#5a9c3a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Deliveries
        </button>
      </div>

      {/* Stats */}
      {activeTab === 'requests' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <p className="text-sm text-gray-500 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejectedRequests}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Total Deliveries</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completedDeliveries}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-[#5a9c3a]">${stats.totalEarnings.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by order ID, customer, email, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-gray-300"
            />
          </div>
          {activeTab === 'requests' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'pending' | 'accepted' | 'rejected' | 'all')}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a]"
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          )}
        </div>
      </div>

      {/* Requests Table */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#5a9c3a]" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No {statusFilter === 'all' ? '' : statusFilter} requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Fee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => {
                    const statusKey = request.status as keyof typeof statusConfig
                    const StatusIcon = statusConfig[statusKey]?.icon || Clock
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-semibold text-gray-900">
                            {request.order.unique_id}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{request.order.buyer?.name || 'N/A'}</p>
                            {request.order.buyer?.email && (
                              <p className="text-gray-500 text-xs">{request.order.buyer.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-1 max-w-xs">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {request.order.address?.full_address || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{request.seller?.name || 'N/A'}</p>
                            {request.seller?.email && (
                              <p className="text-gray-500 text-xs">{request.seller.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Package className="w-4 h-4" />
                            <span>{request.order.items_count}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm font-semibold text-[#5a9c3a]">
                            <DollarSign className="w-4 h-4" />
                            <span>${request.order.delivery_fee.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={`${statusConfig[statusKey]?.color || 'bg-gray-100 text-gray-800'} gap-1 px-3 py-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[statusKey]?.label || request.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white h-8"
                                  onClick={() => handleAcceptRequest(request.id)}
                                  disabled={processingRequest === request.id}
                                >
                                  {processingRequest === request.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 h-8"
                                  onClick={() => handleRejectRequest(request.id)}
                                  disabled={processingRequest === request.id}
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowDetailsModal(true)
                              }}
                              className="h-8"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Deliveries Table */}
      {activeTab === 'deliveries' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#5a9c3a]" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No deliveries found</p>
              <p className="text-gray-400 text-sm mt-2">Accept delivery requests to see them here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Fee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const statusKey = order.status as keyof typeof statusConfig
                    const StatusIcon = statusConfig[statusKey]?.icon || Clock
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-semibold text-gray-900">
                            {order.unique_id}
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
                          <div className="flex items-start gap-1 max-w-xs">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {order.address?.full_address || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{order.seller?.name || 'N/A'}</p>
                            {order.seller?.email && (
                              <p className="text-gray-500 text-xs">{order.seller.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Package className="w-4 h-4" />
                            <span>{order.items_count || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm font-semibold text-[#5a9c3a]">
                            <DollarSign className="w-4 h-4" />
                            <span>${parseFloat(String(order.delivery_fee || 0)).toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={`${statusConfig[statusKey]?.color || 'bg-gray-100 text-gray-800'} gap-1 px-3 py-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[statusKey]?.label || order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
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
                            <Button
                              size="sm"
                              className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white h-8"
                              onClick={() => router.push(`/admin/orders/${order.unique_id}`)}
                            >
                              View Order
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl p-6">
            <DialogHeader className="pb-4">
              <DialogTitle>Delivery Request Details - Order #{selectedRequest.order.unique_id}</DialogTitle>
              <DialogDescription>
                Request from seller for delivery service
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order ID</p>
                  <p className="font-semibold text-gray-900">{selectedRequest.order.unique_id}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <Badge className={`${statusConfig[selectedRequest.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {statusConfig[selectedRequest.status as keyof typeof statusConfig]?.label || selectedRequest.status}
                  </Badge>
                </div>
                {selectedRequest.order.buyer && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.order.buyer.name}</p>
                      {selectedRequest.order.buyer.email && (
                        <p className="text-sm text-gray-600 mt-1">{selectedRequest.order.buyer.email}</p>
                      )}
                      {selectedRequest.order.buyer.phone && (
                        <p className="text-sm text-gray-600">{selectedRequest.order.buyer.phone}</p>
                      )}
                    </div>
                  </>
                )}
                {selectedRequest.order.address && (
                  <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm font-medium text-gray-900">{selectedRequest.order.address.full_address}</p>
                    </div>
                  </div>
                )}
                {selectedRequest.seller && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Seller</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.seller.name}</p>
                    {selectedRequest.seller.email && (
                      <p className="text-sm text-gray-600 mt-1">{selectedRequest.seller.email}</p>
                    )}
                    {selectedRequest.seller.phone && (
                      <p className="text-sm text-gray-600">{selectedRequest.seller.phone}</p>
                    )}
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Type</p>
                  <Badge className={
                    selectedRequest.order.delivery_type === "delivery" ? "bg-blue-100 text-blue-800" :
                    "bg-purple-100 text-purple-800"
                  }>
                    {selectedRequest.order.delivery_type}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Items</p>
                  <p className="font-semibold text-gray-900">{selectedRequest.order.items_count} items</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Fee</p>
                  <p className="font-bold text-[#5a9c3a] text-lg">${selectedRequest.order.delivery_fee.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Order Value</p>
                  <p className="font-bold text-gray-900 text-lg">${selectedRequest.order.total_price.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Request Created</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">Seller Notes</p>
                  <p className="text-sm text-blue-700">{selectedRequest.notes}</p>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 gap-3">
              {selectedRequest.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleRejectRequest(selectedRequest.id)}
                    disabled={processingRequest === selectedRequest.id}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAcceptRequest(selectedRequest.id)}
                    disabled={processingRequest === selectedRequest.id}
                  >
                    {processingRequest === selectedRequest.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Request
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl p-6">
            <DialogHeader className="pb-4">
              <DialogTitle>Delivery Details - Order #{selectedOrder.unique_id}</DialogTitle>
              <DialogDescription>
                Order you are delivering
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order ID</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.unique_id}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <Badge className={`${statusConfig[selectedOrder.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.label || selectedOrder.status}
                  </Badge>
                </div>
                {selectedOrder.buyer && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.buyer.name}</p>
                    {selectedOrder.buyer.email && (
                      <p className="text-sm text-gray-600 mt-1">{selectedOrder.buyer.email}</p>
                    )}
                    {selectedOrder.buyer.phone && (
                      <p className="text-sm text-gray-600">{selectedOrder.buyer.phone}</p>
                    )}
                  </div>
                )}
                {selectedOrder.address && (
                  <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.address.full_address}</p>
                    </div>
                  </div>
                )}
                {selectedOrder.seller && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Seller</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.seller.name}</p>
                    {selectedOrder.seller.email && (
                      <p className="text-sm text-gray-600 mt-1">{selectedOrder.seller.email}</p>
                    )}
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Type</p>
                  <Badge className={
                    selectedOrder.delivery_type === "delivery" ? "bg-blue-100 text-blue-800" :
                    "bg-purple-100 text-purple-800"
                  }>
                    {selectedOrder.delivery_type}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Items</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.items_count || 0} items</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Fee</p>
                  <p className="font-bold text-[#5a9c3a] text-lg">${parseFloat(String(selectedOrder.delivery_fee || 0)).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Order Value</p>
                  <p className="font-bold text-gray-900 text-lg">${parseFloat(String(selectedOrder.total_price || 0)).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order Date</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button
                className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                onClick={() => {
                  router.push(`/admin/orders/${selectedOrder.unique_id}`)
                  setShowDetailsModal(false)
                }}
              >
                View Full Order Details
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
