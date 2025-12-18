"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowRight, Sparkles, TrendingUp, Package } from "lucide-react"
import { useState, useMemo } from "react"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { ApiCategory } from "@/components/api-category-card"
import { getImageUrl } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function CategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Fetch categories
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useApiFetch<ApiCategory[]>('/categories?limit=50')

  const categories = categoriesData || []

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [categories, searchQuery])

  const handleCategoryClick = (category: ApiCategory) => {
    // Navigate directly to products page, bypassing intermediate page
    router.push(`/categories/${category.unique_id}/products`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="mb-8 sm:mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-3xl mb-6 shadow-lg shadow-[#5a9c3a]/20">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 mb-4 tracking-tight">
              Shop by Category
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our wide range of fresh, locally sourced products
            </p>
            {categories.length > 0 && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50">
                <TrendingUp className="w-4 h-4 text-[#5a9c3a]" />
                <span className="text-sm font-medium text-gray-700">
                  {categories.length} {categories.length === 1 ? 'Category' : 'Categories'} Available
                </span>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-8 sm:mb-10 flex justify-center">
            <div className="relative w-full max-w-3xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#5a9c3a]/20 to-[#0d7a3f]/20 rounded-2xl blur-xl opacity-50" />
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Search categories by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-5 py-4 h-16 text-base sm:text-lg rounded-2xl border-2 border-gray-200/80 focus:border-[#5a9c3a] focus:ring-4 focus:ring-[#5a9c3a]/10 bg-white/90 backdrop-blur-sm shadow-lg shadow-gray-200/50 hover:border-gray-300 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          {searchQuery && categories.length > 0 && (
            <div className="mb-6 text-center">
              <p className="text-sm sm:text-base text-gray-600 inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50">
                Showing <span className="font-bold text-[#5a9c3a]">{filteredCategories.length}</span> of <span className="font-semibold">{categories.length}</span> categories
              </p>
            </div>
          )}

          {/* Categories Grid */}
          {categoriesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {[...Array(12)].map((_, i) => (
                    <Card key={i} className="p-0 animate-pulse border-0 shadow-lg overflow-hidden rounded-3xl">
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300" />
                      <div className="p-5 sm:p-6 space-y-3">
                        <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
                        <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
                        <div className="h-10 bg-gray-200 rounded-xl mt-4" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : categoriesError ? (
                <div className="px-6 py-16 sm:py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50">
                  <div className="max-w-2xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-3xl mb-6 shadow-inner">
                      <Package className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Error Loading Categories</h1>
                    <p className="text-base sm:text-lg text-gray-600 mb-8">{categoriesError}</p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-[#5a9c3a]/20"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-16 sm:py-24">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-8 shadow-inner">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">No categories found</h3>
                  <p className="text-base text-gray-600 mb-8 max-w-md mx-auto">
                    We couldn't find any categories matching your search. Try adjusting your query.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="rounded-xl px-6 py-2.5 border-2 hover:bg-gray-50 font-medium"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredCategories.map((category) => {
                    const imageUrl = getImageUrl(category.image, category.name)
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className="group cursor-pointer bg-white border-0 rounded-3xl hover:shadow-2xl shadow-lg hover:shadow-[#5a9c3a]/10 transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#5a9c3a]/5 to-[#0d7a3f]/5">
                          <img
                            src={imageUrl}
                            alt={category.name}
                            className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-700 ease-out"
                            style={{ maxHeight: "100%", maxWidth: "100%" }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.png"
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Product count badge */}
                          {category.products_count !== undefined && category.products_count > 0 && (
                            <div className="absolute top-4 right-4 z-10">
                              <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 font-semibold px-3 py-1.5 shadow-lg border-0 rounded-full">
                                {category.products_count} {category.products_count === 1 ? 'item' : 'items'}
                              </Badge>
                            </div>
                          )}

                          {/* Category name overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-2xl leading-tight group-hover:translate-y-[-2px] transition-transform duration-300">
                              {category.name}
                            </h3>
                            <div className="flex items-center gap-2 text-white/90 text-sm">
                              {category.products_count !== undefined && category.products_count > 0 ? (
                                <>
                                  <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                                  <span className="font-medium">
                                    {category.products_count} {category.products_count === 1 ? 'item' : 'items'} available
                                  </span>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                                  <span className="font-medium">Explore Collection</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Hover arrow indicator */}
                          <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 z-10">
                            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                        
                   
                      </div>
                    )
                  })}
                </div>
              )}
          </div>
      </main>
      <Footer />
    </div>
  )
}
