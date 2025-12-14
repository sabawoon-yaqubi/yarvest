"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Clock,
  MapPin,
  Package,
  Leaf,
  Truck,
  User,
  Mail,
  Phone,
  DollarSign,
  Users,
  Loader2,
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { fetchCourierRequests } from "@/lib/courier-requests-api"
import { fetchMyHarvestOffers, type HarvestRequest } from "@/lib/harvest-requests-api"
import { useRouter } from "next/navigation"
import { getImageUrl } from "@/lib/utils"

interface ScheduleActivity {
  id: string
  type: 'delivery' | 'harvest'
  title: string
  date: string
  time?: string
  location: string
  status: string
  data: any
  priority?: 'high' | 'normal' | 'low'
}

export default function SchedulePage() {
  const router = useRouter()
  const [courierRequests, setCourierRequests] = useState<any[]>([])
  const [harvestRequests, setHarvestRequests] = useState<HarvestRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState<ScheduleActivity | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true)
      try {
        // Load accepted courier requests
        const acceptedDeliveries = await fetchCourierRequests('accepted')
        setCourierRequests(acceptedDeliveries)

        // Load harvest requests where user has offered help
        const myHarvestOffers = await fetchMyHarvestOffers()
        setHarvestRequests(myHarvestOffers)
      } catch (error) {
        console.error('Error loading activities:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadActivities()
  }, [])

  // Combine and transform activities
  const activities = useMemo(() => {
    const combined: ScheduleActivity[] = []

    // Add deliveries
    courierRequests.forEach((request) => {
      combined.push({
        id: `delivery-${request.id}`,
        type: 'delivery',
        title: `Delivery - Order #${request.order.unique_id}`,
        date: request.accepted_at || request.created_at,
        location: request.order.address?.full_address || 'N/A',
        status: request.status,
        data: request,
        priority: 'normal',
      })
    })

    // Add harvests
    harvestRequests.forEach((request) => {
      combined.push({
        id: `harvest-${request.id}`,
        type: 'harvest',
        title: request.title || `Harvest Request #${request.id}`,
        date: request.date,
        location: request.address?.full_address || 'N/A',
        status: request.status,
        data: request,
        priority: 'normal',
      })
    })

    // Sort by date
    return combined.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })
  }, [courierRequests, harvestRequests])

  // Filter activities by date
  const filteredActivities = useMemo(() => {
    if (dateFilter === 'all') return activities

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    return activities.filter(activity => {
      const activityDate = new Date(activity.date)
      
      if (dateFilter === 'today') {
        return activityDate.toDateString() === today.toDateString()
      } else if (dateFilter === 'week') {
        return activityDate >= today && activityDate <= weekFromNow
      } else if (dateFilter === 'month') {
        return activityDate >= today && activityDate <= monthFromNow
      }
      return true
    })
  }, [activities, dateFilter])

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ScheduleActivity[]> = {}
    
    filteredActivities.forEach(activity => {
      const dateKey = new Date(activity.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(activity)
    })
    
    return groups
  }, [filteredActivities])

  const stats = {
    total: activities.length,
    deliveries: activities.filter(a => a.type === 'delivery').length,
    harvests: activities.filter(a => a.type === 'harvest').length,
    today: activities.filter(a => {
      const activityDate = new Date(a.date)
      const today = new Date()
      return activityDate.toDateString() === today.toDateString()
    }).length,
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-500 mt-1 text-sm">View all your upcoming deliveries and harvest activities</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Total Activities</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Deliveries</p>
          <p className="text-2xl font-bold text-blue-600">{stats.deliveries}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Harvests</p>
          <p className="text-2xl font-bold text-green-600">{stats.harvests}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">Today</p>
          <p className="text-2xl font-bold text-[#5a9c3a]">{stats.today}</p>
        </div>
      </div>

      {/* Activities Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#5a9c3a]" />
        </div>
      ) : Object.keys(groupedActivities).length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No activities scheduled</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#5a9c3a]" />
                  <h2 className="text-lg font-semibold text-gray-900">{date}</h2>
                  <Badge className="bg-gray-200 text-gray-700">
                    {dateActivities.length} {dateActivities.length === 1 ? 'activity' : 'activities'}
                  </Badge>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {dateActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'delivery' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {activity.type === 'delivery' ? (
                          <Truck className={`w-6 h-6 ${activity.type === 'delivery' ? 'text-blue-600' : 'text-green-600'}`} />
                        ) : (
                          <Leaf className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg">{activity.title}</h3>
                              <Badge className={
                                activity.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                              </Badge>
                              <Badge className={
                                activity.type === 'delivery' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {activity.type === 'delivery' ? 'Delivery' : 'Harvest'}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="line-clamp-1">{activity.location}</span>
                              </div>
                              {activity.type === 'delivery' && activity.data.order && (
                                <>
                                  {activity.data.order.buyer && (
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      <span>{activity.data.order.buyer.name}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Package className="w-4 h-4" />
                                      <span>{activity.data.order.items_count} items</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      <span className="font-semibold text-[#5a9c3a]">${activity.data.order.delivery_fee.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </>
                              )}
                              {activity.type === 'harvest' && activity.data && (
                                <>
                                  {activity.data.user && (
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      <span>Farmer: {activity.data.user.name}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4">
                                    {activity.data.products_count > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Package className="w-4 h-4" />
                                        <span>{activity.data.products_count} products</span>
                                      </div>
                                    )}
                                    {activity.data.number_of_people && (
                                      <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{activity.data.accepted_count || 0}/{activity.data.number_of_people} volunteers</span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedActivity(activity)
                                setShowDetailsModal(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {activity.type === 'delivery' && (
                              <Button
                                size="sm"
                                className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                                onClick={() => router.push(`/admin/orders/${activity.data.order.unique_id}`)}
                              >
                                View Order
                              </Button>
                            )}
                            {activity.type === 'harvest' && (
                              <Button
                                size="sm"
                                className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                                onClick={() => router.push(`/admin/harvest-requests/${activity.data.id}`)}
                              >
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Details Modal */}
      {selectedActivity && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2">
                {selectedActivity.type === 'delivery' ? (
                  <Truck className="w-5 h-5 text-blue-600" />
                ) : (
                  <Leaf className="w-5 h-5 text-green-600" />
                )}
                {selectedActivity.title}
              </DialogTitle>
              <DialogDescription>
                {selectedActivity.type === 'delivery' ? 'Delivery Activity Details' : 'Harvest Activity Details'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {selectedActivity.type === 'delivery' && selectedActivity.data.order && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order ID</p>
                      <p className="font-semibold text-gray-900">{selectedActivity.data.order.unique_id}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                      <Badge className="bg-green-100 text-green-800">
                        {selectedActivity.status}
                      </Badge>
                    </div>
                    {selectedActivity.data.order.buyer && (
                      <>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                          <p className="font-semibold text-gray-900">{selectedActivity.data.order.buyer.name}</p>
                          {selectedActivity.data.order.buyer.email && (
                            <p className="text-sm text-gray-600 mt-1">{selectedActivity.data.order.buyer.email}</p>
                          )}
                          {selectedActivity.data.order.buyer.phone && (
                            <p className="text-sm text-gray-600">{selectedActivity.data.order.buyer.phone}</p>
                          )}
                        </div>
                        {selectedActivity.data.seller && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Seller</p>
                            <p className="font-semibold text-gray-900">{selectedActivity.data.seller.name}</p>
                            {selectedActivity.data.seller.email && (
                              <p className="text-sm text-gray-600 mt-1">{selectedActivity.data.seller.email}</p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {selectedActivity.data.order.address && (
                      <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Address</p>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-sm font-medium text-gray-900">{selectedActivity.data.order.address.full_address}</p>
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Items</p>
                      <p className="font-semibold text-gray-900">{selectedActivity.data.order.items_count} items</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Fee</p>
                      <p className="font-bold text-[#5a9c3a] text-lg">${selectedActivity.data.order.delivery_fee.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(selectedActivity.date).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedActivity.data.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-1">Seller Notes</p>
                      <p className="text-sm text-blue-700">{selectedActivity.data.notes}</p>
                    </div>
                  )}
                </>
              )}

              {selectedActivity.type === 'harvest' && selectedActivity.data && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedActivity.data.description && (
                      <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                        <p className="text-sm text-gray-900">{selectedActivity.data.description}</p>
                      </div>
                    )}
                    {selectedActivity.data.address && (
                      <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-sm font-medium text-gray-900">{selectedActivity.data.address.full_address}</p>
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-900">{new Date(selectedActivity.data.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">People Needed</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedActivity.data.number_of_people || 'N/A'}</p>
                    </div>
                    {selectedActivity.data.user && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Farmer</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedActivity.data.user.name}</p>
                        {selectedActivity.data.user.email && (
                          <p className="text-xs text-gray-600 mt-1">{selectedActivity.data.user.email}</p>
                        )}
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Volunteers Joined</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedActivity.data.accepted_count || 0}</p>
                    </div>
                  </div>
                  {selectedActivity.data.products && selectedActivity.data.products.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Products</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedActivity.data.products.map((product: any) => (
                          <div key={product.id} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                            {product.main_image && (
                              <img 
                                src={getImageUrl(product.main_image, product.name)} 
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="text-sm font-semibold">{product.name}</p>
                              {product.unit && (
                                <p className="text-xs text-gray-500">{product.unit.name}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              {selectedActivity.type === 'delivery' && (
                <Button
                  className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                  onClick={() => {
                    router.push(`/admin/orders/${selectedActivity.data.order.unique_id}`)
                    setShowDetailsModal(false)
                  }}
                >
                  View Order Details
                </Button>
              )}
              {selectedActivity.type === 'harvest' && (
                <Button
                  className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                  onClick={() => {
                    router.push(`/admin/harvest-requests/${selectedActivity.data.id}`)
                    setShowDetailsModal(false)
                  }}
                >
                  View Harvest Details
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
