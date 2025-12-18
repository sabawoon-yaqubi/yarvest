"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.heat"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, CheckCircle, Package, ShoppingCart, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Add custom styles for popups and map container
if (typeof window !== "undefined") {
  const style = document.createElement("style")
  style.textContent = `
    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(90, 156, 58, 0.1);
      border: 2px solid #5a9c3a;
      padding: 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .custom-popup .leaflet-popup-content-wrapper:hover {
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(90, 156, 58, 0.2);
      transform: translateY(-2px);
    }
    .custom-popup .leaflet-popup-tip {
      background: #5a9c3a;
      border: 2px solid #5a9c3a;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .custom-popup .leaflet-popup-content {
      margin: 0;
      padding: 0;
    }
    .leaflet-container {
      height: 100% !important;
      width: 100% !important;
      z-index: 0;
      font-family: inherit;
      background-color: #f5f5f5 !important;
    }
    .leaflet-tile-container img {
      filter: brightness(1.05) contrast(1.05) saturate(1.1);
      transition: opacity 0.3s ease;
    }
    /* Improve map appearance */
    .leaflet-control-container {
      font-family: inherit;
    }
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
    .leaflet-container .leaflet-pane {
      z-index: 1;
    }
    .custom-marker {
      transition: transform 0.2s ease;
      cursor: pointer;
    }
    .custom-marker:hover {
      transform: scale(1.2);
      z-index: 1000 !important;
    }
    .custom-marker svg {
      transition: transform 0.2s ease;
    }
    .leaflet-popup-close-button {
      padding: 8px !important;
      font-size: 20px !important;
      color: #666 !important;
      transition: color 0.2s ease;
      position: absolute !important;
      top: 8px !important;
      right: 8px !important;
      z-index: 1001 !important;
    }
    .leaflet-popup-close-button:hover {
      color: #5a9c3a !important;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #5a9c3a;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #0d7a3f;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    /* Move zoom controls to bottom-right */
    .leaflet-control-zoom {
      position: absolute !important;
      bottom: 20px !important;
      right: 20px !important;
      top: auto !important;
      left: auto !important;
      margin: 0 !important;
    }
    .leaflet-control-zoom a {
      width: 34px !important;
      height: 34px !important;
      line-height: 34px !important;
      font-size: 18px !important;
      background-color: white !important;
      border: 2px solid rgba(0,0,0,0.2) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
      transition: all 0.2s ease !important;
    }
    .leaflet-control-zoom a:hover {
      background-color: #5a9c3a !important;
      color: white !important;
      border-color: #5a9c3a !important;
    }
    /* Ensure popup appears above top bar but below header */
    .leaflet-popup {
      z-index: 999 !important;
    }
    .leaflet-popup-pane {
      z-index: 999 !important;
    }
    /* Adjust popup positioning to avoid top bar */
    .leaflet-popup-tip-container {
      z-index: 1000 !important;
    }
    /* Ensure map controls don't cover header */
    .leaflet-top {
      z-index: 100 !important;
    }
    .leaflet-bottom {
      z-index: 100 !important;
    }
    /* Ensure popup content is clickable */
    .custom-popup .leaflet-popup-content-wrapper {
      pointer-events: auto !important;
    }
  `
  document.head.appendChild(style)
}

// Fix for default marker icons in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  })
}

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

// Component to handle map size invalidation
const MapSizeHandler = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap } = mod
      return function MapSizeHandlerInner() {
        const map = useMap()
        useEffect(() => {
          // Invalidate size after a short delay to ensure container has dimensions
          const timer = setTimeout(() => {
            if (map && map.invalidateSize) {
              map.invalidateSize()
            }
          }, 100)
          return () => clearTimeout(timer)
        }, [map])
        return null
      }
    }),
  { ssr: false }
)

// Component to fit bounds to show all markers
const FitBounds = dynamic(
  () =>
    Promise.all([
      import("react-leaflet"),
      import("react")
    ]).then(([leafletMod, reactMod]) => {
      const { useMap } = leafletMod
      const { useRef, useEffect } = reactMod
      return function FitBoundsInner({ locations }: { locations: Location[] }) {
        const map = useMap()
        const hasFittedRef = useRef(false)
        
        useEffect(() => {
          if (!map || !locations || locations.length === 0 || hasFittedRef.current) return
          
          // Reset ref when locations change
          hasFittedRef.current = false
          
          // Filter valid locations
          const validLocations = locations.filter(
            (loc) => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && 
                     !isNaN(loc.lat) && !isNaN(loc.lng) &&
                     loc.lat >= -90 && loc.lat <= 90 &&
                     loc.lng >= -180 && loc.lng <= 180
          )
          
          if (validLocations.length === 0) return
          
          // Function to check if map is ready and fit bounds
          const fitBoundsWhenReady = () => {
            try {
              // Check if map container exists and is visible
              const container = map.getContainer()
              if (!container) return false
              
              // Check if container is actually visible (not hidden)
              const rect = container.getBoundingClientRect()
              if (rect.width === 0 || rect.height === 0) return false
              
              // Check if map has valid size
              const mapSize = map.getSize()
              if (!mapSize || mapSize.x === 0 || mapSize.y === 0) {
                // Try to invalidate size to force recalculation
                map.invalidateSize()
                return false
              }
              
              // Create bounds from all locations
              const bounds = L.latLngBounds(
                validLocations.map(loc => [loc.lat, loc.lng] as [number, number])
              )
              
              // Validate bounds
              if (!bounds.isValid()) {
                console.warn('Invalid bounds created from locations')
                return false
              }
              
                  // Invalidate size first to ensure map is properly sized
              map.invalidateSize()
              
              // Small delay to let invalidateSize take effect
              setTimeout(() => {
                try {
                  // Double-check map is still valid
                  const finalSize = map.getSize()
                  if (finalSize && finalSize.x > 0 && finalSize.y > 0) {
                    // Fit bounds but ensure we don't zoom in too much - keep it showing USA-wide view
                    map.fitBounds(bounds, { 
                      padding: [80, 80], 
                      maxZoom: validLocations.length === 1 ? 10 : 6,
                      animate: true
                    })
                    hasFittedRef.current = true
                  }
                } catch (error) {
                  console.error('Error in fitBounds:', error)
                }
              }, 150)
              
              return true
            } catch (error) {
              console.error('Error checking map readiness:', error)
              return false
            }
          }
          
          // Try to fit bounds with increasing delays
          const attemptFit = (delay: number) => {
            setTimeout(() => {
              if (!hasFittedRef.current && fitBoundsWhenReady()) {
                return
              }
              if (!hasFittedRef.current && delay < 2000) {
                attemptFit(delay + 200)
              }
            }, delay)
          }
          
          // Start attempts
          attemptFit(300)
          
          return () => {
            // Cleanup if needed
          }
        }, [map, locations])
        
        return null
      }
    }),
  { ssr: false }
)

interface Location {
  id: number
  name: string
  lat: number
  lng: number
  location?: string
  rating?: number
  reviews?: number
  verified?: boolean
  specialty?: string
  products?: number
  productsList?: Array<{
    id: number
    unique_id?: string
    name: string
    price: number
    image?: string
    link?: string
    product?: any // Full product object for cart functionality
  }>
  onAddToCart?: (product: any, quantity?: number) => void
  image?: string
  productImage?: string // Product image for map pin
  link?: string
  [key: string]: any
}

interface MapViewProps {
  locations: Location[]
  center?: [number, number]
  zoom?: number
  showHeatMap?: boolean
  title?: string
  onAddToCart?: (product: any, quantity?: number) => void
}

// Heat map layer component - dynamically import useMap to avoid SSR issues
const HeatMapLayer = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap } = mod
      return function HeatMapLayerInner({ locations }: { locations: Location[] }) {
        const map = useMap()
        const heatLayerRef = useRef<any>(null)
        const [mapReady, setMapReady] = useState(false)

        useEffect(() => {
          if (!map || typeof window === "undefined") return

          // Wait for map to be fully initialized
          const checkMapReady = () => {
            const container = map.getContainer()
            if (container && container.offsetHeight > 0 && container.offsetWidth > 0) {
              setMapReady(true)
            } else {
              setTimeout(checkMapReady, 100)
            }
          }
          checkMapReady()
        }, [map])

        useEffect(() => {
          if (!map || !mapReady || typeof window === "undefined" || !locations || locations.length === 0) return

          // Filter out invalid locations
          const validLocations = locations.filter(
            (loc) => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && 
                     !isNaN(loc.lat) && !isNaN(loc.lng) &&
                     loc.lat >= -90 && loc.lat <= 90 &&
                     loc.lng >= -180 && loc.lng <= 180
          )

          if (validLocations.length === 0) return

          try {
            const heatData = validLocations.map((loc) => [loc.lat, loc.lng, 1] as [number, number, number])

            if (heatLayerRef.current) {
              map.removeLayer(heatLayerRef.current)
              heatLayerRef.current = null
            }

            // Small delay to ensure canvas is ready
            setTimeout(() => {
              try {
                const heatLayer = (L as any).heatLayer(heatData, {
                  radius: 30,
                  blur: 20,
                  maxZoom: 17,
                  max: 1.0,
                  gradient: {
                    0.0: "rgba(10, 93, 49, 0)",
                    0.2: "rgba(10, 93, 49, 0.2)",
                    0.4: "rgba(10, 93, 49, 0.4)",
                    0.6: "rgba(10, 93, 49, 0.6)",
                    0.8: "rgba(10, 93, 49, 0.8)",
                    1.0: "rgba(10, 93, 49, 1)",
                  },
                })

                heatLayer.addTo(map)
                heatLayerRef.current = heatLayer
              } catch (error) {
                console.error("Error creating heat layer:", error)
              }
            }, 200)
          } catch (error) {
            console.error("Error processing heat data:", error)
          }

          return () => {
            if (heatLayerRef.current) {
              try {
                map.removeLayer(heatLayerRef.current)
              } catch (error) {
                console.error("Error removing heat layer:", error)
              }
              heatLayerRef.current = null
            }
          }
        }, [map, mapReady, locations])

        return null
      }
    }),
  { ssr: false }
)

export function MapView({ locations, center = [39.8283, -98.5795], zoom = 4, showHeatMap = true, title, onAddToCart }: MapViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('MapView mounted, locations:', locations)
  }, [])

  useEffect(() => {
    console.log('MapView locations updated:', locations)
  }, [locations])

  // Calculate center from locations if available, but default to USA center
  const calculatedCenter = useMemo(() => {
    if (locations && locations.length > 0) {
      const validLocations = locations.filter(
        (loc) => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && 
                 !isNaN(loc.lat) && !isNaN(loc.lng)
      )
      if (validLocations.length > 0) {
        const avgLat = validLocations.reduce((sum, loc) => sum + loc.lat, 0) / validLocations.length
        const avgLng = validLocations.reduce((sum, loc) => sum + loc.lng, 0) / validLocations.length
        return [avgLat, avgLng] as [number, number]
      }
    }
    // Default to USA center
    return [39.8283, -98.5795] as [number, number]
  }, [locations])

  // Create simple, clean marker icon
  const createCustomIcon = (productImage?: string, productsCount?: number) => {
    // Simple green pin marker
    const pinColor = '#5a9c3a'
    const badgeHtml = productsCount && productsCount > 1 
      ? `<div style="
          position: absolute;
          top: -8px;
          right: -8px;
          background: #0d7a3f;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">${productsCount > 9 ? '9+' : productsCount}</div>`
      : ''
    
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="position: relative;">
        <svg width="32" height="40" viewBox="0 0 32 40" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M16 0C10.477 0 6 4.477 6 10c0 6 10 20 10 20s10-14 10-20c0-5.523-4.477-10-10-10z" fill="${pinColor}"/>
          <circle cx="16" cy="10" r="5" fill="white"/>
        </svg>
        ${badgeHtml}
      </div>`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    })
  }

  if (!mounted) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#5a9c3a] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative" style={{ height: '100%', width: '100%', minHeight: '600px' }}>
      {title && (
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-r from-[#5a9c3a]/10 via-[#5a9c3a]/5 to-transparent border-b border-[#5a9c3a]/20 pointer-events-none">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{locations.length} locations</p>
            </div>
            {showHeatMap && (
              <Badge className="bg-[#5a9c3a] text-white px-3 py-1">
                Heat Map Active
              </Badge>
            )}
          </div>
        </div>
      )}
      <div className="relative h-full w-full" style={{ height: '100%', width: '100%', position: 'relative', minHeight: '600px' }}>
        <MapContainer
          center={calculatedCenter}
          zoom={locations && locations.length > 0 ? zoom : 4}
          minZoom={3}
          maxZoom={18}
          style={{ 
            height: "100%", 
            width: "100%", 
            zIndex: 1, 
            minHeight: '600px',
            position: 'relative'
          }}
          scrollWheelZoom={true}
          className="rounded-lg"
        >
          <MapSizeHandler />
          {locations && locations.length > 0 && locations.length <= 50 && <FitBounds locations={locations} />}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={3}
          />
          {showHeatMap && locations && locations.length > 0 && <HeatMapLayer locations={locations} />}
          {locations && locations.length > 0 && locations.map((location) => {
            console.log('Rendering marker for:', location.name, 'at', location.lat, location.lng)
            // Use productImage if available, otherwise fall back to image
            const markerImage = location.productImage || location.image
            return (
              <Marker
                key={location.id || `${location.lat}-${location.lng}`}
                position={[location.lat, location.lng]}
                icon={createCustomIcon(markerImage, location.products)}
              >
                <Popup className="custom-popup" maxWidth={320}>
                  <div className="p-0 min-w-[280px]">
                    {/* Header with seller image (smaller) */}
                    <div className="relative">
                      {location.image && (
                        <div className="w-full h-20 overflow-hidden bg-gradient-to-br from-[#5a9c3a]/20 to-[#0d7a3f]/20">
                          <img
                            src={location.image}
                            alt={location.name || 'Seller image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                      {!location.image && location.productImage && (
                        <div className="w-full h-20 overflow-hidden bg-gradient-to-br from-[#5a9c3a]/20 to-[#0d7a3f]/20">
                          <img
                            src={location.productImage}
                            alt={location.name || 'Product image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                      <div className="absolute top-3 right-12 z-10">
                        {location.verified && (
                          <Badge className="bg-[#5a9c3a] text-white text-xs shadow-lg">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{location.name}</h3>
                        {location.specialty && (
                          <p className="text-xs text-[#5a9c3a] font-semibold bg-[#5a9c3a]/10 px-2 py-1 rounded-md inline-block mb-2">
                            {location.specialty}
                          </p>
                        )}
                      </div>
                      
                      {location.location && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3 pb-3 border-b border-gray-100">
                          <MapPin className="w-4 h-4 text-[#5a9c3a] mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{location.location}</span>
                        </div>
                      )}
                      
                      {/* Rating and Products Count */}
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-gray-900 text-sm">
                            {(location.rating || 0).toFixed(1)} ★
                          </span>
                          {location.reviews && location.reviews > 0 && (
                            <span className="text-xs text-gray-500">({location.reviews})</span>
                          )}
                        </div>
                        {location.products && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Package className="w-4 h-4 text-[#5a9c3a]" />
                            <span className="font-semibold">{location.products} {location.products === 1 ? 'product' : 'products'}</span>
                          </div>
                        )}
                      </div>
                      
                      {location.completedJobs && (
                        <p className="text-xs text-gray-600 mb-2 font-medium">{location.completedJobs} jobs completed</p>
                      )}
                      {location.hourlyRate && (
                        <p className="text-xs text-gray-600 mb-2 font-medium">Rate: {location.hourlyRate}/hr</p>
                      )}
                      
                      {/* Products List */}
                      {location.productsList && location.productsList.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Products ({location.productsList.length}):
                          </p>
                          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                            {location.productsList.slice(0, 5).map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center gap-2 p-2 hover:bg-[#5a9c3a]/5 rounded-lg transition-all group border border-transparent hover:border-[#5a9c3a]/20"
                              >
                                <Link
                                  href={product.link || '#'}
                                  className="flex items-center gap-2 flex-1 min-w-0"
                                >
                                  {product.image && (
                                    <img
                                      src={product.image}
                                      alt={product.name || 'Product'}
                                      className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'none'
                                      }}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 group-hover:text-[#5a9c3a] truncate transition-colors">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-[#5a9c3a] font-bold">${product.price.toFixed(2)}</p>
                                  </div>
                                </Link>
                                {onAddToCart && product.product && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      onAddToCart(product.product, 1)
                                    }}
                                    className="h-8 w-8 p-0 hover:bg-[#5a9c3a] hover:text-white flex-shrink-0 transition-all duration-200"
                                    title="Add to cart"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            {location.productsList.length > 5 && (
                              <p className="text-xs text-gray-500 text-center pt-1 font-medium">
                                +{location.productsList.length - 5} more {location.productsList.length - 5 === 1 ? 'product' : 'products'}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {location.link && (
                        <Link
                          href={location.link}
                          className="mt-4 w-full text-center text-sm font-semibold bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-white hover:scale-[1.02] active:scale-[0.98]"
                        >
                          View Seller Profile
                          <span>→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
