"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  Leaf, 
  Search, 
  Plus,
  Calendar,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  fetchUserHarvestRequests, 
  updateHarvestRequest, 
  deleteHarvestRequest,
  fetchHarvestRequest,
  type HarvestRequest,
} from "@/lib/harvest-requests-api"
import { toast } from "sonner"

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
  unknown: { label: "Unknown", color: "bg-gray-100 text-gray-800", icon: AlertTriangle },
}

// Helper function to safely get status config
const getStatusConfig = (status: string) => {
  const normalizedStatus = status?.toLowerCase() || "unknown"
  // Map old status values to new ones for backward compatibility
  const statusMap: Record<string, keyof typeof statusConfig> = {
    'approved': 'accepted',
    'in_progress': 'pending',
    'rejected': 'cancelled',
  }
  const mappedStatus = statusMap[normalizedStatus] || normalizedStatus
  return statusConfig[mappedStatus as keyof typeof statusConfig] || statusConfig.unknown
}

// Helper function to safely render a value as string
const safeString = (value: any): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    // Try common object properties
    if ('name' in value) return String(value.name || '')
    if ('title' in value) return String(value.title || '')
    if ('id' in value) return String(value.id || '')
    if ('unique_id' in value) return String(value.unique_id || '')
  }
  return String(value || '')
}

export default function HarvestRequestsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [harvestRequests, setHarvestRequests] = useState<HarvestRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user's harvest requests on component mount
  useEffect(() => {
    const loadHarvestRequests = async () => {
      setIsLoading(true)
      try {
        const requests = await fetchUserHarvestRequests()
        setHarvestRequests(requests)
      } catch (error) {
        console.error('Error loading harvest requests:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadHarvestRequests()
  }, [])



  // Normalize request data for display
  const normalizedRequests = useMemo(() => {
    return harvestRequests.map((request) => {
      // Get product name(s) from products array or single product
      let productDisplayName = request.title || "Untitled Request"
      if (request.products && request.products.length > 0) {
        const productNames = request.products.map(p => p.name).join(", ")
        productDisplayName = productNames
      } else if (request.product && typeof request.product === 'object') {
        productDisplayName = request.product.name || request.title || "Unknown"
      } else if (request.product && typeof request.product === 'string') {
        productDisplayName = request.product
      }
      
      // Get address display
      const addressDisplay = request.address?.full_address || 
                            (request.address ? 
                              `${request.address.street_address}, ${request.address.city}, ${request.address.state} ${request.address.postal_code}` : 
                              "")
      
      return {
        id: request.id?.toString() || "",
        title: request.title || "Untitled Request",
        product: productDisplayName,
        products: request.products || [],
        quantity: request.products_count || 0,
        unit: request.products?.[0]?.unit?.name || "",
        requestedDate: request.date || request.requested_date || "",
        location: addressDisplay,
        notes: request.description || "",
        status: (() => {
          const status = request.status || "pending"
          const normalized = status.toLowerCase().trim()
          // Map backend statuses to display statuses
          if (normalized === "accepted") return "accepted"
          if (normalized === "cancelled") return "cancelled"
          if (normalized === "completed") return "completed"
          if (normalized === "pending") return "pending"
          return "pending" // Default fallback
        })(),
        createdAt: request.created_at || request.createdAt || "",
        number_of_people: request.number_of_people || 0,
        accepted_count: request.accepted_count || 0,
        store: request.store,
        address: request.address,
        originalRequest: request, // Keep reference to original for updates
      }
    })
  }, [harvestRequests])

  const filteredRequests = normalizedRequests.filter((request) => {
    const matchesSearch = 
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.product.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: normalizedRequests.length,
    pending: normalizedRequests.filter(r => r.status === "pending").length,
    accepted: normalizedRequests.filter(r => r.status === "accepted").length,
    completed: normalizedRequests.filter(r => r.status === "completed").length,
    cancelled: normalizedRequests.filter(r => r.status === "cancelled").length,
  }


  const handleViewDetails = (request: any) => {
    router.push(`/admin/harvest-requests/${request.id}`)
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      // Find the normalized request first
      const normalizedRequest = normalizedRequests.find(r => r.id === requestId)
      if (!normalizedRequest || !normalizedRequest.originalRequest) {
        toast.error("Request not found")
        return
      }

      const originalRequest = normalizedRequest.originalRequest
      const requestIdToUpdate = originalRequest.id || originalRequest.unique_id
      if (!requestIdToUpdate) {
        toast.error("Invalid request ID")
        return
      }

      await updateHarvestRequest(requestIdToUpdate, {
        status: newStatus as any,
      })

      // Refresh user's harvest requests
      const requests = await fetchUserHarvestRequests()
      setHarvestRequests(requests)
      
      // Close details modal if open
      if (selectedRequest && selectedRequest.id === requestId) {
        setShowDetailsModal(false)
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error('Error updating harvest request:', error)
      // Error is already handled in the API service with toast
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A5D31]" />
          <p className="text-gray-600">Loading harvest requests...</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Harvest Requests</h1>
          <p className="text-gray-500 mt-1 text-sm">{stats.total} total requests</p>
        </div>
        <Button 
          className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white gap-2"
          onClick={() => router.push('/admin/harvest-requests/new')}
        >
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Accepted</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.accepted}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Cancelled</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              placeholder="Search requests by ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 h-9 sm:h-10 border"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a] h-9 sm:h-10"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Harvest Requests ({filteredRequests.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Request ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Quantity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No harvest requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => {
                  const statusInfo = getStatusConfig(request.status)
                  const StatusIcon = statusInfo.icon
                  return (
                    <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-mono font-semibold text-gray-900">{safeString(request.id)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">{safeString(request.title)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">{safeString(request.product)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600">
                          {request.quantity} {request.unit}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {request.requestedDate}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={request.location}>
                          {request.location}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${statusInfo.color} gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {request.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(request.id, "accepted")}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              Accept
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Harvest Request Details - {selectedRequest.id}
              </DialogTitle>
              <DialogDescription className="pt-2">
                Created on {selectedRequest.createdAt}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Title</Label>
                <p className="font-semibold text-gray-900">{safeString(selectedRequest.title)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Products</Label>
                  <p className="font-semibold text-gray-900">{safeString(selectedRequest.product)}</p>
                  {selectedRequest.products && selectedRequest.products.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{selectedRequest.products.length} product(s)</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Date</Label>
                  <p className="font-semibold text-gray-900">{selectedRequest.requestedDate}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Location</Label>
                  <p className="font-semibold text-gray-900">{selectedRequest.location}</p>
                </div>
                {selectedRequest.number_of_people && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Number of People</Label>
                    <p className="font-semibold text-gray-900">{selectedRequest.number_of_people}</p>
                  </div>
                )}
              </div>

              {selectedRequest.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Description</Label>
                  <p className="text-gray-700">{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.status === "completed" && selectedRequest.quantity > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <Label className="text-green-800 text-sm font-semibold mb-2 block">Products Count</Label>
                  <p className="text-green-700 font-semibold">
                    {selectedRequest.quantity} product(s)
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="pt-6 gap-3 border-t border-gray-200 mt-6">
              {selectedRequest.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(selectedRequest.id, "cancelled")}
                    className="text-red-600 hover:text-red-700"
                  >
                    Cancel Request
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedRequest.id, "accepted")}
                    className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                  >
                    Accept Request
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </>
  )
}

