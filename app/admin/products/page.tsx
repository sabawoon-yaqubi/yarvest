"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Search,
  Package,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { deleteProduct, updateProduct, type Product, fetchUserProducts } from "@/lib/product-api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getImageUrl } from "@/lib/utils"

export default function ProductsPage() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({})

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true)
      try {
        const productsData = await fetchUserProducts()
        setProducts(productsData)
      } catch (error) {
        console.error('Error loading products:', error)
        toast.error("Failed to load products", { duration: 3000 })
      } finally {
        setLoadingProducts(false)
      }
    }
    loadProducts()
  }, [])

  const handleEdit = (product: any) => {
    const uniqueId = product.unique_id || product.uniqueId || product.id?.toString()
    router.push(`/admin/products/${uniqueId}`)
  }

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    const uniqueId = productToDelete.unique_id || productToDelete.uniqueId || productToDelete.id?.toString()
    if (!uniqueId) {
      toast.error("Product unique identifier is missing", { duration: 3000 })
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      return
    }

    setIsDeleting(true)
    try {
      await deleteProduct(uniqueId)
      const productsData = await fetchUserProducts()
      setProducts(productsData)
      toast.success("Product deleted successfully", { duration: 3000 })
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error("Failed to delete product", { duration: 3000 })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async (product: any) => {
    const uniqueId = product.unique_id || product.uniqueId || product.id?.toString()
    if (!uniqueId) {
      toast.error("Product unique identifier is missing", { duration: 3000 })
      return
    }

    const newStatus = !product.status
    setUpdatingStatus({ ...updatingStatus, [uniqueId]: true })

    // Optimistically update UI
    setProducts(products.map(p => {
      const pId = p.unique_id || (p as any).uniqueId || p.id?.toString()
      if (pId === uniqueId) {
        return { ...p, status: newStatus }
      }
      return p
    }))

    try {
      await updateProduct(uniqueId, { status: newStatus })
      toast.success(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`, { duration: 3000 })
    } catch (error) {
      console.error('Error updating product status:', error)
      toast.error("Failed to update product status", { duration: 3000 })
      // Revert optimistic update
      setProducts(products.map(p => {
        const pId = p.unique_id || (p as any).uniqueId || p.id?.toString()
        if (pId === uniqueId) {
          return { ...p, status: !newStatus }
        }
        return p
      }))
    } finally {
      setUpdatingStatus({ ...updatingStatus, [uniqueId]: false })
    }
  }

  // Filter products based on search
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase()
    return (
      product.name?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="p-6 space-y-6 max-w-8xl mx-auto px-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">
            {products.length} {products.length === 1 ? "product" : "products"} total
          </p>
        </div>
        <Button 
          className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white gap-2"
          onClick={() => router.push('/admin/products/new')}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Search Bar */}
      {products.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border-gray-200 rounded-lg"
          />
        </div>
      )}

      {/* Products Grid */}
      {loadingProducts ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#5a9c3a]" />
            <p className="text-gray-500">Loading products...</p>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="p-6 bg-gray-50 rounded-full mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? "No products found" : "No products yet"}
          </h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            {searchQuery 
              ? "Try adjusting your search terms" 
              : "Start by adding your first product to showcase your offerings"}
          </p>
          {!searchQuery && (
            <Button 
              className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white gap-2"
              onClick={() => router.push('/admin/products/new')}
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-[#5a9c3a]/30 transition-all duration-200"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-50 overflow-hidden">
                <img
                  src={product.main_image ? getImageUrl(product.main_image) : "/placeholder.png"}
                  alt={product.name || "Product"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  {product.status ? (
                    <Badge className="bg-emerald-500 text-white text-xs font-medium">
                      <Eye className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500 text-white text-xs font-medium">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#5a9c3a] transition-colors flex-1">
                    {product.name}
                  </h3>
                  {/* Status Toggle */}
                  <div className="ml-2 flex-shrink-0">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.status || false}
                        onChange={() => handleToggleStatus(product)}
                        disabled={updatingStatus[product.unique_id || product.id?.toString() || '']}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#5a9c3a] transition-colors peer-disabled:opacity-50"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3 font-mono">SKU: {product.sku}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-[#5a9c3a]">
                    ${Number(product.price || 0).toFixed(2)}
                  </span>
                  <span className={`text-sm font-medium ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
                    Stock: {product.stock}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="w-4 h-4 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => handleDeleteClick(product)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">"{productToDelete?.name}"</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setProductToDelete(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
