"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Package } from "lucide-react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"

interface Product {
  id: number
  unique_id: string
  name: string
  price: number
  image: string | null
  description?: string | null
}

export default function StoreProductsPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.id as string
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: storeDetail, loading: storeLoading } = useApiFetch<{
    id: number
    unique_id: string
    name: string
    logo: string | null
    products: Product[]
    products_count?: number
  }>(
    `/stores/${storeId}`,
    {
      enabled: !!storeId,
    }
  )

  // Extract products from store detail
  const storeProducts = storeDetail?.products || []

  if (storeLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading store products...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="bg-gradient-to-b from-white to-secondary/10">
          <div className="px-6 py-8 border-b border-border">
            <div className="max-w-6xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => router.push(`/shops/${storeId}`)}
                className="mb-6 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
              
              <div className="flex items-center gap-4 mb-6">
                {storeDetail?.logo && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary border border-border">
                    <img
                      src={storeDetail.logo}
                      alt={storeDetail.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{storeDetail?.name || 'Store'} Products</h1>
                  <p className="text-muted-foreground">
                    {storeDetail?.products_count || storeProducts.length} {storeDetail?.products_count === 1 ? 'product' : 'products'} available
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-12">
            <div className="max-w-6xl mx-auto">
              {storeLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Loading products...</span>
                </div>
              ) : storeProducts.length === 0 ? (
                <Card className="p-12 text-center">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No products available from this store</p>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {storeProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.unique_id}`}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                        <div className="aspect-square rounded-t-lg overflow-hidden bg-secondary">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-sm text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                           <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
