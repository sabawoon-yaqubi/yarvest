"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle, Mail, Phone, ArrowLeft, Loader2, Shield, Clock, Award, Heart, Users, Calendar } from "lucide-react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { getImageUrl } from "@/lib/utils"
import { ApiVolunteer } from "@/components/volunteers-section"

export default function VolunteerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const volunteerId = params.id as string
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch volunteer details - fetch all volunteers and find the matching one
  const { data: volunteerResponse, loading, error, refetch } = useApiFetch<any>(
    `/volunteers?limit=1000`,
    {
      enabled: !!volunteerId,
    }
  )

  // Extract volunteers from response
  // useApiFetch extracts response.data.data, so volunteerResponse should be the array directly
  // But handle case where it might be wrapped
  const volunteers: ApiVolunteer[] = Array.isArray(volunteerResponse) 
    ? volunteerResponse 
    : (volunteerResponse?.data && Array.isArray(volunteerResponse.data))
      ? volunteerResponse.data
      : []

  const volunteer = volunteers.find((v: ApiVolunteer) => {
    if (!v) return false
    const matchesUniqueId = v.unique_id === volunteerId
    const matchesId = v.id?.toString() === volunteerId
    return matchesUniqueId || matchesId
  })

  const imageUrl = volunteer ? getImageUrl(volunteer.image || volunteer.profile_picture, volunteer.name) : ''
  const rating = volunteer?.reviews?.average_rating ?? 0
  const reviewCount = volunteer?.reviews?.total ?? 0

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('Volunteer ID from params:', volunteerId)
    console.log('Volunteer Response:', volunteerResponse)
    console.log('Volunteers Array:', volunteers)
    console.log('Found Volunteer:', volunteer)
    console.log('Loading:', loading)
    console.log('Error:', error)
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
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Volunteer</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
                <Button onClick={() => router.push('/volunteers-list')} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Volunteers
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Not found state - show if we've finished loading and volunteer is not found
  if (!loading && !error && !volunteer) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Volunteer Not Found</h1>
              <p className="text-gray-600 mb-6">
                The volunteer you're looking for doesn't exist or has been removed.
                {volunteerId && ` (ID: ${volunteerId})`}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
                <Button onClick={() => router.push('/volunteers-list')} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Volunteers
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Don't render main content if volunteer is not found (shouldn't reach here due to check above)
  if (!volunteer) {
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

          {/* Volunteer Profile */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-[#0A5D31]/20 mx-auto md:mx-0">
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100">
                          <Users className="w-16 h-16 text-[#0A5D31]" />
                        </div>
                      )}
                    </div>
                    {volunteer.verified && (
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
                        {volunteer.name}
                      </h1>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{volunteer.location}</span>
                      </div>
                    </div>
                    {reviewCount > 0 && (
                      <div className="flex items-center justify-center md:justify-end gap-2">
                        <div className="flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-lg">
                          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-600">({reviewCount})</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  {(volunteer.email || volunteer.phone) && (
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                      {volunteer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{volunteer.email}</span>
                        </div>
                      )}
                      {volunteer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{volunteer.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Member Since */}
                  {volunteer.created_at && (
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {new Date(volunteer.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0A5D31]/10 rounded-full mb-3">
                <Heart className="w-6 h-6 text-[#0A5D31]" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {reviewCount > 0 ? `${reviewCount}+` : 'New'}
              </div>
              <div className="text-sm text-gray-600">Contributions</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0A5D31]/10 rounded-full mb-3">
                <Star className="w-6 h-6 text-[#0A5D31]" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {reviewCount > 0 ? rating.toFixed(1) : '—'}
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0A5D31]/10 rounded-full mb-3">
                <Award className="w-6 h-6 text-[#0A5D31]" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {volunteer.verified ? 'Verified' : 'Active'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Why Work With This Volunteer?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0A5D31]/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#0A5D31]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Verified & Trusted</h3>
                  <p className="text-sm text-gray-600">
                    {volunteer.verified 
                      ? 'Background checked and verified by Yarvest' 
                      : 'Active community member'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0A5D31]/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#0A5D31]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Community Focused</h3>
                  <p className="text-sm text-gray-600">Dedicated to supporting local farmers and harvesting efforts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0A5D31]/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#0A5D31]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Reliable & Committed</h3>
                  <p className="text-sm text-gray-600">Consistent participation in community activities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0A5D31]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#0A5D31]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Team Player</h3>
                  <p className="text-sm text-gray-600">
                    {reviewCount > 0 
                      ? `Rated ${rating.toFixed(1)} by ${reviewCount} community members` 
                      : 'Ready to contribute to community projects'}
                  </p>
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
              <Mail className="w-4 h-4 mr-2" />
              Contact Volunteer
            </Button>
            <Button 
              variant="outline"
              className="flex-1 border-2 border-gray-300 hover:border-[#0A5D31]"
              size="lg"
            >
              <Heart className="w-4 h-4 mr-2" />
              Request Assistance
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

