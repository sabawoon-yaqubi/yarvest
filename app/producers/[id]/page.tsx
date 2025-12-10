"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle, Mail, Phone, MessageSquare, Package, Calendar, Award, Globe, Truck, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ProductDetailsModal } from "@/components/product-details-modal"

const producerProducts: Record<number, any[]> = {
  1: [
    { id: 1, name: "Organic Heirloom Tomatoes", price: 4.99, unit: "/lb", code: "TOMO001", image: "https://images.unsplash.com/photo-1592924357228-91a8676d3a88?w=800&h=800&fit=crop", producer: "Green Valley Farm", rating: 4.8, reviews: 128, badge: "Best Seller", category: "Vegetables", organic: true },
    { id: 3, name: "Crisp Organic Lettuce", price: 3.49, unit: "/pack", code: "LETT003", image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&h=800&fit=crop", producer: "Green Valley Farm", rating: 4.7, reviews: 82, badge: null, category: "Vegetables", organic: true },
    { id: 5, name: "Fresh Spinach Bundles", price: 3.99, unit: "/pack", code: "SPIN005", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop", producer: "Green Valley Farm", rating: 4.8, reviews: 112, badge: "Organic", category: "Vegetables", organic: true },
    { id: 7, name: "Fresh Broccoli", price: 3.29, unit: "/lb", code: "BROC007", image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&h=800&fit=crop", producer: "Green Valley Farm", rating: 4.6, reviews: 67, badge: null, category: "Vegetables", organic: true },
  ],
  2: [
    { id: 4, name: "Sweet Local Apples", price: 5.99, unit: "/lb", code: "APPL004", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b27c8a?w=800&h=800&fit=crop", producer: "Sunny Side Orchard", rating: 4.9, reviews: 156, badge: "Premium", category: "Fruits", organic: true },
  ],
  3: [
    { id: 3, name: "Crisp Organic Lettuce", price: 3.49, unit: "/pack", code: "LETT003", image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&h=800&fit=crop", producer: "Leaf & Root", rating: 4.7, reviews: 82, badge: null, category: "Vegetables", organic: true },
    { id: 10, name: "Organic Kale", price: 3.79, unit: "/bunch", code: "KALE010", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop", producer: "Leaf & Root", rating: 4.8, reviews: 124, badge: "Organic", category: "Vegetables", organic: true },
  ],
  4: [],
  5: [
    { id: 6, name: "Premium Blueberries", price: 7.99, unit: "/pack", code: "BLUE006", image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&h=800&fit=crop", producer: "Berry Fields Co.", rating: 5.0, reviews: 203, badge: "Premium", category: "Fruits", organic: true },
    { id: 8, name: "Organic Strawberries", price: 6.99, unit: "/pack", code: "STRA008", image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop", producer: "Berry Fields Co.", rating: 4.9, reviews: 189, badge: "Best Seller", category: "Fruits", organic: true },
  ],
  6: [],
}

const allProducers = [
  {
    id: 1,
    name: "Green Valley Farm",
    location: "Marin County, CA",
    fullAddress: "123 Farm Road, Marin County, CA 94941",
    specialty: "Organic Vegetables",
    description: "Family-owned organic farm specializing in seasonal vegetables and greens. We've been serving our community for over 15 years with sustainable farming practices.",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=500&h=400&fit=crop",
    rating: 4.9,
    verified: true,
    products: 45,
    yearsInBusiness: 15,
    email: "contact@greenvalleyfarm.com",
    phone: "(415) 555-0101",
    website: "www.greenvalleyfarm.com",
    certifications: ["USDA Organic", "Non-GMO Project Verified"],
    activities: ["Farm Tours", "CSA Programs", "Farmers Market"],
    deliveryAreas: ["Marin County", "San Francisco", "East Bay"],
    established: "2008",
  },
  {
    id: 2,
    name: "Sunny Side Orchard",
    location: "Sonoma County, CA",
    fullAddress: "456 Orchard Lane, Sonoma County, CA 95476",
    specialty: "Fresh Fruits & Apples",
    description: "Multi-generational apple orchard with fresh seasonal fruits. Our family has been growing premium apples for over 22 years.",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&h=400&fit=crop",
    rating: 4.8,
    verified: true,
    products: 32,
    yearsInBusiness: 22,
    email: "info@sunnysideorchard.com",
    phone: "(707) 555-0202",
    website: "www.sunnysideorchard.com",
    certifications: ["USDA Organic", "California Certified Organic"],
    activities: ["U-Pick Events", "Apple Cider Making", "Seasonal Festivals"],
    deliveryAreas: ["Sonoma County", "Napa Valley", "Marin County"],
    established: "2001",
  },
  {
    id: 3,
    name: "Leaf & Root Collective",
    location: "San Francisco, CA",
    fullAddress: "789 Urban Farm St, San Francisco, CA 94110",
    specialty: "Local Greens",
    description: "Urban farm committed to delivering fresh, locally-grown leafy greens. We focus on sustainable urban agriculture and community engagement.",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=400&fit=crop",
    rating: 4.7,
    verified: true,
    products: 28,
    yearsInBusiness: 8,
    email: "hello@leafandroot.com",
    phone: "(415) 555-0303",
    website: "www.leafandroot.com",
    certifications: ["USDA Organic"],
    activities: ["Community Workshops", "School Programs", "Urban Gardening"],
    deliveryAreas: ["San Francisco", "Oakland", "Berkeley"],
    established: "2015",
  },
  {
    id: 4,
    name: "Meadow Fresh Dairy",
    location: "Petaluma, CA",
    fullAddress: "321 Dairy Road, Petaluma, CA 94952",
    specialty: "Local Dairy Products",
    description: "Artisanal dairy farm producing fresh milk and cheese products. We raise our cows on pasture and follow traditional dairy methods.",
    image: "https://images.unsplash.com/photo-1535248901601-a9cb0ecb5dbe?w=500&h=400&fit=crop",
    rating: 4.9,
    verified: true,
    products: 18,
    yearsInBusiness: 18,
    email: "contact@meadowfresh.com",
    phone: "(707) 555-0404",
    website: "www.meadowfresh.com",
    certifications: ["Certified Humane", "Grass-Fed"],
    activities: ["Farm Tours", "Cheese Making Classes", "Farm Store"],
    deliveryAreas: ["Petaluma", "Marin County", "Sonoma County"],
    established: "2005",
  },
  {
    id: 5,
    name: "Berry Fields Co.",
    location: "Watsonville, CA",
    fullAddress: "654 Berry Lane, Watsonville, CA 95076",
    specialty: "Fresh Berries",
    description: "Specializing in organic strawberries, blueberries, and raspberries. We grow premium berries using sustainable methods.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=400&fit=crop",
    rating: 4.8,
    verified: true,
    products: 25,
    yearsInBusiness: 12,
    email: "info@berryfields.com",
    phone: "(831) 555-0505",
    website: "www.berryfields.com",
    certifications: ["USDA Organic", "California Certified Organic"],
    activities: ["Berry Picking", "Jam Making Workshops", "Seasonal Events"],
    deliveryAreas: ["Watsonville", "Santa Cruz", "Monterey Bay"],
    established: "2011",
  },
  {
    id: 6,
    name: "Root To Table",
    location: "Oakland, CA",
    fullAddress: "987 Root Street, Oakland, CA 94601",
    specialty: "Root Vegetables",
    description: "Heirloom and specialty root vegetable cultivation. We grow unique varieties of carrots, beets, potatoes, and more.",
    image: "https://images.unsplash.com/photo-1599599810963-8db6ce1a8ba5?w=500&h=400&fit=crop",
    rating: 4.6,
    verified: true,
    products: 19,
    yearsInBusiness: 10,
    email: "hello@roottotable.com",
    phone: "(510) 555-0606",
    website: "www.roottotable.com",
    certifications: ["USDA Organic"],
    activities: ["Cooking Classes", "Farm Dinners", "CSA Programs"],
    deliveryAreas: ["Oakland", "Berkeley", "San Francisco"],
    established: "2013",
  },
]

const productDetails: Record<number, any> = {
  1: { id: 1, name: "Organic Heirloom Tomatoes", price: 4.99, unit: "per lb", code: "TOMO001", image: "https://images.unsplash.com/photo-1592924357228-91a8676d3a88?w=800&h=800&fit=crop", producer: "Green Valley Farm", producerImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=100&h=100&fit=crop", rating: 4.8, reviews: 156, inStock: true, badge: "Best Seller", organic: true, description: "Fresh, organic heirloom tomatoes grown without pesticides or synthetic fertilizers.", details: { origin: "Marin County, CA", organic: true, pesticide_free: true, season: "Summer to Fall", harvested: "Daily" }, nutritionFacts: { calories: 18, protein: "0.9g", carbs: "3.9g", fiber: "1.2g" }, category: "Vegetables" },
  3: { id: 3, name: "Crisp Organic Lettuce", price: 3.49, unit: "per pack", code: "LETT003", image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&h=800&fit=crop", producer: "Leaf & Root", producerImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100&h=100&fit=crop", rating: 4.7, reviews: 82, inStock: true, organic: true, description: "Fresh, crisp organic lettuce perfect for salads and sandwiches.", details: { origin: "San Francisco, CA", organic: true, pesticide_free: true, season: "Year-round", harvested: "Daily" }, nutritionFacts: { calories: 15, protein: "1.4g", carbs: "2.9g", fiber: "1.3g" }, category: "Vegetables" },
  4: { id: 4, name: "Sweet Local Apples", price: 5.99, unit: "per lb", code: "APPL004", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b27c8a?w=800&h=800&fit=crop", producer: "Orchard Fresh", producerImage: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=100&h=100&fit=crop", rating: 4.9, reviews: 156, inStock: true, badge: "Premium", organic: true, description: "Crisp, sweet apples picked fresh from our orchard.", details: { origin: "Sonoma County, CA", organic: true, pesticide_free: true, season: "Fall to Spring", harvested: "Weekly" }, nutritionFacts: { calories: 52, protein: "0.3g", carbs: "14g", fiber: "2.4g" }, category: "Fruits" },
  5: { id: 5, name: "Fresh Spinach Bundles", price: 3.99, unit: "per pack", code: "SPIN005", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop", producer: "Green Valley Farm", producerImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=100&h=100&fit=crop", rating: 4.8, reviews: 112, inStock: true, badge: "Organic", organic: true, description: "Fresh, tender spinach leaves perfect for salads, smoothies, or cooking.", details: { origin: "Marin County, CA", organic: true, pesticide_free: true, season: "Year-round", harvested: "Twice weekly" }, nutritionFacts: { calories: 23, protein: "2.9g", carbs: "3.6g", fiber: "2.2g" }, category: "Vegetables" },
  6: { id: 6, name: "Premium Blueberries", price: 7.99, unit: "per pack", code: "BLUE006", image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&h=800&fit=crop", producer: "Berry Fields Co.", producerImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop", rating: 5.0, reviews: 203, inStock: true, badge: "Premium", organic: true, description: "Sweet, plump blueberries bursting with flavor.", details: { origin: "Watsonville, CA", organic: true, pesticide_free: true, season: "Summer", harvested: "Daily" }, nutritionFacts: { calories: 57, protein: "0.7g", carbs: "14g", fiber: "2.4g" }, category: "Fruits" },
  7: { id: 7, name: "Fresh Broccoli", price: 3.29, unit: "per lb", code: "BROC007", image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=800&h=800&fit=crop", producer: "Green Valley Farm", rating: 4.6, reviews: 67, inStock: true, organic: true, description: "Fresh, crisp broccoli perfect for steaming, roasting, or adding to stir-fries.", details: { origin: "Marin County, CA", organic: true, pesticide_free: true, season: "Year-round", harvested: "Twice weekly" }, nutritionFacts: { calories: 34, protein: "2.8g", carbs: "7g", fiber: "2.6g" }, category: "Vegetables" },
  8: { id: 8, name: "Organic Strawberries", price: 6.99, unit: "per pack", code: "STRA008", image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop", producer: "Berry Fields Co.", rating: 4.9, reviews: 189, inStock: true, badge: "Best Seller", organic: true, description: "Sweet, juicy organic strawberries.", details: { origin: "Watsonville, CA", organic: true, pesticide_free: true, season: "Spring to Summer", harvested: "Daily" }, nutritionFacts: { calories: 32, protein: "0.7g", carbs: "7.7g", fiber: "2g" }, category: "Fruits" },
  10: { id: 10, name: "Organic Kale", price: 3.79, unit: "per bunch", code: "KALE010", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop", producer: "Leaf & Root", rating: 4.8, reviews: 124, inStock: true, badge: "Organic", organic: true, description: "Nutrient-dense organic kale perfect for salads, smoothies, or sautéing.", details: { origin: "San Francisco, CA", organic: true, pesticide_free: true, season: "Year-round", harvested: "Twice weekly" }, nutritionFacts: { calories: 49, protein: "4.3g", carbs: "8.8g", fiber: "2g" }, category: "Vegetables" },
}

export default function ProducerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const producerId = Number.parseInt(params.id as string)
  const producer = allProducers.find(p => p.id === producerId)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const handleProductClick = (id: number) => {
    setSelectedProduct(id)
  }

  if (!producer) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-12 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Producer Not Found</h2>
              <p className="text-gray-600 mb-8">The producer you're looking for doesn't exist.</p>
              <Link href="/producers">
                <Button className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white">
                  Browse All Producers
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
      <main className="flex-1 overflow-auto bg-white">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6 text-sm text-gray-500">
              <Link href="/producers" className="hover:text-gray-900">Producers</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{producer.name}</span>
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

            {/* Hero Image */}
            <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl mb-8">
              <img
                src={producer.image}
                alt={producer.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{producer.name}</h1>
                  {producer.verified && (
                    <Badge className="bg-[#0A5D31] text-white border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-lg md:text-xl text-white/90">{producer.specialty}</p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#0A5D31] mb-1">{producer.rating}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#0A5D31] mb-1">{producer.products}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#0A5D31] mb-1">{producer.yearsInBusiness}</div>
                  <div className="text-sm text-gray-600">Years</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-[#0A5D31] mb-1">{producer.established}</div>
                  <div className="text-sm text-gray-600">Established</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
                <p className="text-gray-700 leading-relaxed">{producer.description}</p>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Location & Contact */}
                <Card className="p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#0A5D31]" />
                    Location & Contact
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="text-gray-900 font-medium">{producer.fullAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <a href={`tel:${producer.phone}`} className="text-[#0A5D31] font-medium hover:underline">
                        {producer.phone}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a href={`mailto:${producer.email}`} className="text-[#0A5D31] font-medium hover:underline">
                        {producer.email}
                      </a>
                    </div>
                    {producer.website && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Website</p>
                        <a href={`https://${producer.website}`} target="_blank" rel="noopener noreferrer" className="text-[#0A5D31] font-medium hover:underline flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {producer.website}
                        </a>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Certifications & Activities */}
                <Card className="p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#0A5D31]" />
                    Certifications & Activities
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {producer.certifications.map((cert, idx) => (
                          <Badge key={idx} className="bg-[#0A5D31]/10 text-[#0A5D31] border-[#0A5D31]/20">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Activities & Events</p>
                      <div className="flex flex-wrap gap-2">
                        {producer.activities.map((activity, idx) => (
                          <Badge key={idx} variant="outline" className="border-gray-300">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Delivery Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {producer.deliveryAreas.map((area, idx) => (
                          <Badge key={idx} variant="outline" className="border-[#0A5D31]/30 text-[#0A5D31]">
                            <Truck className="w-3 h-3 mr-1" />
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Products Section */}
              {producerProducts[producerId as keyof typeof producerProducts] && producerProducts[producerId as keyof typeof producerProducts].length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Products ({producerProducts[producerId as keyof typeof producerProducts].length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {producerProducts[producerId as keyof typeof producerProducts].map((product) => (
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

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 mb-8">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-gray-300"
                  onClick={() => {
                    if (producer.email) {
                      window.location.href = `mailto:${producer.email}`
                    }
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
                <Button
                  className="flex-1 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white"
                  onClick={() => {
                    if (producer.phone) {
                      window.location.href = `tel:${producer.phone}`
                    }
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />

        {/* Product Details Modal */}
        {selectedProduct && productDetails[selectedProduct] && (
          <ProductDetailsModal
            product={productDetails[selectedProduct]}
            open={selectedProduct !== null}
            onOpenChange={(open) => !open && setSelectedProduct(null)}
            relatedProducts={[]}
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





