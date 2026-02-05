"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Search, Package, Map, Filter } from "lucide-react"
import { useState, useMemo, Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"
import { ApiProductCard, ApiProduct } from "@/components/api-product-card"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"
import { FreshFoodCategories } from "@/components/fresh-food-categories"
import { calculateProductPrices } from "@/lib/product-utils"
import { useSafeTranslations } from "@/hooks/use-safe-translations"
import { useRouter } from "@/routing"

function ProductsContent() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [showPriceFilter, setShowPriceFilter] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQuery = searchParams.get("q") || ""
  const t = useSafeTranslations("products")

  // Calculate max price from products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000
    const prices = products.map(p => {
      const { price } = calculateProductPrices(p)
      return price
    })
    return Math.max(...prices, 1000)
  }, [products])

  // Initialize price range
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  
  // Update price range max when maxPrice changes
  useEffect(() => {
    if (maxPrice > 1000) {
      setPriceRange([0, maxPrice])
    }
  }, [maxPrice])

  // Filter products based on search query and price range
  const filteredProducts = useMemo(() => {
    let filtered = products
    
    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.seller.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.product_category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Price filter
    filtered = filtered.filter((product) => {
      const { price } = calculateProductPrices(product)
      return price >= priceRange[0] && price <= priceRange[1]
    })

    return filtered
  }, [products, searchQuery, priceRange])


  const renderLoading = () => (
    <ProductCardSkeleton count={12} />
  )

  const renderError = (error: string, retry: () => void) => (
    <div className="px-6 py-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
          <Package className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("errorLoading")}</h1>
        <p className="text-lg text-gray-600 mb-8">{error}</p>
        <Button onClick={retry} className="bg-[#5a9c3a] hover:bg-[#0d7a3f] rounded-xl">
          {t("tryAgain")}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white to-gray-50/50">
        <div className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              {t("title")}
            </h1>
            <p className="text-lg text-gray-600">
              {t("subtitle")}
            </p>
          </div>

          {/* Categories Section */}
          <div className="mb-8">
            <FreshFoodCategories title={false} />
          </div>

          {/* Filter Bar */}
          <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
              {/* Results Count */}
              <div className="text-sm text-gray-600 order-1">
                {t("showingCount", { filtered: filteredProducts.length, total: products.length })}
              </div>

              {/* Right Section - Filters and Map */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 order-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Button
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                    variant="outline"
                    className={`w-full sm:w-auto flex items-center gap-2 ${showPriceFilter ? 'bg-[#5a9c3a] text-white border-[#5a9c3a]' : ''}`}
                  >
                    <Filter className="h-4 w-4" />
                    {t("priceFilter")}
                  </Button>
                  
                  {showPriceFilter && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20 min-w-[240px] w-[90vw] max-w-xs sm:min-w-[280px]">
                      <div className="mb-3">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          {t("priceRange", { min: priceRange[0], max: priceRange[1] })}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            max={maxPrice}
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5a9c3a]"
                            placeholder={t("min")}
                          />
                          <input
                            type="number"
                            min={priceRange[0]}
                            max={maxPrice}
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5a9c3a]"
                            placeholder={t("max")}
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={maxPrice}
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5a9c3a]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setPriceRange([0, maxPrice])
                            setShowPriceFilter(false)
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          {t("reset")}
                        </Button>
                        <Button
                          onClick={() => setShowPriceFilter(false)}
                          size="sm"
                          className="flex-1 bg-[#5a9c3a] hover:bg-[#0d7a3f]"
                        >
                          {t("apply")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => router.push("/products/map")}
                  variant="outline"
                  className="flex items-center gap-2 border-[#5a9c3a] text-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white w-full sm:w-auto"
                >
                  <Map className="h-4 w-4" />
                  {t("mapView")}
                </Button>
              </div>
            </div>
          </div>

          {/* Products List with Infinite Scroll */}
          <InfiniteScrollFetcher<ApiProduct>
            url="/products"
            limit={12}
            gridClassName={(searchQuery || priceRange[0] > 0 || priceRange[1] < maxPrice) ? "hidden" : "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}
            renderItem={(product) => (
              <ApiProductCard
                key={product.id}
                product={product}
              />
            )}
            renderLoading={renderLoading}
            renderError={renderError}
            renderEmpty={() => (
              <div className="text-center py-24 col-span-full">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-[#5a9c3a]/10 rounded-full mb-6">
                  <Package className="w-12 h-12 text-[#5a9c3a]" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{t("noProductsAvailable")}</h3>
                <p className="text-gray-600">{t("noProductsMessage")}</p>
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
          
          {/* Keep loading products in background when filtering */}
          {(searchQuery || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
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
          
          {/* Show filtered products when searching or filtering */}
          {(searchQuery || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <>
              {filteredProducts.length === 0 && products.length > 0 ? (
                <div className="text-center py-24">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-[#5a9c3a]/10 rounded-full flex items-center justify-center">
                      <Search className="w-6 h-6 text-[#5a9c3a]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{t("noProductsFound")}</h3>
                  <p className="text-gray-600 mb-8">{t("tryAdjustingFilters")}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push("/products")
                      setPriceRange([0, maxPrice])
                    }}
                    className="rounded-xl border-gray-300 hover:bg-[#5a9c3a]/10 hover:border-[#5a9c3a]"
                  >
                    {t("clearFilters")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
        <main className="flex-1 overflow-auto bg-gradient-to-b from-white to-gray-50/50">
          <div className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
            <ProductCardSkeleton count={12} />
          </div>
        </main>
      }>
        <ProductsContent />
      </Suspense>
    </div>
  )
}

