"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle, Star, MapPin } from "lucide-react"
import { useState } from "react"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"
import { ProducerCardSkeleton } from "@/components/producer-card-skeleton"
import { ApiVolunteer } from "@/components/volunteers-section"
import { getImageUrl } from "@/lib/utils"

export default function VolunteersListPage() {
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
                <Users className="w-8 h-8 text-[#0A5D31]" />
                <h1 className="text-5xl font-bold text-foreground">Our Volunteers</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Community helpers dedicated to supporting local farmers and harvesting efforts
              </p>
            </div>

            {/* Volunteers Grid */}
            <InfiniteScrollFetcher<ApiVolunteer>
              url="/volunteers"
              limit={12}
              gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              renderItem={(volunteer) => {
                const imageUrl = getImageUrl(volunteer.image || volunteer.profile_picture, volunteer.name)
                
                return (
                  <Card
                    key={volunteer.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-3xl border border-border bg-white flex flex-col h-full p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-20 h-20 bg-[#0A5D31]/10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {imageUrl && imageUrl !== "/placeholder.svg" ? (
                          <img
                            src={imageUrl}
                            alt={volunteer.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                        ) : (
                          <Users className="w-10 h-10 text-[#0A5D31]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{volunteer.name}</h3>
                          {volunteer.verified && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4" />
                          {volunteer.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-sm">4.8</span>
                          <span className="text-xs text-muted-foreground">(Verified)</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-4">
                        Dedicated volunteer helping with harvesting and community support
                      </p>
                      <Button className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-lg">
                        Contact Volunteer
                      </Button>
                    </div>
                  </Card>
                )
              }}
              renderLoading={() => <ProducerCardSkeleton count={12} />}
              renderEmpty={() => (
                <div className="text-center py-12 col-span-full">
                  <p className="text-muted-foreground">No volunteers available at the moment.</p>
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
