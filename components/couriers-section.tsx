"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, CheckCircle, ArrowRight, Star, MapPin } from "lucide-react"
import Link from "next/link"
import { ApiDataFetcher } from "./api-data-fetcher"
import { ProducerCardSkeleton } from "./producer-card-skeleton"
import { getImageUrl } from "@/lib/utils"
import { ApiVolunteer } from "./volunteers-section"

export function CouriersSection() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-6 h-6 text-[#0A5D31]" />
            <h2 className="text-4xl font-bold text-foreground">Our Couriers</h2>
          </div>
          <p className="text-muted-foreground text-base mt-2">Verified delivery partners ensuring safe and timely transport</p>
        </div>
        <Link href="/couriers-list" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm transition-colors flex items-center gap-1">
          View All Couriers
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <ApiDataFetcher<ApiVolunteer>
        url="/couriers"
        limit={4}
        page={1}
        gridClassName="grid grid-cols-1 md:grid-cols-2 gap-6"
        renderItem={(courier) => {
          const imageUrl = getImageUrl(courier.image || courier.profile_picture, courier.name)
          
          return (
            <Card key={courier.id} className="p-6 rounded-2xl border-2 border-border hover:border-[#0A5D31] transition-all hover:shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#0A5D31]/10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={courier.name}
                      className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">{courier.name}</h3>
                    {courier.verified && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    {courier.location}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm">4.8</span>
                    <span className="text-xs text-muted-foreground">(Verified)</span>
                  </div>
                  <Link href="/couriers-list">
                    <Button variant="outline" size="sm" className="w-full border-2 border-border hover:border-[#0A5D31]">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )
        }}
        renderLoading={() => <ProducerCardSkeleton count={4} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No couriers available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}
