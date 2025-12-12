"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package2, ArrowRight, Loader2 } from "lucide-react"
import { getImageUrl } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

export interface ApiCategory {
  id: number
  unique_id: string
  name: string
  image?: string
  slug?: string
  created_at?: string
  updated_at?: string
  products_count?: number
  description?: string
}

export interface ApiCategoryCardProps {
  category: ApiCategory
  onClick?: (category: ApiCategory) => void
  className?: string
  variant?: "default" | "compact" | "featured"
}

export function ApiCategoryCard({
  category,
  onClick,
  className = "",
  variant = "default",
}: ApiCategoryCardProps) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  const imageUrl = getImageUrl(category.image, category.name)
  const categoryUrl = `/categories/${category.unique_id}/products`
  const productsCount = category.products_count || 0

  // Set mounted state only on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true)
      setIsImageLoading(false)
    }
  }

  const handleImageLoad = () => {
    setIsImageLoading(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    // Only call onClick if provided
    if (onClick) {
      e.preventDefault()
      onClick(category)
      return
    }
    
    // Show loading state during navigation (only on client)
    if (isMounted) {
      e.preventDefault()
      setIsNavigating(true)
      router.push(categoryUrl)
    }
  }

  // Compact variant for homepage
  if (variant === "compact") {
    return (
      <div onClick={handleClick} className="cursor-pointer">
        <div className="group text-center">
          <div className="relative overflow-hidden rounded-xl h-20 w-20 mx-auto mb-2 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-gray-100 hover:border-[#0A5D31] hover:scale-105">
            {isImageLoading && !imgError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            {isMounted && isNavigating && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <Loader2 className="w-6 h-6 text-[#0A5D31] animate-spin" />
              </div>
            )}
            <img
              src={imgError ? "/placeholder.svg" : imageUrl}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
          <h3 className="font-medium text-foreground text-xs group-hover:text-[#0A5D31] transition-colors line-clamp-2">
            {category.name}
          </h3>
        </div>
      </div>
    )
  }

  // Featured variant for special displays
  if (variant === "featured") {
    return (
      <Card onClick={handleClick} className={`group cursor-pointer bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl hover:shadow-xl hover:border-[#0A5D31] transition-all duration-300 overflow-hidden ${className}`}>
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {isImageLoading && !imgError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          {isMounted && isNavigating && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-[#0A5D31] animate-spin" />
            </div>
          )}
          <img
            src={imgError ? "/placeholder.svg" : imageUrl}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                {category.name}
              </h3>
              {productsCount > 0 && (
                <p className="text-white/90 text-sm drop-shadow">
                  {productsCount} {productsCount === 1 ? 'product' : 'products'}
                </p>
              )}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge className="bg-[#0A5D31] hover:bg-[#0A5D31] text-white text-xs">
                Fresh
              </Badge>
              <Badge variant="outline" className="border-gray-300 text-gray-700 text-xs">
                Local
              </Badge>
            </div>
            {isMounted && isNavigating ? (
              <Loader2 className="w-5 h-5 text-[#0A5D31] animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5 text-[#0A5D31] group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        </div>
      </Card>
    )
  }

  // Default variant for category pages
  return (
    <Card onClick={handleClick} className={`group cursor-pointer bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-[#0A5D31] transition-all duration-200 p-4 ${className}`}>
      <div className="flex items-start gap-4">
        {/* Category Image */}
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
          {isImageLoading && !imgError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          {isMounted && isNavigating && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 className="w-5 h-5 text-[#0A5D31] animate-spin" />
            </div>
          )}
          <img
            src={imgError ? "/placeholder.svg" : imageUrl}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>

          {/* Category Info */}
        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0A5D31] transition-colors line-clamp-1">
              {category.name}
            </h3>
            {isMounted && isNavigating ? (
              <Loader2 className="w-5 h-5 text-[#0A5D31] animate-spin flex-shrink-0" />
            ) : (
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#0A5D31] group-hover:translate-x-1 transition-all flex-shrink-0" />
            )}
          </div>
          
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge className="bg-[#0A5D31] hover:bg-[#0A5D31] text-white px-2 py-0.5 text-xs font-medium">
              Fresh
            </Badge>
            <Badge variant="outline" className="border-gray-300 text-gray-700 px-2 py-0.5 text-xs font-medium">
              Local
            </Badge>
            {productsCount > 0 && (
              <Badge variant="outline" className="border-gray-300 text-gray-700 px-2 py-0.5 text-xs font-medium">
                <Package2 className="w-3 h-3 mr-1" />
                {productsCount}
              </Badge>
            )}
          </div>

          {/* Category Description or Tags */}
          <p className="text-sm text-gray-600 line-clamp-1">
            {category.description || "Groceries · Fresh Produce · Organic"}
          </p>
        </div>
      </div>
    </Card>
  )
}

