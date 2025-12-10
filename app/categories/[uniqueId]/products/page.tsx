"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SlidersHorizontal, Grid3x3, List, Search, ArrowLeft, Package, ShoppingCart, Star } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/axios"
import { getImageUrl } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading-spinner"

interface Product {
  id: number
  name: string
  price: number | string
  unit: string
  code?: string
  image?: string
  producer?: string
  rating?: number
  reviews?: number
  badge?: string | null
  organic?: boolean
  category_id?: number
  category_unique_id?: string
  stock?: number
  discount?: number
  originalPrice?: number
  [key: string]: any
}

interface Category {
  id: number
  name: string
  unique_id: string
  image?: string
  slug?: string
}

export default function CategoryProductsPage() {
  const params = useParams()
  const router = useRouter()
  const uniqueId = params.uniqueId as string

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState("featured")

  // Fetch products by category unique_id (category info is included in the response)
  useEffect(() => {
    let isMounted = true
    
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch products filtered by category unique_id
        // API endpoint: /categories/{uniqueId}/products
        const response = await api.get(`/categories/${uniqueId}/products`)

        if (!isMounted) return
        
        // Extract category info from response.data.data.category
        if (response.data?.data?.category) {
          const categoryData = response.data.data.category
          if (isMounted) {
            setCategory({
              id: categoryData.id,
              name: categoryData.name,
              unique_id: categoryData.unique_id,
              image: categoryData.image,
            })
          }
        }
        
        // Extract products from response.data.data.products
        // Structure: { success: true, data: { category: {...}, products: [...], count: 1 } }
        let productsData: any[] = []
        
        if (response.data?.data?.products && Array.isArray(response.data.data.products)) {
          productsData = response.data.data.products
        }

        // Map API products to component format
        const mappedProducts = productsData.map((product: any) => {
          // Get image - use main_image or first image from images array
          let productImage = product.main_image
          if (!productImage && product.images && Array.isArray(product.images) && product.images.length > 0) {
            productImage = product.images[0].image
          }
          
          // Get producer name from seller
          let producerName = "Unknown Producer"
          if (product.seller) {
            const firstName = product.seller.first_name || ""
            const lastName = product.seller.last_name || ""
            producerName = `${firstName} ${lastName}`.trim() || product.seller.email || "Unknown Producer"
          }
          
          // Get unit from product_type
          const unit = product.product_type?.name || "/unit"
          
          // Calculate price with discount
          const basePrice = parseFloat(product.price || "0")
          const discount = parseFloat(product.discount || "0")
          const finalPrice = discount > 0 ? basePrice - discount : basePrice
          
          return {
            id: product.id,
            name: product.name || "Unnamed Product",
            price: finalPrice,
            unit: unit,
            code: product.sku || product.unique_id || "",
            image: getImageUrl(productImage),
            producer: producerName,
            rating: product.rating || product.average_rating || 0,
            reviews: product.reviews_count || product.reviews || 0,
            badge: discount > 0 ? "On Sale" : null,
            organic: product.organic || product.is_organic || false,
            category_id: product.product_category_id,
            stock: product.stock || 0,
            discount: discount,
            originalPrice: basePrice,
          }
        })
        
        if (isMounted) {
          setProducts(mappedProducts)
        }
      } catch (err: any) {
        console.error("Error fetching products:", err)
        
        if (isMounted) {
          setError(err.response?.data?.message || err.message || "Failed to load products")
          setProducts([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (uniqueId) {
      fetchProducts()
    } else {
      if (isMounted) {
        setIsLoading(false)
        setError("Category ID not found")
      }
    }
    
    // Cleanup
    return () => {
      isMounted = false
    }
  }, [uniqueId])

  // Auto-scroll to top when products load
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [isLoading, products.length])

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.producer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.code?.toLowerCase().includes(searchQuery.toLowerCase())
      const price = typeof product.price === "number" ? product.price : parseFloat(product.price.toString()) || 0
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1]
      return matchesSearch && matchesPrice
    })
    .sort((a, b) => {
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

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const handleProductClick = (id: number) => {
    router.push(`/products/${id}`)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-16">
            <div className="max-w-7xl mx-auto">
              <LoadingSpinner />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error && products.length === 0) {
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
              <p className="text-lg text-gray-600 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.back()} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={() => window.location.reload()} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1">
        <div className="bg-white">
          <div className="px-6 py-6">
            <div className="max-w-7xl mx-auto">
              {/* Breadcrumb */}
              <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-[#0A5D31]">Home</Link>
                <span>/</span>
                <Link href="/categories" className="hover:text-[#0A5D31]">Categories</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">{category?.name || uniqueId}</span>
              </div>

              {/* Category Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                </div>
                <div className="flex items-center gap-6">
                  {category?.image && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-100">
                      <img
                        src={getImageUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {category?.name || uniqueId}
                    </h1>
                    <p className="text-gray-600">
                      {products.length} {products.length === 1 ? "product" : "products"} available
                      {filteredProducts.length !== products.length && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({filteredProducts.length} shown after filters)
                        </span>
                      )}
                    </p>
                    {/* Debug info */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2 text-xs text-gray-400">
                        Debug: isLoading={isLoading.toString()}, error={error || 'none'}, products={products.length}, filtered={filteredProducts.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Controls Bar */}
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Left: Filter and View Toggle */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-11 px-5 rounded-full border-2 ${showFilters ? "border-[#0A5D31] bg-[#0A5D31]/5" : "border-gray-200"} hover:bg-gray-50`}
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

                {/* Right: Search and Sort */}
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 h-11 rounded-full border-2 border-gray-200 focus:border-[#0A5D31] focus:ring-2 focus:ring-[#0A5D31]/20"
                    />
                  </div>
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
                      ×
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

                    {/* Clear Filters */}
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPriceRange([0, 1000])
                          setSearchQuery("")
                        }}
                        className="w-full rounded-lg"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Results Count */}
              <div className="mb-6 flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold text-[#0A5D31]">{filteredProducts.length}</span> of {products.length} products
                </p>
              </div>

              {/* Products Grid/List */}
              {products.length === 0 && !isLoading ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">
                    {error || "No products available in this category"}
                  </p>
                  {error && (
                    <Button onClick={() => window.location.reload()} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                      Retry
                    </Button>
                  )}
                </div>
              ) : filteredProducts.length === 0 && products.length > 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products match your filters</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? "Try adjusting your search query" : "Try adjusting your filters"}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("")
                      setPriceRange([0, 1000])
                    }} 
                    className="rounded-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="group cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                      <div className="relative">
                        {/* Product Image */}
                        <div className="relative aspect-square bg-gray-50 overflow-hidden">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onClick={() => handleProductClick(product.id)}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              if (target.src !== "/placeholder.svg") {
                                target.src = "/placeholder.svg"
                              }
                            }}
                          />
                          
                          {/* Add Button */}
                          <Button
                            className="absolute top-2 right-2 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white rounded-full h-10 px-4 shadow-md"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Add to cart logic here
                            }}
                          >
                            <span className="text-xl mr-1">+</span> Add
                          </Button>

                          {/* Badge for discount */}
                          {product.discount && product.discount > 0 && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-yellow-400 text-black px-2 py-1 text-xs font-bold">
                                Save ${product.discount.toFixed(2)}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-3" onClick={() => handleProductClick(product.id)}>
                          {/* Price */}
                          <div className="mb-2">
                            <span className="text-2xl font-bold text-gray-900">
                              ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                            </span>
                            {product.originalPrice && product.originalPrice > (typeof product.price === "number" ? product.price : parseFloat(product.price.toString())) && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Promotional Badge */}
                          {product.discount && product.discount > 0 && (
                            <div className="mb-2">
                              <Badge className="bg-yellow-300 text-black px-2 py-0.5 text-xs font-semibold">
                                Spend $20, save $5
                              </Badge>
                            </div>
                          )}

                          {/* Product Name */}
                          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">
                              ({product.reviews || 0})
                            </span>
                          </div>

                          {/* Size/Unit */}
                          <p className="text-xs text-gray-600 mb-2">
                            {product.code} • {product.unit}
                          </p>

                          {/* Stock Status */}
                          <div className="flex items-center gap-1 text-xs text-green-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">
                              {product.stock && product.stock > 0 ? "Many in stock" : "In stock"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="flex flex-row bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      {/* Product Image */}
                      <div className="relative group overflow-hidden bg-gray-50 w-64 h-64 flex-shrink-0">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            if (target.src !== "/placeholder.svg") {
                              target.src = "/placeholder.svg"
                            }
                          }}
                          loading="lazy"
                        />
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
                          <p className="text-xs font-bold text-[#0A5D31] mb-1 uppercase tracking-wider">
                            {product.producer}
                          </p>
                          <h3 className="font-bold text-xl text-foreground mb-2 hover:text-[#0A5D31] leading-snug">
                            {product.name}
                          </h3>
                          {product.code && (
                            <p className="text-xs text-muted-foreground mb-3 font-mono">SKU: {product.code}</p>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({product.reviews || 0} {product.reviews === 1 ? "review" : "reviews"})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-[#0A5D31]">
                              ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                            </span>
                            <span className="text-sm text-gray-600 ml-1">{product.unit}</span>
                          </div>
                          <Button className="bg-[#0A5D31] hover:bg-[#0d7a3f] rounded-full px-6">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

