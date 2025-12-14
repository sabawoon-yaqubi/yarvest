"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Search, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import { getImageUrl } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/stores/cart-store"

interface WishlistItem {
  id: number
  product_id: number
  product_unique_id: string
  name: string
  price: string
  original_price: string
  discount: string
  main_image: string | null
  excerpt: string | null
  details: string | null
  sku: string
  stock: number
  seller: {
    id: number
    unique_id: string
    full_name: string
    image: string | null
  }
  product_category: {
    id: number
    unique_id: string
    name: string
  } | null
  product_type: {
    id: number
    unique_id: string
    name: string
  } | null
  unit: {
    id: number
    unique_id: string
    name: string
  } | null
  reviews: {
    total: number
    average_rating: number
  }
  created_at: string
  updated_at: string
}

export default function FavoritesPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<WishlistItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const user = useAuthStore((state) => state.user)
  const authLoading = useAuthStore((state) => state.isLoading)
  const { addItem } = useCartStore()
  const userId = user?.id
  const hasFetchedRef = useRef<number | null>(null)

  // Fetch wishlist items
  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!userId) {
      setLoading(false)
      hasFetchedRef.current = null
      return
    }

    // Only fetch once per user ID
    if (hasFetchedRef.current !== userId) {
      hasFetchedRef.current = userId
      const fetchWishlist = async () => {
        try {
          setLoading(true)
          const response = await api.get("/wishlist")
          if (response.data?.success) {
            setWishlistItems(response.data.data || [])
          } else {
            setWishlistItems([])
          }
        } catch (error: any) {
          console.error("Error fetching wishlist:", error)
          setWishlistItems([])
          if (error.response?.status === 401) {
            toast.error("Please login to view your favorites")
          } else if (error.response?.status !== 404) {
            toast.error("Failed to load favorites")
          }
        } finally {
          setLoading(false)
        }
      }
      fetchWishlist()
    }
  }, [authLoading, userId])

  // Filter wishlist items based on search
  const filteredItems = wishlistItems.filter((item) => {
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.seller.full_name.toLowerCase().includes(query) ||
      item.product_category?.name.toLowerCase().includes(query) ||
      item.product_type?.name.toLowerCase().includes(query)
    )
  })

  const handleRemoveFavorite = (item: WishlistItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      await api.delete(`/wishlist/${itemToDelete.product_id}`)
      setWishlistItems((prev) =>
        prev.filter((item) => item.id !== itemToDelete.id)
      )
      toast.success("Removed from favorites")
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error: any) {
      console.error("Error removing from wishlist:", error)
      toast.error("Failed to remove from favorites")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      await addItem(item.product_id, 1)
      toast.success("Added to cart")
    } catch (error: any) {
      console.error("Error adding to cart:", error)
      toast.error(error.message || "Failed to add to cart")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Favorites</h1>
          <p className="text-gray-500 mt-1">
            {!loading && wishlistItems.length} {!loading && wishlistItems.length === 1 ? "item" : "items"}
          </p>
        </div>
        {/* Search Bar */}
        {!loading && wishlistItems.length > 0 && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border-gray-200 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#5a9c3a] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Heart className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-4">
            {searchQuery ? "No favorites found" : "No favorites yet"}
          </p>
          {!searchQuery && (
            <Link href="/products">
              <Button className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white">
                Browse Products
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const price = parseFloat(item.price)
            const originalPrice = parseFloat(item.original_price)
            const discount = parseFloat(item.discount)
            const hasDiscount = discount > 0

            return (
              <div
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
              >
                {/* Product Image */}
                <div className="relative bg-gray-100 h-48">
                  <Link href={`/products/${item.product_unique_id}`}>
                    <img
                      src={
                        item.main_image
                          ? getImageUrl(item.main_image)
                          : "/placeholder.svg"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  {hasDiscount && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                      {discount}% OFF
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-white hover:bg-red-50 rounded-full"
                    onClick={() => handleRemoveFavorite(item)}
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </Button>
                </div>

                {/* Product Info */}
                <CardContent className="p-4">
                  <Link href={`/products/${item.product_unique_id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#5a9c3a]">
                      {item.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-[#5a9c3a]">
                        ${price.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                          ${originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {item.stock === 0 && (
                      <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                        Out of Stock
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/products/${item.product_unique_id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="flex-1 bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove from Favorites</DialogTitle>
            <DialogDescription>
              Remove <span className="font-semibold">"{itemToDelete?.name}"</span> from your favorites?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setItemToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

