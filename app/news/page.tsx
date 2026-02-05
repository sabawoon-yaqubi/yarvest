"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { ComingSoon } from "@/components/coming-soon"
import { Newspaper } from "lucide-react"
import { useState } from "react"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export default function NewsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useSafeTranslations("news")

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <ComingSoon
          title={t("title")}
          icon={Newspaper}
          description={t("description")}
        />
        <Footer />
      </main>
    </div>
  )
}
