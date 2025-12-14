"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Printer,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Calendar,
  CreditCard,
  UserCheck,
  Star,
  Search
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { fetchOrder, acceptOrder, rejectOrder, requestCourier, getOrderCourierRequests, type Order } from "@/lib/orders-api"
import { getImageUrl } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import api from "@/lib/axios"

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
}

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [acceptNote, setAcceptNote] = useState("")
  const [shareAddress, setShareAddress] = useState(false)
  const [sharePhone, setSharePhone] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [showCourierModal, setShowCourierModal] = useState(false)
  const [courierRequests, setCourierRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [requestNotes, setRequestNotes] = useState("")
  const [requestingCourier, setRequestingCourier] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true)
      try {
        const orderData = await fetchOrder(orderId)
        setOrder(orderData)
      } catch (error) {
        console.error('Error loading order:', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const handleAcceptClick = () => {
    setAcceptNote("")
    setShareAddress(false)
    setSharePhone(false)
    setShowAcceptModal(true)
  }

  const handleRejectClick = () => {
    setRejectReason("")
    setShowRejectModal(true)
  }

  useEffect(() => {
    const loadCourierRequests = async () => {
      if (!order) return
      
      setLoadingRequests(true)
      try {
        const uniqueId = order.unique_id || orderId
        const requests = await getOrderCourierRequests(uniqueId)
        setCourierRequests(requests)
      } catch (error) {
        console.error('Error loading courier requests:', error)
      } finally {
        setLoadingRequests(false)
      }
    }
    if (order) {
      loadCourierRequests()
    }
  }, [order, orderId])

  const handleRequestCourier = () => {
    setRequestNotes("")
    setShowCourierModal(true)
  }

  const handleCreateCourierRequest = async () => {
    if (!order) return
    
    setRequestingCourier(true)
    try {
      const uniqueId = order.unique_id || orderId
      await requestCourier(uniqueId, requestNotes)
      
      // Refresh order and requests
      const orderData = await fetchOrder(orderId)
      setOrder(orderData)
      
      const requests = await getOrderCourierRequests(uniqueId)
      setCourierRequests(requests)
      
      setShowCourierModal(false)
      setRequestNotes("")
    } catch (error) {
      console.error('Error creating courier request:', error)
    } finally {
      setRequestingCourier(false)
    }
  }

  const handleAcceptOrder = async () => {
    if (!order) return
    
    setIsUpdating(true)
    try {
      const uniqueId = order.unique_id || orderId
      await acceptOrder(uniqueId, {
        note: acceptNote,
        share_address: shareAddress,
        share_phone: sharePhone,
      })
      
      // Refresh order
      const orderData = await fetchOrder(orderId)
      setOrder(orderData)
      
      setShowAcceptModal(false)
      toast.success("Order accepted successfully", { duration: 3000 })
    } catch (error) {
      console.error('Error accepting order:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRejectOrder = async () => {
    if (!order) return
    
    setIsUpdating(true)
    try {
      const uniqueId = order.unique_id || orderId
      await rejectOrder(uniqueId, {
        reason: rejectReason,
      })
      
      // Refresh order
      const orderData = await fetchOrder(orderId)
      setOrder(orderData)
      
      setShowRejectModal(false)
      toast.success("Order rejected successfully", { duration: 3000 })
    } catch (error) {
      console.error('Error rejecting order:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePrint = () => {
    if (!order) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order ${order.unique_id || orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #5a9c3a; border-bottom: 2px solid #5a9c3a; padding-bottom: 10px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: 600; }
          .total { font-size: 20px; font-weight: bold; color: #5a9c3a; }
          .info-row { margin: 8px 0; }
          .info-label { font-weight: 600; display: inline-block; width: 150px; }
        </style>
      </head>
      <body>
        <h1>Order ${order.unique_id || orderId}</h1>
        
        <div class="section">
          <h2>Customer Information</h2>
          <div class="info-row"><span class="info-label">Name:</span> ${order.customer?.full_name || order.customer_name || 'N/A'}</div>
          <div class="info-row"><span class="info-label">Email:</span> ${order.customer?.email || order.email || 'N/A'}</div>
          ${order.customer?.phone || order.phone ? `<div class="info-row"><span class="info-label">Phone:</span> ${order.customer?.phone || order.phone}</div>` : ''}
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
              ${Array.isArray(order.items) ? order.items.map((item: any) => `
                <tr>
                  <td>${item.product?.name || item.name || 'Unknown Product'}</td>
                  <td>${item.quantity || 0}</td>
                  <td>$${typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')).toFixed(2) : (item.price || 0).toFixed(2)}</td>
                  <td>$${typeof item.total === 'string' ? parseFloat(item.total.replace(/,/g, '')).toFixed(2) : (item.total || 0).toFixed(2)}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Order Summary</h2>
          <div class="info-row"><span class="info-label">Subtotal:</span> $${order.subtotal || '0.00'}</div>
          ${order.service_fee ? `<div class="info-row"><span class="info-label">Service Fee:</span> $${typeof order.service_fee === 'string' ? parseFloat(order.service_fee.replace(/,/g, '')).toFixed(2) : (order.service_fee || 0).toFixed(2)}</div>` : ''}
          ${order.delivery_fee ? `<div class="info-row"><span class="info-label">Delivery Fee:</span> $${typeof order.delivery_fee === 'string' ? parseFloat(order.delivery_fee.replace(/,/g, '')).toFixed(2) : (order.delivery_fee || 0).toFixed(2)}</div>` : ''}
          ${order.tax ? `<div class="info-row"><span class="info-label">Tax:</span> $${typeof order.tax === 'string' ? parseFloat(order.tax.replace(/,/g, '')).toFixed(2) : (order.tax || 0).toFixed(2)}</div>` : ''}
          <div class="info-row total"><span class="info-label">Total:</span> $${typeof order.total_price === 'string' ? parseFloat(order.total_price.replace(/,/g, '')).toFixed(2) : (typeof order.total === 'number' ? order.total : parseFloat(String(order.total || 0))).toFixed(2)}</div>
        </div>

        <div class="section">
          <h2>Order Information</h2>
          <div class="info-row"><span class="info-label">Status:</span> ${order.status}</div>
          <div class="info-row"><span class="info-label">Payment Type:</span> ${order.payment_type || 'N/A'}</div>
          <div class="info-row"><span class="info-label">Delivery Type:</span> ${order.delivery_type || 'N/A'}</div>
          <div class="info-row"><span class="info-label">Date:</span> ${order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</div>
        </div>

        ${order.address ? `
        <div class="section">
          <h2>Delivery Address</h2>
          <p>${order.address.full_address || `${order.address.street_address || ''}, ${order.address.city || ''}, ${order.address.state || ''} ${order.address.postal_code || ''}, ${order.address.country || ''}`}</p>
        </div>
        ` : ''}
      </body>
      </html>
    `
    // Add close button and auto-close functionality
    const closeButtonScript = `
      <script>
        window.addEventListener('load', function() {
          const closeBtn = document.createElement('button');
          closeBtn.textContent = 'Close';
          closeBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 10px 20px; background: #5a9c3a; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; z-index: 9999;';
          closeBtn.onclick = function() { window.close(); };
          document.body.appendChild(closeBtn);
          
          // Auto-close after print
          window.addEventListener('afterprint', function() {
            setTimeout(function() { window.close(); }, 500);
          });
        });
      </script>
    `
    
    printWindow.document.write(printContent + closeButtonScript)
    printWindow.document.close()
    printWindow.print()
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#5a9c3a]" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-20">
          <p className="text-gray-500">Order not found</p>
        </div>
      </div>
    )
  }

  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
  const itemsArray = Array.isArray(order.items) ? order.items : (order.items && typeof order.items === 'object' ? Object.values(order.items) : [])

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="-ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Order #{order.unique_id || orderId}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${statusConfig[order.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'} gap-2 px-4 py-2 text-sm`}>
              <StatusIcon className="w-4 h-4" />
              {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
            </Badge>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Accept/Reject Actions - Prominent */}
      {order.status === "pending" && (
        <div className="bg-gradient-to-r from-green-50 to-red-50 border-2 border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Order Action Required</h3>
              <p className="text-sm text-gray-600">This order is pending your approval. Please accept or reject it.</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={handleAcceptClick}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 px-6 py-2.5 flex-1 sm:flex-none"
                size="lg"
              >
                <CheckCircle className="w-5 h-5" />
                Accept Order
              </Button>
              <Button
                onClick={handleRejectClick}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50 gap-2 px-6 py-2.5 flex-1 sm:flex-none"
                size="lg"
              >
                <XCircle className="w-5 h-5" />
                Reject Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Information - Prominent */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Buyer Information</h2>
            <p className="text-sm text-gray-500">Customer details for this order</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                <p className="text-base font-semibold text-gray-900">
                  {order.customer?.full_name || order.customer_name || 'Unknown Customer'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                <Mail className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                <p className="text-base text-gray-900 break-all">
                  {order.customer?.email || order.email || 'N/A'}
                </p>
              </div>
            </div>
            {(order.customer?.phone || order.phone) && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                  <Phone className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                  <p className="text-base text-gray-900">
                    {order.customer?.phone || order.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
          {order.address && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Address</p>
                  <div className="text-base text-gray-900 space-y-1">
                    {order.address.street_address && <p>{order.address.street_address}</p>}
                    {order.address.apt && <p className="text-sm text-gray-600">Apt: {order.address.apt}</p>}
                    <p>
                      {order.address.city}, {order.address.state} {order.address.postal_code}
                    </p>
                    {order.address.country && <p>{order.address.country}</p>}
                    {order.address.business_name && (
                      <p className="font-semibold mt-2 text-[#5a9c3a]">{order.address.business_name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Items ({itemsArray.length})
            </h2>
            <div className="space-y-4">
              {itemsArray.map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#5a9c3a] transition-colors">
                  {item.product?.main_image && (
                    <img
                      src={getImageUrl(item.product.main_image)}
                      alt={item.product.name || 'Product'}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {item.product?.name || item.name || 'Unknown Product'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Quantity: {item.quantity || 0}
                      {item.product?.unit?.name && ` • ${item.product.unit.name}`}
                    </p>
                    <p className="text-xl font-bold text-[#5a9c3a] mt-3">
                      ${typeof item.total === 'string' ? parseFloat(item.total.replace(/,/g, '')).toFixed(2) : (item.total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">${order.subtotal || '0.00'}</span>
              </div>
              {order.service_fee && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-semibold text-gray-900">
                    ${typeof order.service_fee === 'string' ? parseFloat(order.service_fee.replace(/,/g, '')).toFixed(2) : (order.service_fee || 0).toFixed(2)}
                  </span>
                </div>
              )}
              {order.delivery_fee && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold text-gray-900">
                    ${typeof order.delivery_fee === 'string' ? parseFloat(order.delivery_fee.replace(/,/g, '')).toFixed(2) : (order.delivery_fee || 0).toFixed(2)}
                  </span>
                </div>
              )}
              {order.tax && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-900">
                    ${typeof order.tax === 'string' ? parseFloat(order.tax.replace(/,/g, '')).toFixed(2) : (order.tax || 0).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#5a9c3a]">
                    ${typeof order.total_price === 'string' 
                      ? parseFloat(order.total_price.replace(/,/g, '')).toFixed(2) 
                      : (typeof order.total === 'number' ? order.total : parseFloat(String(order.total || 0))).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Type</p>
                  <p className="text-base font-semibold text-gray-900">{order.delivery_type || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Type</p>
                  <p className="text-base font-semibold text-gray-900">{order.payment_type || 'N/A'}</p>
                </div>
              </div>
              {order.delivery_datetime && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Date</p>
                    <p className="text-base font-semibold text-gray-900">{new Date(order.delivery_datetime).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Courier Request Section */}
          {(order.delivery_type?.toLowerCase() === 'delivery' || order.delivery_type?.toLowerCase() === 'pickup') && 
           ['confirmed', 'processing', 'pending'].includes(order.status) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Courier Request
                </h2>
                {order.courier ? (
                  <Badge className="bg-green-100 text-green-800">
                    <UserCheck className="w-3 h-3 mr-1" />
                    Assigned
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleRequestCourier}
                    className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                    disabled={courierRequests.some((r: any) => r.status === 'pending' || r.status === 'accepted')}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Request Courier
                  </Button>
                )}
              </div>
              
              {order.courier ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{order.courier.name || order.courier.first_name + ' ' + order.courier.last_name}</p>
                      {order.courier.email && (
                        <p className="text-sm text-gray-600">{order.courier.email}</p>
                      )}
                      {order.courier.phone && (
                        <p className="text-sm text-gray-600">{order.courier.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {loadingRequests ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-[#5a9c3a]" />
                    </div>
                  ) : courierRequests.length > 0 ? (
                    <div className="space-y-2">
                      {courierRequests.map((req: any) => (
                        <div
                          key={req.id}
                          className={`p-3 border rounded-lg ${
                            req.status === 'accepted' ? 'bg-green-50 border-green-200' :
                            req.status === 'rejected' ? 'bg-red-50 border-red-200' :
                            'bg-yellow-50 border-yellow-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge className={
                                req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                              </Badge>
                              {req.courier && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Accepted by: {req.courier.name}
                                </p>
                              )}
                              {req.notes && (
                                <p className="text-xs text-gray-500 mt-1">{req.notes}</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              {new Date(req.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No courier request yet. Click "Request Courier" to create one.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Accept Order Modal */}
      <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>Accept Order</DialogTitle>
            <DialogDescription>
              Accept order {order.unique_id || orderId} and send confirmation to the buyer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4 pb-4">
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
              Reject order {order.unique_id || orderId}. The buyer will be notified via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4 pb-4">
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

      {/* Request Courier Modal */}
      <Dialog open={showCourierModal} onOpenChange={setShowCourierModal}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Request Courier for Delivery
            </DialogTitle>
            <DialogDescription>
              Create a courier request for order {order.unique_id || orderId}. Available couriers will be able to accept this request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or notes for the courier..."
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Once you create this request, all available couriers will be able to see and accept it. The first courier to accept will be assigned to this delivery.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCourierModal(false)
                setRequestNotes("")
              }}
              disabled={requestingCourier}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCourierRequest}
              disabled={requestingCourier}
              className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
            >
              {requestingCourier ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Request...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Create Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

