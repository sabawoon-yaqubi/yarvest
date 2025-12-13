"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ApiPartner } from "@/types/partner"
import { SponsorCardSkeleton } from "@/components/sponsor-card-skeleton"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"
import { getImageUrl } from "@/lib/utils"

export default function SponsorsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Transform API response to array format
  const transformPartners = (response: any): ApiPartner[] => {
    const rawPartners = response?.partners || response?.sponsors || response?.data || (Array.isArray(response) ? response : [])
    return rawPartners.map((partner: any) => ({
      id: partner.id || partner.unique_id || Math.random(),
      name: partner.name || partner.title || "Unknown Partner",
      logo: getImageUrl(partner.logo || partner.image || partner.main_image || ""),
      description: partner.description || partner.bio || partner.about || "",
      href: partner.href || partner.url || partner.website || `/sponsors/${partner.id || partner.unique_id || partner.slug || ""}`,
      website: partner.website || partner.url || "",
    }))
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
          <div className="px-6 py-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-[#5a9c3a] hover:text-[#0d7a3f] mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Home</span>
              </Link>
              
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-[#5a9c3a]" />
                <h1 className="text-5xl font-bold text-foreground">Trusted Partners</h1>
              </div>
              <p className="text-muted-foreground text-lg mt-2">
                Supporting sustainable local agriculture - Meet our valued partners
              </p>
            </div>

            {/* Partners Grid */}
            <InfiniteScrollFetcher<ApiPartner>
              url="/partners"
              limit={12}
              gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              transformResponse={transformPartners}
              renderItem={(partner) => (
                <Link key={partner.id} href={partner.href || `/sponsors/${partner.id}`}>
                  <div className="group cursor-pointer h-full">
                    <div className="relative overflow-hidden rounded-2xl h-48 shadow-md hover:shadow-xl transition-all duration-300 bg-secondary border-2 border-transparent hover:border-[#5a9c3a]">
                      <img
                        src={partner.logo || partner.image || "/placeholder.svg"}
                        alt={partner.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <h3 className="font-bold text-white text-base">{partner.name}</h3>
                        {partner.description && (
                          <p className="text-white/80 text-xs mt-1 line-clamp-2">{partner.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )}
              renderLoading={() => <SponsorCardSkeleton count={12} />}
              renderEmpty={() => (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No partners available at the moment.</p>
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


