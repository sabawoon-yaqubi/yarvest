"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Filter,
  Grid3x3,
  List,
  MoreVertical
} from "lucide-react"
import { useState, useEffect } from "react"
import { fetchUnits, fetchCategories, fetchProductTypes, createProduct, updateProduct, deleteProduct, type Unit, type Category, type ProductType, type Product, fetchUserProducts } from "@/lib/product-api"
import { ProductDialog } from "@/components/admin/product-dialog"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // API data
  const [units, setUnits] = useState<Unit[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  
  // Form data matching backend schema
  const [formData, setFormData] = useState({
    name: "",
    product_category_id: "",
    product_type_id: "",
    unite_id: "",
    price: "",
    discount: "0",
    stock: "",
    sku: "",
    status: true,
    main_image: "",
    excerpt: "",
    details: "",
  })

  // Fetch units, categories, and product types on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true)
      try {
        const [unitsData, categoriesData, productTypesData] = await Promise.all([
          fetchUnits(),
          fetchCategories(),
          fetchProductTypes(),
        ])
        setUnits(unitsData)
        setCategories(categoriesData)
        setProductTypes(productTypesData)
        console.log('Loaded product types:', productTypesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true)
      try {
        const productsData = await fetchUserProducts()
        setProducts(productsData)
        console.log('Loaded products:', productsData)
        // Log first product structure for debugging
        if (productsData.length > 0) {
          console.log('Sample product structure:', productsData[0])
          console.log('Sample product keys:', Object.keys(productsData[0]))
        }
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }
    loadProducts()
  }, [])

  const handleAIGenerate = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      setFormData({
        ...formData,
        name: "Premium Organic Kale",
        excerpt: "Nutrient-dense organic kale perfect for salads, smoothies, or sautéing.",
        details: "Nutrient-dense organic kale perfect for salads, smoothies, or sautéing. Grown using sustainable farming practices without pesticides. Rich in vitamins A, C, and K, with a fresh, earthy flavor that enhances any dish. Harvested at peak freshness to ensure maximum nutritional value and taste.",
        sku: "KALE" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        price: "3.79",
        discount: "0",
        stock: "50",
        // Note: product_category_id, product_type_id, and unite_id should be selected manually
      })
      setIsGenerating(false)
    }, 2000)
  }

  const handleSave = async () => {
    // Comprehensive validation
    const errors: string[] = []

    if (!formData.name || formData.name.trim() === "") {
      errors.push("Product name is required")
    }

    if (!formData.sku || formData.sku.trim() === "") {
      errors.push("SKU code is required")
    }

    if (!formData.product_category_id || formData.product_category_id === "") {
      errors.push("Category is required")
    }

    if (!formData.product_type_id || formData.product_type_id === "") {
      errors.push("Product type is required")
    }

    if (!formData.unite_id || formData.unite_id === "") {
      errors.push("Unit is required")
    }

    if (!formData.price || formData.price.trim() === "") {
      errors.push("Price is required")
    } else {
      const price = Number(formData.price)
      if (isNaN(price) || price <= 0) {
        errors.push("Price must be a positive number")
      }
    }

    if (formData.discount && formData.discount.trim() !== "") {
      const discount = Number(formData.discount)
      if (isNaN(discount) || discount < 0) {
        errors.push("Discount must be a non-negative number")
      }
    }

    if (!formData.stock || formData.stock.trim() === "") {
      errors.push("Stock quantity is required")
    } else {
      const stock = Number(formData.stock)
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        errors.push("Stock must be a non-negative integer")
      }
    }

    if (!formData.details || formData.details.trim() === "") {
      errors.push("Full description is required")
    }

    if (errors.length > 0) {
      toast.error(errors[0])
      if (errors.length > 1) {
        console.warn("Validation errors:", errors)
      }
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        name: formData.name.trim(),
        product_category_id: Number(formData.product_category_id),
        product_type_id: Number(formData.product_type_id),
        unite_id: Number(formData.unite_id),
        price: Number(formData.price),
        discount: Number(formData.discount) || 0,
        stock: Number(formData.stock),
        sku: formData.sku.trim(),
        status: formData.status,
        main_image: formData.main_image?.trim() || "",
        excerpt: formData.excerpt?.trim() || "",
        details: formData.details.trim(),
      }

      if (editingProduct) {
        // Use unique_id if available, otherwise fall back to id
        const uniqueId = editingProduct.unique_id || editingProduct.uniqueId || editingProduct.id?.toString()
        if (!uniqueId) {
          throw new Error("Product unique identifier is missing")
        }
        await updateProduct(uniqueId, payload)
      } else {
        await createProduct(payload)
      }

      // Refresh products list
      const productsData = await fetchUserProducts()
      setProducts(productsData)

      // Reset form and close modal
      setShowAddModal(false)
      setEditingProduct(null)
      setFormData({
        name: "",
        product_category_id: "",
        product_type_id: "",
        unite_id: "",
        price: "",
        discount: "0",
        stock: "",
        sku: "",
        status: true,
        main_image: "",
        excerpt: "",
        details: "",
      })
    } catch (error) {
      console.error('Error saving product:', error)
      // Error is already handled in the API service with toast
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product: any) => {
    console.log('Editing product:', product)
    setEditingProduct(product)
    
    // Handle different possible field name variations
    // Use nullish coalescing and explicit checks to handle 0 values correctly
    const categoryId = product.product_category_id ?? product.category_id ?? product.category?.id ?? product.product_category?.id ?? null
    const typeId = product.product_type_id ?? product.type_id ?? product.product_type?.id ?? product.type?.id ?? null
    const unitId = product.unite_id ?? product.unit_id ?? product.unit?.id ?? null
    
    console.log('Extracted IDs - Category:', categoryId, 'Type:', typeId, 'Unit:', unitId)
    console.log('Available product fields:', Object.keys(product))
    
    const formDataToSet = {
      name: product.name || "",
      product_category_id: categoryId !== null && categoryId !== undefined ? String(categoryId) : "",
      product_type_id: typeId !== null && typeId !== undefined ? String(typeId) : "",
      unite_id: unitId !== null && unitId !== undefined ? String(unitId) : "",
      price: product.price?.toString() || "",
      discount: product.discount?.toString() || "0",
      stock: product.stock?.toString() || "",
      sku: product.sku || product.code || "",
      status: product.status !== undefined ? product.status : true,
      main_image: product.main_image || product.image || "",
      excerpt: product.excerpt || "",
      details: product.details || product.description || "",
    }
    
    // Verify IDs exist in the arrays
    const categoryExists = categories.some(c => String(c.id) === formDataToSet.product_category_id)
    const unitExists = units.some(u => String(u.id) === formDataToSet.unite_id)
    const typeExists = productTypes.some(t => String(t.id) === formDataToSet.product_type_id)
    
    console.log('Setting form data:', formDataToSet)
    console.log('Available units:', units.map(u => ({ id: u.id, name: u.name })))
    console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })))
    console.log('ID validation - Category exists:', categoryExists, 'Unit exists:', unitExists, 'Type exists:', typeExists)
    
    if (!categoryExists && formDataToSet.product_category_id) {
      console.warn('Category ID not found in categories array:', formDataToSet.product_category_id)
    }
    if (!unitExists && formDataToSet.unite_id) {
      console.warn('Unit ID not found in units array:', formDataToSet.unite_id)
    }
    if (!typeExists && formDataToSet.product_type_id) {
      console.warn('Product Type ID not found in productTypes array:', formDataToSet.product_type_id)
    }
    
    setFormData(formDataToSet)
    setShowAddModal(true)
  }

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    // Get unique_id for deletion
    const uniqueId = productToDelete.unique_id || productToDelete.uniqueId || productToDelete.id?.toString()
    if (!uniqueId) {
      toast.error("Product unique identifier is missing")
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      return
    }

    setIsDeleting(true)
    try {
      await deleteProduct(uniqueId)
      // Refresh products list
      const productsData = await fetchUserProducts()
      setProducts(productsData)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error) {
      console.error('Error deleting product:', error)
      // Error is already handled in the API service with toast
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Manage your product listings and inventory</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#0A5D31] text-white gap-2 shadow-lg"
          onClick={() => {
            setEditingProduct(null)
            setFormData({
              name: "",
              product_category_id: "",
              product_type_id: "",
              unite_id: "",
              price: "",
              discount: "0",
              stock: "",
              sku: "",
              status: true,
              main_image: "",
              excerpt: "",
              details: "",
            })
            setShowAddModal(true)
          }}
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-2"
              />
            </div>
            <div className="flex gap-3">
              <select className="px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#0A5D31] focus:border-[#0A5D31] h-12">
                <option>All Categories</option>
                <option>Vegetables</option>
                <option>Fruits</option>
                <option>Herbs</option>
              </select>
              <select className="px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#0A5D31] focus:border-[#0A5D31] h-12">
                <option>All Status</option>
                <option>Active</option>
                <option>Out of Stock</option>
                <option>Draft</option>
              </select>
              <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={`h-12 w-12 rounded-none ${viewMode === "grid" ? "bg-[#0A5D31] text-white" : ""}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={`h-12 w-12 rounded-none ${viewMode === "list" ? "bg-[#0A5D31] text-white" : ""}`}
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid/List */}
      {loadingProducts ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="border-2 hover:shadow-2xl transition-all duration-300 overflow-hidden group">
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                  src={product.main_image || "/placeholder.svg"}
                  alt={product.name || "Product"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {product.status ? (
                    <Badge className="bg-emerald-500 text-white border-0">
                      <Eye className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500 text-white border-0">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-5">
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">SKU: {product.sku}</p>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-[#0A5D31]">${Number(product.price || 0).toFixed(2)}</span>
                    {Number(product.discount || 0) > 0 && (
                      <span className="text-sm text-gray-400 line-through ml-2">${(Number(product.price || 0) + Number(product.discount || 0)).toFixed(2)}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className={`font-bold ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {product.stock}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-2 hover:border-[#0A5D31] hover:bg-[#0A5D31] hover:text-white transition-all"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => handleDeleteClick(product)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="border-2 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={product.main_image || "/placeholder.svg"} alt={product.name || "Product"} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl text-gray-900">{product.name}</h3>
                          {product.status ? (
                            <Badge className="bg-emerald-500 text-white">Active</Badge>
                          ) : (
                            <Badge className="bg-red-500 text-white">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 font-mono mb-2">SKU: {product.sku}</p>
                        <p className="text-sm text-gray-600">{product.excerpt || product.details}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="text-2xl font-bold text-[#0A5D31]">
                            ${Number(product.price || 0).toFixed(2)}
                            {Number(product.discount || 0) > 0 && (
                              <span className="text-sm text-gray-400 line-through ml-2">${(Number(product.price || 0) + Number(product.discount || 0)).toFixed(2)}</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Stock</p>
                          <p className={`text-xl font-bold ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {product.stock} units
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <ProductDialog
        open={showAddModal}
        onOpenChange={setShowAddModal}
        formData={formData}
        setFormData={setFormData}
        editingProduct={editingProduct}
        isGenerating={isGenerating}
        isLoading={isLoading}
        loadingData={loadingData}
        units={units}
        categories={categories}
        productTypes={productTypes}
        onAIGenerate={handleAIGenerate}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Delete Product
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-600 pt-2">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{productToDelete?.name}"</span>?
              <br />
              <br />
              <span className="text-red-600 font-medium">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setProductToDelete(null)
              }}
              disabled={isDeleting}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white h-10"
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
