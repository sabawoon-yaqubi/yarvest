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
import { useRouter } from "next/navigation"

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
}

export default function CourierDashboard() {
  const router = useRouter()
  const [courierRequests, setCourierRequests] = useState<CourierRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('pending')
  const [selectedRequest, setSelectedRequest] = useState<CourierRequest | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [processingRequest, setProcessingRequest] = useState<number | null>(null)

  useEffect(() => {
    const loadCourierRequests = async () => {
      setIsLoading(true)
      try {
        const requests = await fetchCourierRequests(statusFilter)
        setCourierRequests(requests)
      } catch (error) {
        console.error('Error loading courier requests:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCourierRequests()
  }, [statusFilter])

  const filteredRequests = courierRequests.filter((request) => {
    const matchesSearch = 
      request.order.unique_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.order.buyer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.order.buyer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.order.address?.full_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const stats = {
    total: courierRequests.length,
    pending: courierRequests.filter(r => r.status === 'pending').length,
    accepted: courierRequests.filter(r => r.status === 'accepted').length,
    rejected: courierRequests.filter(r => r.status === 'rejected').length,
  }

  const handleAcceptRequest = async (requestId: number) => {
    setProcessingRequest(requestId)
    try {
      await acceptCourierRequest(requestId)
      const requests = await fetchCourierRequests(statusFilter)
      setCourierRequests(requests)
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
      const requests = await fetchCourierRequests(statusFilter)
      setCourierRequests(requests)
      setShowDetailsModal(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error rejecting request:', error)
    } finally {
      setProcessingRequest(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Delivery Requests</h1>
          <p className="text-gray-500 mt-1 text-sm">View and accept delivery requests from sellers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Accepted</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

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
        </div>
      </div>

      {/* Requests Table */}
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
                  const StatusIcon = statusConfig[request.status]?.icon || Clock
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
                        <Badge className={`${statusConfig[request.status]?.color || 'bg-gray-100 text-gray-800'} gap-1 px-3 py-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[request.status]?.label || request.status}
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
                  <Badge className={`${statusConfig[selectedRequest.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {statusConfig[selectedRequest.status]?.label || selectedRequest.status}
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
    </div>
  )
}
