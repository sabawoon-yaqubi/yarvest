"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Map as MapIcon, ArrowLeft, Loader2, AlertCircle, RefreshCw, Search, Filter, X, SlidersHorizontal, Package } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

const MapView = dynamic(() => import("@/components/map-view").then(mod => ({ default: mod.MapView })), {
  ssr: false,
})
import { ApiProduct } from "@/components/api-product-card"
import { calculateProductPrices } from "@/lib/product-utils"
import { getImageUrl } from "@/lib/utils"
import Link from "next/link"
import api from "@/lib/axios"
import { useCartHandler } from "@/hooks/use-cart-handler"

interface SellerLocation {
  id: number
  sellerId: number
  sellerName: string
  lat: number
  lng: number
  location: string
  products: ApiProduct[]
  image?: string
}

export default function ProductsMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [minRating, setMinRating] = useState<number>(0)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const router = useRouter()
  const { handleAddToCart } = useCartHandler()

  // Fetch products with locations
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/products/with-locations', {
          params: {
            limit: 200,
            page: 1,
          }
        })
        
        const fetchedProducts = response.data?.data || []
        console.log('Fetched products:', fetchedProducts.length)
        console.log('Sample product:', fetchedProducts[0])
        
        setProducts(fetchedProducts)
      } catch (err: any) {
        console.error('Error fetching products:', err)
        setError(err.response?.data?.message || 'Failed to load products. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.seller?.full_name?.toLowerCase().includes(query) ||
          product.product_category?.name?.toLowerCase().includes(query) ||
          product.sku?.toLowerCase().includes(query)
      )
    }

    // Price filter
    filtered = filtered.filter((product) => {
      const { price } = calculateProductPrices(product)
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((product) => (product.reviews?.average_rating || 0) >= minRating)
    }

    return filtered
  }, [products, searchQuery, priceRange, minRating])

  // Group products by seller location
  const sellerLocations = useMemo(() => {
    const sellerMap = new Map<string, {
      sellerId: number
      sellerUniqueId: string
      sellerName: string
      lat: number
      lng: number
      location: string
      products: ApiProduct[]
      image?: string
      rating?: number
      reviewsCount?: number
    }>()

    let skippedCount = 0
    filteredProducts.forEach(product => {
      // Seller location data is now included directly from the API
      const seller = product.seller as any
      
      // Check if seller has latitude and longitude (from new API)
      if (!seller?.latitude || !seller?.longitude) {
        skippedCount++
        return // Skip products without coordinates
      }

      const lat = parseFloat(String(seller.latitude))
      const lng = parseFloat(String(seller.longitude))

      if (isNaN(lat) || isNaN(lng)) {
        skippedCount++
        return
      }

      const sellerUniqueId = seller.unique_id || seller.id?.toString() || 'unknown'
      const locationStr = seller.address?.full_location || 
        (seller.address?.city && seller.address?.state 
          ? `${seller.address.city}, ${seller.address.state}` 
          : seller.address?.city || seller.address?.state || 'Location not specified')
      
      if (!sellerMap.has(sellerUniqueId)) {
        sellerMap.set(sellerUniqueId, {
          sellerId: seller.id,
          sellerUniqueId,
          sellerName: seller.full_name || seller.name || 'Unknown Seller',
          lat,
          lng,
          location: locationStr,
          products: [],
          image: seller.image ? getImageUrl(seller.image) : undefined,
          rating: product.reviews?.average_rating,
          reviewsCount: product.reviews?.total || 0,
        })
      }

      const sellerData = sellerMap.get(sellerUniqueId)!
      sellerData.products.push(product)
      // Update rating if this product has better reviews
      if (product.reviews?.average_rating && (!sellerData.rating || product.reviews.average_rating > sellerData.rating)) {
        sellerData.rating = product.reviews.average_rating
      }
      sellerData.reviewsCount = (sellerData.reviewsCount || 0) + (product.reviews?.total || 0)
    })

    if (skippedCount > 0) {
      console.log(`Skipped ${skippedCount} products without valid coordinates`)
    }

    const locations = Array.from(sellerMap.values()).map((seller) => ({
      id: seller.sellerId,
      sellerId: seller.sellerId,
      sellerUniqueId: seller.sellerUniqueId,
      name: seller.sellerName,
      lat: seller.lat,
      lng: seller.lng,
      location: seller.location,
      products: seller.products,
      image: seller.image,
      productImage: seller.products[0]?.main_image ? getImageUrl(seller.products[0].main_image, seller.products[0].name) : seller.image,
      productsCount: seller.products.length,
      rating: seller.rating,
      reviews: seller.reviewsCount,
      link: `/producers/${seller.sellerUniqueId}`,
    }))

    console.log(`Created ${locations.length} seller locations from ${filteredProducts.length} products`)
    return locations
  }, [filteredProducts])

  // Calculate map center
  const mapCenter = useMemo(() => {
    if (sellerLocations.length === 0) return [37.7749, -122.4194] as [number, number]
    const avgLat = sellerLocations.reduce((sum, loc) => sum + loc.lat, 0) / sellerLocations.length
    const avgLng = sellerLocations.reduce((sum, loc) => sum + loc.lng, 0) / sellerLocations.length
    return [avgLat, avgLng] as [number, number]
  }, [sellerLocations])

  const handleRefresh = () => {
    setProducts([])
    setError(null)
    setLoading(true)
    // Trigger re-fetch
    window.location.reload()
  }

  // Calculate max price from products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000
    const prices = products.map(p => calculateProductPrices(p).price)
    return Math.max(...prices, 1000)
  }, [products])

  // Update price range max when maxPrice changes
  useEffect(() => {
    if (maxPrice > 1000) {
      setPriceRange([0, maxPrice])
    }
  }, [maxPrice])

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-gray-50 to-white flex flex-col">
        {/* Header Section with Gradient */}
        <div className="px-4 sm:px-6 py-8 bg-gradient-to-r from-[#5a9c3a]/5 via-white to-[#5a9c3a]/5 border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-xl shadow-lg">
                    <MapIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Products Map</h1>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                      <span>Find products near you</span>
                      <Badge variant="outline" className="text-xs border-[#5a9c3a]/30 text-[#5a9c3a]">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                      </Badge>
                    </p>
                  </div>
                </div>
                <Link href="/products">
                  <Button variant="outline" className="border-gray-300 hover:border-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white shadow-sm transition-all">
                    <Package className="w-4 h-4 mr-2" />
                    List View
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by product name, seller, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-sm rounded-xl border-2 border-gray-200 focus:border-[#5a9c3a] focus:ring-2 focus:ring-[#5a9c3a]/20 bg-white shadow-sm transition-all"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 px-6 border-2 rounded-xl shadow-sm transition-all ${
                  showFilters 
                    ? 'border-[#5a9c3a] bg-[#5a9c3a] text-white' 
                    : 'border-gray-200 hover:border-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {(minRating > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <Badge className="ml-2 bg-white text-[#5a9c3a] border border-[#5a9c3a]/20">
                    {[minRating > 0 ? 1 : 0, priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="mt-4 p-6 border-2 border-gray-200 rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#5a9c3a]" />
                    <h3 className="text-lg font-bold text-gray-900">Filter Options</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMinRating(0)
                      setPriceRange([0, maxPrice])
                    }}
                    className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-3"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Rating Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#5a9c3a]" />
                      Min Rating: {minRating > 0 ? `${minRating}+` : "Any"}
                    </label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={minRating}
                        onChange={(e) => setMinRating(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5a9c3a]"
                        style={{
                          background: `linear-gradient(to right, #5a9c3a 0%, #5a9c3a ${(minRating / 5) * 100}%, #e5e7eb ${(minRating / 5) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700 min-w-[70px] justify-end">
                        <Package className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{minRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#5a9c3a]" />
                      Price Range: ${priceRange[0].toFixed(0)} - ${priceRange[1].toFixed(0)}
                    </label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        step="10"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5a9c3a]"
                      />
                      <span className="text-sm font-semibold text-gray-700 min-w-[80px] text-right">
                        ${priceRange[1].toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[700px] px-4 sm:px-6 py-6">
          <div className="h-full w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200/50 bg-white" style={{ minHeight: '700px' }}>
          {loading ? (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-green-50/20 to-gray-50">
              <div className="text-center p-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[#5a9c3a]/20 rounded-full blur-xl animate-pulse"></div>
                  <Loader2 className="w-20 h-20 text-[#5a9c3a] mx-auto relative animate-spin" />
                </div>
                <p className="text-gray-700 font-semibold text-lg mb-2">Loading product locations...</p>
                <p className="text-sm text-gray-500">Please wait while we fetch product data</p>
                <div className="mt-4 flex justify-center gap-2">
                  <div className="w-2 h-2 bg-[#5a9c3a] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-[#5a9c3a] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#5a9c3a] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50/20 to-gray-50">
              <div className="text-center p-8 max-w-md">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
                  <AlertCircle className="w-20 h-20 text-red-500 mx-auto relative" />
                </div>
                <p className="text-gray-700 font-semibold text-lg mb-2">Failed to load products</p>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <Button
                  onClick={handleRefresh}
                  className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : sellerLocations.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-8">
              <Card className="p-12 text-center rounded-2xl border-2 border-gray-200 shadow-xl max-w-md bg-white">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <MapIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  {filteredProducts.length === 0 && products.length > 0
                    ? "Try adjusting your search or filters to find more products"
                    : filteredProducts.length === 0 && products.length === 0
                    ? "No products are available at the moment. Please check back later."
                    : "No products with valid location data found"}
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setMinRating(0)
                    setPriceRange([0, maxPrice])
                  }}
                  className="bg-[#5a9c3a] hover:bg-[#0d7a3f] shadow-lg px-6"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </Card>
            </div>
          ) : (
            <MapView
              locations={sellerLocations.map(loc => ({
                id: loc.id,
                name: loc.name,
                lat: loc.lat,
                lng: loc.lng,
                location: loc.location,
                image: loc.image,
                productImage: loc.productImage,
                link: loc.link,
                products: loc.productsCount,
                rating: loc.rating,
                reviews: loc.reviews,
                productsList: loc.products.map(p => ({
                  id: p.id,
                  unique_id: p.unique_id,
                  name: p.name,
                  price: calculateProductPrices(p).price,
                  image: getImageUrl(p.main_image, p.name),
                  link: `/products/${p.unique_id || p.id}`,
                  product: p, // Full product object for cart functionality
                })),
              }))}
              center={mapCenter}
              zoom={sellerLocations.length === 1 ? 10 : 6}
              showHeatMap={false}
              title=""
              onAddToCart={handleAddToCart}
            />
          )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
