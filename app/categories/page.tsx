"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Grid3x3, List, Search, Package, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import api from "@/lib/axios"
import { getImageUrl } from "@/lib/utils"
import { LoadingSpinner } from "@/components/loading-spinner"

interface Category {
  id: number
  name: string
  image?: string
  slug?: string
  unique_id?: string
  created_at?: string
  updated_at?: string
}

export default function CategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let isMounted = true
    
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.get("/categories")
        
        if (!isMounted) return
        
        // Handle different response structures
        let categoriesData: Category[] = []
        if (response.data) {
          if (Array.isArray(response.data)) {
            categoriesData = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            categoriesData = response.data.data
          } else if (response.data.categories && Array.isArray(response.data.categories)) {
            categoriesData = response.data.categories
          }
        }
        
        if (isMounted) {
          setCategories(categoriesData)
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err)
        
        if (isMounted) {
          setError(err.response?.data?.message || err.message || "Failed to load categories")
          setCategories([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchCategories()
    
    return () => {
      isMounted = false
    }
  }, [])

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
            <LoadingSpinner />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-16 bg-gradient-to-b from-white to-gray-50/50">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <Package className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading Categories</h1>
              <p className="text-lg text-gray-600 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h1>
            <p className="text-gray-600">
              {categories.length} {categories.length === 1 ? 'category' : 'categories'} available
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 h-12 rounded-lg border border-gray-300 focus:border-[#0A5D31] focus:ring-2 focus:ring-[#0A5D31]/20"
              />
            </div>
          </div>

          {/* Results Count */}
          {searchQuery && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredCategories.length} of {categories.length} categories
              </p>
            </div>
          )}

          {/* Categories List */}
          {categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories available</h3>
              <p className="text-gray-600">There are no categories to display at the moment.</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search query</p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="rounded-lg"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => {
                const uniqueId = category.unique_id
                if (!uniqueId) return null
                
                const imageUrl = getImageUrl(category.image)
                const categoryUrl = `/categories/${uniqueId}/products`
                
                return (
                  <Link key={category.id} href={categoryUrl}>
                    <Card className="group cursor-pointer bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 p-4">
                      <div className="flex items-start gap-4">
                        {/* Category Logo */}
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              if (target.src !== "/placeholder.svg") {
                                target.src = "/placeholder.svg"
                              }
                            }}
                          />
                        </div>

                        {/* Category Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#0A5D31] transition-colors">
                            {category.name}
                          </h3>
                          
                          {/* Badges Row */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className="bg-[#0A5D31] hover:bg-[#0A5D31] text-white px-2 py-0.5 text-xs font-medium">
                              Fresh
                            </Badge>
                            <Badge variant="outline" className="border-gray-300 text-gray-700 px-2 py-0.5 text-xs font-medium">
                              Local
                            </Badge>
                          </div>

                          {/* Category Tags */}
                          <p className="text-sm text-gray-600 line-clamp-1">
                            Groceries · Fresh Produce · Organic
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
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


