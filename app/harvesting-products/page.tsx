"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Search, Package } from "lucide-react"
import { useState } from "react"
import { ApiProduct } from "@/types/product"
import { ApiProductCard } from "@/components/api-product-card"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"

export default function HarvestingProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-12 bg-gradient-to-b from-white to-secondary/10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingBag className="w-8 h-8 text-[#0A5D31]" />
                <h1 className="text-5xl font-bold text-foreground">Harvesting Products</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Essential tools and equipment for efficient harvesting
              </p>
            </div>

            {/* Products Grid */}
            <InfiniteScrollFetcher<ApiProduct>
              url="/harvesting-products"
              limit={12}
              gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
              renderLoading={() => <ProductCardSkeleton count={12} />}
              renderEmpty={() => (
                <div className="text-center py-12 col-span-full">
                  <p className="text-muted-foreground">No harvesting products available at the moment.</p>
                </div>
              )}
            />
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
