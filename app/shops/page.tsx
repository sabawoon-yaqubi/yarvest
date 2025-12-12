"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Star, Clock, Phone, Search, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { usePaginatedApi } from "@/hooks/use-paginated-api"
import Link from "next/link"
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
            <div className="mb-10">
              <h1 className="text-5xl font-bold text-foreground mb-3">Yarvest Stores</h1>
              <p className="text-lg text-muted-foreground">
                Visit our local shops to discover fresh, organic produce and support local farmers
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
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading stores...</span>
              </div>
            )}

            {/* Error State */}
            {error && filteredShops.length === 0 && (
              <Card className="p-12 text-center rounded-3xl">
                <p className="text-red-500 text-lg mb-4">Error loading stores: {error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
                </Button>
              </Card>
            )}

            {/* Shops Grid */}
            {!loading && filteredShops.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredShops.map((shop) => (
                    <Link key={shop.id} href={`/shops/${shop.unique_id}`}>
                      <Card className="overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-105 rounded-3xl shadow-sm bg-white flex flex-col h-full cursor-pointer">
                        <div className="relative group overflow-hidden bg-secondary h-64">
                          <img
                            src={shop.logo || "/placeholder.svg"}
                            alt={shop.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                          {shop.store_type && (
                            <div className="absolute top-3 left-3 bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
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

                          <Button className="w-full bg-primary hover:bg-accent text-white font-semibold rounded-lg h-12 transition-all">
                            Visit Store
                          </Button>
                        </div>
                      </Card>
                    </Link>
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
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading...
                        </>
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
              <Card className="p-12 text-center rounded-3xl">
                <p className="text-muted-foreground text-lg">
                  {searchQuery ? "No stores found matching your search" : "No stores available at the moment"}
                </p>
              </Card>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
