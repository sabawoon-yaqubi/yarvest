"use client"

import { Badge } from "@/components/ui/badge"
import { Star, MapPin } from "lucide-react"
import Image from "next/image"

interface Product {
  name: string
  producer: string
  producerImage?: string
  rating: number
  reviews: number
  inStock: boolean
  code: string
  badge?: string | null
  organic?: boolean
}

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="font-semibold text-gray-900">{product.rating}</span>
        <span className="text-gray-500 text-sm">({product.reviews} reviews)</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        {product.producerImage && (
          <img
            src={product.producerImage}
            alt={product.producer}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold text-gray-900">{product.producer}</p>
          <p className="text-xs text-gray-500">Verified Producer</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Badge className={product.inStock ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </Badge>
      </div>
      <p className="text-xs text-gray-500 font-mono">SKU: {product.code}</p>
    </div>
  )
}





