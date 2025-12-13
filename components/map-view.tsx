"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.heat"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, CheckCircle } from "lucide-react"
import Link from "next/link"

// Add custom styles for popups and map container
if (typeof window !== "undefined") {
  const style = document.createElement("style")
  style.textContent = `
    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 2px solid #0A5D31;
    }
    .custom-popup .leaflet-popup-tip {
      background: #0A5D31;
      border: 2px solid #0A5D31;
    }
    .leaflet-container {
      height: 100% !important;
      width: 100% !important;
      z-index: 0;
    }
    .leaflet-container .leaflet-pane {
      z-index: 1;
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
  image?: string
  link?: string
  [key: string]: any
}

interface MapViewProps {
  locations: Location[]
  center?: [number, number]
  zoom?: number
  showHeatMap?: boolean
  title?: string
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

export function MapView({ locations, center = [37.7749, -122.4194], zoom = 8, showHeatMap = true, title }: MapViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('MapView mounted, locations:', locations)
  }, [])

  useEffect(() => {
    console.log('MapView locations updated:', locations)
  }, [locations])

  // Create custom green marker icon
  const createCustomIcon = () => {
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background: linear-gradient(135deg, #0A5D31 0%, #0d7a3f 100%);
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">📍</div>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }

  if (!mounted) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0A5D31] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative" style={{ height: '100%', width: '100%', minHeight: '400px' }}>
      {title && (
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-r from-[#0A5D31]/10 via-[#0A5D31]/5 to-transparent border-b border-[#0A5D31]/20">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{locations.length} locations</p>
            </div>
            {showHeatMap && (
              <Badge className="bg-[#0A5D31] text-white px-3 py-1">
                Heat Map Active
              </Badge>
            )}
          </div>
        </div>
      )}
      <div className="relative h-full w-full" style={{ height: '100%', width: '100%', position: 'relative', minHeight: '400px' }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ 
            height: "100%", 
            width: "100%", 
            zIndex: 1, 
            minHeight: '400px',
            position: 'relative'
          }}
          scrollWheelZoom={true}
          className="rounded-lg"
        >
          <MapSizeHandler />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {showHeatMap && locations && locations.length > 0 && <HeatMapLayer locations={locations} />}
          {locations && locations.length > 0 ? (
            locations.map((location) => {
              console.log('Rendering marker for:', location.name, 'at', location.lat, location.lng)
              return (
                <Marker
                  key={location.id || `${location.lat}-${location.lng}`}
                  position={[location.lat, location.lng]}
                  icon={createCustomIcon()}
                >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-3 min-w-[250px]">
                  <div className="flex items-start gap-3 mb-3">
                    {location.image && (
                      <img
                        src={location.image}
                        alt={location.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{location.name}</h3>
                      {location.verified && (
                        <Badge className="bg-[#0A5D31] text-white text-xs mb-2">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  {location.specialty && (
                    <p className="text-sm text-[#0A5D31] font-semibold mb-2 bg-[#0A5D31]/10 px-2 py-1 rounded-md inline-block">
                      {location.specialty}
                    </p>
                  )}
                  {location.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 text-[#0A5D31]" />
                      <span>{location.location}</span>
                    </div>
                  )}
                  {location.rating && (
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900">{location.rating}</span>
                      {location.reviews && (
                        <span className="text-gray-600">({location.reviews} reviews)</span>
                      )}
                    </div>
                  )}
                  {location.products && (
                    <p className="text-sm text-gray-600 mb-2 font-medium">{location.products} products available</p>
                  )}
                  {location.completedJobs && (
                    <p className="text-sm text-gray-600 mb-2 font-medium">{location.completedJobs} jobs completed</p>
                  )}
                  {location.hourlyRate && (
                    <p className="text-sm text-gray-600 mb-2 font-medium">Rate: {location.hourlyRate}/hr</p>
                  )}
                  {location.link && (
                    <Link
                      href={location.link}
                      className="text-sm text-[#0A5D31] font-bold hover:underline mt-3 inline-block bg-[#0A5D31]/10 hover:bg-[#0A5D31]/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View Details →
                    </Link>
                  )}
                </div>
              </Popup>
            </Marker>
              )
            })
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="text-center p-4 bg-white rounded-lg shadow-lg border border-gray-200">
                <p className="text-gray-600 font-medium">No sellers found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search</p>
              </div>
            </div>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
