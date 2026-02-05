"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { BecomePartnerSection } from "@/components/become-partner-section"
import { useState } from "react"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export default function BecomePartnerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const t = useSafeTranslations("becomePartner")

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
          <div className="px-6 py-16 max-w-7xl mx-auto">
            <BecomePartnerSection />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  )
}





