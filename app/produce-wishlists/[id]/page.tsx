"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Leaf,
  Users,
  Loader2,
  Apple,
  MessageSquare,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import {
  getPublicProduceWishlist,
  sendProduceWishlistInquiry,
  type PublicProduceWishlist,
} from "@/lib/produce-wishlist-api"
import { getImageUrl } from "@/lib/utils"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  accent: "#e8f5e9",
}

export default function ProduceWishlistDetailPage() {
  const params = useParams()
  const id = Number(params?.id)
  const [wishlist, setWishlist] = useState<PublicProduceWishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null)
  const [inquiryName, setInquiryName] = useState("")
  const [inquiryEmail, setInquiryEmail] = useState("")
  const [inquiryMessage, setInquiryMessage] = useState("")
  const [submittingItemId, setSubmittingItemId] = useState<number | null>(null)

  useEffect(() => {
    if (!id || isNaN(id)) {
      setLoading(false)
      return
    }
    getPublicProduceWishlist(id)
      .then(setWishlist)
      .catch((err) => {
        console.error(err)
        toast.error("Wishlist not found")
        setWishlist(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSendInquiry = async (itemId: number) => {
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiryEmail)) {
      toast.error("Please enter a valid email")
      return
    }
    setSubmittingItemId(itemId)
    try {
      await sendProduceWishlistInquiry(itemId, {
        name: inquiryName.trim(),
        email: inquiryEmail.trim(),
        message: inquiryMessage.trim(),
      })
      toast.success("Inquiry sent! The wishlist owner will contact you.")
      setExpandedItemId(null)
      setInquiryName("")
      setInquiryEmail("")
      setInquiryMessage("")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send inquiry")
    } finally {
      setSubmittingItemId(null)
    }
  }

  const openInquiry = (itemId: number) => {
    setExpandedItemId(itemId)
    setInquiryName("")
    setInquiryEmail("")
    setInquiryMessage("")
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: COLORS.primary }} />
        </main>
      </div>
    )
  }

  if (!wishlist) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 flex flex-col items-center justify-center px-6 bg-[#fafbf9]">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
              <Leaf className="w-8 h-8" style={{ color: COLORS.primary }} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Wishlist not found</h2>
            <p className="text-gray-500 text-sm mb-6">This wishlist may be private or no longer exists.</p>
            <Button asChild style={{ backgroundColor: COLORS.primary }} className="text-white hover:opacity-95 rounded-xl">
              <Link href="/produce-wishlists">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse wishlists
              </Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-full bg-[#fafbf9]">
          <div className="px-6 py-8 md:py-12 max-w-3xl mx-auto">
            {/* Back link */}
            <Link
              href="/produce-wishlists"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0d7a3f] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to wishlists
            </Link>

            {/* Hero - full bleed image + overlay content */}
            <div className="relative rounded-2xl overflow-hidden mb-10 shadow-lg">
              {wishlist.image ? (
                <div className="aspect-[21/9] md:aspect-[3/1] overflow-hidden">
                  <img
                    src={getImageUrl(wishlist.image)}
                    alt={wishlist.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
              ) : (
                <div className="aspect-[21/9] md:aspect-[3/1] flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
                  <Leaf className="w-24 h-24 opacity-30" style={{ color: COLORS.primary }} />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-end gap-4">
                  {wishlist.owner.image ? (
                    <img
                      src={getImageUrl(wishlist.owner.image)}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-xl flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center ring-4 ring-white shadow-xl flex-shrink-0"
                      style={{ backgroundColor: COLORS.accent }}
                    >
                      <Users className="w-7 h-7" style={{ color: COLORS.primary }} />
                    </div>
                  )}
                  <div className="pb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{wishlist.name}</h1>
                    <p className="text-white/90 text-sm mt-0.5">by {wishlist.owner.full_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description card */}
            {wishlist.description && (
              <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
                <p className="text-gray-600 leading-relaxed">{wishlist.description}</p>
              </div>
            )}

            {/* Items section */}
            <div className="mb-10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Items they&apos;re looking for
              </h2>
              <div className="space-y-3">
                {wishlist.items.length === 0 ? (
                  <div className="bg-white p-16 text-center rounded-2xl border border-dashed border-gray-200 shadow-sm">
                    <Apple className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No items in this wishlist yet.</p>
                  </div>
                ) : (
                  wishlist.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#f8faf6]">
                            {item.image ? (
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.item_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Apple className="w-7 h-7" style={{ color: COLORS.primary }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-lg">{item.item_name}</p>
                            {(item.quantity || item.unit) && (
                              <p className="text-sm text-gray-500 mt-0.5">
                                {[item.quantity, item.unit].filter(Boolean).join(" • ")}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="lg"
                          onClick={() => openInquiry(item.id)}
                          style={{ backgroundColor: COLORS.primary }}
                          className="text-white hover:opacity-95 rounded-xl shadow-sm flex-shrink-0 w-full sm:w-auto"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          I can supply this
                        </Button>
                      </div>

                      {/* Inline inquiry form */}
                      {expandedItemId === item.id && (
                        <div className="border-t border-gray-100 bg-[#f8faf6] p-6">
                          <div className="max-w-md space-y-4">
                            <p className="text-sm text-gray-600">
                              Share your contact info. The wishlist owner will reach out if interested.
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <Label htmlFor="name" className="text-gray-600">Your name</Label>
                                <Input
                                  id="name"
                                  value={inquiryName}
                                  onChange={(e) => setInquiryName(e.target.value)}
                                  placeholder="John Doe"
                                  className="mt-1.5 bg-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor="email" className="text-gray-600">Your email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={inquiryEmail}
                                  onChange={(e) => setInquiryEmail(e.target.value)}
                                  placeholder="john@example.com"
                                  className="mt-1.5 bg-white"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="msg" className="text-gray-600">Message</Label>
                              <Textarea
                                id="msg"
                                value={inquiryMessage}
                                onChange={(e) => setInquiryMessage(e.target.value)}
                                placeholder="I can supply fresh organic apples from my orchard..."
                                className="mt-1.5 bg-white"
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button
                                variant="outline"
                                onClick={() => setExpandedItemId(null)}
                                disabled={!!submittingItemId}
                                className="rounded-xl"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleSendInquiry(item.id)}
                                disabled={
                                  !inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim() || !!submittingItemId
                                }
                                style={{ backgroundColor: COLORS.primary }}
                                className="text-white hover:opacity-95 rounded-xl"
                              >
                                {submittingItemId === item.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Send inquiry
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <p className="text-gray-600 mb-5">Want to create your own wishlist?</p>
              <Button asChild size="lg" style={{ backgroundColor: COLORS.primary }} className="text-white hover:opacity-95 rounded-xl shadow-sm">
                <Link href="/dashboard/produce-wishlist">
                  <Leaf className="w-4 h-4 mr-2" />
                  Create your wishlist
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
