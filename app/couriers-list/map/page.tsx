"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"

const MapView = dynamic(() => import("@/components/map-view").then(mod => ({ default: mod.MapView })), { ssr: false })
import { Input } from "@/components/ui/input"
import { Search, MapPin, Star, CheckCircle, ArrowLeft, Truck } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { ApiVolunteer } from "@/components/volunteers-section"
import Link from "next/link"
import api from "@/lib/axios"

interface MapLocation {
  id: number
  name: string
  lat: number
  lng: number
  location?: string
  rating?: number
  reviews?: number
  verified?: boolean
  image?: string
  link?: string
}

export default function CouriersMapPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Track when component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const [allCouriers, setAllCouriers] = useState<ApiVolunteer[]>([])
  const [allCouriersLoading, setAllCouriersLoading] = useState(true)
  const [allCouriersError, setAllCouriersError] = useState<string | null>(null)

  // Fetch all couriers (all pages)
  const fetchAllCouriers = async () => {
    setAllCouriersLoading(true)
    setAllCouriersError(null)
    
    try {
      const allCouriersData: ApiVolunteer[] = []
      let page = 1
      let hasMore = true
      const limit = 100 // Large limit to get more per page

      while (hasMore) {
        const response = await api.get('/couriers', {
          params: { page, limit }
        })
        
        if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
          const pageData = response.data.data
          allCouriersData.push(...pageData)
          hasMore = pageData.length === limit
          page++
        } else {
          hasMore = false
        }
      }

      setAllCouriers(allCouriersData)
    } catch (err: any) {
      setAllCouriersError(err.response?.data?.message || err.message || "Failed to load couriers")
    } finally {
      setAllCouriersLoading(false)
    }
  }

  useEffect(() => {
    if (isMounted) {
      fetchAllCouriers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  const refetchAllCouriers = () => {
    fetchAllCouriers()
  }

  // Convert addresses to coordinates (simple geocoding fallback)
  const geocodeAddress = async (location: string): Promise<[number, number] | null> => {
    const defaultCenter: [number, number] = [39.8283, -98.5795]
    
    if (!location || location === "Unknown Location" || location === "Location not specified") {
      return defaultCenter
    }

    const locationLower = location.toLowerCase()
    
    // Common US state coordinates (simplified mapping)
    const stateCoords: Record<string, [number, number]> = {
      'california': [36.7783, -119.4179],
      'texas': [31.9686, -99.9018],
      'florida': [27.7663, -81.6868],
      'new york': [40.7128, -74.0060],
      'pennsylvania': [40.5908, -77.2098],
      'illinois': [40.3495, -88.9861],
      'ohio': [40.3888, -82.7649],
      'georgia': [33.0406, -83.6431],
      'north carolina': [35.7596, -79.0193],
      'michigan': [43.3266, -84.5361],
    }

    for (const [state, coords] of Object.entries(stateCoords)) {
      if (locationLower.includes(state)) {
        return coords
      }
    }

    return defaultCenter
  }

  const [resolvedLocations, setResolvedLocations] = useState<MapLocation[]>([])

  // Convert couriers to map locations
  useEffect(() => {
    const convertCouriersToLocations = async () => {
      if (!allCouriers || allCouriers.length === 0) {
        setResolvedLocations([])
        return
      }

      const locations: MapLocation[] = []
      
      for (const courier of allCouriers) {
        const coords = await geocodeAddress(courier.location)
        
        if (coords) {
          locations.push({
            id: courier.id,
            name: courier.name,
            lat: coords[0],
            lng: coords[1],
            location: courier.location,
            rating: courier.reviews?.average_rating ?? 0,
            reviews: courier.reviews?.total ?? 0,
            verified: courier.verified,
            link: `/couriers/${courier.unique_id || courier.id}`,
          })
        }
      }

      setResolvedLocations(locations)
    }

    convertCouriersToLocations()
  }, [allCouriers])

  // Filter couriers based on search
  const filteredCouriers = useMemo(() => {
    let filtered = allCouriers

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (courier) =>
          courier.name.toLowerCase().includes(query) ||
          courier.location.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [allCouriers, searchQuery])

  // Filter map locations based on filtered couriers
  const filteredMapLocations = useMemo(() => {
    const filteredIds = new Set(filteredCouriers.map(c => c.id))
    return resolvedLocations.filter(loc => filteredIds.has(loc.id))
  }, [resolvedLocations, filteredCouriers])

  // Calculate map center based on filtered locations
  const mapCenter = useMemo(() => {
    if (filteredMapLocations.length === 0) {
      return [39.8283, -98.5795] as [number, number]
    }

    const avgLat = filteredMapLocations.reduce((sum, loc) => sum + loc.lat, 0) / filteredMapLocations.length
    const avgLng = filteredMapLocations.reduce((sum, loc) => sum + loc.lng, 0) / filteredMapLocations.length
    return [avgLat, avgLng] as [number, number]
  }, [filteredMapLocations])

  const isLoading = isMounted && allCouriersLoading

  // Show error state
  if (allCouriersError && allCouriers.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto bg-white">
          <div className="px-6 py-16">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <MapPin className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Map</h1>
              <p className="text-lg text-gray-600 mb-6">{allCouriersError}</p>
              <Button onClick={refetchAllCouriers} className="bg-[#5a9c3a] hover:bg-[#0d7a3f]">
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
    <div className="flex flex-col min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-gray-50 to-white flex flex-col pb-8">
        {/* Header Section */}
        <div className="px-4 sm:px-6 py-8 bg-gradient-to-r from-[#5a9c3a]/5 via-white to-[#5a9c3a]/5 border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <Link href="/couriers-list">
                <Button variant="ghost" className="mb-4 -ml-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-xl shadow-lg">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Couriers Map</h1>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                      <span>Find couriers near you</span>
                      <Badge variant="outline" className="text-xs border-[#5a9c3a]/30 text-[#5a9c3a]">
                        {filteredCouriers.length} {filteredCouriers.length === 1 ? 'courier' : 'couriers'}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 h-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5a9c3a]/20 focus:border-[#5a9c3a] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[600px]">
          {isLoading && resolvedLocations.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5a9c3a]/10 rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-[#5a9c3a] animate-pulse" />
                </div>
                <p className="text-gray-600 font-medium">Loading couriers map...</p>
              </div>
            </div>
          ) : filteredMapLocations.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  {searchQuery ? "No couriers found matching your search." : "No couriers available."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          ) : (
            isMounted && (
              <MapView
                locations={filteredMapLocations}
                center={mapCenter}
                zoom={6}
                showHeatMap={false}
                title="Couriers"
              />
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

