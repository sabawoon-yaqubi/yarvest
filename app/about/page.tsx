"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Users, Heart, Sprout } from "lucide-react"
import { useState } from "react"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export default function AboutPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useSafeTranslations("about")

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("title")}</h1>
            <p className="text-gray-500 text-sm mb-12">{t("subtitle")}</p>

            <div className="space-y-12">
              {/* Mission */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("ourMission")}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("missionText1")}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t("missionText2")}
                </p>
              </section>

              {/* Values */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t("ourValues")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#5a9c3a]/10 rounded-lg">
                          <Leaf className="w-6 h-6 text-[#5a9c3a]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">{t("sustainability")}</h3>
                          <p className="text-gray-600 text-sm">
                            {t("sustainabilityDescription")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#5a9c3a]/10 rounded-lg">
                          <Users className="w-6 h-6 text-[#5a9c3a]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">{t("community")}</h3>
                          <p className="text-gray-600 text-sm">
                            {t("communityDescription")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#5a9c3a]/10 rounded-lg">
                          <Heart className="w-6 h-6 text-[#5a9c3a]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">{t("quality")}</h3>
                          <p className="text-gray-600 text-sm">
                            {t("qualityDescription")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#5a9c3a]/10 rounded-lg">
                          <Sprout className="w-6 h-6 text-[#5a9c3a]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">{t("freshness")}</h3>
                          <p className="text-gray-600 text-sm">
                            {t("freshnessDescription")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* How It Works */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("howItWorks")}</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#5a9c3a] text-white rounded-full flex items-center justify-center font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{t("browseProducts")}</h3>
                      <p className="text-gray-600 text-sm">
                        {t("browseProductsDescription")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#5a9c3a] text-white rounded-full flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{t("placeOrder")}</h3>
                      <p className="text-gray-600 text-sm">
                        {t("placeOrderDescription")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#5a9c3a] text-white rounded-full flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{t("getFreshProduce")}</h3>
                      <p className="text-gray-600 text-sm">
                        {t("getFreshProduceDescription")}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
