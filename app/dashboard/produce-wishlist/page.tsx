"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Leaf,
  Plus,
  Trash2,
  Loader2,
  Apple,
  ChevronRight,
  Users,
  MessageCircle,
} from "lucide-react"
import { toast } from "sonner"
import { useSafeTranslations } from "@/hooks/use-safe-translations"
import {
  getProduceWishlists,
  createProduceWishlist,
  deleteProduceWishlist,
  addProduceWishlistItem,
  removeProduceWishlistItem,
  respondToProduceWishlistOffer,
  type ProduceWishlist,
  type ProduceWishlistItem,
} from "@/lib/produce-wishlist-api"
import { getImageUrl } from "@/lib/utils"
import api from "@/lib/axios"
import Link from "next/link"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

export default function ProduceWishlistPage() {
  const t = useSafeTranslations("admin.produceWishlist")
  const [wishlists, setWishlists] = useState<ProduceWishlist[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false)
  const [selectedWishlist, setSelectedWishlist] = useState<ProduceWishlist | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [wishlistToDelete, setWishlistToDelete] = useState<ProduceWishlist | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state for create wishlist (quick create: wishlist + first item in one step)
  const [newName, setNewName] = useState("My Produce Wishlist")
  const [newDescription, setNewDescription] = useState("")
  const [newFirstItem, setNewFirstItem] = useState("")
  const [newImage, setNewImage] = useState("")
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [newIsPublic, setNewIsPublic] = useState(true)
  const [isUploadingWishlistImage, setIsUploadingWishlistImage] = useState(false)
  const wishlistImageInputRef = React.useRef<HTMLInputElement>(null)

  // Form state for add item
  const [itemName, setItemName] = useState("")
  const [itemQuantity, setItemQuantity] = useState("")
  const [itemNotes, setItemNotes] = useState("")
  const [itemUnit, setItemUnit] = useState("")

  const fetchWishlists = async () => {
    try {
      setLoading(true)
      const data = await getProduceWishlists()
      setWishlists(data)
    } catch (error: any) {
      console.error("Error fetching wishlists:", error)
      toast.error("Failed to load wishlists")
      setWishlists([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlists()
  }, [])

  const handleWishlistImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }
    setIsUploadingWishlistImage(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("type", "wishlist")
      const response = await api.post("/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const path = response.data?.data?.path || response.data?.data?.image
      if (path) {
        setNewImage(path)
        setNewImagePreview(getImageUrl(path))
        toast.success("Image uploaded")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload image")
    } finally {
      setIsUploadingWishlistImage(false)
    }
  }

  const handleCreateWishlist = async () => {
    setIsSubmitting(true)
    try {
      const wishlist = await createProduceWishlist({
        name: newName,
        description: newDescription || undefined,
        image: newImage || undefined,
        is_public: newIsPublic,
      })
      if (newFirstItem.trim()) {
        await addProduceWishlistItem(wishlist.id, { item_name: newFirstItem.trim() })
        toast.success("Wishlist created with first item!")
      } else {
        toast.success(t("created"))
      }
      setCreateDialogOpen(false)
      setNewName("My Produce Wishlist")
      setNewDescription("")
      setNewFirstItem("")
      setNewImage("")
      setNewImagePreview(null)
      setNewIsPublic(true)
      fetchWishlists()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create wishlist")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddItem = async () => {
    if (!selectedWishlist || !itemName.trim()) return
    setIsSubmitting(true)
    try {
      await addProduceWishlistItem(selectedWishlist.id, {
        item_name: itemName.trim(),
        quantity: itemQuantity.trim() || undefined,
        notes: itemNotes.trim() || undefined,
        unit: itemUnit.trim() || undefined,
      })
      toast.success(t("itemAdded"))
      setAddItemDialogOpen(false)
      setSelectedWishlist(null)
      setItemName("")
      setItemQuantity("")
      setItemNotes("")
      setItemUnit("")
      fetchWishlists()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add item")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveItem = async (wishlist: ProduceWishlist, item: ProduceWishlistItem) => {
    try {
      await removeProduceWishlistItem(wishlist.id, item.id)
      toast.success(t("itemRemoved"))
      fetchWishlists()
    } catch (error: any) {
      toast.error("Failed to remove item")
    }
  }

  const handleDeleteWishlist = async () => {
    if (!wishlistToDelete) return
    setIsSubmitting(true)
    try {
      await deleteProduceWishlist(wishlistToDelete.id)
      toast.success(t("deleted"))
      setDeleteDialogOpen(false)
      setWishlistToDelete(null)
      fetchWishlists()
    } catch (error: any) {
      toast.error("Failed to delete wishlist")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRespondToOffer = async (offerId: number, status: "accepted" | "rejected") => {
    try {
      await respondToProduceWishlistOffer(offerId, status)
      toast.success(`Offer ${status}`)
      fetchWishlists()
    } catch (error: any) {
      toast.error("Failed to respond to offer")
    }
  }

  const openAddItemDialog = (wishlist: ProduceWishlist) => {
    setSelectedWishlist(wishlist)
    setItemName("")
    setItemQuantity("")
    setItemNotes("")
    setItemUnit("")
    setAddItemDialogOpen(true)
  }

  const popularProduce = [
    "Organic Apples",
    "Fresh Tomatoes",
    "Blueberries",
    "Strawberries",
    "Cherries",
    "Peaches",
    "Pumpkins",
    "Raspberries",
    "Blackberries",
    "Green Beans",
    "Sweet Corn",
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: COLORS.primary }} />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: COLORS.accent }}>
              <Leaf className="w-6 h-6" style={{ color: COLORS.primary }} />
            </div>
            {t("title")}
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Add produce you want. Others can browse and send inquiries to supply them.
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          size="lg"
          style={{ backgroundColor: COLORS.primary }}
          className="hover:opacity-95 text-white rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("createWishlist")}
        </Button>
      </div>

      {/* Wishlists */}
      {wishlists.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
            <Apple className="w-10 h-10" style={{ color: COLORS.primary }} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("noWishlistsYet")}</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm">{t("createFirst")}</p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="lg"
            style={{ backgroundColor: COLORS.primary }}
            className="hover:opacity-95 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("createWishlist")}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {wishlists.map((wishlist) => (
            <div key={wishlist.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Card header with image or placeholder */}
              <div className="relative">
                {wishlist.image ? (
                  <>
                    <div className="h-36 overflow-hidden">
                      <img src={getImageUrl(wishlist.image)} alt={wishlist.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white drop-shadow-md">{wishlist.name}</h3>
                        {wishlist.description && (
                          <p className="text-white/90 text-sm mt-0.5 line-clamp-1">{wishlist.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {wishlist.is_public && (
                          <Badge className="text-xs bg-white/90 text-gray-700 border-0">
                            <Users className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        )}
                        {wishlist.is_public && (
                          <Button variant="secondary" size="sm" asChild className="rounded-lg bg-white/90 hover:bg-white text-gray-800 h-8">
                            <Link href={`/produce-wishlists/${wishlist.id}`} target="_blank">View</Link>
                          </Button>
                        )}
                        <Button size="sm" onClick={() => openAddItemDialog(wishlist)} style={{ backgroundColor: COLORS.primary }} className="text-white hover:opacity-95 rounded-lg h-8">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white/90 hover:text-white hover:bg-white/20 h-8 w-8" onClick={() => { setWishlistToDelete(wishlist); setDeleteDialogOpen(true); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100" style={{ backgroundColor: COLORS.accent }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/80">
                        <Leaf className="w-5 h-5" style={{ color: COLORS.primary }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{wishlist.name}</h3>
                        {wishlist.description && <p className="text-sm text-gray-600 line-clamp-1">{wishlist.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {wishlist.is_public && (
                        <Badge className="text-xs" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: COLORS.primaryDark }}>
                          <Users className="w-3 h-3 mr-1" /> Public
                        </Badge>
                      )}
                      {wishlist.is_public && (
                        <Button variant="outline" size="sm" asChild className="rounded-lg h-8" style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
                          <Link href={`/produce-wishlists/${wishlist.id}`} target="_blank">View</Link>
                        </Button>
                      )}
                      <Button size="sm" onClick={() => openAddItemDialog(wishlist)} style={{ backgroundColor: COLORS.primary }} className="text-white rounded-lg h-8">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-white/50 h-8 w-8" onClick={() => { setWishlistToDelete(wishlist); setDeleteDialogOpen(true); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                {wishlist.items.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-gray-400 text-sm mb-4">{t("noItemsYet")}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddItemDialog(wishlist)}
                      className="rounded-xl"
                      style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {t("addFirstItem")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {wishlist.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf6] hover:bg-[#e8f5e9]/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: COLORS.accent }}>
                            {item.image ? (
                              <img src={getImageUrl(item.image)} alt={item.item_name} className="w-full h-full object-cover" />
                            ) : (
                              <Apple className="w-5 h-5" style={{ color: COLORS.primary }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm">{item.item_name}</p>
                            {(item.quantity || item.unit) && (
                              <p className="text-xs text-gray-500">
                                {[item.quantity, item.unit].filter(Boolean).join(" • ")}
                              </p>
                            )}
                          </div>
                          {item.status === "fulfilled" && (
                            <Badge className="flex-shrink-0 text-xs" style={{ backgroundColor: COLORS.accent, color: COLORS.primaryDark }}>
                              Fulfilled
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {(item.offers?.length || 0) + (item.inquiries?.length || 0) > 0 && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {(item.offers?.length || 0) + (item.inquiries?.length || 0)}
                            </span>
                          )}
                          {item.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-7 w-7"
                              onClick={() => handleRemoveItem(wishlist, item)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {/* Offers & inquiries */}
                    {wishlist.items.some((i) => (i.offers?.length || 0) + (i.inquiries?.length || 0) > 0) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{t("offers")}</p>
                        <div className="space-y-2">
                          {wishlist.items
                            .filter((i) => (i.offers?.length || 0) + (i.inquiries?.length || 0) > 0)
                            .map((item) => (
                              <React.Fragment key={item.id}>
                                {item.offers?.filter((o) => o.status === "pending").map((offer) => (
                                  <div key={offer.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100">
                                    <div className="flex items-center gap-3">
                                      {offer.provider?.image ? (
                                        <img src={getImageUrl(offer.provider.image)} alt="" className="w-8 h-8 rounded-full object-cover" />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                          <Users className="w-4 h-4 text-gray-400" />
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-medium text-sm text-gray-900">{offer.provider?.full_name}</p>
                                        <p className="text-xs text-gray-500">{item.item_name}</p>
                                        {offer.message && <p className="text-xs text-gray-600 mt-0.5">{offer.message}</p>}
                                        {offer.price != null && (
                                          <p className="text-sm font-semibold mt-0.5" style={{ color: COLORS.primary }}>${Number(offer.price).toFixed(2)}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                      <Button size="sm" style={{ backgroundColor: COLORS.primary }} className="text-white rounded-lg h-7 text-xs" onClick={() => handleRespondToOffer(offer.id, "accepted")}>
                                        Accept
                                      </Button>
                                      <Button size="sm" variant="outline" className="rounded-lg h-7 text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleRespondToOffer(offer.id, "rejected")}>
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                {item.inquiries?.filter((inq) => inq.status === "pending").map((inquiry) => (
                                  <div key={`inquiry-${inquiry.id}`} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-gray-400" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm text-gray-900">{inquiry.name}</p>
                                        <p className="text-xs text-gray-500">{item.item_name}</p>
                                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{inquiry.message}</p>
                                        <a href={`mailto:${inquiry.email}`} className="text-xs font-medium mt-0.5 inline-block" style={{ color: COLORS.primary }}>{inquiry.email}</a>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </React.Fragment>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Wishlist Dialog - simple one-step create + optional first item */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md p-6 gap-6">
          <DialogHeader className="p-0">
            <DialogTitle>{t("createWishlist")}</DialogTitle>
            <DialogDescription className="mt-1">
              Name your wishlist. Add your first item now or add items later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t("wishlistName")}</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="My Produce Wishlist"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="firstItem">First item (optional)</Label>
              <Input
                id="firstItem"
                value={newFirstItem}
                onChange={(e) => setNewFirstItem(e.target.value)}
                placeholder="e.g. Organic Apples, Fresh Tomatoes"
                className="mt-1"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {popularProduce.slice(0, 6).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewFirstItem(p)}
                    className="text-xs px-2 py-1 rounded-full border border-gray-200 hover:border-[#5a9c3a] hover:bg-[#e8f5e9] transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="desc">Description (optional)</Label>
              <Textarea
                id="desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Fruits and veggies I'm looking for..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>Cover image (optional)</Label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  ref={wishlistImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleWishlistImageUpload}
                />
                <div
                  onClick={() => wishlistImageInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-[#5a9c3a] hover:bg-[#e8f5e9]/30 transition-colors overflow-hidden"
                >
                  {isUploadingWishlistImage ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  ) : newImagePreview ? (
                    <img src={newImagePreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-gray-400">+</span>
                  )}
                </div>
                {newImagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => {
                      setNewImage("")
                      setNewImagePreview(null)
                      if (wishlistImageInputRef.current) wishlistImageInputRef.current.value = ""
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="public">{t("publicWishlist")}</Label>
              <Switch id="public" checked={newIsPublic} onCheckedChange={setNewIsPublic} />
            </div>
          </div>
          <DialogFooter className="p-0 pt-2 gap-2">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateWishlist}
              disabled={isSubmitting}
              style={{ backgroundColor: COLORS.primary }}
              className="text-white hover:opacity-90"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("createWishlist")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog - simple: just name + optional details */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent className="max-w-md p-6 gap-6">
          <DialogHeader className="p-0">
            <DialogTitle>{t("addItem")}</DialogTitle>
            <DialogDescription className="mt-1">
              What produce are you looking for? Tap a suggestion or type your own.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="itemName">{t("itemName")}</Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Organic Apples, Fresh Tomatoes"
                className="mt-1"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {popularProduce.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setItemName(p)}
                    className="text-xs px-2 py-1 rounded-full border border-gray-200 hover:border-[#5a9c3a] hover:bg-[#e8f5e9] transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantity" className="text-xs text-gray-500">Quantity (optional)</Label>
                <Input
                  id="quantity"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  placeholder="e.g. 5 lbs"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="unit" className="text-xs text-gray-500">Unit (optional)</Label>
                <Input
                  id="unit"
                  value={itemUnit}
                  onChange={(e) => setItemUnit(e.target.value)}
                  placeholder="lbs, kg"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes" className="text-xs text-gray-500">Notes (optional)</Label>
              <Input
                id="notes"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="Any special requests..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="p-0 pt-2 gap-2">
            <Button variant="outline" onClick={() => setAddItemDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleAddItem}
              disabled={!itemName.trim() || isSubmitting}
              style={{ backgroundColor: COLORS.primary }}
              className="text-white hover:opacity-90"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("addItem")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteWishlist")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteWishlistConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWishlist}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link to Public Wishlists Page */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between" style={{ borderLeft: `4px solid ${COLORS.primary}` }}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: COLORS.accent }}>
            <Users className="w-5 h-5" style={{ color: COLORS.primary }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t("communityTitle")}</h3>
            <p className="text-sm text-gray-500">Others can browse your public wishlists and send inquiries.</p>
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-xl" style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
          <Link href="/produce-wishlists">
            Browse wishlists
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
