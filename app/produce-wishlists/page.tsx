"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Leaf, Users, Loader2, Apple, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { useSafeTranslations } from "@/hooks/use-safe-translations"
import { getPublicProduceWishlists, type PublicProduceWishlist } from "@/lib/produce-wishlist-api"
import { getImageUrl } from "@/lib/utils"
import Link from "next/link"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  accent: "#e8f5e9",
}

export default function ProduceWishlistsPublicPage() {
  const t = useSafeTranslations("admin.produceWishlist")
  const [wishlists, setWishlists] = useState<PublicProduceWishlist[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchWishlists = async (pageNum = 1) => {
    try {
      setLoading(true)
      const response = await getPublicProduceWishlists(pageNum)
      setWishlists(response.data)
      setTotalPages(response.meta.last_page)
    } catch (error: any) {
      console.error("Error fetching wishlists:", error)
      toast.error("Failed to load wishlists")
      setWishlists([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlists(page)
  }, [page])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-full bg-gradient-to-b from-white via-[#f8faf6] to-[#e8f5e9]/30">
          <div className="px-6 py-16 max-w-6xl mx-auto">
            {/* Hero Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg" style={{ backgroundColor: COLORS.accent }}>
                <Leaf className="w-8 h-8" style={{ color: COLORS.primary }} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                {t("communityTitle")}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {t("communitySubtitle")} Browse what others are looking for and send an inquiry if you can supply it.
              </p>
              <Button asChild size="lg" style={{ backgroundColor: COLORS.primary }} className="text-white hover:opacity-90 shadow-md rounded-xl px-6">
                <Link href="/dashboard/produce-wishlist">
                  <Leaf className="w-4 h-4 mr-2" />
                  Create your own wishlist
                </Link>
              </Button>
            </div>

            {/* Wishlists */}
            {loading && wishlists.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: COLORS.primary }} />
              </div>
            ) : wishlists.length === 0 ? (
              <div className="bg-white p-16 text-center rounded-xl border border-gray-200 shadow-sm max-w-lg mx-auto">
                <div
                  className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  <Apple className="w-12 h-12" style={{ color: COLORS.primary }} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No public wishlists yet</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                  When users create public produce wishlists, they&apos;ll appear here. You can then send an inquiry to supply the items they&apos;re looking for!
                </p>
                <Button asChild size="lg" variant="outline" className="rounded-xl" style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
                  <Link href="/dashboard/produce-wishlist">Create your own wishlist</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {wishlists.map((wishlist) => (
                    <Link
                      key={wishlist.id}
                      href={`/produce-wishlists/${wishlist.id}`}
                      className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-[#5a9c3a]/30 transition-all block"
                    >
                      {wishlist.image ? (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={getImageUrl(wishlist.image)}
                            alt={wishlist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-32 flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                          <Leaf className="w-16 h-16 opacity-40 group-hover:opacity-60 transition-opacity" style={{ color: COLORS.primary }} />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          {wishlist.owner.image ? (
                            <img
                              src={getImageUrl(wishlist.owner.image)}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: COLORS.accent }}
                            >
                              <Users className="w-5 h-5" style={{ color: COLORS.primary }} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-[#0d7a3f] transition-colors">{wishlist.name}</h3>
                            <p className="text-sm text-gray-500">{wishlist.owner.full_name}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#5a9c3a] flex-shrink-0" />
                        </div>
                        {wishlist.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{wishlist.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Apple className="w-4 h-4" style={{ color: COLORS.primary }} />
                          <span>{wishlist.items_count} item{wishlist.items_count !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
