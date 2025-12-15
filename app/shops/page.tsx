"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Star, Clock, Phone, Search, Loader2, Store, Sparkles } from "lucide-react"
import { useState, useMemo } from "react"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { usePaginatedApi } from "@/hooks/use-paginated-api"
import { StoreListSkeleton } from "@/components/store-list-skeleton"
import { ApiResponse } from "@/types/api"

interface StoreLocation {
  city?: string
  state?: string
  country?: string
  full_location?: string
}

interface Store {
  id: number
  unique_id: string
  name: string
  logo: string | null
  description: string | null
  bio: string | null
  website: string | null
  phone: string | null
  email: string | null
  store_type: {
    id: number
    name: string
  } | null
  user: {
    id: number
    unique_id: string
    full_name: string
    image: string | null
    location?: StoreLocation | null
  } | null
  location?: StoreLocation | null
  items_count: number
  status: boolean
  created_at: string
  updated_at: string
}

interface StoresResponse {
  data: Store[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export default function ShopsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [page, setPage] = useState(1)

  const { data, loading, error, loadMore, hasMore } = usePaginatedApi<Store>(
    "/stores",
    {
      limit: 12,
      enabled: true,
    }
  )

  const filteredShops = useMemo(() => {
    if (!data) return []
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    return data.filter(
      (shop) =>
        shop.name.toLowerCase().includes(query) ||
        shop.description?.toLowerCase().includes(query) ||
        shop.store_type?.name.toLowerCase().includes(query) ||
        shop.user?.full_name.toLowerCase().includes(query)
    )
  }, [data, searchQuery])

  const formatLocation = (store: Store): string => {
    if (store.location?.full_location) {
      return store.location.full_location
    }
    if (store.location) {
      const parts = [
        store.location.city,
        store.location.state,
        store.location.country
      ].filter(Boolean)
      if (parts.length > 0) {
        return parts.join(', ')
      }
    }
    if (store.user?.location?.full_location) {
      return store.user.location.full_location
    }
    if (store.user?.location) {
      const parts = [
        store.user.location.city,
        store.user.location.state,
        store.user.location.country
      ].filter(Boolean)
      if (parts.length > 0) {
        return parts.join(', ')
      }
    }
    return store.store_type?.name || "Location not available"
  }

  const formatHours = (store: Store): string => {
    // Hours would come from store.hours relationship
    // For now, return a default
    return "Check store for hours"
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-12 bg-gradient-to-b from-white to-secondary/10">
          <div className="max-w-6xl mx-auto">
            {/* Coming Soon Banner */}
            <div className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20 p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>
              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <Store className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                      Real Shops Coming Soon!
                    </h2>
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <p className="text-lg text-muted-foreground mb-2">
                    We're working hard to bring you amazing local shops and stores
                  </p>
                  <p className="text-sm text-muted-foreground/80 italic">
                    The shops below are preview placeholders - real stores will be available soon!
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h1 className="text-5xl font-bold text-foreground mb-3">Yarvest Stores</h1>
              <p className="text-lg text-muted-foreground">
                Shop from our partners for the healthiest organic products.
              </p>
            </div>

            {/* Enhanced Search */}
            <div className="mb-10">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by store name, description, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 h-14 text-base rounded-full border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && filteredShops.length === 0 && (
              <StoreListSkeleton />
            )}

            {/* Error State */}
            {error && filteredShops.length === 0 && (
              <div className="p-12 text-center rounded-3xl">
                <p className="text-red-500 text-lg mb-4">Error loading stores: {error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
                </Button>
              </div>
            )}

            {/* Shops Grid */}
            {!loading && filteredShops.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 opacity-60">
                  {filteredShops.map((shop) => (
                    <div key={shop.id} className="relative">
                      {/* Preview Badge */}
                   
                      <div className="overflow-hidden transition-all duration-300 rounded-3xl shadow-sm bg-white flex flex-col h-full cursor-not-allowed pointer-events-none">
                        <div className="relative group overflow-hidden bg-secondary h-64">
                          <img
                            src={shop.logo || "/placeholder.png"}
                            alt={shop.name}
                            className="w-full h-full object-cover transition-transform duration-300 grayscale"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.png"
                            }}
                          />
                          {shop.store_type && (
                            <div className="absolute top-3 left-3 bg-primary/70 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                              {shop.store_type.name}
                            </div>
                          )}
                        </div>
                        <div className="p-7 flex flex-col flex-1">
                          <h3 className="text-2xl font-bold text-foreground mb-2">{shop.name}</h3>
                          {shop.store_type && (
                            <p className="text-sm font-semibold text-primary mb-6 uppercase tracking-wide">
                              {shop.store_type.name}
                            </p>
                          )}

                          <div className="space-y-3.5 mb-8 pb-8 border-b-2 border-border flex-1">
                            {shop.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{shop.description}</p>
                            )}
                            {formatLocation(shop) !== "Location not available" && (
                              <div className="flex items-start gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-foreground font-medium">
                                  {formatLocation(shop)}
                                </span>
                              </div>
                            )}
                            {shop.user && (
                              <div className="flex items-start gap-3 text-sm">
                                <span className="text-foreground font-medium">
                                  Owner: {shop.user.full_name}
                                </span>
                              </div>
                            )}
                            {shop.phone && (
                              <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-foreground font-medium">{shop.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {shop.items_count} {shop.items_count === 1 ? 'product' : 'products'}
                              </span>
                            </div>
                          </div>

                          <Button className="w-full bg-primary/50 text-white font-semibold rounded-lg h-12 transition-all cursor-not-allowed" disabled>
                            Coming Soon
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && !loading && (
                  <div className="mt-10 text-center">
                    <Button
                      onClick={loadMore}
                      variant="outline"
                      className="px-8 py-6 text-base"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Load More Stores"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && filteredShops.length === 0 && !error && (
              <div className="p-12 text-center rounded-3xl">
                <p className="text-muted-foreground text-lg">
                  {searchQuery ? "No stores found matching your search" : "No stores available at the moment"}
                </p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
