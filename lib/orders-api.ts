// lib/orders-api.ts
// API service for order-related operations

import api from './axios'
import { toast } from 'sonner'

export interface OrderItem {
  id: number
  product_id?: number
  product_name?: string
  quantity: number
  price: string | number
  discount?: string | number
  total: string | number
  product?: {
    id: number
    unique_id?: string
    name: string
    main_image?: string | null
    unit?: {
      id: number
      unique_id?: string
      name: string
    }
  }
}

export interface Order {
  id: number
  unique_id?: string
  order_id?: string
  user_id?: number
  customer?: {
    id: number
    unique_id?: string
    full_name?: string
    first_name?: string
    last_name?: string
    email: string
    phone?: string
    image?: string | null
  }
  customer_name?: string
  email?: string
  phone?: string
  items: OrderItem[] | { [key: string]: OrderItem } // Can be array or object with numeric keys
  items_count?: number
  subtotal?: string | number
  service_fee?: string | number
  delivery_fee?: string | number
  tax?: string | number
  total: number | string
  total_price?: string | number // Backend uses total_price
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
  payment_type?: string
  shipping_address?: string
  delivery_type?: string
  delivery_options?: string
  delivery_datetime?: string
  address?: {
    id?: number
    street_address: string
    city: string
    state: string
    country: string
    postal_code: string
    apt?: string
    business_name?: string
    full_address?: string
  }
  tracking_number?: string
  courier?: any
  courier_type?: string
  created_at: string
  updated_at: string
  date?: string
}

export interface UpdateOrderStatusPayload {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}

/**
 * Fetch all orders for the authenticated user (seller)
 */
export async function fetchOrders(): Promise<Order[]> {
  try {
    const response = await api.get('/orders')
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    const errorMessage = error.response?.data?.message || 'Failed to fetch orders'
    toast.error(errorMessage)
    return []
  }
}

/**
 * Fetch a single order by uniqueId
 */
export async function fetchOrder(uniqueId: string): Promise<Order | null> {
  try {
    const response = await api.get(`/orders/${uniqueId}`)
    // Handle different response structures
    const order = response.data?.data || response.data
    return order
  } catch (error: any) {
    console.error('Error fetching order:', error)
    const errorMessage = error.response?.data?.message || 'Failed to fetch order'
    toast.error(errorMessage)
    return null
  }
}

/**
 * Update order status by uniqueId
 */
export async function updateOrderStatus(
  uniqueId: string,
  payload: UpdateOrderStatusPayload
): Promise<Order | null> {
  try {
    const response = await api.put(`/orders/${uniqueId}/status`, payload)
    // Handle different response structures
    const order = response.data?.data || response.data
    toast.success(response.data?.message || 'Order status updated successfully')
    return order
  } catch (error: any) {
    console.error('Error updating order status:', error)
    const errorMessage = error.response?.data?.message || 'Failed to update order status'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Transform API order to frontend format
 */
export function transformOrder(order: Order): any {
  // Format customer name - handle both full_name and first_name/last_name
  let customerName = 'Unknown Customer'
  if (order.customer) {
    if (order.customer.full_name) {
      customerName = order.customer.full_name
    } else if (order.customer.first_name || order.customer.last_name) {
      customerName = `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
    }
  } else if (order.customer_name) {
    customerName = order.customer_name
  }
  
  // Format email
  const email = order.customer?.email || order.email || ''
  
  // Format phone
  const phone = order.customer?.phone || order.phone || ''
  
  // Format shipping address - use full_address if available, otherwise build from parts
  let shippingAddress = order.shipping_address || ''
  if (!shippingAddress && order.address) {
    if (order.address.full_address) {
      shippingAddress = order.address.full_address
    } else {
      const addr = order.address
      const parts = [
        addr.street_address,
        addr.apt && `Apt ${addr.apt}`,
        addr.city,
        addr.state,
        addr.postal_code,
        addr.country
      ].filter(Boolean)
      shippingAddress = parts.join(', ')
    }
  }
  
  // Format date
  const date = order.date || order.created_at
  const formattedDate = date ? new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) : ''
  
  // Format order ID
  const orderId = order.unique_id || order.order_id || `ORD-${order.id.toString().padStart(3, '0')}`
  
  // Transform items - handle both array and object with numeric keys
  let itemsArray: OrderItem[] = []
  if (Array.isArray(order.items)) {
    itemsArray = order.items
  } else if (order.items && typeof order.items === 'object') {
    // Handle object with numeric keys (e.g., { "3": {...}, "5": {...} })
    itemsArray = Object.values(order.items)
  }
  
  // Convert string numbers to actual numbers and format items
  const items = itemsArray.map(item => {
    const price = typeof item.price === 'string' 
      ? parseFloat(item.price.replace(/,/g, '')) || 0 
      : (typeof item.price === 'number' ? item.price : 0)
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0
    const itemTotal = typeof item.total === 'string'
      ? parseFloat(item.total.replace(/,/g, '')) || 0
      : (typeof item.total === 'number' ? item.total : (price * quantity))
    
    return {
      name: item.product_name || item.product?.name || 'Unknown Product',
      quantity,
      price,
      total: itemTotal
    }
  })
  
  // Calculate total - use total_price if available, otherwise total, or calculate from items
  let orderTotal: number
  if (order.total_price !== undefined && order.total_price !== null) {
    orderTotal = typeof order.total_price === 'string'
      ? parseFloat(String(order.total_price).replace(/,/g, '')) || 0
      : (typeof order.total_price === 'number' ? order.total_price : 0)
  } else if (order.total !== undefined && order.total !== null) {
    orderTotal = typeof order.total === 'string'
      ? parseFloat(String(order.total).replace(/,/g, '')) || 0
      : (typeof order.total === 'number' ? order.total : 0)
  } else {
    // Calculate from items if total is missing
    orderTotal = items.reduce((sum, item) => {
      const itemTotal = typeof item.total === 'number' ? item.total : 0
      return sum + itemTotal
    }, 0)
  }
  
  return {
    id: orderId,
    originalId: order.id, // Keep original numeric ID for API calls
    customer: customerName,
    email,
    phone,
    items,
    total: orderTotal,
    status: order.status,
    paymentStatus: order.payment_status || order.payment_type || 'pending',
    date: formattedDate,
    shippingAddress,
    trackingNumber: order.tracking_number,
    originalOrder: order // Keep original for API calls
  }
}
