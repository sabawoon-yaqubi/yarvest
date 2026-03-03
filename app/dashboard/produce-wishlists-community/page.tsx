"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Leaf,
  Users,
  Loader2,
  Package,
  MessageCircle,
  ChevronLeft,
  Apple,
} from "lucide-react"
import { toast } from "sonner"
import { useSafeTranslations } from "@/hooks/use-safe-translations"
import {
  getPublicProduceWishlists,
  createProduceWishlistOffer,
  type PublicProduceWishlist,
} from "@/lib/produce-wishlist-api"
import { getImageUrl } from "@/lib/utils"
import Link from "next/link"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

export default function ProduceWishlistsCommunityPage() {
  const t = useSafeTranslations("admin.produceWishlist")
  const [wishlists, setWishlists] = useState<PublicProduceWishlist[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    id: number
    item_name: string
    wishlist: PublicProduceWishlist
  } | null>(null)
  const [offerMessage, setOfferMessage] = useState("")
  const [offerPrice, setOfferPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [offeredItemIds, setOfferedItemIds] = useState<Set<number>>(new Set())

  const fetchWishlists = async (pageNum = 1) => {
    try {
      setLoading(true)
      const response = await getPublicProduceWishlists(pageNum)
      setWishlists(response.data)
      setTotalPages(response.meta.last_page)
    } catch (error: any) {
      console.error("Error fetching wishlists:", error)
      toast.error("Failed to load community wishlists")
      setWishlists([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlists(page)
  }, [page])

  const openOfferDialog = (item: { id: number; item_name: string }, wishlist: PublicProduceWishlist) => {
    setSelectedItem({ id: item.id, item_name: item.item_name, wishlist })
    setOfferMessage("")
    setOfferPrice("")
    setOfferDialogOpen(true)
  }

  const handleSubmitOffer = async () => {
    if (!selectedItem) return
    setIsSubmitting(true)
    try {
      await createProduceWishlistOffer(selectedItem.id, {
        message: offerMessage.trim() || undefined,
        price: offerPrice ? parseFloat(offerPrice) : undefined,
      })
      toast.success(t("offerSent"))
      setOfferDialogOpen(false)
      setSelectedItem(null)
      setOfferedItemIds((prev) => new Set([...prev, selectedItem.id]))
    } catch (error: any) {
      if (error.response?.data?.message?.includes("already")) {
        toast.error(t("alreadyOffered"))
        setOfferedItemIds((prev) => new Set([...prev, selectedItem.id]))
      } else {
        toast.error(error.response?.data?.message || "Failed to submit offer")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading && wishlists.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: COLORS.primary }} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/produce-wishlist"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to my wishlists
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 rounded-xl" style={{ backgroundColor: COLORS.accent }}>
              <Users className="w-6 h-6" style={{ color: COLORS.primary }} />
            </div>
            {t("communityTitle")}
          </h1>
          <p className="text-gray-500 mt-1">{t("communitySubtitle")}</p>
        </div>
      </div>

      {/* Wishlists Grid */}
      {wishlists.length === 0 ? (
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="p-16 text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: COLORS.accent }}
            >
              <Package className="w-10 h-10" style={{ color: COLORS.primary }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No public wishlists yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              When users create public produce wishlists, they&apos;ll appear here. You can then offer to supply the items they&apos;re looking for!
            </p>
            <Button asChild variant="outline" style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
              <Link href="/dashboard/produce-wishlist">Create your own wishlist</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wishlists.map((wishlist) => (
              <Card
                key={wishlist.id}
                className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                {wishlist.image && (
                  <div className="h-36 overflow-hidden">
                    <img src={getImageUrl(wishlist.image)} alt={wishlist.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    {wishlist.owner.image ? (
                      <img
                        src={getImageUrl(wishlist.owner.image)}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: COLORS.accent }}
                      >
                        <Users className="w-6 h-6" style={{ color: COLORS.primary }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{wishlist.name}</h3>
                      <p className="text-sm text-gray-500">{wishlist.owner.full_name}</p>
                    </div>
                  </div>
                  {wishlist.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{wishlist.description}</p>
                  )}
                  <div className="space-y-2">
                    {wishlist.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                            style={{ backgroundColor: COLORS.accent }}
                          >
                            {item.image ? (
                              <img src={getImageUrl(item.image)} alt={item.item_name} className="w-full h-full object-cover" />
                            ) : (
                              <Apple className="w-5 h-5" style={{ color: COLORS.primary }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.item_name}</p>
                            {(item.quantity || item.unit) && (
                              <p className="text-xs text-gray-500">
                                {[item.quantity, item.unit].filter(Boolean).join(" • ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => openOfferDialog(item, wishlist)}
                          disabled={offeredItemIds.has(item.id)}
                          style={
                            offeredItemIds.has(item.id)
                              ? {}
                              : { backgroundColor: COLORS.primary }
                          }
                          className={
                            offeredItemIds.has(item.id)
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "text-white hover:opacity-90"
                          }
                        >
                          {offeredItemIds.has(item.id) ? (
                            <>
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Offered
                            </>
                          ) : (
                            <>
                              <Package className="w-3 h-3 mr-1" />
                              {t("offerToSupply")}
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
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

      {/* Offer Dialog */}
      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("offerToSupply")}</DialogTitle>
            <DialogDescription>
              {selectedItem && (
                <>
                  Offer to supply &quot;{selectedItem.item_name}&quot;. The wishlist owner will be notified and can
                  accept your offer.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <>
              <div className="space-y-4 py-4">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">{selectedItem.item_name}</p>
                </div>
                <div>
                  <Label htmlFor="message">{t("yourMessage")}</Label>
                  <Textarea
                    id="message"
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="e.g. I have fresh organic apples from my orchard..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="price">{t("yourPrice")}</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOfferDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitOffer}
                  disabled={isSubmitting}
                  style={{ backgroundColor: COLORS.primary }}
                  className="text-white hover:opacity-90"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("submitOffer")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
