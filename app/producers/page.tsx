"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, MessageSquare, Package, Calendar, Users, Map } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { ProductDetailsModal } from "@/components/product-details-modal"
import { ProductDetailModalSkeleton } from "@/components/product-detail-modal-skeleton"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { transformProducers, transformProducer, type TransformedProducer } from "@/lib/producer-api"
import { transformProducts, transformProduct, transformProductDetails, type TransformedProduct } from "@/lib/product-api"
import { ProducerCardSkeleton } from "@/components/producer-card-skeleton"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { ApiDataFetcher } from "@/components/api-data-fetcher"
import { Location } from "@/types/producer"

interface SellersResponse {
  sellers?: any[]
  data?: any[]
}

// Helper function to format location
const formatLocation = (location: string | Location | null | undefined): string => {
  if (!location) return 'Location not available'
  if (typeof location === 'string') {
    return location
  }
  // Handle location object
  if (location.full_location) {
    return location.full_location
  }
  // Build location from parts
  const parts = [location.city, location.state, location.country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'Location not available'
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

  // Fetch all sellers (users with products)
  const { data: allProducersResponse, loading: allProducersLoading, error: allProducersError, refetch: refetchAllProducers } = useApiFetch<SellersResponse>(
    '/sellers',
    { enabled: true }
  )


  // Fetch products for selected seller
  const { data: producerProductsResponse, loading: producerProductsLoading } = useApiFetch<any>(
    selectedProducer ? `/sellers/${selectedProducer}/products` : '',
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

  // Extract and transform sellers (producers)
  const extractProducers = (response: any): TransformedProducer[] => {
    const rawProducers = response?.sellers || response?.data || (Array.isArray(response) ? response : [])
    return transformProducers(rawProducers)
  }

  const allProducers = useMemo(() => {
    return extractProducers(allProducersResponse)
  }, [allProducersResponse])


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

  const isLoading = isMounted && allProducersLoading

  // Filter producers based on search and products
  const filteredProducers = useMemo(() => {
    // First filter out producers without products
    const producersWithProducts = allProducers.filter(
      (producer) => producer.products && producer.products > 0
    )
    
    // Then apply search filter if there's a query
    if (!searchQuery.trim()) return producersWithProducts
    const query = searchQuery.toLowerCase()
    return producersWithProducts.filter(
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
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Sellers</h1>
              <p className="text-lg text-gray-600 mb-6">{allProducersError}</p>
              <Button onClick={refetchAllProducers} className="bg-[#5a9c3a] hover:bg-[#0d7a3f]">
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }


  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-white">
      

        <div className="px-4 sm:px-6 py-6 bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Sellers</h1>
              <p className="text-gray-600">Browse local sellers in our marketplace</p>
            </div>

            {/* Simple Search Bar */}
            <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 text-sm rounded-lg border border-gray-200 focus:border-[#5a9c3a] focus:ring-1 focus:ring-[#5a9c3a]/20 bg-white"
                />
              </div>
              <Link href="/producers/map" className="w-full sm:w-auto">
                <Button variant="outline" className="h-11 px-4 border-gray-200 hover:border-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white rounded-lg transition-all w-full sm:w-auto">
                  <Map className="w-4 h-4 mr-2" />
                  Map
                </Button>
              </Link>
              <div className="text-sm text-gray-500 whitespace-nowrap">
                {filteredProducers.length} {filteredProducers.length === 1 ? 'seller' : 'sellers'}
              </div>
            </div>

            {/* Sellers Grid */}
            <div id="sellers-grid" className="mb-20">

              {/* Loading state */}
              {allProducersLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  <ProducerCardSkeleton count={8} />
                </div>
              )}

              {/* Error state */}
              {allProducersError && !allProducersLoading && (
                <div className="p-12 text-center rounded-2xl border border-red-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <Package className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Sellers</h3>
                  <p className="text-red-600 mb-4">{allProducersError}</p>
                  <Button onClick={refetchAllProducers} className="bg-[#5a9c3a] hover:bg-[#0d7a3f]">
                    Try Again
                  </Button>
                </div>
              )}

              {/* Success state */}
              {!allProducersLoading && !allProducersError && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducers.map((producer) => {
                      const producerReviewData = producersWithReviews.find(p => p.id === producer.id)
                      return (
                        <Link 
                          key={producer.id} 
                          href={producer.unique_id ? `/producers/${producer.unique_id}` : `/producers/${producer.id}`}
                        >
                          <div className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col bg-card border border-border rounded-2xl cursor-pointer h-full">
                            <div className="relative group overflow-hidden bg-secondary h-48">
                              <div className="absolute inset-0 flex items-center justify-center bg-white">
                                <img
                                  src={producer.image || "/placeholder.png"}
                                  alt={producer.name}
                                  className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-110 transition-transform duration-300"
                                  style={{ aspectRatio: '1/1' }}
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.png"
                                  }}
                                />
                              </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                              <h3 className="font-bold text-lg text-foreground mb-1">{producer.name || 'Producer'}</h3>
                              {producer.specialty && (
                                <p className="text-xs text-[#5a9c3a] font-semibold mb-2 uppercase tracking-wide">{producer.specialty}</p>
                              )}

                              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                {formatLocation(producer.location)}
                              </div>

                              <div className="mt-auto pt-4 border-t border-border">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-1">
                                    {producer.rating > 0 ? (
                                      <>
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold text-sm text-foreground">{producer.rating}</span>
                                      </>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">No rating</span>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground font-medium">{producer.products || 0} items</span>
                                </div>

                                <Button className="w-full bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl transition-all h-10">
                                  View Shop
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  {filteredProducers.length === 0 && (
                    <div className="p-12 text-center rounded-2xl border border-gray-200">
                      <p className="text-gray-600 text-lg">No sellers found matching your search</p>
                    </div>
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
                  <p className="text-gray-600">Browse all available products from this seller</p>
                </div>
                {producerProductsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <ProductCardSkeleton count={8} />
                  </div>
                ) : producerProducts.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-gray-200">
                    <p className="text-gray-600 text-lg">No products available from this seller</p>
                  </div>
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
                        image={product.image || "/placeholder.png"}
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
        {selectedProduct && detailsLoading && (
          <ProductDetailModalSkeleton />
        )}
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
