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
import { Search, MapPin, Star, CheckCircle, ArrowLeft, Users } from "lucide-react"
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

export default function VolunteersMapPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Track when component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const [allVolunteers, setAllVolunteers] = useState<ApiVolunteer[]>([])
  const [allVolunteersLoading, setAllVolunteersLoading] = useState(true)
  const [allVolunteersError, setAllVolunteersError] = useState<string | null>(null)

  // Fetch all volunteers (all pages)
  const fetchAllVolunteers = async () => {
    setAllVolunteersLoading(true)
    setAllVolunteersError(null)
    
    try {
      const allVolunteersData: ApiVolunteer[] = []
      let page = 1
      let hasMore = true
      const limit = 100 // Large limit to get more per page

      while (hasMore) {
        const response = await api.get('/volunteers', {
          params: { page, limit }
        })
        
        if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
          const pageData = response.data.data
          allVolunteersData.push(...pageData)
          hasMore = pageData.length === limit
          page++
        } else {
          hasMore = false
        }
      }

      setAllVolunteers(allVolunteersData)
    } catch (err: any) {
      setAllVolunteersError(err.response?.data?.message || err.message || "Failed to load volunteers")
    } finally {
      setAllVolunteersLoading(false)
    }
  }

  useEffect(() => {
    if (isMounted) {
      fetchAllVolunteers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  const refetchAllVolunteers = () => {
    fetchAllVolunteers()
  }

  // Convert addresses to coordinates using Nominatim API
  const geocodeAddress = async (location: string, index: number = 0): Promise<[number, number] | null> => {
    if (!location || location === "Unknown Location" || location === "Location not specified") {
      return null
    }

    try {
      // Use Nominatim OpenStreetMap API for geocoding
      const searchQuery = encodeURIComponent(location + ', USA')
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Yarvest App',
            'Accept-Language': 'en'
          }
        }
      )

      if (!response.ok) {
        console.warn('Geocoding failed for:', location, 'Status:', response.status)
        return null
      }

      const data = await response.json()
      
      if (data && data.length > 0 && data[0].lat && data[0].lon) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        
        // Validate coordinates
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          // Add small random offset to prevent exact overlap (within ~100m)
          // Use index to create consistent but different offsets
          const offsetLat = lat + (Math.sin(index) * 0.001)
          const offsetLng = lng + (Math.cos(index) * 0.001)
          console.log(`✅ Geocoded: ${location} -> ${offsetLat.toFixed(6)}, ${offsetLng.toFixed(6)}`)
          return [offsetLat, offsetLng]
        } else {
          console.warn('Invalid coordinates for:', location, lat, lng)
        }
      } else {
        console.warn('No geocoding results for:', location)
      }
      
      return null
    } catch (error) {
      console.error('Geocoding error for location:', location, error)
      return null
    }
  }

  const [resolvedLocations, setResolvedLocations] = useState<MapLocation[]>([])
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 })

  // Convert volunteers to map locations
  useEffect(() => {
    const convertVolunteersToLocations = async () => {
      if (!allVolunteers || allVolunteers.length === 0) {
        setResolvedLocations([])
        setGeocodingProgress({ current: 0, total: 0 })
        return
      }

      const locations: MapLocation[] = []
      setGeocodingProgress({ current: 0, total: allVolunteers.length })
      
      // Process volunteers in batches with rate limiting
      const batchSize = 2 // Process 2 at a time
      const delayBetweenBatches = 1000 // 1 second delay between batches
      
      for (let i = 0; i < allVolunteers.length; i += batchSize) {
        const batch = allVolunteers.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (volunteer, batchIndex) => {
          const globalIndex = i + batchIndex
          const coords = await geocodeAddress(volunteer.location, globalIndex)
          
          if (coords) {
            return {
              id: volunteer.id,
              name: volunteer.name,
              lat: coords[0],
              lng: coords[1],
              location: volunteer.location,
              rating: volunteer.reviews?.average_rating ?? 0,
              reviews: volunteer.reviews?.total ?? 0,
              verified: volunteer.verified,
              link: `/volunteers-list/${volunteer.unique_id || volunteer.id}`,
            } as MapLocation
          }
          return null
        })
        
        const batchResults = await Promise.all(batchPromises)
        const validLocations = batchResults.filter((loc): loc is MapLocation => loc !== null)
        locations.push(...validLocations)
        
        // Update locations state incrementally so map shows progress
        setResolvedLocations([...locations])
        setGeocodingProgress({ current: Math.min(i + batchSize, allVolunteers.length), total: allVolunteers.length })
        
        // Delay between batches to respect Nominatim rate limits
        if (i + batchSize < allVolunteers.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
        }
      }

      setGeocodingProgress({ current: allVolunteers.length, total: allVolunteers.length })
    }

    convertVolunteersToLocations()
  }, [allVolunteers])

  // Filter volunteers based on search
  const filteredVolunteers = useMemo(() => {
    let filtered = allVolunteers

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (volunteer) =>
          volunteer.name.toLowerCase().includes(query) ||
          volunteer.location.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [allVolunteers, searchQuery])

  // Filter map locations based on filtered volunteers
  const filteredMapLocations = useMemo(() => {
    const filteredIds = new Set(filteredVolunteers.map(v => v.id))
    return resolvedLocations.filter(loc => filteredIds.has(loc.id))
  }, [resolvedLocations, filteredVolunteers])

  // Calculate map center based on filtered locations
  const mapCenter = useMemo(() => {
    if (filteredMapLocations.length === 0) {
      return [39.8283, -98.5795] as [number, number]
    }

    const avgLat = filteredMapLocations.reduce((sum, loc) => sum + loc.lat, 0) / filteredMapLocations.length
    const avgLng = filteredMapLocations.reduce((sum, loc) => sum + loc.lng, 0) / filteredMapLocations.length
    return [avgLat, avgLng] as [number, number]
  }, [filteredMapLocations])

  const isLoading = isMounted && allVolunteersLoading

  // Show error state
  if (allVolunteersError && allVolunteers.length === 0) {
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
              <p className="text-lg text-gray-600 mb-6">{allVolunteersError}</p>
              <Button onClick={refetchAllVolunteers} className="bg-[#5a9c3a] hover:bg-[#0d7a3f]">
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
              <Link href="/volunteers-list">
                <Button variant="ghost" className="mb-4 -ml-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Volunteers Map</h1>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                      <span>Find volunteers near you</span>
                      <Badge variant="outline" className="text-xs border-[#5a9c3a]/30 text-[#5a9c3a]">
                        {filteredVolunteers.length} {filteredVolunteers.length === 1 ? 'volunteer' : 'volunteers'}
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
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5a9c3a]/10 rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-[#5a9c3a] animate-pulse" />
                </div>
                <p className="text-gray-600 font-medium mb-2">Loading volunteers...</p>
              </div>
            </div>
          ) : filteredMapLocations.length === 0 && geocodingProgress.total > 0 && geocodingProgress.current < geocodingProgress.total ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5a9c3a]/10 rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-[#5a9c3a] animate-pulse" />
                </div>
                <p className="text-gray-600 font-medium mb-2">Geocoding locations...</p>
                <p className="text-sm text-gray-500">
                  {geocodingProgress.current} / {geocodingProgress.total} locations
                </p>
              </div>
            </div>
          ) : filteredMapLocations.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  {searchQuery ? "No volunteers found matching your search." : "No volunteers available."}
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
            isMounted && filteredMapLocations.length > 0 && (
              <div className="h-full w-full">
                <MapView
                  locations={filteredMapLocations}
                  center={mapCenter}
                  zoom={filteredMapLocations.length === 1 ? 10 : 6}
                  showHeatMap={false}
                  title="Volunteers"
                />
                {geocodingProgress.total > 0 && geocodingProgress.current < geocodingProgress.total && (
                  <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 border border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-[#5a9c3a]">{geocodingProgress.current}</span> / {geocodingProgress.total} locations loaded
                    </p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

