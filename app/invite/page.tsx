"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Users, Mail, Gift, Share2, Copy, Check } from "lucide-react"
import { useState } from "react"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export default function InvitePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useSafeTranslations("invite")

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Thank You Message at Top */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5a9c3a]/10 rounded-full mb-4">
              <Users className="w-8 h-8 text-[#5a9c3a]" />
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
              {t("subtitle")}
            </p>
          </div>

          {/* Preview of How It Will Look */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8 opacity-75 pointer-events-none">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t("previewTitle")}</h3>
            
            <div className="space-y-6">
              {/* Invite Form Preview */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-500">{t("inviteFriendsByEmail")}</label>
                </div>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder={t("enterFriendsEmail")}
                    disabled
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                  >
                    {t("sendInvitation")}
                  </button>
                </div>
              </div>

              {/* Referral Link Preview */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <Share2 className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-500">{t("yourReferralLink")}</label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="yarvest.app/invite/your-unique-code"
                    disabled
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <button
                    disabled
                    className="px-4 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Rewards Preview */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/5 rounded-xl p-6 border border-[#5a9c3a]/20">
                  <Gift className="w-8 h-8 text-[#5a9c3a] mb-3" />
                  <h4 className="font-semibold text-gray-700 mb-1">{t("friendsJoined")}</h4>
                  <p className="text-2xl font-bold text-gray-400">0</p>
                </div>
                <div className="bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/5 rounded-xl p-6 border border-[#5a9c3a]/20">
                  <Gift className="w-8 h-8 text-[#5a9c3a] mb-3" />
                  <h4 className="font-semibold text-gray-700 mb-1">{t("rewardsEarned")}</h4>
                  <p className="text-2xl font-bold text-gray-400">$0</p>
                </div>
                <div className="bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/5 rounded-xl p-6 border border-[#5a9c3a]/20">
                  <Check className="w-8 h-8 text-[#5a9c3a] mb-3" />
                  <h4 className="font-semibold text-gray-700 mb-1">{t("status")}</h4>
                  <p className="text-sm text-gray-500">{t("comingSoon")}</p>
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
