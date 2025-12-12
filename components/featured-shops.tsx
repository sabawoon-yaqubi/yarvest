"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Store, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ApiShop, Location } from "@/types/producer"
import { ApiDataFetcher } from "./api-data-fetcher"
import { ProducerCardSkeleton } from "./producer-card-skeleton"

// Helper function to format location
const formatLocation = (location: string | Location | null | undefined): string => {
  if (!location) return ''
  if (typeof location === 'string') {
    return location
  }
  // Handle location object
  if (location.full_location) {
    return location.full_location
  }
  // Build location from parts
  const parts = [location.city, location.state, location.country].filter(Boolean)
  return parts.join(', ')
}

export function FeaturedShops() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-6 h-6 text-[#0A5D31]" />
            <h2 className="text-4xl font-bold text-foreground">Featured Shops</h2>
          </div>
          <p className="text-muted-foreground text-base mt-2">Discover the best local stores near you</p>
        </div>
        <Link href="/shops" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm transition-colors">
          View All Shops
        </Link>
      </div>
      
      <ApiDataFetcher<ApiShop>
        url="/stores/featured"
        limit={4}
        page={1}
        gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        renderItem={(shop) => (
          <Link key={shop.id} href={`/shops/${shop.unique_id || shop.id}`}>
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col bg-card border border-border rounded-2xl cursor-pointer h-full">
              <div className="relative group overflow-hidden bg-secondary h-48">
                <img
                  src={shop.image || "/placeholder.svg"}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {shop.badge && (
                  <div className="absolute top-3 left-3 bg-[#0A5D31] text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {shop.badge}
                  </div>
                )}
                {shop.distance && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-900">
                    {shop.distance}
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-foreground mb-1">{shop.name}</h3>
                <p className="text-xs text-[#0A5D31] font-semibold mb-2 uppercase tracking-wide">{shop.specialty}</p>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  {formatLocation(shop.location)}
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm text-foreground">{shop.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{shop.products} items</span>
                </div>

                <Button className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl transition-all mt-auto h-10 flex items-center justify-center gap-2">
                  Visit Shop
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </Link>
        )}
        renderLoading={() => <ProducerCardSkeleton count={4} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No featured shops available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}

