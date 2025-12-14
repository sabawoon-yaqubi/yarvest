"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  Calendar,
  Download,
  Package,
  Leaf,
  Star,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Award,
  Heart,
  Truck,
  Store,
  FileText
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useAuthStore } from "@/stores/auth-store"
import api from "@/lib/axios"
import { type Order } from "@/lib/orders-api"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  ComposedChart
} from "recharts"

const COLORS = ['#5a9c3a', '#7ab856', '#81c868', '#4d8236', '#0d7a3f', '#e8f5e9']

interface AnalyticsData {
  user: any
  orders: Order[]
  products: any[]
  harvestRequests: any[]
  reviews: any[]
  stats: {
    totalOrders: number
    totalRevenue: number
    totalSpent: number
    totalProducts: number
    totalHarvestRequests: number
    totalReviews: number
    averageRating: number
    completedOrders: number
    pendingOrders: number
    cancelledOrders: number
    activeHarvestRequests: number
    completedHarvestRequests: number
  }
  charts?: {
    revenueData?: any[]
    orderStatusData?: any[]
    monthlyData?: any[]
    productSalesData?: any[]
    harvestRequestStatusData?: any[]
  }
}

export default function AnalyticsPage() {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        // Fetch analytics data from API
        const response = await api.get('/analytics', {
          params: { date_range: dateRange }
        })

        if (response.data?.success && response.data?.data) {
          const apiData = response.data.data
          
          setData({
            user: apiData.user,
            orders: apiData.orders || [],
            products: apiData.products || [],
            harvestRequests: apiData.harvestRequests || [],
            reviews: apiData.reviews || [],
            stats: apiData.stats,
            charts: apiData.charts || {}
          })
        }
      } catch (error) {
        console.error('Error loading analytics:', error)
        // Fallback to empty data
        setData({
          user: user,
          orders: [],
          products: [],
          harvestRequests: [],
          reviews: [],
          stats: {
            totalOrders: 0,
            totalRevenue: 0,
            totalSpent: 0,
            totalProducts: 0,
            totalHarvestRequests: 0,
            totalReviews: 0,
            averageRating: 0,
            completedOrders: 0,
            pendingOrders: 0,
            cancelledOrders: 0,
            activeHarvestRequests: 0,
            completedHarvestRequests: 0
          },
          charts: {}
        })
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [user, dateRange])

  // Use chart data from API or fallback to empty arrays
  const revenueData = useMemo(() => {
    return data?.charts?.revenueData || []
  }, [data])

  const orderStatusData = useMemo(() => {
    return data?.charts?.orderStatusData || []
  }, [data])

  const monthlyData = useMemo(() => {
    return data?.charts?.monthlyData || []
  }, [data])

  const productSalesData = useMemo(() => {
    return data?.charts?.productSalesData || []
  }, [data])

  const harvestRequestStatusData = useMemo(() => {
    return data?.charts?.harvestRequestStatusData || []
  }, [data])

  // Filter orders for display (already filtered by API based on dateRange)
  const filteredOrders = useMemo(() => {
    return data?.orders || []
  }, [data])

  const handleExport = () => {
    if (!data) return
    
    const exportData = {
      user: data.user,
      statistics: data.stats,
      orders: data.orders,
      products: data.products,
      harvestRequests: data.harvestRequests,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#5a9c3a]" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-8xl mx-auto px-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-500 mt-1">Comprehensive view of your account activity and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5a9c3a]"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* User Information Card */}
      <Card className="border-2 border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{data.user?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{data.user?.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">
                  {data.user?.created_at 
                    ? new Date(data.user.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Award className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">User ID</p>
                <p className="font-medium text-gray-900">{data.user?.unique_id || data.user?.id || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              ${data.stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-sm text-green-600 mt-2 font-medium">
              {data.stats.completedOrders} completed orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{data.stats.totalOrders}</h3>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              {data.stats.pendingOrders} pending • {data.stats.cancelledOrders} cancelled
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{data.stats.totalProducts}</h3>
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              {data.stats.totalProducts > 0 ? 'Active listings' : 'No products'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Leaf className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{data.stats.totalHarvestRequests}</h3>
            <p className="text-sm text-gray-500">Harvest Requests</p>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              {data.stats.activeHarvestRequests} active • {data.stats.completedHarvestRequests} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Orders Over Time */}
        <Card className="border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue & Orders Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#5a9c3a" 
                  fill="#5a9c3a" 
                  fillOpacity={0.3}
                  name="Revenue ($)"
                />
                <Bar yAxisId="right" dataKey="orders" fill="#7ab856" name="Orders" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card className="border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#5a9c3a" name="Revenue ($)" />
                <Bar dataKey="orders" fill="#7ab856" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        {productSalesData.length > 0 && (
          <Card className="border-2 border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Top Products by Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productSalesData.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#5a9c3a" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Harvest Requests Analytics */}
      {data.stats.totalHarvestRequests > 0 && (
        <Card className="border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              Harvest Requests Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={harvestRequestStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {harvestRequestStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{data.stats.totalHarvestRequests}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{data.stats.completedHarvestRequests}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-yellow-600">{data.stats.activeHarvestRequests}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Statistics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Recent Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredOrders.slice(0, 10).map((order: Order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {order.unique_id || order.order_id || `Order #${order.id}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at || order.createdAt || 0).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${typeof order.total_price === 'string' 
                        ? parseFloat(order.total_price.replace(/,/g, '')).toFixed(2)
                        : (order.total_price || 0).toFixed(2)}
                    </p>
                    <Badge className={
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <p className="text-center text-gray-500 py-8">No orders found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        {data.stats.totalProducts > 0 && (
          <Card className="border-2 border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Your Products ({data.stats.totalProducts})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.products.slice(0, 10).map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.category?.name || 'No category'} • 
                        ${product.price || '0.00'}
                      </p>
                    </div>
                    <Badge className={
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {product.status || 'active'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activity Summary */}
      <Card className="border-2 border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                ${data.stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500">Total Spent</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{data.stats.completedOrders}</p>
              <p className="text-sm text-gray-500">Completed Orders</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(1) : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalReviews}</p>
              <p className="text-sm text-gray-500">Reviews Given</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
