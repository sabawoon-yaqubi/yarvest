"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { ProductDetailsModal } from "@/components/product-details-modal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, SlidersHorizontal, Grid3x3, List, X, CheckCircle, Leaf, Package } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { transformProduct, transformProductDetails, transformProducts, type TransformedProduct } from "@/lib/product-api"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { FreshFoodCategories } from "@/components/fresh-food-categories"
import { getImageUrl } from "@/lib/utils"
import { YarvestLoader } from "@/components/yarvest-loader"
// Use TransformedProduct from product-api.ts
type Product = TransformedProduct

interface ProductsResponse {
  products: any[]
  count?: number
}

interface ProductDetailsResponse {
  product: any
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [selectedProductDetails, setSelectedProductDetails] = useState<any | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState("featured")

  // Track when component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch all products
  const { data: productsResponse, loading: productsLoading, error: productsError, refetch: refetchProducts } = useApiFetch<ProductsResponse>(
    '/products',
    { enabled: true }
  )

  // Fetch product details when a product is selected
  const { data: productDetailsResponse, loading: detailsLoading } = useApiFetch<ProductDetailsResponse>(
    selectedProduct ? `/products/${selectedProduct}` : '',
    { enabled: !!selectedProduct }
  )

  // Update selected product details when response changes
  useEffect(() => {
    if (productDetailsResponse?.product) {
      setSelectedProductDetails(productDetailsResponse.product)
    }
  }, [productDetailsResponse])

  // Extract products from response
  const rawProducts = productsResponse?.products || (Array.isArray(productsResponse) ? productsResponse : [])
  
  // Use loading state directly - only show skeleton on client after mount
  const isLoading = isMounted && productsLoading

  // Transform products using the API utility function
  const products = useMemo(() => {
    return transformProducts(rawProducts)
  }, [rawProducts])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    // Check if filters are at default (no active filtering)
    const hasSearchQuery = searchQuery.trim().length > 0
    const isDefaultPriceRange = priceRange[0] === 0 && priceRange[1] === 1000
    const hasActiveFilters = hasSearchQuery || !isDefaultPriceRange || selectedCategory
    
    // Filter products
    let filtered = products
    if (hasActiveFilters) {
      filtered = products.filter((product) => {
        // Search filter
        const matchesSearch = !hasSearchQuery || 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.producer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.code?.toLowerCase().includes(searchQuery.toLowerCase())
        
        // Category filter
        const matchesCategory = !selectedCategory || selectedCategory === "All" || 
          (selectedCategory === "Organic" ? product.organic : product.category === selectedCategory)
        
        // Price filter - handle edge cases
        let price = typeof product.price === "number" ? product.price : parseFloat(product.price.toString())
        if (isNaN(price) || price < 0) {
          price = 0
        }
        const matchesPrice = isDefaultPriceRange || (price >= priceRange[0] && price <= priceRange[1])
        
        return matchesSearch && matchesCategory && matchesPrice
      })
    }
    
    // Sort products
    return filtered.sort((a, b) => {
      if (sortBy === "price-low") {
        const priceA = typeof a.price === "number" ? a.price : parseFloat(a.price.toString()) || 0
        const priceB = typeof b.price === "number" ? b.price : parseFloat(b.price.toString()) || 0
        return priceA - priceB
      }
      if (sortBy === "price-high") {
        const priceA = typeof a.price === "number" ? a.price : parseFloat(a.price.toString()) || 0
        const priceB = typeof b.price === "number" ? b.price : parseFloat(b.price.toString()) || 0
        return priceB - priceA
      }
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0)
      }
      return 0
    })
  }, [products, searchQuery, priceRange, selectedCategory, sortBy])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const handleProductClick = (id: number) => {
    setSelectedProduct(id)
  }

  const getRelatedProducts = (productId: number): any[] => {
    const product = products.find(p => p.id === productId)
    if (!product) return []
    return products
      .filter((p) => p.id !== productId && (p.category === product.category || p.producer === product.producer))
      .slice(0, 5)
      .map((p) => transformProduct(p))
  }

  // transformProductDetails is now imported from product-api.ts

  // Show YarvestLoader when data is loading
  if (isLoading && isMounted) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="bg-white">
          <FreshFoodCategories />

            <div className="px-6 py-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <ProductCardSkeleton count={12} />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (productsError && products.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-16 bg-gradient-to-b from-white to-gray-50/50">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <Package className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Products</h1>
              <p className="text-lg text-gray-600 mb-6">{productsError}</p>
              <Button onClick={refetchProducts} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
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
      <main className="flex-1 overflow-auto">
        <div className="bg-white">
        
          <div className="px-6 py-6">
            <div className="max-w-7xl mx-auto">
            <FreshFoodCategories title={false} />

              {/* Top Controls Bar */}
              <div className="mb-6 mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left: Filter and View Toggle */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-11 px-5 rounded-full border-2 ${showFilters ? 'border-[#0A5D31] bg-[#0A5D31]/5' : 'border-gray-200'} hover:bg-gray-50`}
                  >
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    Filters
                  </Button>
                  <div className="flex border-2 border-gray-200 rounded-full overflow-hidden">
                    <Button
                      variant="ghost"
                      onClick={() => setViewMode("grid")}
                      className={`h-11 px-4 rounded-none ${viewMode === "grid" ? "bg-[#0A5D31] text-white" : "bg-white hover:bg-gray-50"}`}
                    >
                      <Grid3x3 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setViewMode("list")}
                      className={`h-11 px-4 rounded-none ${viewMode === "list" ? "bg-[#0A5D31] text-white" : "bg-white hover:bg-gray-50"}`}
                    >
                      <List className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Right: Sort */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-foreground text-sm focus:ring-2 focus:ring-[#0A5D31] focus:border-[#0A5D31] cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating: Highest</option>
                  </select>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <Card className="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-gray-900">Filters</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowFilters(false)}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-5">
                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={priceRange[0] === 0 && priceRange[1] === 1000 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPriceRange([0, 1000])}
                          className="rounded-full text-xs"
                        >
                          All
                        </Button>
                        <Button
                          variant={priceRange[0] === 0 && priceRange[1] === 10 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPriceRange([0, 10])}
                          className="rounded-full text-xs"
                        >
                          Under $10
                        </Button>
                        <Button
                          variant={priceRange[0] === 10 && priceRange[1] === 25 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPriceRange([10, 25])}
                          className="rounded-full text-xs"
                        >
                          $10 - $25
                        </Button>
                        <Button
                          variant={priceRange[0] === 25 && priceRange[1] === 50 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPriceRange([25, 50])}
                          className="rounded-full text-xs"
                        >
                          $25 - $50
                        </Button>
                        <Button
                          variant={priceRange[0] === 50 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPriceRange([50, 1000])}
                          className="rounded-full text-xs"
                        >
                          Over $50
                        </Button>
                      </div>
                    </div>

                    {/* Organic Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Product Type</label>
                      <Button
                        variant={selectedCategory === "Organic" ? "default" : "outline"}
                        onClick={() => setSelectedCategory(selectedCategory === "Organic" ? null : "Organic")}
                        className="w-full justify-start gap-2 rounded-lg"
                      >
                        {selectedCategory === "Organic" && <CheckCircle className="w-4 h-4" />}
                        <Leaf className="w-4 h-4" />
                        Organic Only
                      </Button>
                    </div>

                    {/* Producer Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Producer</label>
                      <select className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#0A5D31] focus:border-[#0A5D31]">
                        <option>All Producers</option>
                        <option>Green Valley Farm</option>
                        <option>Sunny Side Farm</option>
                        <option>Leaf & Root</option>
                        <option>Orchard Fresh</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPriceRange([0, 1000])
                        setSelectedCategory(null)
                        setSearchQuery("")
                      }}
                      className="w-full rounded-lg"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </Card>
              )}

              {/* Results Count */}
              <div className="mb-6 flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold text-[#0A5D31]">{filteredProducts.length}</span> of {products.length} products
                </p>
                {selectedCategory && (
                  <Badge className="bg-[#0A5D31]/10 text-[#0A5D31] px-3 py-1 rounded-full">
                    {selectedCategory}
                  </Badge>
                )}
              </div>

              {/* Products Grid/List */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      unit={product.unit}
                      code={product.code || ""}
                      image={product.image || null}
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
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="flex flex-row bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                  >
                    {/* Product Image */}
                    <div className="relative group overflow-hidden bg-gray-50 w-64 h-64 flex-shrink-0">
                      <div onClick={() => handleProductClick(product.id)} className="cursor-pointer">
                        <img
                          src={getImageUrl(product.image, product.name) }
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      {product.badge && (
                        <Badge className="absolute top-4 left-4 bg-[#0A5D31] text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                          {product.badge}
                        </Badge>
                      )}
                      {product.organic && (
                        <Badge className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                          Organic
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#0A5D31] mb-1 uppercase tracking-wider">{product.producer}</p>
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-bold text-xl text-foreground mb-2 hover:text-[#0A5D31] cursor-pointer leading-snug">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground mb-3 font-mono">SKU: {product.code}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-2xl text-[#0A5D31]">${typeof product.price === "number" ? product.price.toFixed(2) : parseFloat(product.price.toString() || "0").toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground">{product.unit}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 max-w-md">
                        <Button 
                          variant="outline" 
                          onClick={() => handleProductClick(product.id)}
                          className="flex-1 border-2 border-gray-200 hover:bg-gray-50 hover:border-[#0A5D31] rounded-xl font-semibold h-11"
                        >
                          View Details
                        </Button>
                          <Button className="flex-1 gap-2 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white rounded-xl font-semibold transition-all h-11">
                            <ShoppingCart className="w-4 h-4" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <Card className="p-12 text-center rounded-3xl border-2 border-gray-200">
                  <div className="max-w-md mx-auto">
                    <SlidersHorizontal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">No products found</h3>
                    <p className="text-muted-foreground text-lg mb-6">
                      Try adjusting your filters or selecting a different category
                    </p>
                    <Button 
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory(null)
                        setPriceRange([0, 1000])
                      }}
                      className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </Card>
              )}

              {/* You May Also Like Section */}
              {filteredProducts.length > 0 && (
                <div className="mt-16">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">You May Also Like</h2>
                    <p className="text-muted-foreground">Products similar to what you're viewing</p>
                  </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                          {products.slice(0, 5).map((product) => (
                            <ProductCard
                              key={product.id}
                              id={product.id}
                              name={product.name}
                              price={product.price}
                              unit={product.unit}
                              code={product.code || ""}
                              image={product.image || null}
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
                </div>
              )}

              {/* Recently Viewed Section */}
              {filteredProducts.length > 0 && (
                <div className="mt-16">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">Recently Viewed</h2>
                    <p className="text-muted-foreground">Continue shopping from where you left off</p>
                  </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                          {products.slice(5, 10).map((product) => (
                            <ProductCard
                              key={product.id}
                              id={product.id}
                              name={product.name}
                              price={product.price}
                              unit={product.unit}
                              code={product.code || ""}
                              image={product.image || null}
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
                </div>
              )}
            </div>
          </div>
        </div>
      <Footer />
      </main>

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
          relatedProducts={getRelatedProducts(selectedProduct)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onAddToCart={(productId, quantity) => {
            console.log("Add to cart:", productId, quantity)
          }}
        />
      )}
    </div>
  )
}

