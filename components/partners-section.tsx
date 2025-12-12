"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Building2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ApiDataFetcher } from "./api-data-fetcher"
import { ProducerCardSkeleton } from "./producer-card-skeleton"
import { getImageUrl } from "@/lib/utils"

export interface ApiPartner {
  id: number
  unique_id: string
  name: string
  description?: string
  image?: string
  logo?: string
  website?: string
  video?: string
  partener_type?: {
    id: number
    unique_id: string
    name: string
  }
  created_at?: string
  updated_at?: string
}

export function PartnersSection() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-6 h-6 text-[#0A5D31]" />
            <h2 className="text-4xl font-bold text-foreground">Our Partners</h2>
          </div>
          <p className="text-muted-foreground text-base mt-2">Trusted organizations supporting our mission</p>
        </div>
        <Link href="/partners" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm transition-colors flex items-center gap-1">
          View All Partners
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <ApiDataFetcher<ApiPartner>
        url="/partners/featured"
        limit={4}
        page={1}
        gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        renderItem={(partner) => {
          const imageUrl = getImageUrl(partner.image || partner.logo, partner.name)
          
          return (
            <Card key={partner.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col bg-card border border-border rounded-2xl cursor-pointer h-full">
              <div className="relative group overflow-hidden bg-secondary h-48">
                <img
                  src={imageUrl}
                  alt={partner.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
                {partner.partener_type && (
                  <div className="absolute top-3 left-3 bg-[#0A5D31] text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {partner.partener_type.name}
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-foreground mb-2">{partner.name}</h3>
                {partner.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {partner.description}
                  </p>
                )}

                {partner.website && (
                  <Button 
                    asChild
                    className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl transition-all mt-auto h-10 flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <a 
                      href={partner.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Visit Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          )
        }}
        renderLoading={() => <ProducerCardSkeleton count={4} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No partners available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}
