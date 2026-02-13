"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, ExternalLink, Loader2, PenLine } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import api from "@/lib/axios"
import { getImageUrl } from "@/lib/utils"
import { useSafeTranslations } from "@/hooks/use-safe-translations"
import { BackendArticle } from "@/types/article"

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "#"

export default function SeedArticlesAdminPage() {
  const t = useSafeTranslations("admin.seedArticles")
  const [articles, setArticles] = useState<BackendArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get("/blogs", { params: { limit: 50, page: 1 } })
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setArticles(res.data.data)
        } else {
          setArticles([])
        }
      } catch (e) {
        setError(t("failedToLoad"))
        setArticles([])
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-600 mt-1">{t("subtitle")}</p>
        </div>
        {ADMIN_URL !== "#" && (
          <a href={ADMIN_URL} target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white gap-2">
              <PenLine className="w-4 h-4" />
              {t("manageInBackend")}
            </Button>
          </a>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#5a9c3a]" />
        </div>
      ) : error ? (
        <div className="text-center py-12 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-gray-200 bg-gray-50">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{t("noArticles")}</p>
          {ADMIN_URL !== "#" && (
            <a href={ADMIN_URL} target="_blank" rel="noopener noreferrer" className="inline-block mt-4">
              <Button variant="outline" className="gap-2">
                <PenLine className="w-4 h-4" />
                {t("manageInBackend")}
              </Button>
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
            >
              {article.image && (
                <img
                  src={getImageUrl(article.image, article.name)}
                  alt=""
                  className="w-full sm:w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                {article.blog_type && (
                  <span className="text-xs font-semibold text-[#5a9c3a] uppercase">
                    {article.blog_type.name}
                  </span>
                )}
                <h2 className="font-semibold text-gray-900 truncate">{article.name}</h2>
                <p className="text-sm text-gray-500 line-clamp-2">{article.description}</p>
              </div>
              <Link href={`/guides/${article.unique_id}`} className="flex-shrink-0">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  {t("viewOnSite")}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {ADMIN_URL === "#" && (
        <p className="mt-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-4">
          Set <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_ADMIN_URL</code> in your env to link to the backend admin for adding and editing articles.
        </p>
      )}
    </div>
  )
}
