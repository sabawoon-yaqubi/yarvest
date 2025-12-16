"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Package, ArrowRight, Loader2, Grid3x3, Sparkles, TrendingUp } from "lucide-react"
import { useState, useMemo } from "react"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { ApiCategory } from "@/components/api-category-card"
import { ApiProductCard, ApiProduct } from "@/components/api-product-card"
import { getImageUrl } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const router = useRouter()

  // Fetch categories
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useApiFetch<ApiCategory[]>('/categories?limit=50')

  // Fetch products for selected category
  const { data: categoryProductsData, loading: productsLoading } = useApiFetch<{ category: ApiCategory; products: ApiProduct[]; count: number }>(
    selectedCategory ? `/categories/${selectedCategory}/products` : '',
    { enabled: !!selectedCategory }
  )

  const categories = categoriesData || []
  const categoryProducts = categoryProductsData?.products || []

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [categories, searchQuery])

  // Get featured products from all categories (first 4 products from each category)
  const featuredProducts = useMemo(() => {
    if (selectedCategory) return []
    
    // Group products by category and take first 4 from each
    const productsByCategory = new Map<number, ApiProduct[]>()
    
    // We'll need to fetch products for each category, but for now show all products
    // In a real implementation, you'd fetch products for each category
    return []
  }, [selectedCategory])

  const handleCategoryClick = (category: ApiCategory) => {
    setSelectedCategory(category.unique_id)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSearchQuery("")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 sm:mb-12 text-center">
            {!selectedCategory && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-3xl mb-6 shadow-lg shadow-[#5a9c3a]/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 mb-4 tracking-tight">
              {selectedCategory ? categoryProductsData?.category?.name || 'Category' : 'Shop by Category'}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {selectedCategory 
                ? `Browse our curated collection of products in this category` 
                : 'Discover our wide range of fresh, locally sourced products'}
            </p>
            {!selectedCategory && categories.length > 0 && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50">
                <TrendingUp className="w-4 h-4 text-[#5a9c3a]" />
                <span className="text-sm font-medium text-gray-700">
                  {categories.length} {categories.length === 1 ? 'Category' : 'Categories'} Available
                </span>
              </div>
            )}
          </div>

          {/* Back Button (when viewing category products) */}
          {selectedCategory && (
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={handleBackToCategories}
                className="group text-[#5a9c3a] hover:text-[#0d7a3f] hover:bg-[#5a9c3a]/10 px-4 py-2 rounded-xl transition-all duration-200"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Categories</span>
              </Button>
            </div>
          )}

          {/* Search Bar */}
          {!selectedCategory && (
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
          )}

          {/* Results Count */}
          {searchQuery && categories.length > 0 && !selectedCategory && (
            <div className="mb-6 text-center">
              <p className="text-sm sm:text-base text-gray-600 inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50">
                Showing <span className="font-bold text-[#5a9c3a]">{filteredCategories.length}</span> of <span className="font-semibold">{categories.length}</span> categories
              </p>
            </div>
          )}

          {/* Category Products View */}
          {selectedCategory ? (
            <div>
              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="p-4 sm:p-6 animate-pulse border-0 shadow-md">
                      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4" />
                      <div className="h-5 bg-gray-200 rounded-lg mb-3" />
                      <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
                    </Card>
                  ))}
                </div>
              ) : categoryProducts.length > 0 ? (
                <>
                  <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Products</p>
                        <p className="text-xl font-bold text-gray-900">
                          <span className="text-[#5a9c3a]">{categoryProducts.length}</span> items
                        </p>
                      </div>
                    </div>
                    <Link href={`/categories/${selectedCategory}/products`}>
                      <Button 
                        variant="outline" 
                        className="text-[#5a9c3a] border-2 border-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        View All Products
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {categoryProducts.slice(0, 8).map((product) => (
                      <ApiProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                  {categoryProducts.length > 8 && (
                    <div className="mt-10 text-center">
                      <Link href={`/categories/${selectedCategory}/products`}>
                        <Button className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white px-10 py-6 rounded-2xl text-base font-semibold shadow-lg shadow-[#5a9c3a]/20 hover:shadow-xl hover:shadow-[#5a9c3a]/30 transition-all duration-300">
                          View All {categoryProducts.length} Products
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 sm:py-24">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-8 shadow-inner">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">No products found</h3>
                  <p className="text-base text-gray-600 mb-8 max-w-md mx-auto">
                    This category doesn't have any products yet. Check back soon!
                  </p>
                  <Button 
                    onClick={handleBackToCategories} 
                    variant="outline" 
                    className="rounded-xl px-6 py-2.5 border-2 hover:bg-gray-50 font-medium"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Back to Categories
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Categories Grid */
            <>
              {categoriesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {[...Array(12)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse border-0 shadow-lg overflow-hidden">
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4" />
                      <div className="h-6 bg-gray-200 rounded-lg mb-3" />
                      <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
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
                      <Card
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className="group cursor-pointer bg-white border-0 rounded-3xl hover:shadow-2xl shadow-lg hover:shadow-[#5a9c3a]/10 transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#5a9c3a]/5 to-[#0d7a3f]/5">
                          <img
                            src={imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.png"
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Product count badge */}
                          {category.products_count !== undefined && category.products_count > 0 && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 font-semibold px-3 py-1.5 shadow-lg border-0">
                                {category.products_count} {category.products_count === 1 ? 'item' : 'items'}
                              </Badge>
                            </div>
                          )}

                          {/* Category name overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-2xl leading-tight">
                              {category.name}
                            </h3>
                            <div className="flex items-center gap-2 text-white/90 text-sm">
                              <div className="w-2 h-2 rounded-full bg-white/80" />
                              <span className="font-medium">Explore Collection</span>
                            </div>
                          </div>

                          {/* Hover arrow indicator */}
                          <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowRight className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        
                        {/* Bottom section with action button */}
                        <div className="p-5 sm:p-6 bg-white">
                          <Button
                            className="w-full bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02]"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCategoryClick(category)
                            }}
                          >
                            View Products
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}


