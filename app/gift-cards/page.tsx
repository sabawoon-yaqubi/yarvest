"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Gift, Mail, CreditCard, Sparkles, Send, Check } from "lucide-react"
import { useState } from "react"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export default function GiftCardsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useSafeTranslations("giftCards")

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Thank You Message at Top */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5a9c3a]/10 rounded-full mb-4">
              <Gift className="w-8 h-8 text-[#5a9c3a]" />
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
              {/* Purchase Gift Card Preview */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-500">{t("purchaseGiftCard")}</label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[25, 50, 100, 200].map((amount) => (
                    <button
                      key={amount}
                      disabled
                      className="px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-400 font-medium cursor-not-allowed hover:border-gray-300"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Custom Amount"
                    disabled
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Purchase Gift Card
                  </button>
                </div>
              </div>

              {/* Send Gift Card Preview */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <Send className="w-5 h-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-500">{t("sendGiftCard")}</label>
                </div>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder={t("recipientsEmail")}
                    disabled
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <textarea
                    placeholder={t("personalMessage")}
                    disabled
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed resize-none"
                  />
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    {t("sendGiftCardButton")}
                  </button>
                </div>
              </div>

              {/* Gift Card Balance Preview */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/5 rounded-xl p-6 border border-[#5a9c3a]/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-6 h-6 text-[#5a9c3a]" />
                    <h4 className="font-semibold text-gray-700">{t("giftCardBalance")}</h4>
                  </div>
                  <p className="text-3xl font-bold text-gray-400">$0.00</p>
                  <p className="text-sm text-gray-500 mt-2">{t("availableToUse")}</p>
                </div>
                <div className="bg-gradient-to-br from-[#5a9c3a]/10 to-[#5a9c3a]/5 rounded-xl p-6 border border-[#5a9c3a]/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-6 h-6 text-[#5a9c3a]" />
                    <h4 className="font-semibold text-gray-700">{t("giftCardsSent")}</h4>
                  </div>
                  <p className="text-3xl font-bold text-gray-400">0</p>
                  <p className="text-sm text-gray-500 mt-2">{t("totalSent")}</p>
                </div>
              </div>

              {/* Gift Card Features Preview */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-gray-400" />
                  {t("featuresComingSoon")}
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-400" />
                    {t("digitalGiftCards")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-400" />
                    {t("useOnAnyProduct")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-400" />
                    {t("neverExpires")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-gray-400" />
                    {t("personalMessages")}
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
