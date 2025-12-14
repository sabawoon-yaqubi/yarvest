"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/axios"
import { ApiProductCard } from "@/components/api-product-card"
import { ApiProduct } from "@/types/product"
import { WishlistProduct } from "@/lib/wishlist-api"
import { useWishlistStore } from "@/stores/wishlist-store"
import { useCartHandler } from "@/hooks/use-cart-handler"
import {
  ShoppingCart,
  DollarSign,
  Package,
  Truck,
  Leaf,
  Loader2,
  ArrowRight,
  TrendingUp,
  Heart,
} from "lucide-react"
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
} from "recharts"

interface DashboardStats {
  totalOrders?: number
  totalSpent?: number
  totalProducts?: number
  totalRevenue?: number
  totalEarnings?: number
  completedDeliveries?: number
  pendingOrders?: number
  wishlistCount?: number
  totalSales?: number
  pendingOrdersCount?: number
  activeDeliveries?: number
}

interface RecentOrder {
  id: string
  unique_id: string
  total_price: number
  total_amount?: number
  status: string
  created_at: string
  items_count?: number
}

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

export default function UnifiedDashboard() {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const router = useRouter()
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({})
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Chart data
  const [salesData, setSalesData] = useState<any[]>([])
  const [orderStatusData, setOrderStatusData] = useState<any[]>([])
  const [activityData, setActivityData] = useState<any[]>([])
  
  // Favorites data
  const [favorites, setFavorites] = useState<ApiProduct[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(false)
  const wishlistStore = useWishlistStore()
  const { handleAddToCart } = useCartHandler()
  const wishlistFetchedRef = useRef(false)
  
  // Helper function to convert WishlistProduct to ApiProduct
  const convertWishlistToApiProduct = (items: WishlistProduct[]): ApiProduct[] => {
    return items.map((item: WishlistProduct) => ({
      id: item.product_id,
      unique_id: item.product_unique_id,
      name: item.name,
      price: item.price,
      discount: item.discount,
      main_image: item.main_image,
      excerpt: item.excerpt || null,
      details: item.details || null,
      seller: {
        ...item.seller,
        image: item.seller.image ?? null,
      },
      product_category: item.product_category || {
        id: 0,
        unique_id: '',
        name: ''
      },
      product_type: item.product_type || {
        id: 0,
        unique_id: '',
        name: ''
      },
      unit: item.unit || null,
      reviews: item.reviews,
      status: 1,
      sku: item.sku || '',
      stock: item.stock,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))
  }

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/")
      return
    }
    
    const fetchDashboardData = async () => {
      try {
        setLoadingRoles(true)
        setLoadingData(true)
        
        // Fetch user roles
        const rolesResponse = await api.get('/user/roles')
        const rolesData = rolesResponse.data?.data?.roles || rolesResponse.data?.roles || []
        const roles = Array.isArray(rolesData) 
          ? rolesData.map((r: any) => r.name || r) 
          : []
        setUserRoles(roles)

        // Fetch dashboard stats from new API endpoint
        const dashboardResponse = await api.get('/dashboard/stats')
        const dashboardData = dashboardResponse.data?.data || {}

        // Extract stats based on roles
        const newStats: DashboardStats = {}
        
        if (dashboardData.stats?.buyer) {
          newStats.totalOrders = dashboardData.stats.buyer.totalOrders || 0
          newStats.pendingOrders = dashboardData.stats.buyer.pendingOrders || 0
          newStats.totalSpent = dashboardData.stats.buyer.totalSpent || 0
          newStats.wishlistCount = dashboardData.stats.buyer.wishlistCount || 0
        }

        if (dashboardData.stats?.seller) {
          newStats.totalProducts = dashboardData.stats.seller.totalProducts || 0
          newStats.totalSales = dashboardData.stats.seller.totalSales || 0
          newStats.totalRevenue = dashboardData.stats.seller.totalRevenue || 0
          newStats.pendingOrdersCount = dashboardData.stats.seller.pendingOrdersCount || 0
        }

        if (dashboardData.stats?.worker) {
          newStats.totalEarnings = dashboardData.stats.worker.totalEarnings || 0
          newStats.completedDeliveries = dashboardData.stats.worker.completedDeliveries || 0
          newStats.activeDeliveries = dashboardData.stats.worker.activeDeliveries || 0
        }

        setStats(newStats)

        // Set recent orders
        if (dashboardData.recentOrders && Array.isArray(dashboardData.recentOrders)) {
          setRecentOrders(dashboardData.recentOrders)
        }

        // Set chart data
        if (dashboardData.salesData && Array.isArray(dashboardData.salesData)) {
          setSalesData(dashboardData.salesData)
        }

        if (dashboardData.orderStatusData && Array.isArray(dashboardData.orderStatusData)) {
          setOrderStatusData(dashboardData.orderStatusData)
        }

        if (dashboardData.activityData && Array.isArray(dashboardData.activityData)) {
          setActivityData(dashboardData.activityData)
        }

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        if (user && (user as any).roles) {
          const roles = Array.isArray((user as any).roles)
            ? (user as any).roles.map((r: any) => r.name || r)
            : []
          setUserRoles(roles)
        }
      } finally {
        setLoadingRoles(false)
        setLoadingData(false)
      }
    }
    
    fetchDashboardData()
  }, [user, router, isLoading])

  // Fetch favorites when user has buyer role
  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!user || !userRoles.includes('Buyer')) {
      setFavorites([])
      wishlistFetchedRef.current = false
      return
    }

    // Only fetch once per user session
    if (!wishlistFetchedRef.current) {
      wishlistFetchedRef.current = true
      const fetchFavorites = async () => {
        try {
          setLoadingFavorites(true)
          await wishlistStore.fetchWishlist()
          // Get updated items from store after fetch
          const currentItems = wishlistStore.items
          // Convert WishlistProduct to ApiProduct format
          const convertedFavorites = convertWishlistToApiProduct(currentItems)
          setFavorites(convertedFavorites)
        } catch (error: any) {
          console.error('Error fetching favorites:', error)
          setFavorites([])
        } finally {
          setLoadingFavorites(false)
        }
      }

      fetchFavorites()
    } else {
      // If already fetched, just sync the current items
      const convertedFavorites = convertWishlistToApiProduct(wishlistStore.items)
      setFavorites(convertedFavorites)
    }
  }, [user, isLoading, userRoles])

  if (isLoading || loadingRoles || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: COLORS.primary }} />
          <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const hasRole = (roleName: string) => {
    return userRoles.some(r => r.toLowerCase() === roleName.toLowerCase())
  }

  const hasBuyer = hasRole("Buyer")
  const hasSeller = hasRole("Seller")
  const hasHelper = hasRole("Helper")
  const hasCourier = hasRole("Courier")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name || 'User'}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Here's your overview</p>
          </div>
        </div>

        {/* Key Stats - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasBuyer && (
            <>
              <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Total Orders</p>
                      <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                        {stats.totalOrders || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: COLORS.accent }}>
                      <ShoppingCart className="w-6 h-6" style={{ color: COLORS.primary }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Total Spent</p>
                      <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                        {formatCurrency(stats.totalSpent || 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: COLORS.accent }}>
                      <DollarSign className="w-6 h-6" style={{ color: COLORS.primary }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {hasSeller && (
            <>
              <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Products</p>
                      <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                        {stats.totalProducts || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: COLORS.accent }}>
                      <Package className="w-6 h-6" style={{ color: COLORS.primary }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Revenue</p>
                      <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                        {formatCurrency(stats.totalRevenue || 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: COLORS.accent }}>
                      <DollarSign className="w-6 h-6" style={{ color: COLORS.primary }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {(hasHelper || hasCourier) && (
            <>
              <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Earnings</p>
                      <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                        {formatCurrency(stats.totalEarnings || 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: COLORS.accent }}>
                      <DollarSign className="w-6 h-6" style={{ color: COLORS.primary }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Completed</p>
                      <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                        {stats.completedDeliveries || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: COLORS.accent }}>
                      {hasHelper ? (
                        <Leaf className="w-6 h-6" style={{ color: COLORS.primary }} />
                      ) : (
                        <Truck className="w-6 h-6" style={{ color: COLORS.primary }} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales/Earnings Chart */}
          {salesData.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {hasBuyer ? 'Spending' : hasSeller ? 'Revenue' : 'Earnings'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: COLORS.primary }}>
                    <TrendingUp className="w-4 h-4" />
                    <span>Trending</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: `1px solid ${COLORS.primary}`,
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={hasBuyer ? "amount" : hasSeller ? "revenue" : "earnings"} 
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      dot={{ fill: COLORS.primary, r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Order Status Chart */}
          {orderStatusData.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Order Status</h3>
                  <p className="text-sm text-gray-500 mt-1">Distribution</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? COLORS.primary : index === 1 ? COLORS.primaryLight : COLORS.primaryDark}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Bar Chart for Seller */}
          {hasSeller && salesData.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Daily Revenue</h3>
                  <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: `1px solid ${COLORS.primary}`,
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill={COLORS.primary}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Activity Chart - Order/Delivery Volume */}
          {activityData.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    {hasBuyer ? 'Order Activity' : hasSeller ? 'Orders Received' : 'Delivery Activity'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: `1px solid ${COLORS.primary}`,
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => [`${value} ${hasBuyer || hasSeller ? 'orders' : 'deliveries'}`, '']}
                    />
                    <Bar 
                      dataKey={hasBuyer || hasSeller ? "orders" : "deliveries"} 
                      fill={COLORS.primaryLight}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                    <p className="text-sm text-gray-500 mt-1">Your latest activity</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                    className="hover:bg-transparent"
                    style={{ color: COLORS.primary }}
                  >
                    <Link href={hasSeller ? "/admin/orders" : "/orders"}>
                      View all
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {recentOrders.slice(0, 5).map((order) => (
                  <Link
                    key={order.id}
                    href={hasSeller ? `/admin/orders` : `/orders`}
                    className="block p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm font-semibold text-gray-900">
                            #{order.unique_id || order.id.slice(-8)}
                          </span>
                          <Badge 
                            className="text-xs font-medium border-0"
                            style={{ 
                              backgroundColor: COLORS.accent,
                              color: COLORS.primaryDark
                            }}
                          >
                            {order.status || 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                      </div>
                      <p className="text-lg font-bold" style={{ color: COLORS.primary }}>
                        {formatCurrency(order.total_price || order.total_amount || 0)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Favorites Section - Only for Buyers */}
        {hasBuyer && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: COLORS.accent }}>
                      <Heart className="w-5 h-5" style={{ color: COLORS.primary }} fill={COLORS.primary} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">My Favorites</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {loadingFavorites 
                          ? 'Loading...' 
                          : `${favorites.length} ${favorites.length === 1 ? 'item' : 'items'} saved`}
                      </p>
                    </div>
                  </div>
                  {favorites.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                      className="hover:bg-transparent"
                      style={{ color: COLORS.primary }}
                    >
                      <Link href="/favorites">
                        View all
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              {loadingFavorites ? (
                <div className="p-6 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: COLORS.primary }} />
                  <p className="text-sm text-gray-500">Loading favorites...</p>
                </div>
              ) : favorites.length === 0 ? (
                <div className="p-12 text-center">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h4>
                  <p className="text-sm text-gray-500 mb-4">Start adding products to your favorites to see them here!</p>
                  <Button 
                    asChild
                    style={{ backgroundColor: COLORS.primary }}
                    className="hover:opacity-90"
                  >
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {favorites.slice(0, 5).map((product) => (
                      <ApiProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onToggleFavorite={async (productId) => {
                          try {
                            await wishlistStore.toggleItem(productId)
                            // The useEffect will automatically update favorites when wishlistStore.items changes
                          } catch (error) {
                            console.error('Error toggling favorite:', error)
                          }
                        }}
                        isFavorite={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
