"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, DollarSign, Users, TrendingUp, CheckCircle, Clock, Sprout, Store, Settings, Target } from "lucide-react"
import { useState } from "react"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { DonationSkeleton } from "@/components/donation-skeleton"
import Link from "next/link"

interface DonationCampaign {
  id: number
  unique_id: string
  title: string
  description: string
  goal: number
  raised: number
  donors: number
  image: string | null
  verified: boolean
  impact: string | null
  daysLeft: number | null
  progress: number
  date: string
  status: boolean
}

interface DonationStats {
  families_helped: string
  total_raised: string
  total_donors: number
  completed_campaigns: number
}

export default function DonationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch donations
  const { data: donationsData, loading: loadingDonations } = useApiFetch<DonationCampaign[]>(
    `/donations?limit=100&page=1`
  )

  // Fetch statistics
  const { data: statsData, loading: loadingStats } = useApiFetch<DonationStats>(
    `/donations/statistics`
  )

  const donations = donationsData || []
  const stats = statsData || {
    families_helped: "5,000+",
    total_raised: "$150K+",
    total_donors: 2500,
    completed_campaigns: 50,
  }

  const isLoading = loadingDonations || loadingStats

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-16 bg-gradient-to-b from-white to-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#5a9c3a]/10 rounded-full mb-6">
                <Heart className="w-10 h-10 text-[#5a9c3a]" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Donations & Giving</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Support your community by donating to help feed families in need and support local agriculture
              </p>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <DonationSkeleton />
            ) : (
              <>
                {/* Donation Campaigns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {donations.length === 0 ? (
                    <div className="col-span-full">
                      <Card className="p-16 text-center border-2 border-dashed border-gray-200">
                        <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Donation Campaigns</h3>
                        <p className="text-gray-500 text-lg">No active donation campaigns at the moment</p>
                      </Card>
                    </div>
                  ) : (
                    donations.map((campaign) => {
                      const progress = campaign.progress || (campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0)
                      return (
                        <Card 
                          key={campaign.id} 
                          className="overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-2xl border-2 border-gray-200 hover:border-[#5a9c3a]/30 group"
                        >
                          <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                            <img 
                              src={campaign.image || "/placeholder.svg"} 
                              alt={campaign.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {campaign.verified && (
                              <Badge className="absolute top-4 right-4 bg-green-500 text-white border-0 shadow-lg">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {campaign.daysLeft !== null && campaign.daysLeft > 0 && (
                              <Badge className="absolute top-4 left-4 bg-[#5a9c3a] text-white border-0 shadow-lg">
                                <Clock className="w-3 h-3 mr-1" />
                                {campaign.daysLeft} {campaign.daysLeft === 1 ? 'day' : 'days'} left
                              </Badge>
                            )}
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{campaign.title}</h3>
                            <p className="text-gray-600 mb-5 text-sm line-clamp-2 leading-relaxed">{campaign.description}</p>
                            
                            {/* Progress Bar */}
                            <div className="mb-5">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600 font-medium">Raised</span>
                                <span className="font-bold text-gray-900">
                                  ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 mb-5 text-sm text-gray-600 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-[#5a9c3a]" />
                                <span className="font-medium">{campaign.donors} {campaign.donors === 1 ? 'donor' : 'donors'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4 text-[#5a9c3a]" />
                                <span className="font-medium">{Math.round(progress)}% funded</span>
                              </div>
                              {campaign.impact && (
                                <div className="flex items-center gap-1.5">
                                  <Target className="w-4 h-4 text-[#5a9c3a]" />
                                  <span className="font-medium">{campaign.impact}</span>
                                </div>
                              )}
                            </div>

                            <Button className="w-full bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl h-11 shadow-md hover:shadow-lg transition-all">
                              <Heart className="w-4 h-4 mr-2" />
                              Donate Now
                            </Button>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>

                {/* Seller Donation Forwarding Section */}
                <Card className="p-8 rounded-2xl border-2 border-[#5a9c3a] bg-gradient-to-br from-emerald-50 via-[#5a9c3a]/5 to-white mb-12">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-[#5a9c3a]/10">
                        <Sprout className="w-8 h-8 text-[#5a9c3a]" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">For Sellers & Producers</h2>
                    </div>
                    <div className="bg-white rounded-xl p-8 border-2 border-[#5a9c3a]/20 shadow-lg">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-[#5a9c3a]/10 flex-shrink-0">
                          <Store className="w-6 h-6 text-[#5a9c3a]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-3">Forward Proceeds to Yarvest Donation Box</h3>
                          <p className="text-gray-700 leading-relaxed mb-4">
                            As a seller or producer on Yarvest, you can opt to forward proceeds from your sales to the Yarvest Donation Box. 
                            This helps support seed and plant programs across your neighborhood, fostering community growth and agricultural initiatives.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-[#5a9c3a]" />
                                <span className="font-semibold text-gray-900">Set Percentage or Fixed Amount</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Choose to donate a percentage of each sale or a fixed amount per transaction
                              </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-[#5a9c3a]" />
                                <span className="font-semibold text-gray-900">Automatic Forwarding</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Proceeds are automatically forwarded from your sales - no manual steps required
                              </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-[#5a9c3a]" />
                                <span className="font-semibold text-gray-900">Track Your Impact</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                See how your contributions help support community programs and initiatives
                              </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-[#5a9c3a]" />
                                <span className="font-semibold text-gray-900">Change Anytime</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Update your donation settings at any time from your seller dashboard
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button 
                              asChild
                              className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white gap-2 shadow-lg"
                            >
                              <Link href="/admin/settings">
                                <Settings className="w-4 h-4" />
                                Configure Donation Settings
                              </Link>
                            </Button>
                            <Button 
                              variant="outline"
                              asChild
                              className="border-2 border-[#5a9c3a] text-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white gap-2"
                            >
                              <Link href="/admin">
                                <Store className="w-4 h-4" />
                                Go to Seller Dashboard
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
