"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Trash2, 
  ShoppingBag, 
  Loader2, 
  Plus, 
  Minus, 
  ShoppingCart,
  Truck,
  Shield,
  ArrowRight,
  CheckCircle2,
  Bike,
  Package
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useCartStore } from "@/stores/cart-store"
import { useAuthStore } from "@/stores/auth-store"
import { getImageUrl } from "@/lib/utils"
import { CartItemSkeleton } from "@/components/cart-item-skeleton"

export default function CartPage() {
  const { items: cartItems, isLoading, error, fetchCart, updateItemQuantity, removeItem } = useCartStore()
  const { isLoggedIn } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [deliveryTypes, setDeliveryTypes] = useState<Record<string | number, 'delivery' | 'pickup'>>({})
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set())

  // Initialize delivery types for each seller
  useEffect(() => {
    if (cartItems.length > 0) {
      const newDeliveryTypes: Record<string | number, 'delivery' | 'pickup'> = {}
      cartItems.forEach(item => {
        const sellerId = item.seller?.id || 'unknown'
        if (!newDeliveryTypes[sellerId]) {
          newDeliveryTypes[sellerId] = 'delivery'
        }
      })
      setDeliveryTypes(newDeliveryTypes)
    }
  }, [cartItems])

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart()
    }
  }, [isLoggedIn, fetchCart])

  const handleUpdateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id)
      return
    }

    setUpdatingItems(prev => new Set(prev).add(id))
    try {
      await updateItemQuantity(id, newQuantity)
    } catch (error: any) {
      console.error('Failed to update quantity:', error)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (id: number) => {
    setRemovingItems(prev => new Set(prev).add(id))
    try {
      await removeItem(id)
    } catch (error: any) {
      console.error('Failed to remove item:', error)
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  // Group items by seller
  const itemsBySeller = cartItems.reduce((acc, item) => {
    const sellerId = item.seller?.id || 'unknown'
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: item.seller,
        items: []
      }
    }
    acc[sellerId].items.push(item)
    return acc
  }, {} as Record<string | number, { seller: any; items: typeof cartItems }>)

  const sellerGroups = Object.values(itemsBySeller)

  // Calculate shipping per seller group
  const calculateShipping = (group: typeof sellerGroups[0]) => {
    const groupSubtotal = group.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const groupDeliveryType = deliveryTypes[group.seller?.id || 'unknown'] || 'delivery'
    return groupDeliveryType === 'delivery' ? (groupSubtotal >= 50 ? 0 : 5.99) : 0
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalShipping = sellerGroups.reduce((sum, group) => sum + calculateShipping(group), 0)
  const total = subtotal + totalShipping

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600 text-sm md:text-base">
              {cartItems.length > 0 
                ? `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`
                : 'Your cart is empty'
              }
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <CartItemSkeleton count={3} />
            </div>
          ) : !isLoggedIn ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0A5D31]/10 rounded-full mb-4">
                <ShoppingBag className="w-8 h-8 text-[#0A5D31]" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
              <p className="text-gray-600 mb-6">You need to be logged in to view your cart</p>
              <Link href="/login">
                <Button className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white">
                  Log In
                </Button>
              </Link>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-red-200 p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <ShoppingBag className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Error loading cart</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button 
                onClick={() => fetchCart()} 
                className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white"
              >
                Try Again
              </Button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some fresh produce to get started!</p>
              <Link href="/products">
                <Button className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {sellerGroups.map((group, groupIndex) => {
                  const sellerId = group.seller?.id || 'unknown'
                  const groupDeliveryType = deliveryTypes[sellerId] || 'delivery'
                  const groupSubtotal = group.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                  const groupShipping = calculateShipping(group)
                  
                  return (
                    <div key={sellerId || groupIndex} className="space-y-3">
                      {/* Seller Header */}
                      {group.seller && (
                        <div className="flex items-center justify-between py-2 px-1">
                          <p className="text-sm font-semibold text-gray-900">{group.seller.full_name}</p>
                          <div className="flex items-center gap-3">
                            {/* Delivery Type Toggle */}
                            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                              <button
                                onClick={() => setDeliveryTypes(prev => ({ ...prev, [sellerId]: 'delivery' }))}
                                className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-md transition-all text-xs ${
                                  groupDeliveryType === 'delivery'
                                    ? 'bg-[#0A5D31] text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                <Bike className="w-3.5 h-3.5" />
                                <span>Delivery</span>
                              </button>
                              <button
                                onClick={() => setDeliveryTypes(prev => ({ ...prev, [sellerId]: 'pickup' }))}
                                className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-md transition-all text-xs ${
                                  groupDeliveryType === 'pickup'
                                    ? 'bg-[#0A5D31] text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                <Package className="w-3.5 h-3.5" />
                                <span>Pickup</span>
                              </button>
                            </div>
                            {groupShipping > 0 && (
                              <span className="text-xs text-gray-500">+${groupShipping.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      )}
                      {group.items.map((item) => {
                        const isUpdating = updatingItems.has(item.id)
                        const isRemoving = removingItems.has(item.id)
                        const imageUrl = getImageUrl(item.image, item.name)
                        
                        return (
                          <div 
                            key={item.id} 
                            className={`bg-white rounded-lg border border-gray-200 p-2.5 transition-all ${
                              isRemoving ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex gap-2.5">
                              {/* Image */}
                              <Link href={`/products/${item.product_unique_id}`} className="flex-shrink-0">
                                <img
                                  src={imageUrl}
                                  alt={item.name}
                                  className="w-14 h-14 object-cover rounded-md"
                                />
                              </Link>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="flex-1 min-w-0">
                                    <Link href={`/products/${item.product_unique_id}`}>
                                      <h3 className="font-medium text-sm text-gray-900 hover:text-[#0A5D31] line-clamp-1">
                                        {item.name}
                                      </h3>
                                    </Link>
                                    <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveItem(item.id)}
                                    disabled={isRemoving || isUpdating}
                                    className="text-gray-400 hover:text-red-500 h-6 w-6 flex-shrink-0"
                                  >
                                    {isRemoving ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>

                                {/* Quantity and Price */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-0.5 bg-gray-50 rounded-md px-1 py-0.5">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                      disabled={isUpdating || isRemoving || item.quantity <= 1}
                                      className="h-5 w-5 p-0 hover:bg-white disabled:opacity-50"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                      ) : (
                                        <Minus className="w-2.5 h-2.5" />
                                      )}
                                    </Button>
                                    <span className="w-6 text-center font-semibold text-xs text-gray-900">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                      disabled={isUpdating || isRemoving || item.quantity >= item.stock}
                                      className="h-5 w-5 p-0 hover:bg-white disabled:opacity-50"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                      ) : (
                                        <Plus className="w-2.5 h-2.5" />
                                      )}
                                    </Button>
                                  </div>
                                  <span className="text-sm font-bold text-[#0A5D31]">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:sticky lg:top-6 h-fit">
                <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                      <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-[#0A5D31]" />
                        <span className="text-gray-600">Delivery</span>
                      </div>
                      <span className={`font-semibold ${totalShipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {totalShipping === 0 ? 'Free' : `$${totalShipping.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl md:text-3xl font-bold text-[#0A5D31]">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button className="w-full h-12 mb-3 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Link href="/products">
                    <Button variant="outline" className="w-full h-11 border-gray-300 hover:border-[#0A5D31]">
                      Continue Shopping
                    </Button>
                  </Link>

               
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
