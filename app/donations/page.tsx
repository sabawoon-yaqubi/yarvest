"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, DollarSign, Users, TrendingUp, CheckCircle, Clock, Award, Target, Loader2 } from "lucide-react"
import { useState } from "react"
import { useApiFetch } from "@/hooks/use-api-fetch"

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
  const [donationAmount, setDonationAmount] = useState(25)

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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0A5D31]/10 rounded-full mb-6">
                <Heart className="w-10 h-10 text-[#0A5D31]" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Donations & Giving</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Support your community by donating to help feed families in need and support local agriculture
              </p>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-[#0A5D31] mx-auto mb-4" />
                  <p className="text-gray-600">Loading donation campaigns...</p>
                </div>
              </div>
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
                          className="overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-2xl border-2 border-gray-200 hover:border-[#0A5D31]/30 group"
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
                              <Badge className="absolute top-4 left-4 bg-[#0A5D31] text-white border-0 shadow-lg">
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
                                  className="bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 mb-5 text-sm text-gray-600 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-[#0A5D31]" />
                                <span className="font-medium">{campaign.donors} {campaign.donors === 1 ? 'donor' : 'donors'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4 text-[#0A5D31]" />
                                <span className="font-medium">{Math.round(progress)}% funded</span>
                              </div>
                              {campaign.impact && (
                                <div className="flex items-center gap-1.5">
                                  <Target className="w-4 h-4 text-[#0A5D31]" />
                                  <span className="font-medium">{campaign.impact}</span>
                                </div>
                              )}
                            </div>

                            <Button className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl h-11 shadow-md hover:shadow-lg transition-all">
                              <Heart className="w-4 h-4 mr-2" />
                              Donate Now
                            </Button>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>

                {/* Quick Donate Section */}
                <Card className="p-8 rounded-2xl border-2 border-[#0A5D31] bg-gradient-to-br from-[#0A5D31]/5 to-white mb-12">
                  <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Buy Food for Needy</h2>
                    <p className="text-gray-600 mb-6 text-lg">
                      Purchase food items that will be directly delivered to families in need in your community
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                      {[25, 50, 100, 250].map((amount) => (
                        <Button
                          key={amount}
                          variant={donationAmount === amount ? "default" : "outline"}
                          onClick={() => setDonationAmount(amount)}
                          className={`h-12 px-6 text-base font-semibold rounded-xl transition-all ${
                            donationAmount === amount 
                              ? "bg-[#0A5D31] text-white shadow-lg" 
                              : "border-2 border-gray-300 hover:border-[#0A5D31]"
                          }`}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    <Button 
                      size="lg" 
                      className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white px-8 h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      Donate ${donationAmount}
                    </Button>
                  </div>
                </Card>

                {/* Impact Stats */}
                <div className="mt-12 mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Impact</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { icon: Users, value: stats.families_helped, label: "Families Helped" },
                      { icon: DollarSign, value: `$${stats.total_raised}`, label: "Raised This Year" },
                      { icon: Heart, value: `${stats.total_donors.toLocaleString()}+`, label: "Donors" },
                      { icon: Award, value: `${stats.completed_campaigns}+`, label: "Campaigns Completed" },
                    ].map((stat, idx) => (
                      <Card key={idx} className="p-6 rounded-2xl border-2 border-gray-200 text-center hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-[#0A5D31]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <stat.icon className="w-7 h-7 text-[#0A5D31]" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                        <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Success Stories */}
                <Card className="p-8 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-[#0A5D31]/5 to-white">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Success Stories</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Community Garden Success",
                        text: "Thanks to donations, we've established 15 community gardens serving over 500 families.",
                        impact: "500+ families",
                      },
                      {
                        title: "Farmer Support Program",
                        text: "Our farmer support initiative has helped 30 small farms expand their operations.",
                        impact: "30 farms",
                      },
                      {
                        title: "School Nutrition",
                        text: "Fresh produce programs in schools have improved nutrition for 1,200+ students.",
                        impact: "1,200+ students",
                      },
                    ].map((story, idx) => (
                      <div key={idx} className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:shadow-lg transition-shadow">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{story.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{story.text}</p>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0A5D31]">
                          <Target className="w-4 h-4" />
                          {story.impact}
                        </div>
                      </div>
                    ))}
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
