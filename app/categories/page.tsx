"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Package, ArrowRight, Loader2, Grid3x3 } from "lucide-react"
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5a9c3a]/10 to-[#0d7a3f]/10 rounded-2xl mb-4">
              <Grid3x3 className="w-8 h-8 text-[#5a9c3a]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              {selectedCategory ? categoryProductsData?.category?.name || 'Category' : 'Shop by Category'}
            </h1>
            <p className="text-lg text-gray-600">
              {selectedCategory 
                ? `Browse products in this category` 
                : 'Discover our wide range of fresh products'}
            </p>
          </div>

          {/* Back Button (when viewing category products) */}
          {selectedCategory && (
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToCategories}
                className="text-[#5a9c3a] hover:text-[#0d7a3f] hover:bg-[#5a9c3a]/10"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Categories
              </Button>
            </div>
          )}

          {/* Search Bar */}
          {!selectedCategory && (
            <div className="mb-8 flex justify-center">
              <div className="relative w-full max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 h-14 text-lg rounded-xl border-2 border-gray-200 focus:border-[#5a9c3a] focus:ring-2 focus:ring-[#5a9c3a]/20 bg-white shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Results Count */}
          {searchQuery && categories.length > 0 && !selectedCategory && (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-[#5a9c3a]">{filteredCategories.length}</span> of {categories.length} categories
              </p>
            </div>
          )}

          {/* Category Products View */}
          {selectedCategory ? (
            <div>
              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="p-4 animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </Card>
                  ))}
                </div>
              ) : categoryProducts.length > 0 ? (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-[#5a9c3a]">{categoryProducts.length}</span> products found
                    </p>
                    <Link href={`/categories/${selectedCategory}/products`}>
                      <Button variant="outline" className="text-[#5a9c3a] border-[#5a9c3a] hover:bg-[#5a9c3a] hover:text-white">
                        View All Products
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categoryProducts.slice(0, 8).map((product) => (
                      <ApiProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                  {categoryProducts.length > 8 && (
                    <div className="mt-8 text-center">
                      <Link href={`/categories/${selectedCategory}/products`}>
                        <Button className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white px-8 py-6 rounded-xl">
                          View All {categoryProducts.length} Products
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">This category doesn't have any products yet.</p>
                  <Button onClick={handleBackToCategories} variant="outline" className="rounded-xl">
                    Back to Categories
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Categories Grid */
            <>
              {categoriesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded mb-3" />
                          <div className="h-4 bg-gray-200 rounded w-2/3" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : categoriesError ? (
                <div className="px-6 py-16 bg-gradient-to-b from-white to-gray-50/50 rounded-2xl">
                  <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                      <Package className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Categories</h1>
                    <p className="text-lg text-gray-600 mb-6">{categoriesError}</p>
                    <Button onClick={() => window.location.reload()} className="bg-[#5a9c3a] hover:bg-[#0d7a3f]">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No categories found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search query</p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="rounded-xl"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map((category) => {
                    const imageUrl = getImageUrl(category.image, category.name)
                    return (
                      <Card
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className="group cursor-pointer bg-white border-2 border-gray-200 rounded-2xl hover:shadow-xl hover:border-[#5a9c3a] transition-all duration-300 overflow-hidden"
                      >
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#5a9c3a]/10 to-[#0d7a3f]/10">
                          <img
                            src={imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.png"
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                              {category.name}
                            </h3>
                            {category.products_count !== undefined && category.products_count > 0 && (
                              <p className="text-white/90 text-sm drop-shadow">
                                {category.products_count} {category.products_count === 1 ? 'product' : 'products'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Badge className="bg-[#5a9c3a] hover:bg-[#5a9c3a] text-white text-xs">
                                Fresh
                              </Badge>
                              <Badge variant="outline" className="border-gray-300 text-gray-700 text-xs">
                                Local
                              </Badge>
                            </div>
                            <ArrowRight className="w-5 h-5 text-[#5a9c3a] group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div className="mt-4">
                            <Button
                              className="w-full bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCategoryClick(category)
                              }}
                            >
                              View Products
                            </Button>
                          </div>
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


