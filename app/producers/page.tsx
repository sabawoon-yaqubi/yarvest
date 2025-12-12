"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Leaf, CheckCircle, MessageSquare, Package, Calendar, Award, Shield, Truck, TrendingUp, Users, ArrowRight, Clock, Zap, Percent, Sparkles, Map } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { ProductDetailsModal } from "@/components/product-details-modal"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { transformProducers, transformProducer, type TransformedProducer } from "@/lib/producer-api"
import { transformProducts, transformProduct, transformProductDetails, type TransformedProduct } from "@/lib/product-api"
import { ProducerSection } from "@/components/producer-section"
import { ProducerCardSkeleton } from "@/components/producer-card-skeleton"
import { ApiDataFetcher } from "@/components/api-data-fetcher"
import { YarvestLoader } from "@/components/yarvest-loader"

interface ProducersResponse {
  stores?: any[]
  producers?: any[]
  data?: any[]
}

export default function ProducersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProducer, setSelectedProducer] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [selectedProductDetails, setSelectedProductDetails] = useState<any | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Track when component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch all producers
  const { data: allProducersResponse, loading: allProducersLoading, error: allProducersError, refetch: refetchAllProducers } = useApiFetch<ProducersResponse>(
    '/stores/producers',
    { enabled: true }
  )

  // Fetch top sellers
  const { data: topSellersResponse, loading: topSellersLoading } = useApiFetch<ProducersResponse>(
    '/stores/top-sellers',
    { enabled: true }
  )

  // Fetch certified organic
  const { data: organicResponse, loading: organicLoading } = useApiFetch<ProducersResponse>(
    '/stores/certified-organic',
    { enabled: true }
  )

  // Fetch most reviewed
  const { data: mostReviewedResponse, loading: mostReviewedLoading } = useApiFetch<ProducersResponse>(
    '/stores/most-reviewed',
    { enabled: true }
  )

  // Fetch new this season
  const { data: newProducersResponse, loading: newProducersLoading } = useApiFetch<ProducersResponse>(
    '/stores/new-this-season',
    { enabled: true }
  )

  // Fetch products for selected producer
  const { data: producerProductsResponse, loading: producerProductsLoading } = useApiFetch<any>(
    selectedProducer ? `/stores/${selectedProducer}/products` : '',
    { enabled: !!selectedProducer }
  )

  // Fetch product details when a product is selected
  const { data: productDetailsResponse, loading: detailsLoading } = useApiFetch<any>(
    selectedProduct ? `/products/${selectedProduct}` : '',
    { enabled: !!selectedProduct }
  )

  // Update selected product details when response changes
  useEffect(() => {
    if (productDetailsResponse?.product || productDetailsResponse) {
      setSelectedProductDetails(productDetailsResponse?.product || productDetailsResponse)
    }
  }, [productDetailsResponse])

  // Extract and transform producers
  const extractProducers = (response: any): TransformedProducer[] => {
    const rawProducers = response?.stores || response?.producers || response?.data || (Array.isArray(response) ? response : [])
    return transformProducers(rawProducers)
  }

  const allProducers = useMemo(() => {
    return extractProducers(allProducersResponse)
  }, [allProducersResponse])

  const topSellers = useMemo(() => {
    return extractProducers(topSellersResponse).slice(0, 4)
  }, [topSellersResponse])

  const organicProducers = useMemo(() => {
    return extractProducers(organicResponse).slice(0, 4)
  }, [organicResponse])

  const mostReviewed = useMemo(() => {
    return extractProducers(mostReviewedResponse).slice(0, 4)
  }, [mostReviewedResponse])

  const newestProducers = useMemo(() => {
    return extractProducers(newProducersResponse).slice(0, 4)
  }, [newProducersResponse])

  // Extract and transform producer products
  const producerProducts = useMemo(() => {
    if (!producerProductsResponse || !selectedProducer) return []
    const rawProducts = producerProductsResponse?.products || producerProductsResponse?.data || (Array.isArray(producerProductsResponse) ? producerProductsResponse : [])
    return transformProducts(rawProducts)
  }, [producerProductsResponse, selectedProducer])

  // Calculate total reviews for each producer
  const producersWithReviews = useMemo(() => {
    return allProducers.map(producer => ({
      ...producer,
      totalReviews: producer.totalReviews || 0
    }))
  }, [allProducers])

  const isLoading = isMounted && (allProducersLoading || topSellersLoading || organicLoading || mostReviewedLoading || newProducersLoading)

  // Filter producers based on search
  const filteredProducers = useMemo(() => {
    if (!searchQuery.trim()) return allProducers
    const query = searchQuery.toLowerCase()
    return allProducers.filter(
      (producer) =>
        producer.name.toLowerCase().includes(query) ||
        producer.specialty.toLowerCase().includes(query) ||
        producer.location.toLowerCase().includes(query)
    )
  }, [allProducers, searchQuery])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const handleProductClick = (id: number) => {
    setSelectedProduct(id)
  }

  const getRelatedProducts = (productId: number): any[] => {
    if (!producerProducts || producerProducts.length === 0) return []
    const product = producerProducts.find(p => p.id === productId)
    if (!product) return []
    return producerProducts
      .filter((p) => p.id !== productId && (p.category === product.category || p.producer === product.producer))
      .slice(0, 5)
      .map((p) => ({
        ...p,
        inStock: (p.stock || 0) > 0,
        description: "Product description",
      }))
  }

  // Show YarvestLoader when data is loading
  if (isLoading && isMounted) {
    return <YarvestLoader />
  }

  // Show error state
  if (allProducersError && allProducers.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto bg-white">
          <div className="px-6 py-16">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <Package className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Producers</h1>
              <p className="text-lg text-gray-600 mb-6">{allProducersError}</p>
              <Button onClick={refetchAllProducers} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const benefits = [
    {
      icon: Shield,
      title: "Verified Producers",
      description: "All producers are verified and meet our quality standards",
    },
    {
      icon: Leaf,
      title: "Sustainable Practices",
      description: "Committed to environmentally friendly farming methods",
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description: "Fresh, high-quality products directly from local farms",
    },
    {
      icon: Truck,
      title: "Local Sourcing",
      description: "Supporting local farmers and reducing food miles",
    },
  ]

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-white">
        {/* Promotional Banners Section */}
        <div className="px-6 pt-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Banner 1: Organic Producers */}
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <div className="absolute inset-0">
                  <img
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=800&h=400&fit=crop"
                    alt="Organic farming"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A5D31]/90 via-[#0A5D31]/85 to-[#0A5D31]/80"></div>
                </div>
                <div className="relative p-8 md:p-10 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Leaf className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Certified Organic</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                    Shop Organic Producers
                  </h2>
                  <p className="text-white/90 mb-6 text-lg">
                    Discover certified organic farms with USDA Organic certification. Fresh, pesticide-free produce delivered to your door.
                  </p>
                  <Link href="#organic-producers">
                    <Button className="bg-white text-[#0A5D31] hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                      Shop Organic
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Banner 2: Fast Delivery */}
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <div className="absolute inset-0">
                  <img
                    src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop"
                    alt="Fresh delivery"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A5D31]/90 via-[#0d7a3f]/85 to-[#0A5D31]/80"></div>
                </div>
                <div className="relative p-8 md:p-10 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Fast Delivery</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                    Same-Day Delivery Available
                  </h2>
                  <p className="text-white/90 mb-6 text-lg">
                    Get fresh produce delivered fast. Many producers offer same-day or next-day delivery in your area.
                  </p>
                  <Link href="#top-sellers">
                    <Button className="bg-white text-[#0A5D31] hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                      Find Fast Delivery
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Banner 3: New Producers */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl mb-8">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1600&h=300&fit=crop"
                  alt="New producers"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A5D31]/90 via-[#0d7a3f]/85 to-[#0A5D31]/80"></div>
              </div>
              <div className="relative p-8 md:p-12 text-white">
                <div className="flex items-center justify-between flex-wrap gap-6">
                  <div className="flex-1 min-w-[300px]">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm font-semibold uppercase tracking-wide">New This Season</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                      Discover New Local Producers
                    </h2>
                    <p className="text-white/90 mb-6 text-lg max-w-2xl">
                      We've expanded our network! Meet new verified producers joining our marketplace. Fresh options, more variety, better prices.
                    </p>
                    <Link href="#new-producers">
                      <Button className="bg-white text-[#0A5D31] hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                        Explore New Producers
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex gap-3">
                    {newestProducers.slice(0, 3).map((producer) => (
                      <div key={producer.id} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                        <img
                          src={producer.image}
                          alt={producer.name}
                          className="w-16 h-16 rounded-lg object-cover mb-2"
                        />
                        <p className="text-sm font-semibold text-white">{producer.name}</p>
                        <p className="text-xs text-white/80">{producer.specialty}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-16">
          <div className="max-w-7xl mx-auto">

            {/* Benefits Section */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Producers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, idx) => (
                  <Card key={idx} className="p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-[#0A5D31]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-6 h-6 text-[#0A5D31]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Top Sellers Section */}
            <div id="top-sellers" className="scroll-mt-8">
              <ProducerSection
                url="/stores/top-sellers"
                title="Top Sellers"
                description="Producers with the most products available"
                icon={<TrendingUp className="w-6 h-6 text-[#0A5D31]" />}
                badge="Top Seller"
                limit={4}
              />
            </div>

            {/* Organic Producers Section */}
            <div id="organic-producers" className="scroll-mt-8">
              <ProducerSection
                url="/stores/certified-organic"
                title="Certified Organic"
                description="USDA Organic certified producers with pesticide-free products"
                icon={<Leaf className="w-6 h-6 text-[#0A5D31]" />}
                badge="Organic"
                limit={4}
              />
            </div>

            {/* Most Reviewed Section */}
            <div className="scroll-mt-8">
              <ProducerSection
                url="/stores/most-reviewed"
                title="Most Reviewed"
                description="Producers with the most customer reviews and highest ratings"
                icon={<Users className="w-6 h-6 text-[#0A5D31]" />}
                badge="Most Reviewed"
                limit={4}
              />
            </div>

            {/* New Producers Section */}
            <div id="new-producers" className="scroll-mt-8">
              <ProducerSection
                url="/stores/new-this-season"
                title="New This Season"
                description="Recently joined producers with fresh offerings"
                icon={<Sparkles className="w-6 h-6 text-[#0A5D31]" />}
                badge="New"
                limit={4}
              />
            </div>

            {/* Search */}
            <div className="mb-10">
              <div className="flex items-center gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search producers, specialties, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 h-14 text-base rounded-full border-2 border-gray-200 focus:border-[#0A5D31] focus:ring-2 focus:ring-[#0A5D31]/20"
                  />
                </div>
                <Link href="/producers/map">
                  <Button className="h-14 px-6 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white rounded-full shadow-lg hover:shadow-xl transition-all">
                    <Map className="w-5 h-5 mr-2" />
                    Map View
                  </Button>
                </Link>
              </div>
            </div>

            {/* All Producers Grid */}
            <div id="producers-grid" className="mb-20 scroll-mt-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">All Producers</h2>
                  <p className="text-gray-600 text-lg">Browse all verified local producers in our marketplace</p>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredProducers.length} {filteredProducers.length === 1 ? 'producer' : 'producers'} found
                </div>
              </div>

              {/* Loading state */}
              {allProducersLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ProducerCardSkeleton count={6} />
                </div>
              )}

              {/* Error state */}
              {allProducersError && !allProducersLoading && (
                <Card className="p-12 text-center rounded-2xl border border-red-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <Package className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Producers</h3>
                  <p className="text-red-600 mb-4">{allProducersError}</p>
                  <Button onClick={refetchAllProducers} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                    Try Again
                  </Button>
                </Card>
              )}

              {/* Success state */}
              {!allProducersLoading && !allProducersError && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducers.map((producer) => {
                      const producerReviewData = producersWithReviews.find(p => p.id === producer.id)
                      return (
                        <Card
                          key={producer.id}
                          className="overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-xl border border-gray-200 bg-white flex flex-col h-full group cursor-pointer"
                        >
                          <div className="relative overflow-hidden bg-gray-100 h-48">
                            <img
                              src={producer.image || "/placeholder.svg"}
                              alt={producer.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                              {producer.verified && (
                                <div className="bg-[#0A5D31] text-white p-2 rounded-full shadow-lg">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            {producer.certifications && producer.certifications.length > 0 && producer.certifications.some((c: string) => typeof c === 'string' && c.toLowerCase().includes('organic')) && (
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-green-500 text-white border-0 font-semibold text-xs">
                                  <Leaf className="w-3 h-3 mr-1 inline" />
                                  Organic
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-xl text-gray-900 mb-1">{producer.name}</h3>
                            <p className="text-xs font-semibold text-[#0A5D31] mb-2 uppercase tracking-wide">
                              {producer.specialty}
                            </p>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{producer.description}</p>

                            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 text-[#0A5D31] flex-shrink-0" />
                                <span>{producer.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                <span className="font-semibold text-gray-900">{producer.rating}</span>
                                <span className="text-gray-600">• {producer.products} products</span>
                                {producerReviewData && producerReviewData.totalReviews > 0 && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-600">{producerReviewData.totalReviews} reviews</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-[#0A5D31] flex-shrink-0" />
                                <span>{producer.yearsInBusiness} years in business</span>
                              </div>
                            </div>

                            {producer.deliveryAreas && producer.deliveryAreas.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {producer.deliveryAreas.slice(0, 2).map((area, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs border-gray-300">
                                    <Truck className="w-3 h-3 mr-1" />
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2 mt-auto">
                              <Link href={producer.unique_id ? `/shops/${producer.unique_id}` : `/producers/${producer.id}`} className="flex-1">
                                <Button 
                                  className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                                >
                                  <Package className="w-4 h-4 mr-2" />
                                  Shop Now
                                </Button>
                              </Link>
                              <Button 
                                variant="outline"
                                className="border-2 border-gray-300 hover:border-[#0A5D31] hover:bg-[#0A5D31] hover:text-white font-semibold rounded-lg transition-all"
                                onClick={() => {
                                  if (producer.email) {
                                    window.location.href = `mailto:${producer.email}`
                                  }
                                }}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>

                  {filteredProducers.length === 0 && (
                    <Card className="p-12 text-center rounded-2xl border border-gray-200">
                      <p className="text-gray-600 text-lg">No producers found matching your search</p>
                    </Card>
                  )}
                </>
              )}
            </div>
            {/* Selected Producer Products */}
            {selectedProducer && (
              <div className="mt-16">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Products from {allProducers.find(p => p.id === selectedProducer)?.name}
                  </h2>
                  <p className="text-gray-600">Browse all available products from this producer</p>
                </div>
                {producerProductsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0A5D31] border-t-transparent mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                ) : producerProducts.length === 0 ? (
                  <Card className="p-12 text-center rounded-2xl border border-gray-200">
                    <p className="text-gray-600 text-lg">No products available from this producer</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {producerProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        unit={product.unit}
                        code={product.code || ""}
                        image={product.image || "/placeholder.svg"}
                        producer={product.producer || "Unknown Producer"}
                        rating={product.rating || 0}
                        reviews={product.reviews || 0}
                        badge={product.badge}
                        organic={product.organic}
                        isFavorite={favorites.includes(product.id)}
                        onToggleFavorite={toggleFavorite}
                        onClick={handleProductClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Footer />

        {/* Product Details Modal */}
        {selectedProduct && selectedProductDetails && !detailsLoading && (
          <ProductDetailsModal
            product={transformProductDetails(selectedProductDetails)}
            open={selectedProduct !== null && !detailsLoading}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedProduct(null)
                setSelectedProductDetails(null)
              }
            }}
            relatedProducts={selectedProduct !== null ? getRelatedProducts(selectedProduct) : []}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onAddToCart={(productId, quantity) => {
              console.log("Add to cart:", productId, quantity)
            }}
          />
        )}
      </main>
    </div>
  )
}
