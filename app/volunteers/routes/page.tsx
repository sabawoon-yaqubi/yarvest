"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  MapPin,
  Navigation,
  Clock,
  Package,
  Route,
  Plus,
  Trash2,
  Edit,
  Search,
  Loader2,
  Calendar,
  DollarSign,
  User,
  Truck,
  AlertCircle
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getCourierOrders, type Order } from "@/lib/orders-api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface RouteStop {
  orderId: string
  address: string
  customer: string
  time?: string
  status: string
  deliveryFee: number
  order: Order
}

interface DeliveryRoute {
  id: string
  name: string
  date: string
  stops: RouteStop[]
  distance: number
  estimatedTime: string
  status: 'active' | 'saved' | 'completed'
  totalEarnings: number
}

// Calculate distance between two addresses (simplified - using lat/lng if available)
function calculateDistance(addr1: any, addr2: any): number {
  if (!addr1?.latitude || !addr2?.latitude || !addr1?.longitude || !addr2?.longitude) {
    // If no coordinates, return a random distance between 0.5-5 miles
    return Math.random() * 4.5 + 0.5
  }
  
  const R = 3959 // Earth's radius in miles
  const dLat = (addr2.latitude - addr1.latitude) * Math.PI / 180
  const dLon = (addr2.longitude - addr1.longitude) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(addr1.latitude * Math.PI / 180) * Math.cos(addr2.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Group orders into routes by date
function createRoutesFromOrders(orders: Order[]): DeliveryRoute[] {
  if (!orders || orders.length === 0) return []

  // Filter orders that are not cancelled
  const activeOrders = orders.filter(o => 
    o.status !== 'cancelled' && 
    (o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered' || o.status === 'pending')
  )

  // Group orders by date
  const ordersByDate = new Map<string, Order[]>()
  
  activeOrders.forEach(order => {
    // Use created_at or updated_at for date grouping since delivery_datetime may not be available
    const dateStr = order.delivery_datetime || order.created_at || order.updated_at
    const date = dateStr ? new Date(dateStr).toLocaleDateString() : new Date().toLocaleDateString()
    
    if (!ordersByDate.has(date)) {
      ordersByDate.set(date, [])
    }
    ordersByDate.get(date)!.push(order)
  })

  const routes: DeliveryRoute[] = []

  ordersByDate.forEach((dayOrders, date) => {
    if (dayOrders.length === 0) return

    // Sort orders by address proximity (simplified - just use order as-is for now)
    // In a real implementation, you'd use a routing algorithm like TSP
    
    const stops: RouteStop[] = dayOrders.map((order, index) => {
      const address = order.address?.full_address || 
        `${order.address?.street_address || ''}, ${order.address?.city || ''}, ${order.address?.state || ''}`.trim() ||
        order.shipping_address ||
        'Address not available'
      
      // Backend returns buyer with name property (concatenated first_name + last_name)
      const customer = order.buyer?.name || 
        order.customer?.full_name || 
        `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim() ||
        order.customer_name ||
        'Unknown Customer'

      // Calculate estimated time (30 minutes per stop + travel time)
      const baseTime = index * 30
      const hours = Math.floor(baseTime / 60)
      const minutes = baseTime % 60
      const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

      return {
        orderId: order.unique_id || `ORD-${order.id}`,
        address,
        customer,
        time: index === 0 ? '9:00 AM' : undefined, // Start time
        status: order.status,
        deliveryFee: parseFloat(String(order.delivery_fee || 0)),
        order
      }
    })

    // Calculate total distance (simplified - estimate 2 miles per stop)
    const distance = Math.max(dayOrders.length * 2, 5)
    
    // Calculate estimated time (30 min per stop + 15 min travel per stop)
    const totalMinutes = dayOrders.length * 45
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const estimatedTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

    // Calculate total earnings
    const totalEarnings = stops.reduce((sum, stop) => sum + stop.deliveryFee, 0)

    // Determine route status
    const allDelivered = dayOrders.every(o => o.status === 'delivered')
    const allCompleted = dayOrders.every(o => o.status === 'completed' || o.status === 'delivered')
    const status: 'active' | 'saved' | 'completed' = 
      allCompleted ? 'completed' : 
      allDelivered ? 'completed' : 
      'active'

    routes.push({
      id: `route-${date}-${dayOrders.length}`,
      name: `Route for ${date}`,
      date,
      stops,
      distance: Math.round(distance * 10) / 10,
      estimatedTime,
      status,
      totalEarnings
    })
  })

  // Sort routes by date (most recent first)
  return routes.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
}

export default function RoutesPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true)
      try {
        const courierOrders = await getCourierOrders()
        console.log('Loaded courier orders:', courierOrders)
        console.log('Sample order structure:', courierOrders[0])
        setOrders(courierOrders)
      } catch (error) {
        console.error('Error loading orders:', error)
        toast.error('Failed to load delivery orders')
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [])

  const routes = useMemo(() => {
    console.log('Creating routes from orders:', orders)
    const createdRoutes = createRoutesFromOrders(orders)
    console.log('Created routes:', createdRoutes)
    return createdRoutes
  }, [orders])

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch = 
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.stops.some(stop => 
        stop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stop.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stop.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesSearch
  })

  const stats = {
    totalRoutes: routes.length,
    activeRoutes: routes.filter(r => r.status === 'active').length,
    completedRoutes: routes.filter(r => r.status === 'completed').length,
    totalStops: routes.reduce((sum, r) => sum + r.stops.length, 0),
    totalEarnings: routes.reduce((sum, r) => sum + r.totalEarnings, 0),
  }

  const handleStartRoute = (route: DeliveryRoute) => {
    // Open navigation or route planning
    toast.success(`Starting route: ${route.name}`)
    // In a real implementation, this would open Google Maps or a navigation app
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#5a9c3a]" />
          <p className="text-gray-600">Loading routes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Delivery Routes</h1>
          <p className="text-gray-500 mt-1 text-sm">Plan and optimize your delivery routes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Total Routes</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalRoutes}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeRoutes}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completedRoutes}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Total Stops</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalStops}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
          <p className="text-2xl font-bold text-[#5a9c3a]">${stats.totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search routes by name, date, address, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      {filteredRoutes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Route className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No routes found</p>
          <p className="text-gray-400 text-sm">
            {orders.length === 0 
              ? "Accept delivery requests to see routes here"
              : "No routes match your search criteria"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRoutes.map((route) => (
            <Card key={route.id} className="border-2 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Route className="w-5 h-5 text-[#5a9c3a]" />
                    {route.name}
                  </CardTitle>
                  <Badge className={
                    route.status === "active" ? "bg-green-500 text-white" : 
                    route.status === "completed" ? "bg-blue-500 text-white" :
                    "bg-gray-500 text-white"
                  }>
                    {route.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{route.date}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Stops</p>
                    <p className="text-lg font-bold text-gray-900">{route.stops.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Distance</p>
                    <p className="text-lg font-bold text-gray-900">{route.distance} mi</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Time</p>
                    <p className="text-lg font-bold text-gray-900">{route.estimatedTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">
                    Earnings: ${route.totalEarnings.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Stops:</p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {route.stops.map((stop, index) => (
                      <div 
                        key={stop.orderId} 
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => handleViewOrder(stop.orderId)}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          stop.status === 'delivered' || stop.status === 'completed' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-[#5a9c3a] text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{stop.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500 truncate">{stop.customer}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${
                              stop.status === 'delivered' || stop.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : stop.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {stop.status}
                            </Badge>
                            <span className="text-xs text-gray-500">${stop.deliveryFee.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  {route.status === 'active' && (
                    <Button 
                      className="flex-1 bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                      onClick={() => handleStartRoute(route)}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Start Route
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedRoute(route)
                      setShowDetailsModal(true)
                    }}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Route Details Modal */}
      {selectedRoute && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Route className="w-5 h-5 text-[#5a9c3a]" />
                {selectedRoute.name}
              </DialogTitle>
              <DialogDescription className="pt-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedRoute.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {selectedRoute.stops.length} stops
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    {selectedRoute.distance} mi
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedRoute.estimatedTime}
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-800">Total Route Earnings</span>
                  <span className="text-2xl font-bold text-green-700">
                    ${selectedRoute.totalEarnings.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Route Stops</h3>
                {selectedRoute.stops.map((stop, index) => (
                  <div 
                    key={stop.orderId}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      handleViewOrder(stop.orderId)
                      setShowDetailsModal(false)
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        stop.status === 'delivered' || stop.status === 'completed' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-[#5a9c3a] text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 mb-1">Order: {stop.orderId}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <User className="w-4 h-4" />
                              <span>{stop.customer}</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{stop.address}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={
                              stop.status === 'delivered' || stop.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : stop.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {stop.status}
                            </Badge>
                            <span className="text-sm font-semibold text-[#5a9c3a]">
                              ${stop.deliveryFee.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4 gap-3 border-t mt-6">
              {selectedRoute.status === 'active' && (
                <Button 
                  className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                  onClick={() => {
                    handleStartRoute(selectedRoute)
                    setShowDetailsModal(false)
                  }}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Start Route
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
