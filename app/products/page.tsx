"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Search, Package } from "lucide-react"
import { useState, useMemo, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"
import { ApiProductCard, ApiProduct } from "@/components/api-product-card"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { FreshFoodCategories } from "@/components/fresh-food-categories"

function ProductsContent() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQuery = searchParams.get("q") || ""

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.product_category.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [products, searchQuery])

  const renderLoading = () => (
    <ProductCardSkeleton count={12} />
  )

  const renderError = (error: string, retry: () => void) => (
    <div className="px-6 py-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <Package className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Products</h1>
        <p className="text-lg text-gray-600 mb-6">{error}</p>
        <Button onClick={retry} className="bg-[#5a9c3a] hover:bg-[#0d7a3f]">
          Try Again
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Our Products
            </h1>
            <p className="text-lg text-gray-600">
              Discover fresh, locally sourced products
            </p>
          </div>

          {/* Categories Section */}
          <div className="mb-10">
            <FreshFoodCategories title={false} />
          </div>

          {/* Results Count */}
          {searchQuery && products.length > 0 && (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-[#5a9c3a]">{filteredProducts.length}</span> of {products.length} products
              </p>
            </div>
          )}

          {/* Products List with Infinite Scroll */}
          <InfiniteScrollFetcher<ApiProduct>
            url="/products"
            limit={12}
            gridClassName={searchQuery ? "hidden" : "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6"}
            renderItem={(product) => (
              <ApiProductCard
                key={product.id}
                product={product}
              />
            )}
            renderLoading={renderLoading}
            renderError={renderError}
            renderEmpty={() => (
              <div className="text-center py-20 col-span-full">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-600">There are no products to display at the moment.</p>
              </div>
            )}
            onSuccess={(data) => {
              // Accumulate products instead of replacing
              setProducts(prev => {
                const newProducts = Array.isArray(data) ? data : []
                // Filter out duplicates by ID
                const existingIds = new Set(prev.map(p => p.id))
                const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id))
                return [...prev, ...uniqueNewProducts]
              })
            }}
          />
          
          {/* Keep loading products in background when searching */}
          {searchQuery && (
            <InfiniteScrollFetcher<ApiProduct>
              url="/products"
              limit={12}
              enabled={true}
              gridClassName="hidden"
              renderItem={() => null}
              renderLoading={() => null}
              renderError={() => null}
              renderEmpty={() => null}
              onSuccess={(data) => {
                // Accumulate products instead of replacing
                setProducts(prev => {
                  const newProducts = Array.isArray(data) ? data : []
                  // Filter out duplicates by ID
                  const existingIds = new Set(prev.map(p => p.id))
                  const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id))
                  return [...prev, ...uniqueNewProducts]
                })
              }}
            />
          )}
          
          {/* When searching, show filtered products */}
          {searchQuery && (
            <>
              {filteredProducts.length === 0 && products.length > 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search query</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/products")}
                    className="rounded-xl"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ApiProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <Suspense fallback={
        <main className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
            <ProductCardSkeleton count={12} />
          </div>
        </main>
      }>
        <ProductsContent />
      </Suspense>
    </div>
  )
}

