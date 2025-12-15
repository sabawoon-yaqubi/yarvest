"use client"

import Link from "next/link"
import { ApiPartner } from "@/types/partner"
import { ApiDataFetcher } from "./api-data-fetcher"
import { SponsorCardSkeleton } from "./sponsor-card-skeleton"
import { getImageUrl } from "@/lib/utils"

export function SponsorsSection() {
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
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold text-foreground">Trusted Partners</h2>
          <p className="text-muted-foreground text-base mt-2">Supporting sustainable local agriculture</p>
        </div>
        <Link href="/sponsors" className="text-[#5a9c3a] font-semibold hover:text-[#0d7a3f] text-sm transition-colors">
          View All
        </Link>
      </div>

      <ApiDataFetcher<ApiPartner>
        url="/partners"
        limit={4}
        page={1}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        transformResponse={transformPartners}
        renderItem={(partner) => (
          <Link key={partner.id} href={partner.href || `/sponsors/${partner.id}`}>
            <div className="group cursor-pointer h-full">
              <div className="relative overflow-hidden rounded-2xl h-48 shadow-md hover:shadow-xl transition-all duration-300 bg-secondary border-2 border-transparent hover:border-[#5a9c3a]">
                <img
                  src={partner.logo || partner.image || "/placeholder.png"}
                  alt={partner.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="font-bold text-white text-base">{partner.name}</h3>
                  {partner.description && (
                    <p className="text-white/80 text-xs mt-1">{partner.description}</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}
        renderLoading={() => <SponsorCardSkeleton count={4} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No partners available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}
