"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { MapView } from "@/components/map-view"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, CheckCircle, Filter, X, SlidersHorizontal } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { transformProducers, type TransformedProducer } from "@/lib/producer-api"
import Link from "next/link"

interface SellersResponse {
  sellers?: any[]
  data?: any[]
}

interface MapLocation {
  id: number
  name: string
  lat: number
  lng: number
  location?: string
  rating?: number
  reviews?: number
  verified?: boolean
  specialty?: string
  products?: number
  image?: string
  link?: string
}

export default function ProducersMapPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all")
  const [minRating, setMinRating] = useState<number>(0)
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false)
  const [isMounted, setIsMounted] = useState(false)

  // Track when component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch all sellers (users with products)
  const { data: allProducersResponse, loading: allProducersLoading, error: allProducersError, refetch: refetchAllProducers } = useApiFetch<SellersResponse>(
    '/sellers',
    { enabled: true }
  )

  // Extract and transform sellers (producers)
  const extractProducers = (response: any): TransformedProducer[] => {
    const rawProducers = response?.sellers || response?.data || (Array.isArray(response) ? response : [])
    return transformProducers(rawProducers)
  }

  const allProducers = useMemo(() => {
    return extractProducers(allProducersResponse)
  }, [allProducersResponse])

  // Store raw producers data to access lat/lng if available
  const rawProducersData = useMemo(() => {
    return allProducersResponse?.sellers || allProducersResponse?.data || (Array.isArray(allProducersResponse) ? allProducersResponse : [])
  }, [allProducersResponse])

  // Get unique specialties for filter
  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set<string>()
    allProducers.forEach(producer => {
      if (producer.specialty && producer.specialty !== "General") {
        uniqueSpecialties.add(producer.specialty)
      }
    })
    return Array.from(uniqueSpecialties).sort()
  }, [allProducers])

  // Convert addresses to coordinates (simple geocoding fallback)
  const geocodeAddress = async (location: string): Promise<[number, number] | null> => {
    // Default center (USA center)
    const defaultCenter: [number, number] = [39.8283, -98.5795]
    
    if (!location || location === "Unknown Location") {
      return defaultCenter
    }

    // Try to extract state/city from location string
    // This is a simple fallback - in production, use a proper geocoding service
    const locationLower = location.toLowerCase()
    
    // Common US state coordinates (simplified mapping)
    const stateCoords: Record<string, [number, number]> = {
      'california': [36.7783, -119.4179],
      'texas': [31.9686, -99.9018],
      'florida': [27.7663, -81.6868],
      'new york': [42.1657, -74.9481],
      'pennsylvania': [40.5908, -77.2098],
      'illinois': [40.3495, -88.9861],
      'ohio': [40.3888, -82.7649],
      'georgia': [33.0406, -83.6431],
      'north carolina': [35.5397, -79.8431],
      'michigan': [43.3266, -84.5361],
    }

    // Check if location contains a state name
    for (const [state, coords] of Object.entries(stateCoords)) {
      if (locationLower.includes(state)) {
        // Add some random offset to spread markers
        const offset = (Math.random() - 0.5) * 2
        return [coords[0] + offset, coords[1] + offset]
      }
    }

    return defaultCenter
  }

  // Use state to store resolved locations
  const [resolvedLocations, setResolvedLocations] = useState<MapLocation[]>([])

  // Convert producers to map locations
  useEffect(() => {
    const convertProducersToLocations = async () => {
      if (!allProducers || allProducers.length === 0) {
        setResolvedLocations([])
        return
      }

      const locations: MapLocation[] = []
      
      for (let i = 0; i < allProducers.length; i++) {
        const producer = allProducers[i]
        const rawProducer = rawProducersData[i]
        
        // Try to get coordinates from raw data first (check location object or address)
        let coords: [number, number] | null = null
        
        if (rawProducer) {
          // Check if location object has lat/lng
          if (rawProducer.location && typeof rawProducer.location === 'object') {
            if (rawProducer.location.latitude && rawProducer.location.longitude) {
              coords = [
                parseFloat(rawProducer.location.latitude),
                parseFloat(rawProducer.location.longitude)
              ]
            }
          }
          // Check if address has lat/lng
          if (!coords && rawProducer.address) {
            if (rawProducer.address.latitude && rawProducer.address.longitude) {
              coords = [
                parseFloat(rawProducer.address.latitude),
                parseFloat(rawProducer.address.longitude)
              ]
            }
          }
          // Check direct lat/lng fields
          if (!coords && rawProducer.latitude && rawProducer.longitude) {
            coords = [
              parseFloat(rawProducer.latitude),
              parseFloat(rawProducer.longitude)
            ]
          }
        }
        
        // Fallback to geocoding if no coordinates found
        if (!coords) {
          coords = await geocodeAddress(producer.location)
        }
        
        if (coords) {
          locations.push({
            id: producer.id,
            name: producer.name,
            lat: coords[0],
            lng: coords[1],
            location: producer.location,
            rating: producer.rating,
            reviews: producer.totalReviews,
            verified: producer.verified,
            specialty: producer.specialty,
            products: producer.products,
            image: producer.image,
            link: producer.unique_id ? `/producers/${producer.unique_id}` : `/producers/${producer.id}`,
          })
        }
      }

      setResolvedLocations(locations)
    }

    convertProducersToLocations()
  }, [allProducers, rawProducersData])

  // Filter producers based on search and filters
  const filteredProducers = useMemo(() => {
    let filtered = allProducers

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (producer) =>
          producer.name.toLowerCase().includes(query) ||
          producer.specialty.toLowerCase().includes(query) ||
          producer.location.toLowerCase().includes(query)
      )
    }

    // Specialty filter
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((producer) => producer.specialty === selectedSpecialty)
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((producer) => (producer.rating || 0) >= minRating)
    }

    // Verified filter
    if (verifiedOnly) {
      filtered = filtered.filter((producer) => producer.verified)
    }

    return filtered
  }, [allProducers, searchQuery, selectedSpecialty, minRating, verifiedOnly])

  // Filter map locations based on filtered producers
  const filteredMapLocations = useMemo(() => {
    const filteredIds = new Set(filteredProducers.map(p => p.id))
    return resolvedLocations.filter(loc => filteredIds.has(loc.id))
  }, [resolvedLocations, filteredProducers])

  // Calculate map center based on filtered locations
  const mapCenter = useMemo(() => {
    if (filteredMapLocations.length === 0) {
      return [39.8283, -98.5795] as [number, number] // USA center
    }

    const avgLat = filteredMapLocations.reduce((sum, loc) => sum + loc.lat, 0) / filteredMapLocations.length
    const avgLng = filteredMapLocations.reduce((sum, loc) => sum + loc.lng, 0) / filteredMapLocations.length
    return [avgLat, avgLng] as [number, number]
  }, [filteredMapLocations])

  const isLoading = isMounted && allProducersLoading

  // Show error state
  if (allProducersError && allProducers.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto bg-white">
          <div className="px-6 py-16">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <MapPin className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Map</h1>
              <p className="text-lg text-gray-600 mb-6">{allProducersError}</p>
              <Button onClick={refetchAllProducers} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
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
      <main className="flex-1 overflow-auto bg-gradient-to-b from-gray-50 to-white flex flex-col">
        {/* Header Section with Gradient */}
        <div className="px-4 sm:px-6 py-8 bg-gradient-to-r from-[#0A5D31]/5 via-white to-[#0A5D31]/5 border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#0A5D31] to-[#0d7a3f] rounded-xl shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Sellers Map</h1>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                      <span>Find sellers near you</span>
                      <Badge variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31]">
                        {filteredProducers.length} {filteredProducers.length === 1 ? 'seller' : 'sellers'}
                      </Badge>
                    </p>
                  </div>
                </div>
                <Link href="/producers">
                  <Button variant="outline" className="border-gray-300 hover:border-[#0A5D31] hover:bg-[#0A5D31] hover:text-white shadow-sm transition-all">
                    <MapPin className="w-4 h-4 mr-2" />
                    List View
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, specialty, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-sm rounded-xl border-2 border-gray-200 focus:border-[#0A5D31] focus:ring-2 focus:ring-[#0A5D31]/20 bg-white shadow-sm transition-all"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 px-6 border-2 rounded-xl shadow-sm transition-all ${
                  showFilters 
                    ? 'border-[#0A5D31] bg-[#0A5D31] text-white' 
                    : 'border-gray-200 hover:border-[#0A5D31] hover:bg-[#0A5D31] hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {(selectedSpecialty !== "all" || minRating > 0 || verifiedOnly) && (
                  <Badge className="ml-2 bg-white text-[#0A5D31] border border-[#0A5D31]/20">
                    {[selectedSpecialty !== "all" ? 1 : 0, minRating > 0 ? 1 : 0, verifiedOnly ? 1 : 0].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="mt-4 p-6 border-2 border-gray-200 rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#0A5D31]" />
                    <h3 className="text-lg font-bold text-gray-900">Filter Options</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSpecialty("all")
                      setMinRating(0)
                      setVerifiedOnly(false)
                    }}
                    className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-3"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Specialty Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#0A5D31]" />
                      Specialty
                    </label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-[#0A5D31] focus:ring-2 focus:ring-[#0A5D31]/20 text-sm bg-white shadow-sm transition-all"
                    >
                      <option value="all">All Specialties</option>
                      {specialties.map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      Min Rating: {minRating > 0 ? `${minRating}+` : "Any"}
                    </label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={minRating}
                        onChange={(e) => setMinRating(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0A5D31]"
                        style={{
                          background: `linear-gradient(to right, #0A5D31 0%, #0A5D31 ${(minRating / 5) * 100}%, #e5e7eb ${(minRating / 5) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700 min-w-[70px] justify-end">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{minRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#0A5D31]" />
                      Status
                    </label>
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 h-11">
                      <input
                        type="checkbox"
                        id="verified-only"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-[#0A5D31] focus:ring-2 focus:ring-[#0A5D31]/20 cursor-pointer"
                      />
                      <label htmlFor="verified-only" className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer flex-1">
                        <CheckCircle className={`w-5 h-5 ${verifiedOnly ? 'text-[#0A5D31]' : 'text-gray-400'}`} />
                        <span>Verified Only</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[500px] px-4 sm:px-6 py-6">
          <div className="h-full w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200/50 bg-white">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#0A5D31]/5 via-gray-50 to-[#0A5D31]/5">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#0A5D31]/20 mx-auto mb-4"></div>
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#0A5D31] border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                  <p className="text-gray-700 font-semibold text-lg">Loading map...</p>
                  <p className="text-gray-500 text-sm mt-1">Finding sellers near you</p>
                </div>
              </div>
            ) : filteredMapLocations.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-8">
                <Card className="p-12 text-center rounded-2xl border-2 border-gray-200 shadow-xl max-w-md bg-white">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <MapPin className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Sellers Found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filters to find more sellers</p>
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedSpecialty("all")
                      setMinRating(0)
                      setVerifiedOnly(false)
                    }}
                    className="bg-[#0A5D31] hover:bg-[#0d7a3f] shadow-lg px-6"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </Card>
              </div>
            ) : (
              <div className="h-full w-full">
                <MapView
                  locations={filteredMapLocations}
                  center={mapCenter}
                  zoom={filteredMapLocations.length === 1 ? 10 : 6}
                  showHeatMap={false}
                  title={`${filteredMapLocations.length} Seller${filteredMapLocations.length === 1 ? '' : 's'}`}
                />
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </div>
  )
}

