"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle, Mail, Phone, Package, Calendar, Award, Globe, Truck, ArrowLeft, Loader2, Leaf, Shield, Users } from "lucide-react"
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
  phone: string | null
  email: string | null
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
      <div className="flex flex-col h-screen bg-background">
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
      <div className="flex flex-col h-screen bg-background">
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
                  <Button onClick={() => router.push("/producers")} className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white">
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
  const certifications = store.certifications?.map(c => c.certification?.name).filter(Boolean) || []
  const isOrganic = certifications.some(c => c.toLowerCase().includes('organic'))

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[#0A5D31]/5 via-white to-white">
          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Breadcrumb */}
              <div className="mb-6 text-sm text-gray-500">
                <Link href="/producers" className="hover:text-[#0A5D31] transition-colors">Sellers</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">{store.name}</span>
              </div>

              {/* Back Button */}
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>

              {/* Producer Header */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-xl">
                    <img
                      src={store.logo || "/placeholder.svg"}
                      alt={store.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{store.name}</h1>
                        {store.status && (
                          <Badge className="bg-green-500 text-white border-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      {store.verified && (
                        <Badge variant="secondary" className="text-base font-semibold mb-4 bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified Seller
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#0A5D31]/10 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{store.rating || 0}</div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#0A5D31]/10 rounded-lg">
                        <Package className="w-5 h-5 text-[#0A5D31]" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{productsCount}</div>
                        <div className="text-xs text-gray-600">{productsCount === 1 ? 'Product' : 'Products'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#0A5D31]/10 rounded-lg">
                        <MapPin className="w-5 h-5 text-[#0A5D31]" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg line-clamp-1">{location}</div>
                        <div className="text-xs text-gray-600">Location</div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {(store.description || store.bio) && (
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                      {store.description || store.bio}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {store.email && (
                      <Button
                        variant="outline"
                        className="border-2 border-gray-300 hover:border-[#0A5D31]"
                        onClick={() => {
                          window.location.href = `mailto:${store.email}`
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    )}
                    {store.phone && (
                      <Button
                        className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white"
                        onClick={() => {
                          window.location.href = `tel:${store.phone}`
                        }}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                    )}
                    {store.website && (
                      <Button
                        variant="outline"
                        className="border-2 border-gray-300 hover:border-[#0A5D31]"
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
        <div className="px-6 py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                {(store.description || store.bio) && (
                  <Card className="p-8 border-2 border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-6 h-6 text-[#0A5D31]" />
                      About
                    </h2>
                    {store.description && (
                      <p className="text-gray-700 leading-relaxed mb-4 text-lg">{store.description}</p>
                    )}
                    {store.bio && (
                      <p className="text-gray-700 leading-relaxed text-lg">{store.bio}</p>
                    )}
                  </Card>
                )}

                {/* Products Section */}
                {store.products && store.products.length > 0 && (
                  <Card className="p-8 border-2 border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-6 h-6 text-[#0A5D31]" />
                        Products ({productsCount})
                      </h2>
                      <Link href={`/sellers/${store.unique_id}/products`}>
                        <Button variant="outline" className="border-[#0A5D31] text-[#0A5D31] hover:bg-[#0A5D31] hover:text-white">
                          View All Products
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  <Card className="p-6 border-2 border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#0A5D31]" />
                      Location
                    </h3>
                    <p className="text-gray-700 font-medium">{location}</p>
                  </Card>
                )}

                {/* Contact Information */}
                <Card className="p-6 border-2 border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[#0A5D31]" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    {store.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-[#0A5D31] flex-shrink-0" />
                        <a
                          href={`tel:${store.phone}`}
                          className="text-gray-900 hover:text-[#0A5D31] transition-colors font-medium"
                        >
                          {store.phone}
                        </a>
                      </div>
                    )}
                    {store.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-[#0A5D31] flex-shrink-0" />
                        <a
                          href={`mailto:${store.email}`}
                          className="text-gray-900 hover:text-[#0A5D31] transition-colors break-all font-medium"
                        >
                          {store.email}
                        </a>
                      </div>
                    )}
                    {store.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-[#0A5D31] flex-shrink-0" />
                        <a
                          href={store.website.startsWith('http') ? store.website : `https://${store.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 hover:text-[#0A5D31] transition-colors break-all font-medium"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </Card>


                {/* Certifications */}
                {certifications.length > 0 && (
                  <Card className="p-6 border-2 border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#0A5D31]" />
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {certifications.map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="mr-2 mb-2 border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5">
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
                {store.reviews_count !== undefined && (
                  <Card className="p-6 border-2 border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#0A5D31]" />
                      Seller Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Reviews</span>
                        <span className="font-semibold text-gray-900">{store.reviews_count || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Products</span>
                        <span className="font-semibold text-gray-900">{store.products_count || 0}</span>
                      </div>
                      {store.verified && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Status</span>
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
