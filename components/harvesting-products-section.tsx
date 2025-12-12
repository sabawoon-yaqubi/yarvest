"use client"

import { ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { ApiProduct } from "@/types/product"
import { ApiProductCard } from "./api-product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { ApiDataFetcher } from "./api-data-fetcher"

export function HarvestingProductsSection() {
  const [favorites, setFavorites] = useState<number[]>([])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-6 h-6 text-[#0A5D31]" />
            <h2 className="text-4xl font-bold text-foreground">Harvesting Products</h2>
          </div>
          <p className="text-muted-foreground text-base mt-2">Essential tools and equipment for efficient harvesting</p>
        </div>
        <Link href="/harvesting-products" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm transition-colors flex items-center gap-1">
          View All Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <ApiDataFetcher<ApiProduct>
        url="/harvesting-products"
        limit={4}
        page={1}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
        renderLoading={() => <ProductCardSkeleton count={4} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No harvesting products available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}





