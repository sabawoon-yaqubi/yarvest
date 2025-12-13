"use client"

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-[#0A5D31]" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Couriers</h2>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">Verified delivery partners ensuring safe and timely transport</p>
        </div>
        <Link href="/couriers-list" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm transition-colors flex items-center gap-1 self-start md:self-auto">
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <ApiDataFetcher<ApiVolunteer>
        url="/couriers"
        limit={4}
        page={1}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        renderItem={(courier) => {
          const imageUrl = getImageUrl(courier.image || courier.profile_picture, courier.name)
          const rating = courier.reviews?.average_rating ?? 0
          const reviewCount = courier.reviews?.total ?? 0
          
          return (
            <Link 
              href={`/couriers/${courier.unique_id || courier.id}`}
              key={courier.id}
              className="group block"
            >
              <div className="bg-white rounded-xl border border-gray-200 hover:border-[#0A5D31] hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                <div className="p-5 flex flex-col items-center text-center flex-1">
                  {/* Image and Verified Badge */}
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-[#0A5D31]/20 group-hover:border-[#0A5D31]/50 transition-all duration-300 group-hover:scale-105">
                      <img
                        src={imageUrl}
                        alt={courier.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {courier.verified && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <Badge className="bg-[#0A5D31] text-white px-2.5 py-1 text-xs font-semibold flex items-center gap-1 shadow-md">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#0A5D31] transition-colors">
                    {courier.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="line-clamp-2">{courier.location}</span>
                  </div>

                  {/* Rating */}
                  {reviewCount > 0 ? (
                    <div className="flex items-center justify-center gap-1.5 mb-4">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({reviewCount})</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 mb-4">
                      <Star className="w-4 h-4 text-gray-300" />
                      <span className="text-xs text-gray-400">No reviews yet</span>
                    </div>
                  )}

                  {/* Button */}
                  <div className="mt-auto w-full">
                    <div className="w-full py-2 px-4 rounded-lg border border-gray-300 group-hover:border-[#0A5D31] group-hover:bg-[#0A5D31] group-hover:text-white text-sm font-medium text-gray-700 transition-all duration-300 text-center">
                      View Profile
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        }}
        renderLoading={() => <ProducerCardSkeleton count={4} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No couriers available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}
