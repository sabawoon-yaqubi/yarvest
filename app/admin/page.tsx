"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export default function AdminDashboardRedirect() {
  const router = useRouter()
  const t = useSafeTranslations("admin")

  useEffect(() => {
    router.replace("/dashboard")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#5a9c3a]" />
        <p className="text-muted-foreground">{t("redirecting")}</p>
      </div>
    </div>
  )
}
