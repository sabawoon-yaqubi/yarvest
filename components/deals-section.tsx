"use client"

import { useState } from "react"
import { Sparkles, ArrowRight } from "lucide-react"
import { ApiProduct } from "@/types/product"
import { ApiProductCard } from "./api-product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { ApiDataFetcher } from "./api-data-fetcher"
import { useCartHandler } from "@/hooks/use-cart-handler"
import { useSafeTranslations } from "@/hooks/use-safe-translations"
import { Link } from "@/routing"

export function DealsSection() {
  const [favorites, setFavorites] = useState<number[]>([])
  const { handleAddToCart } = useCartHandler()
  const t = useSafeTranslations("home")

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#5a9c3a]" />
              <h3 className="font-bold text-2xl sm:text-4xl text-foreground">{t("specialDeals")}</h3>
            </div>
            <p className="text-muted-foreground text-base mt-2 hidden sm:block">{t("specialDealsDescription")}</p>
          </div>
        <Link href="/deals" className="text-[#5a9c3a] font-semibold hover:text-[#0d7a3f] text-sm transition-colors flex items-center gap-1">
          {t("viewAllDeals")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <ApiDataFetcher<ApiProduct>
        url="/special-deals"
        limit={4}
        page={1}
        gridClassName="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-3"
        renderItem={(deal) => (
          <ApiProductCard
            key={deal.id}
            product={deal}
            onAddToCart={handleAddToCart}
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
            <p className="text-muted-foreground">{t("noDeals")}</p>
          </div>
        )}
      />
    </div>
  )
}

