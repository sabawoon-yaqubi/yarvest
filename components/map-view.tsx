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

// Add custom styles for popups
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

        useEffect(() => {
          if (!map || typeof window === "undefined") return

          const heatData = locations.map((loc) => [loc.lat, loc.lng, 1] as [number, number, number])

          if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current)
          }

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

          return () => {
            if (heatLayerRef.current) {
              map.removeLayer(heatLayerRef.current)
            }
          }
        }, [map, locations])

        return null
      }
    }),
  { ssr: false }
)

export function MapView({ locations, center = [37.7749, -122.4194], zoom = 8, showHeatMap = true, title }: MapViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
      <Card className="overflow-hidden border-2 border-gray-200 shadow-xl rounded-2xl">
        {title && (
          <div className="p-6 border-b bg-gradient-to-r from-[#0A5D31]/10 via-[#0A5D31]/5 to-white">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{locations.length} locations on map</p>
          </div>
        )}
        <div className="h-[700px] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0A5D31] border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading beautiful map...</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-2 border-gray-200 shadow-xl rounded-2xl">
      {title && (
        <div className="p-6 border-b bg-gradient-to-r from-[#0A5D31]/10 via-[#0A5D31]/5 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{locations.length} locations on map</p>
            </div>
            {showHeatMap && (
              <Badge className="bg-[#0A5D31] text-white px-3 py-1">
                Heat Map Active
              </Badge>
            )}
          </div>
        </div>
      )}
      <div className="relative h-[700px] w-full">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          scrollWheelZoom={true}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {showHeatMap && <HeatMapLayer locations={locations} />}
          {locations.map((location) => (
            <Marker
              key={location.id}
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
          ))}
        </MapContainer>
      </div>
    </Card>
  )
}
