"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export default function PrivacyPolicyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useSafeTranslations("privacy")

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("title")}</h1>
            <p className="text-gray-500 text-sm mb-8">{t("lastUpdated", { date: new Date().toLocaleDateString() })}</p>

            <div className="prose prose-sm max-w-none space-y-8 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. {t("introduction")}</h2>
                <p className="leading-relaxed">
                  {t("introductionText")}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. {t("informationWeCollect")}</h2>
                <p className="leading-relaxed mb-3">{t("informationWeCollectText")}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t("accountInformation")}</li>
                  <li>{t("paymentInformation")}</li>
                  <li>{t("deliveryAddress")}</li>
                  <li>{t("orderHistory")}</li>
                  <li>{t("communicationData")}</li>
                  <li>{t("profileInformation")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. {t("howWeUseInformation")}</h2>
                <p className="leading-relaxed mb-3">{t("howWeUseInformationText")}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t("processOrders")}</li>
                  <li>{t("communicate")}</li>
                  <li>{t("marketing")}</li>
                  <li>{t("improve")}</li>
                  <li>{t("preventFraud")}</li>
                  <li>{t("comply")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. {t("informationSharing")}</h2>
                <p className="leading-relaxed">
                  {t("informationSharingText")}
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>{t("serviceProviders")}</li>
                  <li>{t("paymentProcessors")}</li>
                  <li>{t("deliveryPartners")}</li>
                  <li>{t("legalAuthorities")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. {t("dataSecurity")}</h2>
                <p className="leading-relaxed">
                  {t("dataSecurityText")}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. {t("yourRights")}</h2>
                <p className="leading-relaxed mb-3">{t("yourRightsText")}</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t("accessInformation")}</li>
                  <li>{t("correctInformation")}</li>
                  <li>{t("requestDeletion")}</li>
                  <li>{t("optOut")}</li>
                  <li>{t("objectToProcessing")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. {t("cookies")}</h2>
                <p className="leading-relaxed">
                  {t("cookiesText")} <a href="/cookies" className="text-[#5a9c3a] hover:underline">{t("cookiePolicy")}</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. {t("contactUs")}</h2>
                <p className="leading-relaxed">
                  {t("contactUsText")}
                </p>
                <p className="mt-2">
                  Email: <a href="mailto:privacy@yarvest.health" className="text-[#5a9c3a] hover:underline">{t("contactEmail")}</a>
                </p>
              </section>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
