"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Building2 } from "lucide-react"
import { useState } from "react"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"
import { ProducerCardSkeleton } from "@/components/producer-card-skeleton"
import { ApiPartner } from "@/components/partners-section"
import { getImageUrl } from "@/lib/utils"

export default function PartnersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-12 bg-gradient-to-b from-white to-secondary/10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-8 h-8 text-[#0A5D31]" />
                <h1 className="text-5xl font-bold text-foreground">Our Partners</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Trusted organizations and businesses supporting our mission to connect communities with fresh, local produce
              </p>
            </div>

            {/* Partners Grid */}
            <InfiniteScrollFetcher<ApiPartner>
              url="/partners/featured"
              limit={12}
              gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              renderItem={(partner) => {
                const imageUrl = getImageUrl(partner.image || partner.logo, partner.name)
                
                return (
                  <Card
                    key={partner.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-3xl border border-border bg-white flex flex-col h-full"
                  >
                    <div className="relative group overflow-hidden bg-secondary h-64">
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
                        <div className="absolute top-4 left-4 bg-[#0A5D31] text-white px-4 py-2 rounded-full text-xs font-bold uppercase shadow-lg">
                          {partner.partener_type.name}
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-xl text-foreground mb-3 leading-snug">{partner.name}</h3>
                      {partner.description && (
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-3 flex-1">
                          {partner.description}
                        </p>
                      )}

                      {partner.website ? (
                        <Button 
                          asChild
                          className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-lg mt-auto h-11 transition-all flex items-center justify-center gap-2"
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
                      ) : (
                        <div className="mt-auto pt-4 text-sm text-muted-foreground text-center">
                          No website available
                        </div>
                      )}
                    </div>
                  </Card>
                )
              }}
              renderLoading={() => <ProducerCardSkeleton count={12} />}
              renderEmpty={() => (
                <div className="text-center py-12 col-span-full">
                  <p className="text-muted-foreground">No partners available at the moment.</p>
                </div>
              )}
            />
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
