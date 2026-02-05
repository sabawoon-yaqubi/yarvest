"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Wrench, Search, Loader2, Sparkles, Map } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { HarvestingToolCard } from "@/components/harvesting-tool-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import dynamic from "next/dynamic"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(
  () => import("@/components/map-view").then((mod) => ({ default: mod.MapView })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#5a9c3a] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    )
  }
)

interface HarvestingTool {
  id: number
  unique_id: string
  name: string
  description: string | null
  image: string | null
  type: 'rent' | 'borrow'
  daily_rate: string | null
  deposit: string | null
  location: string | null
  availability: 'available' | 'unavailable' | 'rented'
  condition: string | null
  instructions: string | null
  owner: {
    id: number
    unique_id: string
    full_name: string
    email: string
    image: string | null
  } | null
  created_at: string
  updated_at: string
}

export default function HarvestingProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tools, setTools] = useState<HarvestingTool[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const t = useSafeTranslations("harvestingProducts")

  // Helper function to extract state from location
  const extractState = (location: string | null): string | null => {
    if (!location) return null
    const states = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ]
    const parts = location.split(',').map(p => p.trim())
    for (const part of parts) {
      const upperPart = part.toUpperCase()
      if (states.includes(upperPart)) {
        return upperPart
      }
    }
    if (parts.length > 1) {
      return parts[parts.length - 1]
    }
    return location
  }

  // Convert tools to map locations (simplified - you may need to geocode addresses)
  const mapLocations = useMemo(() => {
    return tools
      .filter(tool => tool.location)
      .map(tool => ({
        id: tool.id,
        name: tool.name,
        lat: 0, // You'll need to geocode the location or get coordinates from API
        lng: 0, // You'll need to geocode the location or get coordinates from API
        type: tool.type,
        daily_rate: tool.daily_rate,
        deposit: tool.deposit,
        state: extractState(tool.location),
      }))
      .filter(loc => loc.lat !== 0 && loc.lng !== 0) // Filter out invalid coordinates
  }, [tools])

  useEffect(() => {
    fetchTools()
  }, [page, searchQuery])

  const fetchTools = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: 12,
        availability: 'available',
      }
      if (searchQuery) {
        params.search = searchQuery
      }
      const response = await api.get('/harvesting-tools', { params })
      const data = response.data?.data || []
      
      if (page === 1) {
        setTools(data)
      } else {
        setTools(prev => [...prev, ...data])
      }
      
      setHasMore(data.length === 12)
    } catch (error: any) {
      console.error('Error fetching tools:', error)
      toast.error('Failed to load tools')
      setTools([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTools()
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-secondary/5 to-white">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#5a9c3a]/5 via-secondary/10 to-white">
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #5a9c3a 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          <div className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5a9c3a] to-[#4d8236] mb-6 shadow-lg shadow-[#5a9c3a]/20">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
                  {t("title")}
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>

              {/* Enhanced Search */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5a9c3a]/20 to-[#4d8236]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#5a9c3a]/10 hover:border-[#5a9c3a]/20">
                    <Search className="absolute left-5 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder={t("searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-14 pr-6 py-4 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                    <Button
                      type="submit"
                      className="mr-2 bg-[#5a9c3a] hover:bg-[#4d8236] text-white rounded-xl px-6 h-10 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {t("search")}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Results Count and Map Button */}
            {!loading && tools.length > 0 && (
              <div className="mb-8 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("showing")} <span className="font-semibold text-foreground">{tools.length}</span> {t("availableTools")}
                </p>
                <Button
                  onClick={() => setIsMapModalOpen(true)}
                  variant="outline"
                  className="border-2 border-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white text-[#5a9c3a] rounded-xl px-4 h-10 font-semibold transition-all duration-200"
                >
                  <Map className="w-4 h-4 mr-2" />
                  {t("viewOnMap")}
                </Button>
              </div>
            )}

            {/* Tools Grid */}
            {loading && tools.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl min-h-[460px] animate-pulse border-2 border-gray-100 flex flex-col">
                    <div className="h-[220px] bg-gray-200 rounded-t-2xl" />
                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="mt-auto pt-3 border-t-2 border-gray-100">
                        <div className="h-10 bg-gray-200 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : tools.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                  <Wrench className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t("noToolsFound")}</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery 
                    ? t("noToolsMessage", { query: searchQuery })
                    : t("noToolsAvailable")}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                  {tools.map((tool, index) => (
                    <div
                      key={tool.id}
                      className="animate-in fade-in-0 slide-in-from-bottom-4 flex"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <HarvestingToolCard
                        tool={tool}
                        onRequestSuccess={() => {
                          toast.success('Request submitted successfully!')
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-12 text-center">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loading}
                      size="lg"
                      className="bg-[#5a9c3a] hover:bg-[#4d8236] text-white rounded-xl px-8 py-6 h-auto text-base font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t("loadingMoreTools")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          {t("loadMoreTools")}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Footer />
      </main>

      {/* Map Modal */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="sm:max-w-[90vw] max-w-[95vw] h-[90vh] max-h-[90vh] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5a9c3a] to-[#4d8236] flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">{t("toolsMapView")}</DialogTitle>
                <DialogDescription>
                  {t("toolsMapDescription")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-6">
            {mapLocations.length > 0 ? (
              <div className="h-full rounded-lg overflow-hidden border-2 border-gray-200">
                <MapView 
                  locations={mapLocations.map(loc => ({
                    id: loc.id,
                    name: loc.name,
                    lat: loc.lat,
                    lng: loc.lng,
                  }))}
                  center={[37.7749, -122.4194]}
                  zoom={6}
                  showHeatMap={false}
                  title="Harvesting Tools"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="text-center">
                  <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">{t("noLocationData")}</p>
                  <p className="text-sm text-gray-500 mt-2">{t("locationCoordinatesNeeded")}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
