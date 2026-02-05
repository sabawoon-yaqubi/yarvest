"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft, Package, Leaf } from "lucide-react"
import { useState } from "react"
import { useSafeTranslations } from "@/hooks/use-safe-translations"
import { Link } from "@/routing"

export default function NotFound() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useSafeTranslations("notFound")

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-green-50/30 flex items-center justify-center px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Animated 404 Number */}
            <div className="mb-8">
              <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5a9c3a] via-[#7ab856] to-[#0d7a3f] leading-none">
                404
              </h1>
            </div>

            {/* Icon Illustration */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5a9c3a]/20 to-[#0d7a3f]/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-[#5a9c3a]/10 to-[#0d7a3f]/10 rounded-full p-8 border-4 border-[#5a9c3a]/20">
                  <Package className="w-24 h-24 text-[#5a9c3a]" />
                </div>
              </div>
            </div>

            {/* Main Message */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t("title")}
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                {t("message")}
              </p>
              <p className="text-base text-gray-500">
                {t("submessage")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/">
                <Button 
                  size="lg"
                  className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  {t("goHome")}
                </Button>
              </Link>
              <Link href="/products">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#5a9c3a] text-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white font-semibold px-8 py-6 rounded-xl transition-all flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  {t("browseProducts")}
                </Button>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto">
              <Link 
                href="/categories"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#5a9c3a] hover:shadow-md transition-all group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-[#5a9c3a]/10 rounded-lg group-hover:bg-[#5a9c3a]/20 transition-colors">
                    <Leaf className="w-6 h-6 text-[#5a9c3a]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#5a9c3a] transition-colors">
                    {t("categories")}
                  </span>
                </div>
              </Link>
              <Link 
                href="/producers"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#5a9c3a] hover:shadow-md transition-all group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-[#5a9c3a]/10 rounded-lg group-hover:bg-[#5a9c3a]/20 transition-colors">
                    <Package className="w-6 h-6 text-[#5a9c3a]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#5a9c3a] transition-colors">
                    {t("producers")}
                  </span>
                </div>
              </Link>
              <Link 
                href="/deals"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#5a9c3a] hover:shadow-md transition-all group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-[#5a9c3a]/10 rounded-lg group-hover:bg-[#5a9c3a]/20 transition-colors">
                    <Search className="w-6 h-6 text-[#5a9c3a]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#5a9c3a] transition-colors">
                    {t("deals")}
                  </span>
                </div>
              </Link>
              <Link 
                href="/search"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#5a9c3a] hover:shadow-md transition-all group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 bg-[#5a9c3a]/10 rounded-lg group-hover:bg-[#5a9c3a]/20 transition-colors">
                    <Search className="w-6 h-6 text-[#5a9c3a]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#5a9c3a] transition-colors">
                    {t("search")}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}

