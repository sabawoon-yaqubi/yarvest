"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle, Package, Calendar, Award, Globe, Truck, ArrowLeft, Loader2, Leaf, Shield, Users } from "lucide-react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { ApiProductCard } from "@/components/api-product-card"
import { StoreDetailSkeleton } from "@/components/store-detail-skeleton"

interface SellerDetail {
  id: number
  unique_id: string
  name: string
  full_name: string
  logo: string | null
  image: string | null
  description: string | null
  bio: string | null
  website: string | null
  location: {
    city?: string
    state?: string
    country?: string
    full_location?: string
  } | null
  products: Array<{
    id: number
    unique_id: string
    name: string
    price: number | string
    main_image: string | null
    image: string | null
  }>
  products_count?: number
  rating?: number
  reviews_count?: number
  is_verified?: boolean
  verified?: boolean
  certifications?: Array<any>
  created_at: string
  updated_at: string
}

// Helper function to format location
const formatLocation = (location: any): string => {
  if (!location) return 'Location not available'
  if (typeof location === 'string') return location
  if (location.full_location) return location.full_location
  const parts = [location.city, location.state, location.country].filter(Boolean)
  return parts.join(', ') || 'Location not available'
}


export default function ProducerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const producerId = params.id as string
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])

  // Fetch seller/producer details using unique_id
  const { data: storeResponse, loading, error, refetch } = useApiFetch<any>(
    `/sellers/${producerId}`,
    {
      enabled: !!producerId,
    }
  )
  
  // Extract seller data from response
  const store = storeResponse?.data || storeResponse

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const handleAddToCart = (product: any, quantity: number) => {
    console.log("Add to cart:", product, quantity)
    // Implement cart logic here
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <StoreDetailSkeleton />
        </main>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error || !store) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <Card className="p-12">
                <p className="text-red-500 text-lg mb-4">
                  {error || "Seller not found"}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => refetch()} variant="outline">
                    Retry
                  </Button>
                  <Button onClick={() => router.push("/producers")} className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white">
                    Browse All Sellers
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    )
  }

  const location = formatLocation(store.location)
  const productsCount = store.products_count || store.products?.length || 0
  const certifications = store.certifications?.map((c: any) => c.certification?.name).filter(Boolean) || []
  const isOrganic = certifications.some((c: string) => c.toLowerCase().includes('organic'))

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto pb-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[#5a9c3a]/10 via-[#5a9c3a]/5 to-white overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#5a9c3a] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#5a9c3a] rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-7xl mx-auto">
              {/* Breadcrumb */}
              <div className="mb-4 text-sm text-gray-600">
                <Link href="/producers" className="hover:text-[#5a9c3a] transition-colors font-medium">Sellers</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-semibold">{store.name}</span>
              </div>

              {/* Back Button */}
              <div className="mb-8">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>

              {/* Producer Header */}
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-36 h-36 lg:w-44 lg:h-44 rounded-3xl overflow-hidden bg-white border-4 border-white shadow-2xl ring-4 ring-[#5a9c3a]/10">
                      <img
                        src={store.logo || store.image || "/placeholder.png"}
                        alt={store.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png"
                        }}
                      />
                    </div>
                    {store.verified && (
                      <div className="absolute -bottom-2 -right-2 bg-[#5a9c3a] text-white rounded-full p-2 shadow-lg border-4 border-white">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 w-full">
                  <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900">{store.name}</h1>
                      {store.verified && (
                        <Badge className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] text-white border-0 px-3 py-1 text-sm font-semibold shadow-md">
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                          Verified Seller
                        </Badge>
                      )}
                      {store.status && (
                        <Badge className="bg-green-500 text-white border-0 px-3 py-1 text-sm font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                          Active
                        </Badge>
                      )}
                    </div>
                    {location && (
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 text-[#5a9c3a]" />
                        <span className="font-medium">{location}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center sm:items-start">
                      <div className="flex items-center gap-3 mb-2 w-full justify-center sm:justify-start">
                        <div className="p-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-xl">{store.rating?.toFixed(1) || '0.0'}</div>
                          <div className="text-xs text-gray-600 font-medium">Rating</div>
                        </div>
                      </div>
                      {store.reviews_count && (
                        <div className="text-xs text-gray-500 text-center sm:text-left">{store.reviews_count} reviews</div>
                      )}
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center sm:items-start">
                      <div className="flex items-center gap-3 mb-2 w-full justify-center sm:justify-start">
                        <div className="p-2 bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/20 rounded-xl">
                          <Package className="w-5 h-5 text-[#5a9c3a]" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-xl">{productsCount}</div>
                          <div className="text-xs text-gray-600 font-medium">{productsCount === 1 ? 'Product' : 'Products'}</div>
                        </div>
                      </div>
                    </div>
                    {store.reviews_count !== undefined && (
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center sm:items-start">
                        <div className="flex items-center gap-3 mb-2 w-full justify-center sm:justify-start">
                          <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                            <Users className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-xl">{store.reviews_count || 0}</div>
                            <div className="text-xs text-gray-600 font-medium">Reviews</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {(store.description || store.bio) && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-6">
                      <p className="text-gray-700 leading-relaxed text-base">
                        {store.description || store.bio}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {store.website && (
                      <Button
                        variant="outline"
                        className="border-2 border-gray-300 hover:border-[#5a9c3a] hover:bg-[#5a9c3a]/5 rounded-xl px-6"
                        onClick={() => {
                          window.open(store.website?.startsWith('http') ? store.website : `https://${store.website}`, '_blank')
                        }}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                {(store.description || store.bio) && (
                  <Card className="p-8 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/20 rounded-xl">
                        <Users className="w-6 h-6 text-[#5a9c3a]" />
                      </div>
                      About
                    </h2>
                    {store.description && (
                      <p className="text-gray-700 leading-relaxed mb-4 text-base">{store.description}</p>
                    )}
                    {store.bio && (
                      <p className="text-gray-700 leading-relaxed text-base">{store.bio}</p>
                    )}
                  </Card>
                )}

                {/* Products Section */}
                {store.products && store.products.length > 0 && (
                  <Card className="p-8 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/20 rounded-xl">
                          <Package className="w-6 h-6 text-[#5a9c3a]" />
                        </div>
                        Products <span className="text-[#5a9c3a]">({productsCount})</span>
                      </h2>
                      <Link href={`/sellers/${store.unique_id}/products`}>
                        <Button variant="outline" className="border-[#5a9c3a] text-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white rounded-xl">
                          View All Products
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6">
                      {store.products.slice(0, 6).map((product: any) => (
                        <ApiProductCard
                          key={product.id}
                          product={{
                            id: product.id,
                            unique_id: product.unique_id,
                            name: product.name,
                            price: typeof product.price === 'string' ? product.price : product.price.toString(),
                            discount: product.discount || '0',
                            main_image: product.main_image || product.image,
                            excerpt: product.excerpt || null,
                            details: product.details || null,
                            seller: product.seller || store.user || { id: store.id, unique_id: store.unique_id, full_name: store.name, image: store.image },
                            product_category: product.product_category || { id: 0, unique_id: '', name: '' },
                            product_type: product.product_type || { id: 0, unique_id: '', name: '' },
                            reviews: product.reviews || { total: 0, average_rating: 0 },
                            status: product.status !== undefined ? product.status : true,
                            sku: product.sku || '',
                            stock: product.stock || 0,
                            created_at: product.created_at || '',
                            updated_at: product.updated_at || '',
                          }}
                          onAddToCart={handleAddToCart}
                          onToggleFavorite={toggleFavorite}
                          isFavorite={favorites.includes(product.id)}
                        />
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Location Information */}
                {store.location && (
                  <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/20 rounded-lg">
                        <MapPin className="w-4 h-4 text-[#5a9c3a]" />
                      </div>
                      Location
                    </h3>
                    <p className="text-gray-700 font-medium text-sm">{location}</p>
                  </Card>
                )}

                {/* Website Link */}
                {store.website && (
                  <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/20 rounded-lg">
                        <Globe className="w-4 h-4 text-[#5a9c3a]" />
                      </div>
                      Website
                    </h3>
                    <div className="space-y-3">
                      <a
                        href={store.website.startsWith('http') ? store.website : `https://${store.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#5a9c3a]/5 transition-colors group"
                      >
                        <div className="p-2 bg-gray-100 group-hover:bg-[#5a9c3a]/10 rounded-lg transition-colors">
                          <Globe className="w-4 h-4 text-[#5a9c3a]" />
                        </div>
                        <span className="text-gray-900 hover:text-[#5a9c3a] transition-colors break-all font-medium text-sm">
                          Visit Website
                        </span>
                      </a>
                    </div>
                  </Card>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                  <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/20 rounded-lg">
                        <Award className="w-4 h-4 text-[#5a9c3a]" />
                      </div>
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {certifications.map((cert: string, idx: number) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="border-[#5a9c3a]/30 text-[#5a9c3a] bg-[#5a9c3a]/5 hover:bg-[#5a9c3a]/10 transition-colors px-3 py-1.5 rounded-lg"
                        >
                          {isOrganic && cert.toLowerCase().includes('organic') && (
                            <Leaf className="w-3 h-3 mr-1 inline" />
                          )}
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Seller Stats */}
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/20 rounded-lg">
                      <Users className="w-4 h-4 text-[#5a9c3a]" />
                    </div>
                    Seller Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-gray-600 text-sm font-medium">Total Reviews</span>
                      <span className="font-bold text-gray-900">{store.reviews_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-gray-600 text-sm font-medium">Total Products</span>
                      <span className="font-bold text-gray-900">{store.products_count || 0}</span>
                    </div>
                    {store.verified && (
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-600 text-sm font-medium">Status</span>
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
