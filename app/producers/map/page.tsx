"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, List, ArrowLeft, CheckCircle, Package, Star } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const MapView = dynamic(() => import("@/components/map-view").then((mod) => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => (
    <Card className="overflow-hidden border-2 border-gray-200 shadow-xl rounded-2xl">
      <div className="h-[700px] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0A5D31] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    </Card>
  ),
})

// Producer data with coordinates (approximate locations in California)
const allProducers = [
  {
    id: 1,
    name: "Green Valley Farm",
    location: "Marin County, CA",
    fullAddress: "123 Farm Road, Marin County, CA 94941",
    specialty: "Organic Vegetables",
    lat: 37.9,
    lng: -122.5,
    rating: 4.9,
    verified: true,
    products: 45,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=500&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Sunny Side Orchard",
    location: "Sonoma County, CA",
    fullAddress: "456 Orchard Lane, Sonoma County, CA 95476",
    specialty: "Fresh Fruits & Apples",
    lat: 38.3,
    lng: -122.7,
    rating: 4.8,
    verified: true,
    products: 32,
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Leaf & Root Collective",
    location: "San Francisco, CA",
    fullAddress: "789 Urban Farm St, San Francisco, CA 94110",
    specialty: "Local Greens",
    lat: 37.7749,
    lng: -122.4194,
    rating: 4.7,
    verified: true,
    products: 28,
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Meadow Fresh Dairy",
    location: "Petaluma, CA",
    fullAddress: "321 Dairy Road, Petaluma, CA 94952",
    specialty: "Local Dairy Products",
    lat: 38.2324,
    lng: -122.6367,
    rating: 4.9,
    verified: true,
    products: 18,
    image: "https://images.unsplash.com/photo-1535248901601-a9cb0ecb5dbe?w=500&h=400&fit=crop",
  },
  {
    id: 5,
    name: "Berry Fields Co.",
    location: "Watsonville, CA",
    fullAddress: "654 Berry Lane, Watsonville, CA 95076",
    specialty: "Fresh Berries",
    lat: 36.9102,
    lng: -121.7569,
    rating: 4.8,
    verified: true,
    products: 25,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=400&fit=crop",
  },
  {
    id: 6,
    name: "Root To Table",
    location: "Oakland, CA",
    fullAddress: "987 Root Street, Oakland, CA 94601",
    specialty: "Root Vegetables",
    lat: 37.8044,
    lng: -122.2712,
    rating: 4.6,
    verified: true,
    products: 19,
    image: "https://images.unsplash.com/photo-1599599810963-8db6ce1a8ba5?w=500&h=400&fit=crop",
  },
]

export default function ProducersMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProducer, setSelectedProducer] = useState<number | null>(null)
  const router = useRouter()

  // Calculate center point (average of all locations)
  const centerLat = allProducers.reduce((sum, p) => sum + p.lat, 0) / allProducers.length
  const centerLng = allProducers.reduce((sum, p) => sum + p.lng, 0) / allProducers.length

  const totalProducts = allProducers.reduce((sum, p) => sum + p.products, 0)
  const avgRating = (allProducers.reduce((sum, p) => sum + p.rating, 0) / allProducers.length).toFixed(1)
  const verifiedCount = allProducers.filter((p) => p.verified).length

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Button
                      variant="ghost"
                      onClick={() => router.back()}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] bg-clip-text text-transparent">
                    Producers Map
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Explore all verified producers on an interactive map with beautiful heat visualization
                  </p>
                </div>
                <Link href="/producers">
                  <Button className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
                    <List className="w-5 h-5 mr-2" />
                    List View
                  </Button>
                </Link>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-6 border-2 border-gray-200 hover:border-[#0A5D31] transition-all shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-[#0A5D31]/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl font-bold text-[#0A5D31]">{allProducers.length}</div>
                    <div className="w-12 h-12 bg-[#0A5D31]/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#0A5D31]" />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">Total Producers</div>
                </Card>
                <Card className="p-6 border-2 border-gray-200 hover:border-[#0A5D31] transition-all shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl font-bold text-[#0A5D31]">{verifiedCount}</div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">Verified</div>
                </Card>
                <Card className="p-6 border-2 border-gray-200 hover:border-[#0A5D31] transition-all shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl font-bold text-[#0A5D31]">{totalProducts}</div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">Total Products</div>
                </Card>
                <Card className="p-6 border-2 border-gray-200 hover:border-[#0A5D31] transition-all shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-yellow-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-3xl font-bold text-[#0A5D31]">{avgRating}</div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">Avg Rating</div>
                </Card>
              </div>
            </div>

            {/* Map */}
            <div className="mb-8">
              <MapView
                locations={allProducers.map((p) => ({
                  ...p,
                  link: `/producers/${p.id}`,
                  reviews: Math.floor(Math.random() * 200) + 50,
                }))}
                center={[centerLat, centerLng]}
                zoom={8}
                showHeatMap={true}
                title="Producer Locations"
              />
            </div>

            {/* Enhanced Legend */}
            <Card className="p-6 border-2 border-gray-200 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0A5D31]" />
                Map Legend
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#0A5D31] to-[#0d7a3f] rounded-full shadow-md"></div>
                  <span className="text-gray-700 font-medium">High concentration of producers</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#0A5D31]/60 to-[#0A5D31]/40 rounded-full shadow-md"></div>
                  <span className="text-gray-700 font-medium">Medium concentration</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#0A5D31]/30 to-[#0A5D31]/20 rounded-full shadow-md"></div>
                  <span className="text-gray-700 font-medium">Low concentration</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <MapPin className="w-6 h-6 text-[#0A5D31]" />
                  <span className="text-gray-700 font-medium">Click markers for producer details</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
