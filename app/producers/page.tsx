"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Leaf, CheckCircle, MessageSquare, Package, Calendar, Award, Shield, Truck, TrendingUp, Users, ArrowRight, Clock, Zap, Percent, Sparkles, Map, Loader2 } from "lucide-react"
import { useState } from "react"
import { ProductDetailsModal } from "@/components/product-details-modal"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { ApiProducer, Location } from "@/types/producer"

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

// Helper function to format location
const formatLocation = (location: string | Location | null | undefined): string => {
  if (!location) return 'Location not available'
  if (typeof location === 'string') {
    return location
  }
  if (location.full_location) {
    return location.full_location
  }
  const parts = [location.city, location.state, location.country].filter(Boolean)
  return parts.join(', ') || 'Location not available'
}

// Map API producer to expected format
const mapApiProducer = (apiProducer: any) => {
  const location = apiProducer.user?.location || apiProducer.location
  const productsCount = apiProducer.items_count || apiProducer.products_count || 0
  const certifications = apiProducer.certifications?.map((c: any) => 
    typeof c === 'string' ? c : (c.name || c.certification?.name || '')
  ).filter(Boolean) || []
  
  return {
    id: apiProducer.id,
    unique_id: apiProducer.unique_id,
    name: apiProducer.name,
    location: formatLocation(location),
    fullAddress: formatLocation(location),
    specialty: apiProducer.store_type?.name || apiProducer.category || 'Local Producer',
    description: apiProducer.description || apiProducer.bio || '',
    image: apiProducer.logo || apiProducer.image || '/placeholder.svg',
    rating: apiProducer.rating || 4.5,
    verified: apiProducer.is_verified !== false,
    products: productsCount,
    yearsInBusiness: apiProducer.years_experience || 0,
    email: apiProducer.email || apiProducer.user?.email || '',
    phone: apiProducer.phone || '',
    website: apiProducer.website || '',
    certifications: certifications,
    activities: [],
    deliveryAreas: [],
    established: apiProducer.established_year?.toString() || (apiProducer.created_at ? new Date(apiProducer.created_at).getFullYear().toString() : '2020'),
    reviews_count: apiProducer.reviews_count || 0,
  }
}

export default function ProducersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProducer, setSelectedProducer] = useState<number | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])

  // Fetch all producers
  const { data: allProducersData, loading: loadingProducers } = useApiFetch<any[]>(
    `/stores/producers?limit=100&page=1`
  )

  // Fetch top sellers
  const { data: topSellersData, loading: loadingTopSellers } = useApiFetch<any[]>(
    `/stores/top-sellers?limit=4&page=1`
  )

  // Fetch organic producers
  const { data: organicProducersData, loading: loadingOrganic } = useApiFetch<any[]>(
    `/stores/certified-organic?limit=4&page=1`
  )

  // Fetch most reviewed
  const { data: mostReviewedData, loading: loadingMostReviewed } = useApiFetch<any[]>(
    `/stores/most-reviewed?limit=4&page=1`
  )

  // Fetch new producers
  const { data: newProducersData, loading: loadingNewProducers } = useApiFetch<any[]>(
    `/stores/new-this-season?limit=4&page=1`
  )

  // Map API data to expected format
  const allProducers = (allProducersData || []).map(mapApiProducer)
  const topSellers = (topSellersData || []).map(mapApiProducer)
  const organicProducers = (organicProducersData || []).map(mapApiProducer)
  const mostReviewed = (mostReviewedData || []).map(mapApiProducer)
  const newestProducers = (newProducersData || []).map(mapApiProducer)

  const filteredProducers = allProducers.filter(
    (producer) =>
      producer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producer.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producer.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const handleProductClick = (id: number) => {
    setSelectedProduct(id)
  }

  // Calculate total reviews for each producer
  const producersWithReviews = allProducers.map(producer => ({
    ...producer,
    totalReviews: producer.reviews_count || 0
  }))

  const isLoading = loadingProducers || loadingTopSellers || loadingOrganic || loadingMostReviewed || loadingNewProducers

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#0A5D31] mx-auto mb-4" />
            <p className="text-gray-600">Loading producers...</p>
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
            <div id="top-sellers" className="mb-20 scroll-mt-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#0A5D31]/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-[#0A5D31]" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Top Sellers</h2>
                  </div>
                  <p className="text-gray-600 text-lg">Producers with the most products available</p>
                </div>
              </div>
              {topSellers.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed border-gray-200">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No top sellers available at the moment</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {topSellers.map((producer) => (
                    <Card
                      key={producer.id}
                      className="overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-2xl border-2 border-gray-100 bg-white flex flex-col h-full group cursor-pointer hover:border-[#0A5D31]/30"
                    >
                      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 h-48">
                        <img
                          src={producer.image || "/placeholder.svg"}
                          alt={producer.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          {producer.verified && (
                            <div className="bg-[#0A5D31] text-white p-2 rounded-full shadow-lg">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-[#0A5D31] text-white border-0 font-bold shadow-lg px-3 py-1">
                            <TrendingUp className="w-3 h-3 mr-1 inline" />
                            Top Seller
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 border-0 font-semibold text-sm px-3 py-1.5 shadow-md">
                            <Package className="w-4 h-4 mr-1.5 inline" />
                            {producer.products} {producer.products === 1 ? 'Product' : 'Products'}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{producer.name}</h3>
                        <p className="text-sm font-semibold text-[#0A5D31] mb-4 uppercase tracking-wide">
                          {producer.specialty}
                        </p>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-gray-900 text-lg">{producer.rating}</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{producer.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-5">
                          <Badge variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5 px-2 py-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Fast Delivery
                          </Badge>
                          <Badge variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5 px-2 py-1">
                            <Percent className="w-3 h-3 mr-1" />
                            Best Prices
                          </Badge>
                        </div>
                        <Link href={producer.unique_id ? `/shops/${producer.unique_id}` : `/producers/${producer.id}`} className="mt-auto">
                          <Button 
                            className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-xl h-11 text-base"
                          >
                            Shop Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Organic Producers Section */}
            <div id="organic-producers" className="mb-20 scroll-mt-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Certified Organic</h2>
                  </div>
                  <p className="text-gray-600 text-lg">USDA Organic certified producers with pesticide-free products</p>
                </div>
              </div>
              {organicProducers.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed border-gray-200">
                  <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No organic producers available at the moment</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {organicProducers.map((producer) => (
                    <Card
                      key={producer.id}
                      className="overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-xl border-2 border-[#0A5D31]/20 bg-white flex flex-col h-full group cursor-pointer hover:border-[#0A5D31]/40"
                    >
                    <div className="relative overflow-hidden bg-gray-100 h-40">
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
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-[#0A5D31] text-white border-0 font-bold shadow-lg">
                          <Leaf className="w-3 h-3 mr-1 inline" />
                          Organic
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{producer.name}</h3>
                      <p className="text-xs font-semibold text-[#0A5D31] mb-3 uppercase tracking-wide">
                        {producer.specialty}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-gray-900">{producer.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span>{producer.location}</span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {producer.certifications.slice(0, 2).map((cert: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                        <Badge variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5 w-full justify-center">
                          <Shield className="w-3 h-3 mr-1" />
                          Pesticide Free
                        </Badge>
                      </div>
                      <Link href={producer.unique_id ? `/shops/${producer.unique_id}` : `/producers/${producer.id}`} className="mt-auto">
                        <Button 
                          className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                          Shop Organic
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Most Reviewed Section */}
            <div className="mb-20">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#0A5D31]/10 rounded-lg">
                      <Users className="w-6 h-6 text-[#0A5D31]" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Most Reviewed</h2>
                  </div>
                  <p className="text-gray-600 text-lg">Producers with the most customer reviews and highest ratings</p>
                </div>
              </div>
              {mostReviewed.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed border-gray-200">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No reviewed producers available at the moment</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mostReviewed.map((producer) => (
                  <Card
                    key={producer.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-xl border border-gray-200 bg-white flex flex-col h-full group cursor-pointer"
                  >
                    <div className="relative overflow-hidden bg-gray-100 h-40">
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
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-[#0A5D31] text-white border-0 font-bold shadow-lg">
                          <Users className="w-3 h-3 mr-1 inline" />
                          Most Reviewed
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-0 font-semibold text-xs">
                          {producer.reviews_count || 0} Reviews
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{producer.name}</h3>
                      <p className="text-xs font-semibold text-[#0A5D31] mb-3 uppercase tracking-wide">
                        {producer.specialty}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-gray-900">{producer.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                         <span className="text-gray-600 text-sm">{producer.reviews_count || 0} reviews</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5">
                          <Award className="w-3 h-3 mr-1" />
                          Top Rated
                        </Badge>
                      </div>
                      <Link href={producer.unique_id ? `/shops/${producer.unique_id}` : `/producers/${producer.id}`} className="mt-auto">
                        <Button 
                          className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                          View Reviews
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* New Producers Section */}
            <div id="new-producers" className="mb-20 scroll-mt-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#0A5D31]/10 rounded-lg">
                      <Sparkles className="w-6 h-6 text-[#0A5D31]" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">New This Season</h2>
                  </div>
                  <p className="text-gray-600 text-lg">Recently joined producers with fresh offerings</p>
                </div>
              </div>
              {newestProducers.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed border-gray-200">
                  <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No new producers available at the moment</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {newestProducers.map((producer) => (
                    <Card
                      key={producer.id}
                      className="overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-xl border-2 border-[#0A5D31]/20 bg-white flex flex-col h-full group cursor-pointer hover:border-[#0A5D31]/40"
                    >
                    <div className="relative overflow-hidden bg-gray-100 h-40">
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
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-[#0A5D31] text-white border-0 font-bold shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1 inline" />
                          New
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{producer.name}</h3>
                      <p className="text-xs font-semibold text-[#0A5D31] mb-3 uppercase tracking-wide">
                        {producer.specialty}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-gray-900">{producer.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 text-sm">Est. {producer.established}</span>
                      </div>
                      <div className="mb-4">
                        <Badge variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5 w-full justify-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {producer.yearsInBusiness} Years Experience
                        </Badge>
                      </div>
                      <Link href={producer.unique_id ? `/shops/${producer.unique_id}` : `/producers/${producer.id}`} className="mt-auto">
                        <Button 
                          className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                          Discover More
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
              )}
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
              {filteredProducers.length === 0 ? (
                <Card className="p-16 text-center border-2 border-dashed border-gray-200">
                  <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Producers Found</h3>
                  <p className="text-gray-500 text-lg">
                    {searchQuery ? "Try adjusting your search terms" : "No producers available at the moment"}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducers.map((producer) => {
                    const producerReviewData = producersWithReviews.find(p => p.id === producer.id)
                    return (
                      <Card
                        key={producer.id}
                        className="overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-2xl border-2 border-gray-100 bg-white flex flex-col h-full group cursor-pointer hover:border-[#0A5D31]/30"
                      >
                        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 h-56">
                          <img
                            src={producer.image || "/placeholder.svg"}
                            alt={producer.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            {producer.verified && (
                              <div className="bg-[#0A5D31] text-white p-2.5 rounded-full shadow-lg">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          {producer.certifications.some((c: string) => c.toLowerCase().includes('organic')) && (
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-green-500 text-white border-0 font-semibold text-sm px-3 py-1.5 shadow-lg">
                                <Leaf className="w-4 h-4 mr-1.5 inline" />
                                Organic
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{producer.name}</h3>
                          <p className="text-sm font-semibold text-[#0A5D31] mb-3 uppercase tracking-wide">
                            {producer.specialty}
                          </p>
                          {producer.description && (
                            <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">{producer.description}</p>
                          )}

                          <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="w-5 h-5 text-[#0A5D31] flex-shrink-0" />
                              <span className="text-sm line-clamp-1">{producer.location}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                <span className="font-bold text-gray-900">{producer.rating}</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-600 text-sm font-medium">{producer.products} {producer.products === 1 ? 'product' : 'products'}</span>
                              {producerReviewData && producerReviewData.totalReviews > 0 && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-gray-600 text-sm">{producerReviewData.totalReviews} {producerReviewData.totalReviews === 1 ? 'review' : 'reviews'}</span>
                                </>
                              )}
                            </div>
                            {producer.yearsInBusiness > 0 && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-5 h-5 text-[#0A5D31] flex-shrink-0" />
                                <span className="text-sm">{producer.yearsInBusiness} {producer.yearsInBusiness === 1 ? 'year' : 'years'} in business</span>
                              </div>
                            )}
                          </div>

                          {producer.deliveryAreas.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-5">
                              {producer.deliveryAreas.slice(0, 2).map((area, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs border-gray-300 px-2 py-1">
                                  <Truck className="w-3 h-3 mr-1" />
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-3 mt-auto">
                            <Link href={producer.unique_id ? `/shops/${producer.unique_id}` : `/producers/${producer.id}`} className="flex-1">
                              <Button 
                                className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-xl h-11"
                              >
                                <Package className="w-4 h-4 mr-2" />
                                Shop Now
                              </Button>
                            </Link>
                            {producer.email && (
                              <Button 
                                variant="outline"
                                className="border-2 border-gray-300 hover:border-[#0A5D31] hover:bg-[#0A5D31] hover:text-white font-semibold rounded-xl transition-all h-11 w-11 p-0"
                                onClick={() => {
                                  window.location.href = `mailto:${producer.email}`
                                }}
                                title="Contact via email"
                              >
                                <MessageSquare className="w-5 h-5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {!isLoading && filteredProducers.length === 0 && (
              <Card className="p-12 text-center rounded-2xl border border-gray-200">
                <p className="text-gray-600 text-lg">
                  {searchQuery ? "No producers found matching your search" : "No producers available at the moment"}
                </p>
              </Card>
            )}

            {/* Selected Producer Products */}
            {selectedProducer && (
              <div className="mt-16">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Products from {allProducers.find(p => p.id === selectedProducer)?.name}
                  </h2>
                  <p className="text-gray-600">Browse all available products from this producer</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {producerProducts[selectedProducer as keyof typeof producerProducts]?.map((product) => (
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
