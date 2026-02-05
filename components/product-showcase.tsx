"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { ApiProduct } from "@/types/product"
import { ApiProductCard } from "./api-product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { ApiDataFetcher } from "./api-data-fetcher"
import { useCartHandler } from "@/hooks/use-cart-handler"
import { useSafeTranslations } from "@/hooks/use-safe-translations"
import { Link } from "@/routing"

export function ProductShowcase() {
  const [favorites, setFavorites] = useState<number[]>([])
  const { handleAddToCart } = useCartHandler()
  const t = useSafeTranslations("home")

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="font-bold text-2xl sm:text-4xl text-foreground">{t("featuredProducts")}</h3>
          <p className="text-muted-foreground text-base mt-2 hidden sm:block">{t("featuredProductsDescription")}</p>
        </div>
        <Link href="/featured-products" className="text-[#5a9c3a] font-semibold hover:text-[#0d7a3f] text-sm transition-colors flex items-center gap-1">
          {t("viewAll")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <ApiDataFetcher<ApiProduct>
        url="/featured-products"
        limit={4}
        page={1}
        gridClassName="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-3"
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
            <p className="text-muted-foreground">{t("noFeaturedProducts")}</p>
          </div>
        )}
      />
    </div>
  )
}
