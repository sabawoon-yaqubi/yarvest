"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingCart
} from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { fetchOrders, updateOrderStatus, transformOrder, type Order } from "@/lib/orders-api"


const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [transformedOrders, setTransformedOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

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
    processing: transformedOrders.filter(o => o.status === "processing").length,
    shipped: transformedOrders.filter(o => o.status === "shipped").length,
    delivered: transformedOrders.filter(o => o.status === "delivered").length,
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
    setSelectedOrder(order)
    setShowDetailsModal(true)
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">Manage and track customer orders</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Orders
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-2 border-gray-100">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
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
            <p className="text-sm text-gray-500 mb-1">Processing</p>
            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-gray-100">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Shipped</p>
            <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-gray-100">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-gray-100">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-[#0A5D31]">${stats.revenue.toFixed(2)}</p>
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
                placeholder="Search orders by ID, customer, or email..."
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
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-2 border-gray-100">
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {order.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, "processing")}
                                className="text-blue-600 hover:text-blue-700"
                                disabled={isUpdating}
                              >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Process"}
                              </Button>
                            )}
                            {order.status === "processing" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, "shipped")}
                                className="text-purple-600 hover:text-purple-700"
                                disabled={isUpdating}
                              >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ship"}
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
        </CardContent>
      </Card>

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
              {selectedOrder.status === "pending" && (
                <Button
                  onClick={() => handleStatusUpdate(selectedOrder.id, "processing")}
                  className="bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#0A5D31] text-white h-9 px-6 text-sm font-semibold"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Mark as Processing"
                  )}
                </Button>
              )}
              {selectedOrder.status === "processing" && (
                <Button
                  onClick={() => handleStatusUpdate(selectedOrder.id, "shipped")}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-600 text-white h-9 px-6 text-sm font-semibold"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Mark as Shipped"
                  )}
                </Button>
              )}
              {selectedOrder.status === "shipped" && (
                <Button
                  onClick={() => handleStatusUpdate(selectedOrder.id, "delivered")}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-600 text-white h-9 px-6 text-sm font-semibold"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Mark as Delivered"
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

