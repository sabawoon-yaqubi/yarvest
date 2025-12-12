"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Mail, 
  Globe, 
  Store, 
  User, 
  Package,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Award
} from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { ApiResponse } from "@/types/api"

interface StoreType {
  id: number
  name: string
}

interface StoreUser {
  id: number
  unique_id: string
  full_name: string
  image: string | null
}

interface StoreProduct {
  id: number
  unique_id: string
  name: string
  price: number
  image: string | null
}

interface StoreHour {
  id: number
  day: string
  start_time: string
  end_time: string
  type: string
}

interface StoreCertification {
  id: number
  certification: {
    id: number
    name: string
  }
}

interface StoreLocation {
  city?: string
  state?: string
  country?: string
  address_line_1?: string
  address_line_2?: string
  zip_code?: string
  full_location?: string
}

interface StoreDetail {
  id: number
  unique_id: string
  name: string
  logo: string | null
  description: string | null
  bio: string | null
  website: string | null
  phone: string | null
  email: string | null
  store_type: StoreType | null
  user: StoreUser | null
  location?: StoreLocation | null
  products: StoreProduct[]
  hours?: StoreHour[]
  certifications?: StoreCertification[]
  products_count?: number
  status: boolean
  created_at: string
  updated_at: string
}

export default function StoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: store, loading, error, refetch } = useApiFetch<StoreDetail>(
    `/stores/${storeId}`,
    {
      enabled: !!storeId,
    }
  )

  const formatTime = (time: string): string => {
    if (!time) return ""
    try {
      const [hours, minutes] = time.split(":")
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? "PM" : "AM"
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return time
    }
  }

  const formatHours = (hours?: StoreHour[]): string => {
    if (!hours || hours.length === 0) return "Check store for hours"
    
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
    const todayHours = hours.find(h => h.day.toLowerCase() === today.toLowerCase())
    
    if (todayHours) {
      return `${formatTime(todayHours.start_time)} - ${formatTime(todayHours.end_time)}`
    }
    
    return "Check store for hours"
  }

  const getDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading store details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <Card className="p-12">
                <p className="text-red-500 text-lg mb-4">
                  {error || "Store not found"}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => refetch()} variant="outline">
                    Retry
                  </Button>
                  <Button onClick={() => router.push("/shops")} variant="default">
                    Back to Stores
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="bg-gradient-to-b from-white to-secondary/10">
          {/* Header Section */}
          <div className="px-6 py-8 border-b border-border">
            <div className="max-w-6xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-6 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="flex flex-col md:flex-row gap-8">
                {/* Store Logo */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-secondary border-2 border-border">
                    <img
                      src={store.logo || "/placeholder.svg"}
                      alt={store.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                </div>

                {/* Store Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-foreground mb-2">{store.name}</h1>
                      {store.store_type && (
                        <Badge variant="secondary" className="text-sm font-semibold mb-4">
                          {store.store_type.name}
                        </Badge>
                      )}
                    </div>
                    {store.status && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span className="text-sm">
                        {store.products_count || store.products?.length || 0} Products
                      </span>
                    </div>
                    {store.user && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{store.user.full_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {store.description && (
                    <p className="text-muted-foreground mb-4">{store.description}</p>
                  )}
                  {store.bio && (
                    <p className="text-muted-foreground">{store.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About Section */}
                  {(store.description || store.bio) && (
                    <Card className="p-6">
                      <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
                      {store.description && (
                        <p className="text-muted-foreground mb-4 leading-relaxed">{store.description}</p>
                      )}
                      {store.bio && (
                        <p className="text-muted-foreground leading-relaxed">{store.bio}</p>
                      )}
                    </Card>
                  )}

                  {/* Products Section */}
                  {store.products && store.products.length > 0 && (
                    <Card className="p-6">
                      <h2 className="text-2xl font-bold text-foreground mb-6">Products</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {store.products.slice(0, 6).map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.unique_id}`}
                            className="group"
                          >
                            <div className="aspect-square rounded-lg overflow-hidden bg-secondary mb-2">
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                            </div>
                            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                             <p className="text-sm font-bold text-primary">${product.price.toFixed(2)}</p>
                          </Link>
                        ))}
                      </div>
                      {store.products.length > 6 && (
                        <div className="mt-6 text-center">
                          <Button variant="outline" onClick={() => router.push(`/shops/${storeId}/products`)}>
                            View All {store.products.length} Products
                          </Button>
                        </div>
                      )}
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Location Information */}
                  {store.location && (
                    <Card className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Location
                      </h3>
                      <div className="space-y-2">
                        {store.location.full_location && (
                          <p className="text-foreground font-medium">{store.location.full_location}</p>
                        )}
                        {!store.location.full_location && (
                          <>
                            {store.location.address_line_1 && (
                              <p className="text-foreground">{store.location.address_line_1}</p>
                            )}
                            {store.location.address_line_2 && (
                              <p className="text-foreground">{store.location.address_line_2}</p>
                            )}
                            <p className="text-muted-foreground">
                              {[
                                store.location.city,
                                store.location.state,
                                store.location.zip_code,
                                store.location.country
                              ].filter(Boolean).join(', ')}
                            </p>
                          </>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Contact Information */}
                  <Card className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      {store.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                          <a
                            href={`tel:${store.phone}`}
                            className="text-foreground hover:text-primary transition-colors"
                          >
                            {store.phone}
                          </a>
                        </div>
                      )}
                      {store.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                          <a
                            href={`mailto:${store.email}`}
                            className="text-foreground hover:text-primary transition-colors break-all"
                          >
                            {store.email}
                          </a>
                        </div>
                      )}
                      {store.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                          <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-primary transition-colors break-all"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Store Hours */}
                  {store.hours && store.hours.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Store Hours
                      </h3>
                      <div className="space-y-2">
                        {store.hours.map((hour) => (
                          <div key={hour.id} className="flex justify-between text-sm">
                            <span className="font-medium text-foreground">{getDayName(hour.day)}</span>
                            <span className="text-muted-foreground">
                              {formatTime(hour.start_time)} - {formatTime(hour.end_time)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Certifications */}
                  {store.certifications && store.certifications.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Certifications
                      </h3>
                      <div className="space-y-2">
                        {store.certifications.map((cert) => (
                          <Badge key={cert.id} variant="outline" className="mr-2 mb-2">
                            {cert.certification.name}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Owner Information */}
                  {store.user && (
                    <Card className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Store Owner
                      </h3>
                      <div className="flex items-center gap-3">
                        {store.user.image && (
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary">
                            <img
                              src={store.user.image}
                              alt={store.user.full_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground">{store.user.full_name}</p>
                          <Link
                            href={`/producers/${store.user.unique_id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
