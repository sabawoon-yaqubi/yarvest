"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchIcon, X, SlidersHorizontal, Grid3x3, List, Sparkles, Package, TrendingUp, ArrowRight, Check } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"
import { ApiProductCard, ApiProduct } from "@/components/api-product-card"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { ProductModal } from "@/components/product-modal"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { useCartHandler } from "@/hooks/use-cart-handler"

interface ApiCategory {
  id: number
  unique_id: string
  name: string
  image: string | null
}

const trendingSearches = ["tomatoes", "apples", "lettuce", "carrots", "berries", "organic", "fresh", "local"]

export default function SearchPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQuery = searchParams.get("q") || ""
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("relevance")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null)
  const [products, setProducts] = useState<ApiProduct[]>([])
  const { handleAddToCart } = useCartHandler()

  // Fetch categories for filter
  const { data: categoriesResponse } = useApiFetch<{ data: ApiCategory[] }>("/categories")
  const categories = categoriesResponse?.data || []

  // Build API URL with filters - reactive to changes
  const apiUrl = useMemo(() => {
    // Don't build URL if no search query
    if (!searchQuery.trim()) {
      return ""
    }
    
    const params = new URLSearchParams()
    
    // Add search query
    params.set("search", searchQuery.trim())
    
    if (selectedCategory) {
      params.set("category_id", selectedCategory)
    }
    
    // Set order_by based on sortBy
    switch (sortBy) {
      case "price-low":
        params.set("order_by", "price")
        params.set("order_dir", "asc")
        break
      case "price-high":
        params.set("order_by", "price")
        params.set("order_dir", "desc")
        break
      case "rating":
        params.set("order_by", "created_at")
        params.set("order_dir", "desc")
        break
      default:
        params.set("order_by", "created_at")
        params.set("order_dir", "desc")
    }

    return `/products?${params.toString()}`
  }, [searchQuery, selectedCategory, sortBy])

  // Track current search URL to detect changes
  const [currentSearchUrl, setCurrentSearchUrl] = useState("")
  
  // Reset products when search URL changes
  useEffect(() => {
    if (apiUrl !== currentSearchUrl) {
      setProducts([])
      setCurrentSearchUrl(apiUrl)
    }
  }, [apiUrl, currentSearchUrl])


  const handleProductClick = (product: ApiProduct) => {
    setSelectedProduct(product)
  }

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((fav) => fav !== productId) : [...prev, productId]))
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setPriceRange(null)
    setSortBy("relevance")
  }

  const hasActiveFilters = selectedCategory || priceRange || sortBy !== "relevance"

  // Filter products by price range client-side
  const filteredProducts = useMemo(() => {
    if (!priceRange) return products
    return products.filter((product) => {
      const price = parseFloat(product.price)
      return (
        (priceRange === "Under $3" && price < 3) ||
        (priceRange === "$3 - $5" && price >= 3 && price <= 5) ||
        (priceRange === "$5 - $10" && price > 5 && price <= 10) ||
        (priceRange === "Over $10" && price > 10)
      )
    })
  }, [products, priceRange])

  const priceRanges = ["Under $3", "$3 - $5", "$5 - $10", "Over $10"]

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Search Results
            </h1>
            {searchQuery && (
              <p className="text-lg text-gray-600">
                Results for "<span className="font-semibold text-[#5a9c3a]">{searchQuery}</span>"
              </p>
            )}
          </div>
          {/* Trending Searches - Show when no search query */}
          {!searchQuery && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#5a9c3a]" />
                <h2 className="text-xl font-bold text-gray-900">Trending Searches</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {trendingSearches.map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                    className="rounded-full px-6 py-2 border-2 border-gray-200 hover:border-[#5a9c3a] hover:bg-[#5a9c3a]/5 transition-all"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Controls Bar */}
          {searchQuery && (
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600">
                  {filteredProducts.length > 0 ? (
                    <>
                      Showing <span className="font-bold text-[#5a9c3a]">{filteredProducts.length}</span> results
                    </>
                  ) : (
                    "No results found"
                  )}
                </p>
                {hasActiveFilters && (
                  <Badge className="bg-[#5a9c3a]/10 text-[#5a9c3a] px-3 py-1">
                    Filters Active
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`gap-2 border-2 ${showFilters ? "bg-[#5a9c3a] text-white border-[#5a9c3a]" : "border-gray-200"}`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Filters
                      {hasActiveFilters && (
                        <span className="ml-1 bg-[#5a9c3a] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {[selectedCategory, priceRange, sortBy !== "relevance"].filter(Boolean).length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 max-h-[80vh] overflow-y-auto p-3">
                    <div className="flex items-center justify-between mb-3 sticky top-0 bg-white pb-2 border-b">
                      <DropdownMenuLabel className="text-base font-bold">Filters</DropdownMenuLabel>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearFilters()
                          }}
                          className="h-7 text-xs text-[#5a9c3a] hover:text-[#0d7a3f]"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                    
                    {/* Category Filter */}
                    <div className="py-2">
                      <DropdownMenuLabel className="text-xs font-semibold text-gray-700 mb-2 px-2">Category</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
                        <DropdownMenuRadioItem value="all" className="text-sm">
                          All Categories
                        </DropdownMenuRadioItem>
                        {categories.map((cat) => (
                          <DropdownMenuRadioItem key={cat.id} value={cat.id.toString()} className="text-sm">
                            {cat.name}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Price Range Filter */}
                    <div className="py-2">
                      <DropdownMenuLabel className="text-xs font-semibold text-gray-700 mb-2 px-2">Price Range</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={priceRange || "all"} onValueChange={(value) => setPriceRange(value === "all" ? null : value)}>
                        <DropdownMenuRadioItem value="all" className="text-sm">
                          All Prices
                        </DropdownMenuRadioItem>
                        {priceRanges.map((price) => (
                          <DropdownMenuRadioItem key={price} value={price} className="text-sm">
                            {price}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex gap-1 border-2 border-gray-200 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-[#5a9c3a] text-white" : ""}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-[#5a9c3a] text-white" : ""}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a] cursor-pointer"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          )}


          {/* Search Results with Infinite Scroll */}
          {searchQuery && apiUrl ? (
            <InfiniteScrollFetcher<ApiProduct>
              key={apiUrl}
              url={apiUrl}
              limit={12}
              enabled={true}
              gridClassName={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-6" : "space-y-4"}
              renderItem={(product) => {
                // Apply price range filter client-side
                if (priceRange) {
                  const price = parseFloat(product.price)
                  const matchesPrice = 
                    (priceRange === "Under $3" && price < 3) ||
                    (priceRange === "$3 - $5" && price >= 3 && price <= 5) ||
                    (priceRange === "$5 - $10" && price > 5 && price <= 10) ||
                    (priceRange === "Over $10" && price > 10)
                  if (!matchesPrice) return null
                }

                if (viewMode === "grid") {
                  return (
                    <ApiProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.includes(product.id)}
                    />
                  )
                } else {
                  return (
                    <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-row bg-white border-2 border-gray-100 rounded-2xl">
                      <div className="relative w-48 h-48 bg-gray-50 flex-shrink-0 group cursor-pointer" onClick={() => handleProductClick(product)}>
                        <img
                          src={product.main_image || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-[#5a9c3a] mb-1 uppercase tracking-wide">
                              {product.seller?.full_name || "Unknown Producer"}
                            </p>
                            <h3 
                              className="font-bold text-xl text-gray-900 mb-2 hover:text-[#5a9c3a] cursor-pointer transition-colors" 
                              onClick={() => handleProductClick(product)}
                            >
                              {product.name}
                            </h3>
                            {product.product_category && (
                              <Badge className="bg-[#5a9c3a]/10 text-[#5a9c3a] text-xs mb-2">
                                {product.product_category.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {product.reviews && product.reviews.total > 0 && (
                          <div className="flex items-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < Math.floor(product.reviews!.average_rating)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              {product.reviews.average_rating.toFixed(1)} ({product.reviews.total} reviews)
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <div>
                            <span className="font-bold text-3xl text-[#5a9c3a]">
                              ${product.price}
                            </span>
                          </div>
                          <Button 
                            className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white gap-2 rounded-xl"
                            onClick={() => handleAddToCart(product, 1)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                }
              }}
              renderLoading={() => <ProductCardSkeleton count={12} />}
              renderError={(error, retry) => (
                <div className="text-center py-16 col-span-full">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                    <Package className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Products</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button onClick={retry} className="bg-[#5a9c3a] hover:bg-[#0d7a3f]">
                    Try Again
                  </Button>
                </div>
              )}
              renderEmpty={() => (
                <Card className="p-16 text-center rounded-3xl border-2 border-gray-200">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                    <SearchIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    We couldn't find any products matching your search. Try adjusting your filters or search terms.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={clearFilters} 
                      variant="outline"
                      className="rounded-xl"
                    >
                      Clear Filters
                    </Button>
                    <Button 
                      onClick={() => router.push("/products")}
                      className="bg-[#5a9c3a] hover:bg-[#0d7a3f] rounded-xl"
                    >
                      Browse All Products
                    </Button>
                  </div>
                </Card>
              )}
              onSuccess={(data) => {
                // Accumulate products for infinite scroll
                if (data && Array.isArray(data)) {
                  setProducts(prev => {
                    const newProducts = data
                    // Filter out duplicates by ID
                    const existingIds = new Set(prev.map(p => p.id))
                    const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id))
                    return [...prev, ...uniqueNewProducts]
                  })
                }
              }}
            />
          ) : (
            <Card className="p-16 text-center rounded-3xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-[#5a9c3a]/10 rounded-full mb-6">
                <Sparkles className="w-12 h-12 text-[#5a9c3a]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Search</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Enter a search term above to discover fresh products from local farmers and producers
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {trendingSearches.slice(0, 4).map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                    className="rounded-full border-2 border-gray-200 hover:border-[#5a9c3a] hover:bg-[#5a9c3a]/5 transition-all"
                  >
                    {term}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>
        <Footer />

        {/* Product Modal */}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            open={!!selectedProduct}
            onOpenChange={(open) => !open && setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(selectedProduct.id)}
          />
        )}
      </main>
    </div>
  )
}
