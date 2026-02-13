"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { BackendArticleDetail } from "@/types/article"
import { getImageUrl } from "@/lib/utils"
import { ArticleDetailSkeleton } from "@/components/article-detail-skeleton"

export default function GuideDetailPage() {
  const params = useParams()
  const uniqueId = params.uniqueId as string
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: article, loading, error } = useApiFetch<BackendArticleDetail>(
    `/blogs/${uniqueId}`
  )

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/30 to-white">
          <ArticleDetailSkeleton />
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-12 bg-gradient-to-b from-white to-secondary/10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Article Not Found
              </h2>
              <p className="text-muted-foreground mb-8">
                {error ||
                  "The article you're looking for doesn't exist or is no longer available."}
              </p>
              <Link href="/guides">
                <Button className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white">
                  Back to Guides
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const dateStr = article.date
    ? new Date(article.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""
  const authorName =
    article.user?.first_name || article.user?.last_name
      ? [article.user.first_name, article.user.last_name].filter(Boolean).join(" ")
      : article.user?.email || "Yarvest"

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/30 to-white pb-8">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/guides">
            <Button variant="ghost" className="mb-6 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Guides
            </Button>
          </Link>

          <article className="space-y-6">
            {article.blog_type && (
              <span className="inline-block bg-[#5a9c3a] text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                {article.blog_type.name}
              </span>
            )}
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
              {article.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {dateStr && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#5a9c3a]" />
                  {dateStr}
                </span>
              )}
              {authorName && (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#5a9c3a]" />
                  {authorName}
                </span>
              )}
            </div>

            {article.image && (
              <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={getImageUrl(article.image, article.name)}
                  alt={article.name}
                  className="w-full h-auto max-h-[480px] object-cover"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
              {article.description}
            </div>

            {article.video && (
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Related video
                </p>
                <a
                  href={article.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5a9c3a] hover:text-[#0d7a3f] font-medium underline"
                >
                  {article.video}
                </a>
              </div>
            )}
          </article>
        </div>
        <Footer />
      </main>
    </div>
  )
}
