"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star, CheckCircle } from "lucide-react"
import Link from "next/link"
import { ApiProducer, Location } from "@/types/producer"
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

export function ProducersSection() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold text-foreground">Meet Our Producers</h2>
          <p className="text-muted-foreground text-base mt-2">Local farmers committed to quality and sustainability</p>
        </div>
        <Link href="/producers" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm transition-colors">
          View All
        </Link>
      </div>
      
      <ApiDataFetcher<ApiProducer>
        url="/stores/producers"
        limit={4}
        page={1}
        gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        renderItem={(producer) => (
          <Link key={producer.id} href={`/producers/${producer.id}`}>
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col bg-card border border-border rounded-2xl cursor-pointer h-full">
              <div className="relative group overflow-hidden bg-secondary h-48">
                <img
                  src={producer.image || "/placeholder.svg"}
                  alt={producer.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {producer.verified && (
                  <div className="absolute top-3 right-3 bg-[#0A5D31] text-white p-2 rounded-full shadow-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-foreground mb-1">{producer.name}</h3>
                <p className="text-xs text-[#0A5D31] font-semibold mb-2 uppercase tracking-wide">{producer.specialty}</p>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  {formatLocation(producer.location)}
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm text-foreground">{producer.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{producer.products} items</span>
                </div>

                <Button className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl transition-all mt-auto h-10">
                  View Shop
                </Button>
              </div>
            </Card>
          </Link>
        )}
        renderLoading={() => <ProducerCardSkeleton count={4} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No producers available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}
