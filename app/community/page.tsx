"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Users2, MessageSquare, Heart, Share2, User, Calendar, MapPin, TrendingUp, Check } from "lucide-react"
import { useState } from "react"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export default function CommunityPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useSafeTranslations("community")

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Thank You Message at Top */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5a9c3a]/10 rounded-full mb-4">
              <Users2 className="w-8 h-8 text-[#5a9c3a]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t("thankYou")}</h2>
            <p className="text-lg text-gray-600">{t("thankYouMessage")}</p>
          </div>

          {/* Coming Soon Badge */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#5a9c3a]/10 border-2 border-[#5a9c3a]/30 rounded-full mb-6">
              <span className="text-2xl font-bold text-[#5a9c3a]">{t("comingSoon")}</span>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("comingSoonMessage")}
            </p>
          </div>

          {/* Preview of How It Will Look */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8 opacity-75 pointer-events-none">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t("previewFeatures")}</h3>
            
            <div className="space-y-6">
              {/* Community Posts Preview */}
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-500">{t("communityPosts")}</label>
                </div>
                <div className="space-y-4">
                  {/* Post Preview 1 */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#5a9c3a]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-[#5a9c3a]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-700 text-sm">Farmer John</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Just harvested fresh tomatoes! Available at the market this weekend. 🍅</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <button disabled className="flex items-center gap-1 cursor-not-allowed">
                            <Heart className="w-4 h-4" />
                            <span>12</span>
                          </button>
                          <button disabled className="flex items-center gap-1 cursor-not-allowed">
                            <MessageSquare className="w-4 h-4" />
                            <span>3</span>
                          </button>
                          <button disabled className="flex items-center gap-1 cursor-not-allowed">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Preview 2 */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-700 text-sm">Sarah M.</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">5 hours ago</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Looking for tips on growing organic vegetables. Any recommendations?</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <button disabled className="flex items-center gap-1 cursor-not-allowed">
                            <Heart className="w-4 h-4" />
                            <span>8</span>
                          </button>
                          <button disabled className="flex items-center gap-1 cursor-not-allowed">
                            <MessageSquare className="w-4 h-4" />
                            <span>5</span>
                          </button>
                          <button disabled className="flex items-center gap-1 cursor-not-allowed">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discussion Forums Preview */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-500">{t("discussionForums")}</label>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Organic Farming Tips", posts: 24, members: 156 },
                    { title: "Seasonal Recipes", posts: 18, members: 203 },
                    { title: "Local Market Updates", posts: 32, members: 289 },
                    { title: "Sustainability Practices", posts: 15, members: 124 }
                  ].map((forum, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-700 text-sm mb-1">{forum.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{forum.posts} {t("posts")}</span>
                          <span>•</span>
                          <span>{forum.members} {t("members")}</span>
                        </div>
                      </div>
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Farmer Profiles Preview */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/5 rounded-xl p-6 border border-[#5a9c3a]/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#5a9c3a]/20 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-[#5a9c3a]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">{t("farmerProfiles")}</h4>
                      <p className="text-xs text-gray-500">{t("connectWithFarmers")}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#5a9c3a]" />
                      <span>{t("viewFarmerStories")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#5a9c3a]" />
                      <span>{t("followFavorites")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#5a9c3a]" />
                      <span>{t("directMessaging")}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">{t("communityEvents")}</h4>
                      <p className="text-xs text-gray-500">{t("joinLocalGatherings")}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>{t("farmVisitsTours")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>{t("workshopsClasses")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>{t("communityMarkets")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-gray-400" />
                  {t("featuresComingSoon")}
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-400" />
                    {t("sharePhotosStories")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-400" />
                    {t("askQuestions")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-400" />
                    {t("connectFarmers")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-400" />
                    {t("joinForums")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-400" />
                    {t("discoverEvents")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-400" />
                    {t("shareRecipes")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disabled Notice */}
          <div className="text-center">
            <p className="text-sm text-gray-500 italic">
              {t("previewNotice")}
            </p>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
