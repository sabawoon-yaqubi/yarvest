"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle, Mail, Phone, Truck, ArrowLeft, Loader2, Shield, Clock, Award, Package } from "lucide-react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { getImageUrl } from "@/lib/utils"

interface CourierDetail {
  id: number
  unique_id: string
  name: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  image?: string
  profile_picture?: string
  location: string
  verified: boolean
  type?: 'volunteer' | 'courier'
  status: string
  bio?: string
  description?: string
  created_at?: string
  updated_at?: string
}

export default function CourierDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courierId = params.id as string
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch courier details - fetch all couriers and find the matching one
  const { data: courierResponse, loading, error, refetch } = useApiFetch<any>(
    `/couriers?limit=1000`,
    {
      enabled: !!courierId,
    }
  )

  // Extract couriers from response
  const couriers = courierResponse?.data || []
  const courier = Array.isArray(couriers) 
    ? couriers.find((c: CourierDetail) => {
        const matchesUniqueId = c.unique_id === courierId
        const matchesId = c.id?.toString() === courierId
        return matchesUniqueId || matchesId
      })
    : undefined

  const imageUrl = courier ? getImageUrl(courier.image || courier.profile_picture, courier.name) : ''

  // Debug logging (remove in production)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Courier ID from params:', courierId)
    console.log('Courier Response:', courierResponse)
    console.log('Couriers Array:', couriers)
    console.log('Found Courier:', courier)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="bg-white rounded-xl p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto md:mx-0"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-16">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Courier</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
                <Button onClick={() => router.push('/couriers-list')} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Couriers
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Not found state - only show if we've finished loading and courier is not found
  if (!loading && !courier) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-16">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Courier Not Found</h1>
              <p className="text-gray-600 mb-6">
                The courier you're looking for doesn't exist or has been removed.
                {courierId && ` (ID: ${courierId})`}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
                <Button onClick={() => router.push('/couriers-list')} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Couriers
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Don't render main content if courier is not found
  if (!courier) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Courier Profile */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-[#0A5D31]/20 mx-auto md:mx-0">
                      <img
                        src={imageUrl}
                        alt={courier.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {courier.verified && (
                      <div className="absolute -bottom-2 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0">
                        <Badge className="bg-[#0A5D31] text-white px-3 py-1 text-xs font-semibold flex items-center gap-1 shadow-md">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {courier.name}
                      </h1>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{courier.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center md:justify-end gap-2">
                      <div className="flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-lg">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-gray-900">4.8</span>
                        <span className="text-sm text-gray-600">(120+)</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(courier.email || courier.phone) && (
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                      {courier.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{courier.email}</span>
                        </div>
                      )}
                      {courier.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{courier.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {(courier.bio || courier.description) && (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {courier.bio || courier.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0A5D31]/10 rounded-full mb-3">
                <Package className="w-6 h-6 text-[#0A5D31]" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">500+</div>
              <div className="text-sm text-gray-600">Deliveries</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0A5D31]/10 rounded-full mb-3">
                <Clock className="w-6 h-6 text-[#0A5D31]" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">98%</div>
              <div className="text-sm text-gray-600">On-Time Rate</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0A5D31]/10 rounded-full mb-3">
                <Award className="w-6 h-6 text-[#0A5D31]" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">4.8</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Why Choose This Courier?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0A5D31]/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#0A5D31]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Verified & Trusted</h3>
                  <p className="text-sm text-gray-600">Background checked and verified by Yarvest</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0A5D31]/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#0A5D31]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Reliable Delivery</h3>
                  <p className="text-sm text-gray-600">Consistent on-time delivery performance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0A5D31]/10 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#0A5D31]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Professional Service</h3>
                  <p className="text-sm text-gray-600">Experienced in handling fresh produce</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0A5D31]/10 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-[#0A5D31]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">High Ratings</h3>
                  <p className="text-sm text-gray-600">Rated 4.8+ by customers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white"
              size="lg"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact Courier
            </Button>
            <Button 
              variant="outline"
              className="flex-1 border-2 border-gray-300 hover:border-[#0A5D31]"
              size="lg"
            >
              <Truck className="w-4 h-4 mr-2" />
              Request Delivery
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

