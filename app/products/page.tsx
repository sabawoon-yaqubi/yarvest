"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { ProductCategories } from "@/components/product-categories"
import { ProductDetailsModal } from "@/components/product-details-modal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, SlidersHorizontal, Grid3x3, List, X, CheckCircle, Leaf } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const allProducts = [
  {
    id: 1,
    name: "Organic Heirloom Tomatoes",
    price: 4.99,
    unit: "/lb",
    code: "TOMO001",
    image: "https://images.unsplash.com/photo-1592924357228-91a8676d3a88?w=800&h=800&fit=crop",
    producer: "Green Valley Farm",
    rating: 4.8,
    reviews: 128,
    badge: "Best Seller",
    category: "Vegetables",
    organic: true,
  },
  {
    id: 2,
    name: "Fresh Local Carrots",
    price: 2.99,
    unit: "/lb",
    code: "CARR002",
    image: "https://images.unsplash.com/photo-1599599810694-b5ac4dd64b51?w=800&h=800&fit=crop",
    producer: "Sunny Side Farm",
    rating: 4.9,
    reviews: 95,
    badge: "New",
    category: "Vegetables",
    organic: true,
  },
  {
    id: 3,
    name: "Crisp Organic Lettuce",
    price: 3.49,
    unit: "/pack",
    code: "LETT003",
    image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&h=800&fit=crop",
    producer: "Leaf & Root",
    rating: 4.7,
    reviews: 82,
    badge: null,
    category: "Vegetables",
    organic: true,
  },
  {
    id: 4,
    name: "Sweet Local Apples",
    price: 5.99,
    unit: "/lb",
    code: "APPL004",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b27c8a?w=800&h=800&fit=crop",
    producer: "Orchard Fresh",
    rating: 4.9,
    reviews: 156,
    badge: "Premium",
    category: "Fruits",
    organic: true,
  },
  {
    id: 5,
    name: "Fresh Spinach Bundles",
    price: 3.99,
    unit: "/pack",
    code: "SPIN005",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop",
    producer: "Green Valley Farm",
    rating: 4.8,
    reviews: 112,
    badge: "Organic",
    category: "Vegetables",
    organic: true,
  },
  {
    id: 6,
    name: "Premium Blueberries",
    price: 7.99,
    unit: "/pack",
    code: "BLUE006",
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&h=800&fit=crop",
    producer: "Berry Fields Co.",
    rating: 5.0,
    reviews: 203,
    badge: "Premium",
    category: "Fruits",
    organic: true,
  },
  {
    id: 7,
    name: "Fresh Broccoli",
    price: 3.29,
    unit: "/lb",
    code: "BROC007",
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&h=800&fit=crop",
    producer: "Green Valley Farm",
    rating: 4.6,
    reviews: 67,
    badge: null,
    category: "Vegetables",
    organic: true,
  },
  {
    id: 8,
    name: "Organic Strawberries",
    price: 6.99,
    unit: "/pack",
    code: "STRA008",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop",
    producer: "Berry Fields Co.",
    rating: 4.9,
    reviews: 189,
    badge: "Best Seller",
    category: "Fruits",
    organic: true,
  },
  {
    id: 9,
    name: "Fresh Bell Peppers",
    price: 4.49,
    unit: "/lb",
    code: "PEPP009",
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&h=800&fit=crop",
    producer: "Sunny Side Farm",
    rating: 4.7,
    reviews: 91,
    badge: null,
    category: "Vegetables",
    organic: false,
  },
  {
    id: 10,
    name: "Organic Kale",
    price: 3.79,
    unit: "/bunch",
    code: "KALE010",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop",
    producer: "Leaf & Root",
    rating: 4.8,
    reviews: 124,
    badge: "Organic",
    category: "Vegetables",
    organic: true,
  },
]

const productDetails: Record<number, any> = {
  1: {
    id: 1,
    name: "Organic Heirloom Tomatoes",
    price: 4.99,
    unit: "per lb",
    code: "TOMO001",
    image: "https://images.unsplash.com/photo-1592924357228-91a8676d3a88?w=800&h=800&fit=crop",
    producer: "Green Valley Farm",
    producerImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=100&h=100&fit=crop",
    rating: 4.8,
    reviews: 156,
    inStock: true,
    badge: "Best Seller",
    organic: true,
    description: "Fresh, organic heirloom tomatoes grown without pesticides or synthetic fertilizers. These sun-ripened beauties are perfect for salads, cooking, or eating fresh. Handpicked at peak ripeness to ensure maximum flavor and nutrition.",
    details: {
      origin: "Marin County, CA",
      organic: true,
      pesticide_free: true,
      season: "Summer to Fall",
      harvested: "Daily",
    },
    nutritionFacts: {
      calories: 18,
      protein: "0.9g",
      carbs: "3.9g",
      fiber: "1.2g",
    },
    category: "Vegetables",
  },
  2: {
    id: 2,
    name: "Fresh Local Carrots",
    price: 2.99,
    unit: "per lb",
    code: "CARR002",
    image: "https://images.unsplash.com/photo-1599599810694-b5ac4dd64b51?w=800&h=800&fit=crop",
    producer: "Sunny Side Farm",
    producerImage: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=100&h=100&fit=crop",
    rating: 4.9,
    reviews: 203,
    inStock: true,
    badge: "New",
    organic: true,
    description: "Crisp, sweet carrots harvested at peak ripeness. Great raw, roasted, or juiced for maximum nutrition. Our carrots are grown using sustainable farming practices without any harmful pesticides.",
    details: {
      origin: "Sonoma County, CA",
      organic: true,
      pesticide_free: true,
      season: "Year-round",
      harvested: "Twice weekly",
    },
    nutritionFacts: {
      calories: 41,
      protein: "0.9g",
      carbs: "10g",
      fiber: "2.8g",
    },
    category: "Vegetables",
  },
  3: {
    id: 3,
    name: "Crisp Organic Lettuce",
    price: 3.49,
    unit: "per pack",
    code: "LETT003",
    image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&h=800&fit=crop",
    producer: "Leaf & Root",
    producerImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100&h=100&fit=crop",
    rating: 4.7,
    reviews: 82,
    inStock: true,
    organic: true,
    description: "Fresh, crisp organic lettuce perfect for salads and sandwiches. Grown using sustainable methods and harvested daily to ensure maximum freshness.",
    details: {
      origin: "San Francisco, CA",
      organic: true,
      pesticide_free: true,
      season: "Year-round",
      harvested: "Daily",
    },
    nutritionFacts: {
      calories: 15,
      protein: "1.4g",
      carbs: "2.9g",
      fiber: "1.3g",
    },
    category: "Vegetables",
  },
  4: {
    id: 4,
    name: "Sweet Local Apples",
    price: 5.99,
    unit: "per lb",
    code: "APPL004",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b27c8a?w=800&h=800&fit=crop",
    producer: "Orchard Fresh",
    producerImage: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=100&h=100&fit=crop",
    rating: 4.9,
    reviews: 156,
    inStock: true,
    badge: "Premium",
    organic: true,
    description: "Crisp, sweet apples picked fresh from our orchard. Perfect for snacking, baking, or making fresh juice. Available in multiple varieties.",
    details: {
      origin: "Sonoma County, CA",
      organic: true,
      pesticide_free: true,
      season: "Fall to Spring",
      harvested: "Weekly",
    },
    nutritionFacts: {
      calories: 52,
      protein: "0.3g",
      carbs: "14g",
      fiber: "2.4g",
    },
    category: "Fruits",
  },
  5: {
    id: 5,
    name: "Fresh Spinach Bundles",
    price: 3.99,
    unit: "per pack",
    code: "SPIN005",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop",
    producer: "Green Valley Farm",
    producerImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=100&h=100&fit=crop",
    rating: 4.8,
    reviews: 112,
    inStock: true,
    badge: "Organic",
    organic: true,
    description: "Fresh, tender spinach leaves perfect for salads, smoothies, or cooking. Packed with nutrients and flavor.",
    details: {
      origin: "Marin County, CA",
      organic: true,
      pesticide_free: true,
      season: "Year-round",
      harvested: "Twice weekly",
    },
    nutritionFacts: {
      calories: 23,
      protein: "2.9g",
      carbs: "3.6g",
      fiber: "2.2g",
    },
    category: "Vegetables",
  },
  6: {
    id: 6,
    name: "Premium Blueberries",
    price: 7.99,
    unit: "per pack",
    code: "BLUE006",
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&h=800&fit=crop",
    producer: "Berry Fields Co.",
    producerImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop",
    rating: 5.0,
    reviews: 203,
    inStock: true,
    badge: "Premium",
    organic: true,
    description: "Sweet, plump blueberries bursting with flavor. Perfect for breakfast, desserts, or as a healthy snack.",
    details: {
      origin: "Watsonville, CA",
      organic: true,
      pesticide_free: true,
      season: "Summer",
      harvested: "Daily",
    },
    nutritionFacts: {
      calories: 57,
      protein: "0.7g",
      carbs: "14g",
      fiber: "2.4g",
    },
    category: "Fruits",
  },
  7: {
    id: 7,
    name: "Fresh Broccoli",
    price: 3.29,
    unit: "per lb",
    code: "BROC007",
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&h=800&fit=crop",
    producer: "Green Valley Farm",
    rating: 4.6,
    reviews: 67,
    inStock: true,
    organic: true,
    description: "Fresh, crisp broccoli perfect for steaming, roasting, or adding to stir-fries.",
    details: {
      origin: "Marin County, CA",
      organic: true,
      pesticide_free: true,
      season: "Year-round",
      harvested: "Twice weekly",
    },
    nutritionFacts: {
      calories: 34,
      protein: "2.8g",
      carbs: "7g",
      fiber: "2.6g",
    },
    category: "Vegetables",
  },
  8: {
    id: 8,
    name: "Organic Strawberries",
    price: 6.99,
    unit: "per pack",
    code: "STRA008",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop",
    producer: "Berry Fields Co.",
    rating: 4.9,
    reviews: 189,
    inStock: true,
    badge: "Best Seller",
    organic: true,
    description: "Sweet, juicy organic strawberries. Perfect for desserts, smoothies, or fresh eating.",
    details: {
      origin: "Watsonville, CA",
      organic: true,
      pesticide_free: true,
      season: "Spring to Summer",
      harvested: "Daily",
    },
    nutritionFacts: {
      calories: 32,
      protein: "0.7g",
      carbs: "7.7g",
      fiber: "2g",
    },
    category: "Fruits",
  },
  9: {
    id: 9,
    name: "Fresh Bell Peppers",
    price: 4.49,
    unit: "per lb",
    code: "PEPP009",
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&h=800&fit=crop",
    producer: "Sunny Side Farm",
    rating: 4.7,
    reviews: 91,
    inStock: true,
    organic: false,
    description: "Colorful bell peppers in red, yellow, and green. Great for salads, roasting, or stuffing.",
    details: {
      origin: "Sonoma County, CA",
      organic: false,
      pesticide_free: false,
      season: "Summer to Fall",
      harvested: "Twice weekly",
    },
    nutritionFacts: {
      calories: 31,
      protein: "1g",
      carbs: "7g",
      fiber: "2.5g",
    },
    category: "Vegetables",
  },
  10: {
    id: 10,
    name: "Organic Kale",
    price: 3.79,
    unit: "per bunch",
    code: "KALE010",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop",
    producer: "Leaf & Root",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    badge: "Organic",
    organic: true,
    description: "Nutrient-dense organic kale perfect for salads, smoothies, or sautéing.",
    details: {
      origin: "San Francisco, CA",
      organic: true,
      pesticide_free: true,
      season: "Year-round",
      harvested: "Twice weekly",
    },
    nutritionFacts: {
      calories: 49,
      protein: "4.3g",
      carbs: "8.8g",
      fiber: "2g",
    },
    category: "Vegetables",
  },
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20])
  const [sortBy, setSortBy] = useState("featured")

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.producer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === "All" || 
      (selectedCategory === "Organic" ? product.organic : product.category === selectedCategory)
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    return matchesSearch && matchesCategory && matchesPrice
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price
    if (sortBy === "price-high") return b.price - a.price
    if (sortBy === "rating") return b.rating - a.rating
    return 0
  })

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const handleProductClick = (id: number) => {
    setSelectedProduct(id)
  }

  const getRelatedProducts = (productId: number) => {
    const product = productDetails[productId as keyof typeof productDetails]
    if (!product) return []
    return allProducts
      .filter((p) => p.id !== productId && (p.category === product.category || p.producer === product.producer))
      .slice(0, 5)
      .map((p) => ({
        ...p,
        ...productDetails[p.id as keyof typeof productDetails],
      }))
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="bg-white">
          {/* Categories Section */}
          <ProductCategories 
            selectedCategory={selectedCategory} 
            onCategorySelect={setSelectedCategory}
          />

          <div className="px-6 py-6">
            <div className="max-w-7xl mx-auto">
              {/* Top Controls Bar */}
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                          variant={priceRange[0] === 0 && priceRange[1] === 20 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPriceRange([0, 20])}
                          className="rounded-full text-xs"
                        >
                          All
                        </Button>
                        <Button
                          variant={priceRange[0] === 0 && priceRange[1] === 5 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPriceRange([0, 5])}
                          className="rounded-full text-xs"
                        >
                          Under $5
                        </Button>
                        <Button
                          variant={priceRange[0] === 5 && priceRange[1] === 10 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPriceRange([5, 10])}
                          className="rounded-full text-xs"
                        >
                          $5 - $10
                        </Button>
                        <Button
                          variant={priceRange[0] === 10 && priceRange[1] === 20 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPriceRange([10, 20])}
                          className="rounded-full text-xs"
                        >
                          $10 - $20
                        </Button>
                        <Button
                          variant={priceRange[0] === 20 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPriceRange([20, 100])}
                          className="rounded-full text-xs"
                        >
                          Over $20
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
                        setPriceRange([0, 20])
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
                  Showing <span className="font-bold text-[#0A5D31]">{filteredProducts.length}</span> of {allProducts.length} products
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
                      code={product.code}
                      image={product.image}
                      producer={product.producer}
                      rating={product.rating}
                      reviews={product.reviews}
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
                          src={product.image || "/placeholder.svg"}
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
                                  i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
                            <span className="font-bold text-2xl text-[#0A5D31]">${product.price.toFixed(2)}</span>
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
                        setPriceRange([0, 20])
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
                          {allProducts.slice(0, 5).map((product) => (
                            <ProductCard
                              key={product.id}
                              id={product.id}
                              name={product.name}
                              price={product.price}
                              unit={product.unit}
                              code={product.code}
                              image={product.image}
                              producer={product.producer}
                              rating={product.rating}
                              reviews={product.reviews}
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
                          {allProducts.slice(5, 10).map((product) => (
                            <ProductCard
                              key={product.id}
                              id={product.id}
                              name={product.name}
                              price={product.price}
                              unit={product.unit}
                              code={product.code}
                              image={product.image}
                              producer={product.producer}
                              rating={product.rating}
                              reviews={product.reviews}
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

      {selectedProduct && (
        <ProductDetailsModal
          product={productDetails[selectedProduct as keyof typeof productDetails]}
          open={selectedProduct !== null}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
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

