"use client"

import { useState } from "react"
import { Tag } from "lucide-react"
import Link from "next/link"
import { ApiProduct } from "@/types/product"
import { ApiProductCard } from "./api-product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { ApiDataFetcher } from "./api-data-fetcher"

export function DealsSection() {
  const [favorites, setFavorites] = useState<number[]>([])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-6 h-6 text-[#0A5D31]" />
            <h2 className="text-4xl font-bold text-foreground">Special Deals</h2>
          </div>
          <p className="text-muted-foreground text-base mt-2">Limited time offers - Don't miss out!</p>
        </div>
        <Link href="/deals" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm transition-colors">
          View All Deals
        </Link>
      </div>
      
      <ApiDataFetcher<ApiProduct>
        url="/special-deals"
        renderItem={(deal) => (
          <ApiProductCard
            key={deal.id}
            product={deal}
            onAddToCart={(product, quantity) => {
              console.log("Add to cart:", product.name, quantity)
              // Add your cart logic here
            }}
            onToggleFavorite={(productId) => {
              setFavorites(prev => 
                prev.includes(productId) 
                  ? prev.filter(id => id !== productId)
                  : [...prev, productId]
              )
            }}
            isFavorite={favorites.includes(deal.id)}
          />
        )}
        renderLoading={() => <ProductCardSkeleton count={4} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No special deals available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}

