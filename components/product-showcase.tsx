"use client"

import { useState } from "react"
import Link from "next/link"
import { ApiProduct } from "@/types/product"
import { ApiProductCard } from "./api-product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { ApiDataFetcher } from "./api-data-fetcher"
import { useCartHandler } from "@/hooks/use-cart-handler"

export function ProductShowcase() {
  const [favorites, setFavorites] = useState<number[]>([])
  const { handleAddToCart } = useCartHandler()

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold text-foreground">Featured Fresh Products</h2>
          <p className="text-muted-foreground text-base mt-2">Premium quality from verified local producers</p>
        </div>
        <Link href="/featured-products" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm transition-colors">
          View All
        </Link>
      </div>
      
      <ApiDataFetcher<ApiProduct>
        url="/featured-products"
        limit={6}
        page={1}
        gridClassName="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-3"
        renderItem={(product) => (
          <ApiProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
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
        renderLoading={() => <ProductCardSkeleton count={6} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No featured products available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}
