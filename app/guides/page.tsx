"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight } from "lucide-react"
import { useState, useMemo } from "react"
import { BackendArticle } from "@/types/article"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"
import { ArticleCardSkeleton } from "@/components/article-card-skeleton"
import Link from "next/link"
import { getImageUrl } from "@/lib/utils"
import { useSafeTranslations } from "@/hooks/use-safe-translations"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { BackendArticleType } from "@/types/article"

export default function GuidesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null)
  const t = useSafeTranslations("guides")

  const { data: typesData, loading: typesLoading } = useApiFetch<BackendArticleType[] | null>("/blogs/types")
  const types = Array.isArray(typesData) ? typesData : []

  const apiUrl = useMemo(() => {
    if (selectedTypeId) return `/blogs?blog_type_id=${selectedTypeId}`
    return "/blogs"
  }, [selectedTypeId])

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/30 to-white">
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
                {t("title")}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t("subtitle")}
              </p>
            </div>

            {/* Topic filter: skeleton when loading types, buttons when ready */}
            {typesLoading ? (
              <div className="mb-10 flex gap-3 flex-wrap justify-center">
                <div className="h-11 w-28 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-11 w-24 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-11 w-32 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-11 w-20 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-11 w-28 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ) : types.length > 0 ? (
              <div className="mb-10 flex gap-3 flex-wrap justify-center">
                <Button
                  variant={selectedTypeId === null ? "default" : "outline"}
                  onClick={() => setSelectedTypeId(null)}
                  className={`rounded-full font-semibold px-6 h-11 transition-all ${
                    selectedTypeId === null
                      ? "bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white shadow-md"
                      : "border-2 hover:border-[#5a9c3a] hover:text-[#5a9c3a]"
                  }`}
                >
                  {t("allTopics")}
                </Button>
                {types.map((type) => (
                  <Button
                    key={type.unique_id}
                    variant={selectedTypeId === String(type.id) ? "default" : "outline"}
                    onClick={() =>
                      setSelectedTypeId(
                        selectedTypeId === String(type.id) ? null : String(type.id)
                      )
                    }
                    className={`rounded-full font-semibold px-6 h-11 transition-all ${
                      selectedTypeId === String(type.id)
                        ? "bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white shadow-md"
                        : "border-2 hover:border-[#5a9c3a] hover:text-[#5a9c3a]"
                    }`}
                  >
                    {type.name}
                  </Button>
                ))}
              </div>
            ) : null}

            <InfiniteScrollFetcher<BackendArticle>
              key={apiUrl}
              url={apiUrl}
              limit={12}
              gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              renderItem={(article) => {
                const dateStr = article.date
                  ? new Date(article.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""
                return (
                  <div
                    key={article.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl border border-gray-200 bg-white flex flex-col h-full group"
                  >
                    <div className="relative group overflow-hidden bg-gray-100 h-56">
                      <img
                        src={getImageUrl(article.image, article.name)}
                        alt={article.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {article.blog_type && (
                        <div className="absolute top-4 left-4 bg-[#5a9c3a] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase shadow-lg">
                          {article.blog_type.name}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-xs text-gray-500 mb-2">{dateStr}</p>
                      <h3 className="font-bold text-lg text-foreground mb-3 leading-snug line-clamp-2">
                        {article.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                        {article.description}
                      </p>
                      <Link
                        href={`/guides/${article.unique_id}`}
                        className="mt-4 inline-flex items-center gap-2 text-[#5a9c3a] font-semibold hover:text-[#0d7a3f] transition-colors"
                      >
                        {t("readMore")}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              }}
              renderLoading={() => <ArticleCardSkeleton count={6} />}
              renderEmpty={() => (
                <div className="text-center py-20 col-span-full rounded-2xl border border-gray-100 bg-white/80 shadow-sm">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-[#5a9c3a]/10 rounded-full mb-5">
                    <BookOpen className="w-10 h-10 text-[#5a9c3a]" />
                  </div>
                  <p className="text-xl font-semibold text-gray-800 mb-2">
                    {t("noArticles")}
                  </p>
                  <p className="text-gray-500 max-w-md mx-auto">{t("checkBackSoon")}</p>
                </div>
              )}
            />
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
