"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Trash2,
  AlertTriangle
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  fetchUserHarvestRequests, 
  createHarvestRequest, 
  updateHarvestRequest, 
  deleteHarvestRequest,
  fetchHarvestRequest,
  fetchUserAddresses,
  type HarvestRequest,
  type Address
} from "@/lib/harvest-requests-api"
import { fetchUserProducts, type Product } from "@/lib/product-api"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [harvestRequests, setHarvestRequests] = useState<HarvestRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [formData, setFormData] = useState({
    product_ids: [] as number[],
    address_ids: [] as number[],
    date: "",
    number_of_people: "",
    description: "",
  })

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

  // Fetch products for the form dropdown
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await fetchUserProducts()
        setProducts(productsData)
      } catch (error) {
        console.error('Error loading products:', error)
      }
    }
    loadProducts()
  }, [])

  // Fetch addresses for the form dropdown
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const addressesData = await fetchUserAddresses()
        setAddresses(addressesData)
      } catch (error) {
        console.error('Error loading addresses:', error)
      }
    }
    loadAddresses()
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
  }, [harvestRequests, products])

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

  const handleSave = async () => {
    // Validation
    if (formData.product_ids.length === 0 || !formData.date || formData.address_ids.length === 0) {
      toast.error("Please fill in all required fields (products, addresses, and date)")
      return
    }

    try {
      const payload: any = {
        date: formData.date,
      }

      // Use product_ids if multiple, product_id if single
      if (formData.product_ids.length === 1) {
        payload.product_id = formData.product_ids[0]
      } else {
        payload.product_ids = formData.product_ids
      }

      // Use user_address_ids if multiple, user_address_id if single
      if (formData.address_ids.length === 1) {
        payload.user_address_id = formData.address_ids[0]
      } else {
        payload.user_address_ids = formData.address_ids
      }

      // Optional fields
      if (formData.number_of_people) {
        payload.number_of_people = Number(formData.number_of_people)
      }
      if (formData.description) {
        payload.description = formData.description
      }

      await createHarvestRequest(payload)
      
      // Refresh user's harvest requests
      const requests = await fetchUserHarvestRequests()
      setHarvestRequests(requests)
      
      setShowAddModal(false)
      setFormData({
        product_ids: [],
        address_ids: [],
        date: "",
        number_of_people: "",
        description: "",
      })
    } catch (error) {
      console.error('Error creating harvest request:', error)
      // Error is already handled in the API service with toast
    }
  }

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Harvest Requests</h1>
          <p className="text-gray-500 mt-1">Manage harvest requests and track harvesting activities</p>
        </div>
        <Button 
          className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-2 border-gray-100">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-gray-100">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-gray-100">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Accepted</p>
            <p className="text-2xl font-bold text-blue-600">{stats.accepted}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-gray-100">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-gray-100">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-gray-100">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search requests by ID or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#0A5D31] focus:border-[#0A5D31]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading harvest requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">No harvest requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => {
          const statusInfo = getStatusConfig(request.status)
          const StatusIcon = statusInfo.icon
          return (
            <Card key={request.id} className="border-2 border-gray-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-semibold text-gray-900">{safeString(request.id)}</span>
                  <Badge className={`${statusInfo.color} gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{safeString(request.title)}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{safeString(request.product)}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  <span className="font-semibold">{request.quantity} {request.unit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Requested: {request.requestedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{request.location}</span>
                </div>
                {request.status === "completed" && request.quantity > 0 && (
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      Products: {request.quantity} {request.unit && `(${request.unit})`}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewDetails(request)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  {request.status === "pending" && (
                    <Button
                      className="flex-1 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white"
                      onClick={() => handleStatusUpdate(request.id, "accepted")}
                    >
                      Accept
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      )}

      {/* Add Request Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0 gap-0 bg-white border-gray-200 shadow-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Header */}
          <DialogHeader className="px-6 pt-5 pb-4 bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] text-white">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              New Harvest Request
            </DialogTitle>
            <DialogDescription className="text-gray-100 text-sm">
              Create a new harvest request for your products
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            {/* Products Selection */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Products <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-white">
                {products.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No products available</p>
                ) : (
                  <div className="space-y-2">
                    {products.map((product) => {
                      const isSelected = formData.product_ids.includes(product.id)
                      return (
                        <label
                          key={product.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  product_ids: [...formData.product_ids, product.id],
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  product_ids: formData.product_ids.filter((id) => id !== product.id),
                                })
                              }
                            }}
                            className="w-4 h-4 text-[#0A5D31] border-gray-300 rounded focus:ring-[#0A5D31] focus:ring-2"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                            {product.sku && (
                              <span className="text-xs text-gray-500 ml-2">({product.sku})</span>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
              {formData.product_ids.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {formData.product_ids.length} product(s) selected
                </p>
              )}
            </div>

            {/* Addresses Selection */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Addresses <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-white">
                {addresses.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No addresses available</p>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((address) => {
                      const isSelected = formData.address_ids.includes(address.id)
                      const formatAddress = () => {
                        const parts = [
                          address.street_address,
                          address.apt && `Apt ${address.apt}`,
                          address.city,
                          address.state,
                          address.postal_code,
                        ].filter(Boolean)
                        return parts.join(", ")
                      }
                      return (
                        <label
                          key={address.id}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  address_ids: [...formData.address_ids, address.id],
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  address_ids: formData.address_ids.filter((id) => id !== address.id),
                                })
                              }
                            }}
                            className="w-4 h-4 mt-0.5 text-[#0A5D31] border-gray-300 rounded focus:ring-[#0A5D31] focus:ring-2"
                          />
                          <div className="flex-1">
                            {address.business_name && (
                              <span className="text-sm font-semibold text-gray-900 block mb-1">
                                {address.business_name}
                              </span>
                            )}
                            <span className="text-sm text-gray-700 block">{formatAddress()}</span>
                            {address.country && (
                              <span className="text-xs text-gray-500 block mt-0.5">{address.country}</span>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
              {formData.address_ids.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {formData.address_ids.length} address(es) selected
                </p>
              )}
            </div>

            {/* Harvest Date */}
            <div>
              <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                Harvest Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1.5 h-9 border-gray-200 focus:border-[#0A5D31] focus:ring-[#0A5D31] text-sm"
              />
            </div>

            {/* Number of People */}
            <div>
              <Label htmlFor="number_of_people" className="text-sm font-semibold text-gray-700">
                Number of People
              </Label>
              <Input
                id="number_of_people"
                type="number"
                value={formData.number_of_people}
                onChange={(e) => setFormData({ ...formData, number_of_people: e.target.value })}
                placeholder="Optional"
                min="1"
                className="mt-1.5 h-9 border-gray-200 focus:border-[#0A5D31] focus:ring-[#0A5D31] text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details or instructions..."
                rows={3}
                className="mt-1.5 w-full p-2.5 border border-gray-200 focus:ring-2 focus:ring-[#0A5D31] focus:border-[#0A5D31] resize-none text-sm rounded-md"
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="h-9 px-4 text-sm border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#0A5D31] text-white h-9 px-6 text-sm font-semibold"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0 gap-0 bg-white border-gray-200 shadow-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Header */}
            <DialogHeader className="px-6 pt-5 pb-4 bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] text-white">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Harvest Request Details - {selectedRequest.id}
              </DialogTitle>
              <DialogDescription className="text-gray-100 text-sm">
                Created on {selectedRequest.createdAt}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-4 space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Title</Label>
                <p className="font-semibold text-gray-900 mt-1">{safeString(selectedRequest.title)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Products</Label>
                  <p className="font-semibold text-gray-900 mt-1">{safeString(selectedRequest.product)}</p>
                  {selectedRequest.products && selectedRequest.products.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{selectedRequest.products.length} product(s)</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Date</Label>
                  <p className="font-semibold text-gray-900 mt-1">{selectedRequest.requestedDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Location</Label>
                  <p className="font-semibold text-gray-900 mt-1">{selectedRequest.location}</p>
                </div>
                {selectedRequest.number_of_people && (
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Number of People</Label>
                    <p className="font-semibold text-gray-900 mt-1">{selectedRequest.number_of_people}</p>
                  </div>
                )}
              </div>

              {selectedRequest.notes && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Description</Label>
                  <p className="text-gray-700 mt-1.5 w-full p-2.5 border border-gray-200 rounded-md bg-gray-50">{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.status === "completed" && selectedRequest.quantity > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <Label className="text-green-800 text-sm font-semibold">Products Count</Label>
                  <p className="text-green-700 font-semibold mt-1">
                    {selectedRequest.quantity} product(s)
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 gap-2">
              {selectedRequest.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(selectedRequest.id, "cancelled")}
                    className="h-9 px-4 text-sm border-gray-300 hover:bg-gray-100 text-red-600"
                  >
                    Cancel Request
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedRequest.id, "accepted")}
                    className="bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#0A5D31] text-white h-9 px-6 text-sm font-semibold"
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
  )
}

