"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ProductModal } from "@/components/product-modal"
import dynamic from "next/dynamic"

// Dynamically import MapView to avoid SSR issues (window is not defined)
const MapView = dynamic(
  () => import("@/components/map-view").then((mod) => ({ default: mod.MapView })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#5a9c3a] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    )
  }
)
import { 
  Trash2, 
  ShoppingBag, 
  Loader2, 
  Plus, 
  Minus, 
  ShoppingCart,
  Truck,
  ArrowRight,
  Bike,
  Package,
  MapPin,
  CheckCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useCartStore } from "@/stores/cart-store"
import { useAuthStore } from "@/stores/auth-store"
import { useDeliveryTypesStore } from "@/stores/delivery-types-store"
import { getImageUrl } from "@/lib/utils"
import { CartItemSkeleton } from "@/components/cart-item-skeleton"
import type { ApiProduct } from "@/types/product"
import api from "@/lib/axios"

// Constants
const DELIVERY_FEE = 5.99

export default function CartPage() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const { items: cartItems, isLoading, error, fetchCart, updateItemQuantity, removeItem, addItem } = useCartStore()
  const { isLoggedIn, isLoading: authLoading } = useAuthStore()
  const { deliveryTypes, setDeliveryType } = useDeliveryTypesStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set())
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [mapLocations, setMapLocations] = useState<any[]>([])
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodingError, setGeocodingError] = useState<string | null>(null)
  const [isOrderPlaced, setIsOrderPlaced] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)

  // ============================================
  // EFFECTS
  // ============================================
  
  // Initialize delivery types for new sellers (default to 'pickup' - delivery is coming soon)
  useEffect(() => {
    if (cartItems.length > 0) {
      cartItems.forEach(item => {
        const sellerId = item.seller?.id || 'unknown'
        if (!deliveryTypes[sellerId]) {
          setDeliveryType(sellerId, 'pickup')
        }
      })
    }
  }, [cartItems, deliveryTypes, setDeliveryType])

  // Fetch cart when user logs in
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      fetchCart()
    }
  }, [isLoggedIn, authLoading])

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
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

  const handleProductClick = async (productUniqueId: string) => {
    try {
      const response = await api.get(`/products/${productUniqueId}`)
      if (response.data.success && response.data.data) {
        setSelectedProduct(response.data.data)
        setIsProductModalOpen(true)
      }
    } catch (error: any) {
      // Silently handle 404 errors (product might not exist)
      if (error.response?.status === 404) {
        console.log('Product not found:', productUniqueId)
        return
      }
      // Only log non-404 errors
      if (error.response?.status !== 404) {
        console.error('Error fetching product:', error)
      }
    }
  }

  const handleAddToCart = async (product: ApiProduct, quantity: number) => {
    try {
      await addItem(product.id, quantity)
      setIsProductModalOpen(false)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleOrderNow = () => {
    if (cartItems.length === 0) return
    setShowOrderConfirmation(true)
  }

  const handleConfirmOrder = async () => {
    setIsPlacingOrder(true)
    
    try {
      // Create order via API - backend will automatically use user's active address
      const response = await api.post('/orders', {
        payment_type: 'cashe', // Since online payments are not available
      })
      
      if (response.data.success) {
        // Refresh cart to clear items
        await fetchCart()
        
        // Close confirmation modal and show success message
        setShowOrderConfirmation(false)
        setIsOrderPlaced(true)
      } else {
        throw new Error(response.data.message || 'Failed to place order')
      }
    } catch (error: any) {
      console.error('Error placing order:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.'
      alert(errorMessage)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const handleViewMap = async () => {
    setIsMapModalOpen(true)
    setIsGeocoding(true)
    setGeocodingError(null)
    setMapLocations([])
    
    try {
      // Geocode seller locations with delay to avoid rate limiting
      const locations: any[] = []
      const missingLocations: string[] = []
      
      for (let i = 0; i < sellerGroups.length; i++) {
        const group = sellerGroups[i]
        const seller = group.seller
        const location = seller?.location || ''
        
        // Add delay between requests to avoid rate limiting (1 second)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        if (!location || location.trim() === '') {
          missingLocations.push(getSellerName(seller))
          console.log('Seller has no location:', getSellerName(seller))
          continue
        }

        try {
          // Clean and format location string
          let searchQuery = location.trim()
          
          // Remove "Mexico" if it's incorrectly included (common data issue)
          searchQuery = searchQuery.replace(/,\s*Mexico\s*$/i, '').trim()
          
          // If location doesn't contain "USA" or country, add it
          if (!searchQuery.toLowerCase().includes('usa') && 
              !searchQuery.toLowerCase().includes('united states') &&
              !searchQuery.toLowerCase().includes('united states of america')) {
            searchQuery = `${searchQuery}, USA`
          }
          
          console.log('Geocoding location:', searchQuery, 'for seller:', getSellerName(seller))
          
          // Simple geocoding using OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=us`,
            {
              headers: {
                'User-Agent': 'Yarvest App',
                'Accept': 'application/json'
              }
            }
          )
          
          if (!response.ok) {
            console.error('Geocoding request failed:', response.status, response.statusText)
            missingLocations.push(getSellerName(seller))
            continue
          }
          
          const data = await response.json()
          
          if (data && data.length > 0 && data[0].lat && data[0].lon) {
            const lat = parseFloat(data[0].lat)
            const lng = parseFloat(data[0].lon)
            
            // Validate coordinates
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              locations.push({
                id: seller.id,
                name: getSellerName(seller),
                lat: lat,
                lng: lng,
                location: location,
                products: group.items.length,
              })
              console.log('✅ Successfully geocoded:', getSellerName(seller), 'at', lat, lng)
            } else {
              console.error('Invalid coordinates:', lat, lng)
              missingLocations.push(getSellerName(seller))
            }
          } else {
            console.log('❌ No geocoding results for:', searchQuery)
            missingLocations.push(getSellerName(seller))
          }
        } catch (error) {
          console.error('Geocoding error for location:', location, error)
          missingLocations.push(getSellerName(seller))
        }
      }

      // Set map locations
      setMapLocations(locations)
      
      // Show helpful error message if some locations are missing
      if (locations.length === 0) {
        setGeocodingError('No valid locations found. Sellers may not have addresses set.')
      } else if (missingLocations.length > 0) {
        setGeocodingError(`${locations.length} location(s) found. ${missingLocations.length} seller(s) could not be located: ${missingLocations.join(', ')}`)
      }
      
      console.log(`✅ Total locations geocoded: ${locations.length} out of ${sellerGroups.length}`)
      if (missingLocations.length > 0) {
        console.log('❌ Missing locations:', missingLocations)
      }
    } catch (error) {
      console.error('Error geocoding locations:', error)
      setGeocodingError('Failed to load map locations. Please try again.')
    } finally {
      setIsGeocoding(false)
    }
  }

  // ============================================
  // DATA PROCESSING & CALCULATIONS
  // ============================================
  
  // Group cart items by seller
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

  // All groups are pickup only (delivery coming soon)
  const pickupGroups = sellerGroups.filter(group => {
    const sellerId = group.seller?.id || 'unknown'
    const deliveryType = deliveryTypes[sellerId] || 'pickup'
    // Force pickup if somehow delivery is selected
    if (deliveryType === 'delivery') {
      setDeliveryType(sellerId, 'pickup')
    }
    return true
  })

  // Calculate subtotals
  const calculateSubtotal = (groups: typeof sellerGroups) => {
    return groups.reduce((sum, group) => 
      sum + group.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0), 0
    )
  }

  const pickupSubtotal = calculateSubtotal(pickupGroups)
  const grandTotal = pickupSubtotal

  // Helper flags
  const hasPickupGroups = pickupGroups.length > 0

  // Get seller display name
  const getSellerName = (seller: any) => {
    if (seller?.full_name) return seller.full_name
    if (seller?.first_name || seller?.last_name) {
      return `${seller.first_name || ''} ${seller.last_name || ''}`.trim()
    }
    return seller?.email || 'Unknown Seller'
  }

  // ============================================
  // RENDER HELPERS
  // ============================================
  
  const renderEmptyState = (title: string, message: string, icon: React.ReactNode, action?: React.ReactNode) => (
    <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5a9c3a]/10 rounded-full mb-4">
        {icon}
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      {action}
    </div>
  )

  const renderCartItem = (item: typeof cartItems[0]) => {
    const isUpdating = updatingItems.has(item.id)
    const isRemoving = removingItems.has(item.id)
    const imageUrl = getImageUrl(item.image, item.name)
    const itemTotal = item.price * item.quantity

    return (
      <div 
        key={item.id} 
        className={`bg-white rounded-lg border border-gray-200 p-3 transition-all hover:shadow-md ${
          isRemoving ? 'opacity-50' : ''
        }`}
      >
        <div className="flex gap-3">
          {/* Product Image - Clickable */}
          <button
            onClick={() => handleProductClick(item.product_unique_id)}
            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src={imageUrl}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          </button>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleProductClick(item.product_unique_id)}
                  className="text-left w-full"
                >
                  <h3 className="font-semibold text-sm text-gray-900 hover:text-[#5a9c3a] line-clamp-2 transition-colors">
                    {item.name}
                  </h3>
                </button>
                <p className="text-xs text-gray-500 mt-0.5">${item.price.toFixed(2)} each</p>
              </div>
              
              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(item.id)}
                disabled={isRemoving || isUpdating}
                className="text-gray-400 hover:text-red-500 h-7 w-7 flex-shrink-0"
              >
                {isRemoving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Quantity Controls & Total Price */}
            <div className="flex items-center justify-between">
              {/* Quantity Controls */}
              <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={isUpdating || isRemoving || item.quantity <= 1}
                  className="h-6 w-6 p-0 hover:bg-white disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                </Button>
                <span className="w-8 text-center font-semibold text-sm text-gray-900">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={isUpdating || isRemoving || item.quantity >= item.stock}
                  className="h-6 w-6 p-0 hover:bg-white disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                </Button>
              </div>
              
              {/* Item Total Price */}
              <span className="text-base font-bold text-[#5a9c3a]">
                ${itemTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600 text-sm md:text-base">
              {cartItems.length > 0 
                ? `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`
                : 'Your cart is empty'
              }
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <CartItemSkeleton count={3} />
            </div>
          )}

          {/* Not Logged In */}
          {!isLoading && !isLoggedIn && renderEmptyState(
            "Please log in",
            "You need to be logged in to view your cart",
            <ShoppingBag className="w-8 h-8 text-[#5a9c3a]" />,
            <Link href="/login">
              <Button className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white">
                Log In
              </Button>
            </Link>
          )}

          {/* Error State */}
          {!isLoading && !authLoading && isLoggedIn && error && renderEmptyState(
            "Error loading cart",
            error,
            <ShoppingBag className="w-8 h-8 text-red-600" />,
            <Button 
              onClick={() => fetchCart()} 
              className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
            >
              Try Again
            </Button>
          )}

          {/* Empty Cart */}
          {!isLoading && !authLoading && isLoggedIn && !error && cartItems.length === 0 && renderEmptyState(
            "Your cart is empty",
            "Add some fresh produce to get started!",
            <ShoppingBag className="w-8 h-8 text-gray-400" />,
            <Link href="/products">
              <Button className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white">
                Browse Products
              </Button>
            </Link>
          )}

          {/* Cart Content */}
          {!isLoading && !authLoading && isLoggedIn && !error && cartItems.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {sellerGroups.map((group, groupIndex) => {
                  const sellerId = group.seller?.id || 'unknown'
                  const deliveryType = deliveryTypes[sellerId] || 'pickup'
                  const groupSubtotal = group.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                  
                  // Group items by category
                  const itemsByCategory = group.items.reduce((acc, item) => {
                    const categoryName = item.category?.name || 'Uncategorized'
                    if (!acc[categoryName]) {
                      acc[categoryName] = []
                    }
                    acc[categoryName].push(item)
                    return acc
                  }, {} as Record<string, typeof group.items>)
                  
                  return (
                    <div key={sellerId || groupIndex} className="space-y-3">
                      {/* Simplified Seller Card */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base text-gray-900">
                              {getSellerName(group.seller)}
                            </h3>
                            {deliveryType === 'pickup' && group.seller?.location && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-[#5a9c3a]" />
                                <span className="text-xs text-gray-600">{group.seller.location}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Delivery Type Toggle - Delivery Coming Soon */}
                          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                            <button
                              disabled
                              className="px-3 py-1.5 rounded-md text-xs font-medium opacity-50 cursor-not-allowed relative"
                              title="Coming Soon"
                            >
                              <Bike className="w-3.5 h-3.5 inline mr-1" />
                              Delivery
                              <span className="ml-1 text-[10px] bg-gray-200 text-gray-600 px-1 rounded">Soon</span>
                            </button>
                            <button
                              onClick={() => setDeliveryType(sellerId, 'pickup')}
                              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all bg-[#5a9c3a] text-white shadow-sm"
                            >
                              <Package className="w-3.5 h-3.5 inline mr-1" />
                              Pickup
                            </button>
                          </div>
                        </div>

                        {/* Summary Row */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm">
                          <span className="text-gray-600">
                            {group.items.length} {group.items.length === 1 ? 'item' : 'items'} • ${groupSubtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Items by Category */}
                      {Object.entries(itemsByCategory).map(([categoryName, categoryItems]) => (
                        <div key={categoryName} className="space-y-2">
                          {/* Category Header */}
                          <div className="px-2">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {categoryName}
                            </h4>
                          </div>
                          
                          {/* Category Items */}
                          <div className="space-y-2">
                            {categoryItems.map((item) => renderCartItem(item))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:sticky lg:top-6 h-fit">
                <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                  
                  {/* View on Map Button */}
                  <Button 
                    onClick={handleViewMap}
                    variant="outline" 
                    className="w-full mb-4 border-[#5a9c3a] text-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                  
                  {/* Price Breakdown */}
                  <div className="space-y-2.5 mb-4">
                    {hasPickupGroups && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Pickup ({pickupGroups.reduce((sum, g) => sum + g.items.length, 0)} {pickupGroups.reduce((sum, g) => sum + g.items.length, 0) === 1 ? 'item' : 'items'})
                        </span>
                        <span className="font-semibold text-gray-900">${pickupSubtotal.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Grand Total */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-[#5a9c3a]">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <Button 
                    onClick={handleOrderNow}
                    disabled={isPlacingOrder || cartItems.length === 0}
                    className="w-full h-12 mb-3 bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Order Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  <Link href="/products">
                    <Button variant="outline" className="w-full h-11 border-gray-300 hover:border-[#5a9c3a]">
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

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          open={isProductModalOpen}
          onOpenChange={setIsProductModalOpen}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Map Modal */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <DialogTitle className="sr-only">Seller Locations Map</DialogTitle>
          <div className="h-[80vh] w-full relative">
            {isGeocoding ? (
              <div className="flex items-center justify-center h-full absolute inset-0 z-50 bg-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#5a9c3a] border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading map locations...</p>
                </div>
              </div>
            ) : (
              <>
                {mapLocations.length > 0 ? (
                  <MapView 
                    locations={mapLocations}
                    showHeatMap={false}
                    title="Seller Locations"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium mb-1">No locations available</p>
                      <p className="text-sm text-gray-500">Sellers may not have addresses set</p>
                    </div>
                  </div>
                )}
                {geocodingError && (
                  <div className="absolute top-4 left-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg">
                    <p className="text-sm text-yellow-800">{geocodingError}</p>
                  </div>
                )}
                {mapLocations.length === 0 && !isGeocoding && !geocodingError && (
                  <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/90">
                    <div className="text-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium mb-1">No locations available</p>
                      <p className="text-sm text-gray-500">Sellers may not have addresses set</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Confirmation Modal */}
      <Dialog open={showOrderConfirmation} onOpenChange={(open) => {
        // Prevent closing while placing order
        if (!isPlacingOrder) {
          setShowOrderConfirmation(open)
        }
      }}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">Confirm Your Order</DialogTitle>
                <p className="text-white/90 text-sm mt-1">Review your order details</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Items</span>
                <span className="font-semibold text-gray-900">{cartItems.length}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-[#5a9c3a]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Seller Info */}
            {sellerGroups.length > 1 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 text-sm mb-1">
                      Ordering from {sellerGroups.length} sellers
                    </p>
                    <p className="text-xs text-blue-700">
                      Your order will be placed separately for each seller. You'll be notified once each seller confirms.
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                  {sellerGroups.map((group, index) => (
                    <div key={group.seller?.id || index} className="flex items-center justify-between text-xs bg-white rounded px-2 py-1.5">
                      <span className="text-gray-700 font-medium">{getSellerName(group.seller)}</span>
                      <span className="text-gray-500">{group.items.length} {group.items.length === 1 ? 'item' : 'items'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm mb-1">
                      Ordering from {getSellerName(sellerGroups[0]?.seller)}
                    </p>
                    <p className="text-xs text-green-700">
                      Once the seller confirms your order, we will notify you.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button 
                onClick={handleConfirmOrder}
                disabled={isPlacingOrder}
                className="w-full bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold h-12 text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm & Place Order
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setShowOrderConfirmation(false)}
                variant="outline"
                disabled={isPlacingOrder}
                className="w-full border-gray-300 hover:border-gray-400 text-gray-700 h-11 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Placed Success Modal */}
      <Dialog open={isOrderPlaced} onOpenChange={setIsOrderPlaced}>
        <DialogContent className="max-w-md p-4">
          <DialogTitle className="sr-only">Order Placed</DialogTitle>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#5a9c3a]/10 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-[#5a9c3a]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Placed Successfully!</h2>
            <DialogDescription className="text-base text-gray-600 mb-6">
              {sellerGroups.length > 1 ? (
                <>
                  Your orders have been placed with {sellerGroups.length} different sellers. 
                  Once each seller confirms your order, we will notify you.
                </>
              ) : (
                <>
                  Your order has been placed. Once the seller confirms the order, we will notify you.
                </>
              )}
            </DialogDescription>
            <div className="flex flex-col gap-3">
              <Link href="/products" className="w-full">
                <Button 
                  onClick={() => setIsOrderPlaced(false)}
                  className="w-full bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                >
                  Continue Shopping
                </Button>
              </Link>
              <Button 
                onClick={() => setIsOrderPlaced(false)}
                variant="outline"
                className="w-full border-gray-300 hover:border-[#5a9c3a]"
              >
                View Order Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
