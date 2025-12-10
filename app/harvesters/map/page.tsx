"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, List, ArrowLeft, CheckCircle, Users, Award, Star } from "lucide-react"
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

// Harvester data with coordinates (approximate locations in California)
const harvesters = [
  {
    id: 1,
    name: "Green Thumb Harvesters",
    location: "Napa Valley, CA",
    lat: 38.2975,
    lng: -122.2869,
    rating: 4.9,
    reviews: 124,
    verified: true,
    experience: "5+ years",
    specialties: ["Fruit Picking", "Vegetable Harvesting", "Seasonal Work"],
    hourlyRate: "$25-35",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    completedJobs: 234,
  },
  {
    id: 2,
    name: "Seasonal Harvest Team",
    location: "Sonoma County, CA",
    lat: 38.3,
    lng: -122.7,
    rating: 4.8,
    reviews: 98,
    verified: true,
    experience: "3+ years",
    specialties: ["Organic Farms", "Small Farms", "Family Farms"],
    hourlyRate: "$20-30",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    completedJobs: 156,
  },
  {
    id: 3,
    name: "Farm Hands Collective",
    location: "Marin County, CA",
    lat: 37.9,
    lng: -122.5,
    rating: 4.7,
    reviews: 67,
    verified: true,
    experience: "2+ years",
    specialties: ["Quick Harvest", "Large Scale", "Equipment Operation"],
    hourlyRate: "$30-40",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    completedJobs: 89,
  },
  {
    id: 4,
    name: "Expert Harvesters Pro",
    location: "Sacramento, CA",
    lat: 38.5816,
    lng: -121.4944,
    rating: 4.9,
    reviews: 187,
    verified: true,
    experience: "8+ years",
    specialties: ["Vineyard Work", "Orchard Management", "Precision Harvesting"],
    hourlyRate: "$35-45",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    completedJobs: 312,
  },
  {
    id: 5,
    name: "Local Harvest Crew",
    location: "Fresno, CA",
    lat: 36.7378,
    lng: -119.7871,
    rating: 4.8,
    reviews: 145,
    verified: true,
    experience: "4+ years",
    specialties: ["Field Crops", "Vegetable Farms", "Quick Turnaround"],
    hourlyRate: "$22-32",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    completedJobs: 201,
  },
  {
    id: 6,
    name: "Premium Harvest Services",
    location: "Monterey, CA",
    lat: 36.6002,
    lng: -121.8947,
    rating: 5.0,
    reviews: 98,
    verified: true,
    experience: "6+ years",
    specialties: ["Organic Farms", "Premium Produce", "Quality Focus"],
    hourlyRate: "$40-50",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    completedJobs: 167,
  },
]

export default function HarvestersMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  // Calculate center point (average of all locations)
  const centerLat = harvesters.reduce((sum, h) => sum + h.lat, 0) / harvesters.length
  const centerLng = harvesters.reduce((sum, h) => sum + h.lng, 0) / harvesters.length

  const totalJobs = harvesters.reduce((sum, h) => sum + h.completedJobs, 0)
  const avgRating = (harvesters.reduce((sum, h) => sum + h.rating, 0) / harvesters.length).toFixed(1)
  const verifiedCount = harvesters.filter((h) => h.verified).length

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
                    Harvest Helpers Map
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Find experienced harvest helpers on an interactive map with beautiful heat visualization
                  </p>
                </div>
                <Link href="/harvesters">
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
                    <div className="text-3xl font-bold text-[#0A5D31]">{harvesters.length}</div>
                    <div className="w-12 h-12 bg-[#0A5D31]/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#0A5D31]" />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">Total Teams</div>
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
                    <div className="text-3xl font-bold text-[#0A5D31]">{totalJobs}</div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">Jobs Completed</div>
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
                locations={harvesters.map((h) => ({
                  ...h,
                  specialty: h.specialties.join(", "),
                  link: `/harvesters/${h.id}`,
                }))}
                center={[centerLat, centerLng]}
                zoom={7}
                showHeatMap={true}
                title="Harvest Helper Locations"
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
                  <span className="text-gray-700 font-medium">High concentration of helpers</span>
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
                  <span className="text-gray-700 font-medium">Click markers for team details</span>
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
