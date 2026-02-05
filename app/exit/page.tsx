"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, AlertCircle, CheckCircle, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export default function ExitPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const t = useSafeTranslations("exit")

  const handleLogout = () => {
    setShowConfirm(true)
  }

  const confirmLogout = () => {
    window.location.href = "/"
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-16 bg-gradient-to-b from-white to-gray-50/50">
          <div className="max-w-2xl mx-auto">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#5a9c3a]/10 rounded-full mb-6">
                <LogOut className="w-10 h-10 text-[#5a9c3a]" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">{t("title")}</h1>
              <p className="text-xl text-gray-600">
                {t("subtitle")}
              </p>
            </div>

            {!showConfirm ? (
              <Card className="p-8 rounded-2xl border-2 border-gray-200">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("logOutConfirmation")}</h2>
                    <p className="text-gray-600">
                      {t("logOutMessage")}
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Link href="/">
                      <Button variant="outline" className="px-8">
                        {t("cancel")}
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      className="px-8 bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      {t("logOut")}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 rounded-2xl border-2 border-green-200 bg-green-50/50">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("loggedOutSuccessfully")}</h2>
                    <p className="text-gray-600">
                      {t("loggedOutMessage")}
                    </p>
                  </div>
                  <Link href="/">
                    <Button className="px-8 bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white">
                      {t("returnToHome")}
                    </Button>
                  </Link>
                </div>
              </Card>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 rounded-xl border border-gray-200 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">{t("needHelp")}</h3>
                <p className="text-sm text-gray-600 mb-4">{t("contactSupport")}</p>
                <Link href="/help">
                  <Button variant="outline" size="sm" className="w-full">
                    {t("helpCenter")}
                  </Button>
                </Link>
              </Card>
              <Card className="p-6 rounded-xl border border-gray-200 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">{t("stayConnected")}</h3>
                <p className="text-sm text-gray-600 mb-4">{t("joinCommunity")}</p>
                <Link href="/community">
                  <Button variant="outline" size="sm" className="w-full">
                    {t("community")}
                  </Button>
                </Link>
              </Card>
              <Card className="p-6 rounded-xl border border-gray-200 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">{t("continueShopping")}</h3>
                <p className="text-sm text-gray-600 mb-4">{t("browseProducts")}</p>
                <Link href="/products">
                  <Button variant="outline" size="sm" className="w-full">
                    {t("products")}
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}





