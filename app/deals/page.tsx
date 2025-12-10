"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { Tag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ApiProduct } from "@/types/product"
import { ApiProductCard } from "@/components/api-product-card"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"

export default function DealsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
          <div className="px-6 py-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-[#0A5D31] hover:text-[#0d7a3f] mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Home</span>
              </Link>
              
              <div className="flex items-center gap-3 mb-2">
                <Tag className="w-8 h-8 text-[#0A5D31]" />
                <h1 className="text-5xl font-bold text-foreground">Special Deals</h1>
              </div>
              <p className="text-muted-foreground text-lg mt-2">
                Limited time offers - Don't miss out on these amazing discounts!
              </p>
            </div>

            {/* Products Grid */}
            <InfiniteScrollFetcher<ApiProduct>
              url="/special-deals"
              limit={12}
              gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
              renderLoading={() => <ProductCardSkeleton count={8} />}
              renderEmpty={() => (
                <div className="text-center py-12 col-span-full">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-muted-foreground mb-2">No special deals available</p>
                  <p className="text-sm text-gray-500">Check back later for amazing offers!</p>
                </div>
              )}
            />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  )
}

