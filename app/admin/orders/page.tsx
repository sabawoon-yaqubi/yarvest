"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  ShoppingCart,
  Printer
} from "lucide-react"
import { useState, useEffect, Fragment } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { fetchOrders, updateOrderStatus, transformOrder, acceptOrder, rejectOrder, type Order } from "@/lib/orders-api"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"


const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [transformedOrders, setTransformedOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [acceptNote, setAcceptNote] = useState("")
  const [shareAddress, setShareAddress] = useState(false)
  const [sharePhone, setSharePhone] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  // Fetch orders on mount
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true)
      try {
        const fetchedOrders = await fetchOrders()
        setOrders(fetchedOrders)
        // Transform orders for display
        const transformed = fetchedOrders.map(order => transformOrder(order))
        setTransformedOrders(transformed)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [])

  const filteredOrders = transformedOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: transformedOrders.length,
    pending: transformedOrders.filter(o => o.status === "pending").length,
    confirmed: transformedOrders.filter(o => o.status === "confirmed").length,
    processing: transformedOrders.filter(o => o.status === "processing").length,
    shipped: transformedOrders.filter(o => o.status === "shipped").length,
    delivered: transformedOrders.filter(o => o.status === "delivered").length,
    completed: transformedOrders.filter(o => o.status === "completed").length,
    revenue: transformedOrders.filter(o => o.status !== "cancelled").reduce((sum, o) => {
      const orderTotal = typeof o.total === 'number' ? o.total : parseFloat(String(o.total)) || 0
      return sum + orderTotal
    }, 0),
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      // Find the order to get the uniqueId
      const order = transformedOrders.find(o => o.id === orderId)
      if (!order) {
        console.error('Order not found')
        return
      }

      // Use the uniqueId (stored as id in transformed order) for API calls
      const uniqueId = order.id // This is already the uniqueId from transformOrder
      await updateOrderStatus(uniqueId, { status: newStatus as any })
      
      // Refresh orders
      const fetchedOrders = await fetchOrders()
      setOrders(fetchedOrders)
      const transformed = fetchedOrders.map(o => transformOrder(o))
      setTransformedOrders(transformed)
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        const updated = transformed.find(o => o.id === orderId)
        if (updated) setSelectedOrder(updated)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      // Error is already handled in the API service with toast
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewDetails = (order: any) => {
    router.push(`/admin/orders/${order.originalOrder?.unique_id || order.id}`)
  }

  const handleAcceptClick = (order: any) => {
    setSelectedOrder(order)
    setAcceptNote("")
    setShareAddress(false)
    setSharePhone(false)
    setShowAcceptModal(true)
  }

  const handleRejectClick = (order: any) => {
    setSelectedOrder(order)
    setRejectReason("")
    setShowRejectModal(true)
  }

  const handleAcceptOrder = async () => {
    if (!selectedOrder) return
    
    setIsUpdating(true)
    try {
      const uniqueId = selectedOrder.originalOrder?.unique_id || selectedOrder.id
      await acceptOrder(uniqueId, {
        note: acceptNote,
        share_address: shareAddress,
        share_phone: sharePhone,
      })
      
      // Refresh orders
      const fetchedOrders = await fetchOrders()
      setOrders(fetchedOrders)
      const transformed = fetchedOrders.map(o => transformOrder(o))
      setTransformedOrders(transformed)
      
      setShowAcceptModal(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error accepting order:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRejectOrder = async () => {
    if (!selectedOrder) return
    
    setIsUpdating(true)
    try {
      const uniqueId = selectedOrder.originalOrder?.unique_id || selectedOrder.id
      await rejectOrder(uniqueId, {
        reason: rejectReason,
      })
      
      // Refresh orders
      const fetchedOrders = await fetchOrders()
      setOrders(fetchedOrders)
      const transformed = fetchedOrders.map(o => transformOrder(o))
      setTransformedOrders(transformed)
      
      setShowRejectModal(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error rejecting order:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePrint = (order: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const orderData = order.originalOrder || order
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #5a9c3a; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <h1>Order ${order.id}</h1>
        <div class="section">
          <h2>Customer Information</h2>
          <p><strong>Name:</strong> ${order.customer}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
        </div>
        <div class="section">
          <h2>Order Items</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price?.toFixed(2) || '0.00'}</td>
                  <td>$${item.total?.toFixed(2) || '0.00'}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>
        <div class="section">
          <h2>Total: $${order.total?.toFixed(2) || '0.00'}</h2>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Date:</strong> ${order.date}</p>
        </div>
      </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A5D31]" />
          <p className="text-gray-600">Loading orders...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1 text-sm">{stats.total} total orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Confirmed</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-xl sm:text-2xl font-bold text-[#5a9c3a]">{stats.completed}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Processing</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Shipped</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.shipped}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Revenue</p>
          <p className="text-xl sm:text-2xl font-bold text-[#5a9c3a]">${stats.revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              placeholder="Search orders..."
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
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Orders ({filteredOrders.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
                    return (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="font-mono font-semibold text-gray-900">{order.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.customer}</p>
                            <p className="text-sm text-gray-500">{order.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            {order.items?.length || 0} item(s)
                          </div>
                        </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-900">${(typeof order.total === 'number' ? order.total : parseFloat(String(order.total)) || 0).toFixed(2)}</span>
                      </td>
                        <td className="py-4 px-4">
                          <Badge className={`${statusConfig[order.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {order.date}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                              disabled={isUpdating}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrint(order)}
                              title="Print Order"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            {order.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAcceptClick(order)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  disabled={isUpdating}
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRejectClick(order)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={isUpdating}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {(order.status === "confirmed" || order.status === "processing" || order.status === "shipped" || order.status === "delivered") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, "completed")}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                disabled={isUpdating}
                              >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark Completed"}
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

      <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>Accept Order</DialogTitle>
            <DialogDescription>
              Accept order {selectedOrder?.id} and send confirmation to the buyer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note for the buyer..."
                value={acceptNote}
                onChange={(e) => setAcceptNote(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-3">
              <Label>Share Contact Information</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share-address"
                  checked={shareAddress}
                  onChange={(e) => setShareAddress(e.target.checked)}
                />
                <Label htmlFor="share-address" className="font-normal cursor-pointer">
                  Share my address with buyer
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share-phone"
                  checked={sharePhone}
                  onChange={(e) => setSharePhone(e.target.checked)}
                />
                <Label htmlFor="share-phone" className="font-normal cursor-pointer">
                  Share my phone number with buyer
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAcceptModal(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptOrder}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Order Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Reject order {selectedOrder?.id}. The buyer will be notified via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectOrder}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0 gap-0 bg-white border-gray-200 shadow-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Header */}
            <DialogHeader className="px-6 pt-5 pb-4 bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] text-white">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Order Details - {selectedOrder.id}
              </DialogTitle>
              <DialogDescription className="text-gray-100 text-sm">
                Order placed on {selectedOrder.date}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-4 space-y-4">
              {/* Customer Information */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Customer Information
                </Label>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold text-gray-900">{selectedOrder.customer || 'Unknown Customer'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-700">{selectedOrder.email || 'No email provided'}</p>
                  </div>
                  {selectedOrder.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-700">{selectedOrder.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-4 h-4" />
                  Order Items
                </Label>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-semibold text-gray-900">{item.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity || 0}</p>
                        </div>
                        <p className="font-semibold text-gray-900">${(item.total || ((item.price || 0) * (item.quantity || 0))).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
                      No items found
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 bg-[#0A5D31]/10 rounded-lg border-2 border-[#0A5D31] mt-3">
                    <span className="font-bold text-gray-900 text-lg">Total</span>
                    <span className="font-bold text-[#0A5D31] text-2xl">${(selectedOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </Label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
              )}

              {/* Tracking Information */}
              {selectedOrder.trackingNumber && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4" />
                    Tracking Information
                  </Label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="font-mono text-gray-900">{selectedOrder.trackingNumber}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 gap-2">
              {(selectedOrder.status === "confirmed" || selectedOrder.status === "processing" || selectedOrder.status === "shipped" || selectedOrder.status === "delivered") && (
                <Button
                  onClick={() => handleStatusUpdate(selectedOrder.id, "completed")}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-600 text-white h-9 px-6 text-sm font-semibold"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Mark Completed"
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </>
  )
}

