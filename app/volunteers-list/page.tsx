"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, CheckCircle, Star, MapPin, Search } from "lucide-react"
import { useState, useMemo } from "react"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"
import { ProducerCardSkeleton } from "@/components/producer-card-skeleton"
import { ApiVolunteer } from "@/components/volunteers-section"
import { getImageUrl } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function VolunteersListPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [allVolunteers, setAllVolunteers] = useState<ApiVolunteer[]>([])
  const router = useRouter()

  // Filter volunteers based on search query
  const filteredVolunteers = useMemo(() => {
    if (!searchQuery.trim()) return allVolunteers
    const query = searchQuery.toLowerCase()
    return allVolunteers.filter(volunteer => 
      volunteer.name.toLowerCase().includes(query) ||
      volunteer.location.toLowerCase().includes(query)
    )
  }, [allVolunteers, searchQuery])

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/30 to-white">
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#5a9c3a]/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#5a9c3a]" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900">Our Harvesters</h1>
              </div>
              <p className="text-lg text-gray-600 mb-6">
                Community helpers dedicated to supporting local farmers and harvesting efforts
              </p>

              {/* Search and Map Button - Search on Right */}
              <div className="flex items-center justify-between gap-3 mb-8">
                <div></div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by name or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 h-9 text-sm w-64 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5a9c3a]/20 focus:border-[#5a9c3a] transition-colors"
                    />
                  </div>
                  <Button
                    onClick={() => router.push('/volunteers-list/map')}
                    className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl px-4 h-9 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">View Map</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Volunteers Grid */}
            <InfiniteScrollFetcher<ApiVolunteer>
              url="/volunteers"
              limit={12}
              gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              onSuccess={(data) => {
                if (Array.isArray(data)) {
                  setAllVolunteers(prev => {
                    const existingIds = new Set(prev.map(v => v.id))
                    const newVolunteers = data.filter((v: ApiVolunteer) => !existingIds.has(v.id))
                    return [...prev, ...newVolunteers]
                  })
                }
              }}
              renderItem={(volunteer) => {
                // Filter based on search query
                if (searchQuery.trim()) {
                  const query = searchQuery.toLowerCase()
                  if (!volunteer.name?.toLowerCase().includes(query) && 
                      !volunteer.location?.toLowerCase().includes(query)) {
                    return null
                  }
                }
                const imageUrl = getImageUrl(volunteer.image || volunteer.profile_picture, volunteer.name)
                const rating = volunteer.reviews?.average_rating ?? 0
                const reviewCount = volunteer.reviews?.total ?? 0
                
                return (
                  <Link 
                    href={`/volunteers-list/${volunteer.unique_id || volunteer.id}`}
                    key={volunteer.id}
                    className="block"
                  >
                    <Card
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl border border-gray-200 bg-white flex flex-col h-full cursor-pointer group"
                    >
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-[#5a9c3a]/10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-100 group-hover:border-[#5a9c3a]/30 transition-colors">
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
                              <Users className="w-8 h-8 text-[#5a9c3a]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900 truncate">{volunteer.name}</h3>
                              {volunteer.verified && (
                                <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 flex-shrink-0">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                              <MapPin className="w-3.5 h-3.5 text-[#5a9c3a] flex-shrink-0" />
                              <span className="truncate">{volunteer.location}</span>
                            </div>
                            {reviewCount > 0 ? (
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold text-sm text-gray-900">{rating.toFixed(1)}</span>
                                <span className="text-xs text-gray-500">({reviewCount} reviews)</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-gray-300" />
                                <span className="text-xs text-gray-500">No reviews yet</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-200">
                          <Button className="w-full bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl h-10 transition-all shadow-sm hover:shadow-md">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              }}
              renderLoading={() => <ProducerCardSkeleton count={12} />}
              renderEmpty={() => (
                <div className="text-center py-16 col-span-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg text-gray-600 font-medium mb-2">
                    {searchQuery ? "No volunteers found matching your search." : "No volunteers available at the moment."}
                  </p>
                  {searchQuery && (
                    <p className="text-sm text-gray-500">Try adjusting your search terms.</p>
                  )}
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
