"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Star, MapPin, Leaf, Truck, Shield, CheckCircle, Minus, Plus, Share2, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

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
  },
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = Number.parseInt(params.id as string)
  const product = productDetails[productId as keyof typeof productDetails]
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [imgSrc, setImgSrc] = useState("/placeholder.svg")
  const [producerImgError, setProducerImgError] = useState(false)
  const [producerImgSrc, setProducerImgSrc] = useState("/placeholder.svg")

  useEffect(() => {
    if (product) {
      setImgSrc(product.image || "/placeholder.svg")
      setProducerImgSrc(product.producerImage || "/placeholder.svg")
      setImgError(false)
      setProducerImgError(false)
    }
  }, [product])

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
      setImgSrc("/placeholder.svg")
    }
  }

  const handleProducerImageError = () => {
    if (!producerImgError) {
      setProducerImgError(true)
      setProducerImgSrc("/placeholder.svg")
    }
  }

  if (!product) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-12 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h2>
              <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
              <Link href="/products">
                <Button className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white">
                  Browse All Products
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-500">
            <Link href="/products" className="hover:text-gray-900">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>

          {/* Main Product Section - Modern Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Image Section - Light & Spacious */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl">
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  loading="lazy"
                />
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  {product.badge && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg px-4 py-2 text-sm font-bold">
                      {product.badge}
                    </Badge>
                  )}
                  {product.organic && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg px-4 py-2 text-sm font-bold">
                      <Leaf className="w-3 h-3 mr-1 inline" />
                      Organic
                    </Badge>
                  )}
                </div>
                <button className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Info Section - Clean & Modern */}
            <div className="flex flex-col">
              <div className="mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{product.rating}</span>
                  <span className="text-gray-500">({product.reviews} reviews)</span>
                </div>
              </div>

              {/* Price - Large & Prominent */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold text-gray-900">${typeof product.price === "number" ? product.price.toFixed(2) : parseFloat(product.price.toString() || "0").toFixed(2)}</span>
                  <span className="text-xl text-gray-500">{product.unit}</span>
                </div>
                {product.inStock && (
                  <div className="flex items-center gap-2 mt-3 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">In Stock</span>
                  </div>
                )}
              </div>

              {/* Producer Info - Card Style */}
              <div className="mb-8 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-4">
                  <img
                    src={producerImgSrc}
                    alt={product.producer}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                    onError={handleProducerImageError}
                    loading="lazy"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{product.producer}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Verified Producer</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white rounded-xl border-2 border-gray-200 p-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Total: <span className="font-bold text-lg text-gray-900">${(product.price * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-xl border-2 hover:bg-red-50 hover:border-red-200"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </div>
              </div>

              {/* Benefits - Light Icons */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Free delivery over $50</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <span>100% Satisfaction</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Fresh Guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <span>Local Sourced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Sections - Clean Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Description */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">About This Product</h3>
              <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700"><strong>Origin:</strong> {product.details.origin}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700"><strong>Certified Organic:</strong> Yes</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700"><strong>Pesticide Free:</strong> Yes</span>
                </div>
                <div className="pt-3 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                  <p><strong>Season:</strong> {product.details.season}</p>
                  <p><strong>Harvested:</strong> {product.details.harvested}</p>
                </div>
              </div>
            </div>

            {/* Nutrition */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 shadow-sm border border-green-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nutrition Facts</h3>
              <p className="text-sm text-gray-600 mb-6">Per serving (100g)</p>
              <div className="space-y-4">
                {[
                  { label: "Calories", value: product.nutritionFacts.calories },
                  { label: "Protein", value: product.nutritionFacts.protein },
                  { label: "Carbohydrates", value: product.nutritionFacts.carbs },
                  { label: "Dietary Fiber", value: product.nutritionFacts.fiber },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-3 border-b border-green-200 last:border-0">
                    <span className="text-gray-700 font-medium">{item.label}</span>
                    <span className="font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
