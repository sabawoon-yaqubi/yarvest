"use client"

import { TrendingUp } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { ApiProduct } from "@/types/product"
import { ApiProductCard } from "./api-product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { ApiDataFetcher } from "./api-data-fetcher"

export function TrendingProducts() {
  const [favorites, setFavorites] = useState<number[]>([])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-[#0A5D31]" />
            <h2 className="text-4xl font-bold text-foreground">Trending Now</h2>
          </div>
          <p className="text-muted-foreground text-base mt-2">What everyone's buying this week</p>
        </div>
        <Link href="/trending" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm transition-colors">
          View All
        </Link>
      </div>
      
      <ApiDataFetcher<ApiProduct>
        url="/trending-products"
        limit={5}
        page={1}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        renderItem={(product) => (
          <ApiProductCard
            key={product.id}
            product={product}
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
            isFavorite={favorites.includes(product.id)}
          />
        )}
        renderLoading={() => <ProductCardSkeleton count={5} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No trending products available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}

