"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, ImageIcon } from "lucide-react"
import type { Unit, Category, ProductType } from "@/lib/product-api"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: {
    main_image: string
    name: string
    sku: string
    price: string
    discount: string
    unite_id: string
    stock: string
    product_category_id: string
    product_type_id: string
    status: boolean
    excerpt: string
    details: string
  }
  setFormData: React.Dispatch<React.SetStateAction<{
    main_image: string
    name: string
    sku: string
    price: string
    discount: string
    unite_id: string
    stock: string
    product_category_id: string
    product_type_id: string
    status: boolean
    excerpt: string
    details: string
  }>>
  editingProduct: any | null
  isGenerating: boolean
  isLoading: boolean
  loadingData: boolean
  units: Unit[]
  categories: Category[]
  productTypes: ProductType[]
  onAIGenerate: () => void
  onSave: () => void
}

export function ProductDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  editingProduct,
  isGenerating,
  isLoading,
  loadingData,
  units,
  categories,
  productTypes,
  onAIGenerate,
  onSave,
}: ProductDialogProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0 gap-0 bg-white border-gray-200 shadow-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] text-white">
          <DialogTitle className="text-xl font-bold">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription className="text-gray-100 text-sm">
            {editingProduct ? "Update product information" : "Create a new product listing"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* AI Generate Button */}
          {!editingProduct && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0A5D31] to-[#0d7a3f]">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">AI Generate</h4>
                  <p className="text-xs text-gray-600">Generate product details instantly</p>
                </div>
              </div>
              <Button
                onClick={onAIGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#0A5D31] text-white gap-2 px-4 h-9 text-sm rounded-lg"
              >
                <Sparkles className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          )}

          {/* Product Image */}
          <div>
            <Label className="text-sm font-semibold text-gray-700">Product Image URL</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.main_image}
                onChange={(e) => setFormData({ ...formData, main_image: e.target.value })}
                className="h-9 border-gray-200 focus:border-[#0A5D31] focus:ring-[#0A5D31] text-sm"
              />
              <Button
                variant="outline"
                type="button"
                className="h-9 w-9 border-gray-200 hover:bg-[#0A5D31]/5 hover:border-[#0A5D31]"
              >
                <ImageIcon className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
            {formData.main_image && (
              <div className="mt-2 inline-block">
                <img
                  src={formData.main_image || "/placeholder.svg"}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Organic Tomatoes"
                className="mt-1.5 h-9 border-gray-200 focus:border-[#0A5D31] focus:ring-[#0A5D31] text-sm"
              />
            </div>
            <div>
              <Label htmlFor="code" className="text-sm font-semibold text-gray-700">
                SKU Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., TOMO001"
                className="mt-1.5 h-9 border-gray-200 focus:border-[#0A5D31] focus:ring-[#0A5D31] text-sm"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                Price <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="h-9 pl-7 border-gray-200 focus:border-[#0A5D31] focus:ring-[#0A5D31] text-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="discount" className="text-sm font-semibold text-gray-700">
                Discount
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="0.00"
                  className="h-9 pl-7 border-gray-200 focus:border-[#0A5D31] focus:ring-[#0A5D31] text-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="unit" className="text-sm font-semibold text-gray-700">
                Unit <span className="text-red-500">*</span>
              </Label>
              <select
                id="unit"
                value={formData.unite_id}
                onChange={(e) => setFormData({ ...formData, unite_id: e.target.value })}
                disabled={loadingData}
                className="mt-1.5 w-full h-9 px-3 border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#0A5D31] focus:border-[#0A5D31] rounded-md"
              >
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={String(unit.id)}>
                    {unit.name} {unit.symbol ? `(${unit.symbol})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="stock" className="text-sm font-semibold text-gray-700">
                Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                className="mt-1.5 h-9 border-gray-200 focus:border-[#0A5D31] focus:ring-[#0A5D31] text-sm"
              />
            </div>
          </div>

          {/* Classification */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                value={formData.product_category_id}
                onChange={(e) => setFormData({ ...formData, product_category_id: e.target.value })}
                disabled={loadingData}
                className="mt-1.5 w-full h-9 px-3 border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#0A5D31] focus:border-[#0A5D31] rounded-md"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="product_type" className="text-sm font-semibold text-gray-700">
                Product Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="product_type"
                value={formData.product_type_id}
                onChange={(e) => setFormData({ ...formData, product_type_id: e.target.value })}
                disabled={loadingData}
                className="mt-1.5 w-full h-9 px-3 border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-[#0A5D31] focus:border-[#0A5D31] rounded-md"
              >
                <option value="">Select type</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={String(type.id)}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="relative flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#0A5D31] transition-all"></div>
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700">Active Status</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="excerpt" className="text-sm font-semibold text-gray-700">
                Short Description
              </Label>
              <Input
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief product summary..."
                className="mt-1.5 h-9 border-gray-200 focus:border-[#0A5D31] focus:ring-[#0A5D31] text-sm"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Full Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Describe your product in detail..."
                rows={3}
                className="mt-1.5 w-full p-2.5 border border-gray-200 focus:ring-2 focus:ring-[#0A5D31] focus:border-[#0A5D31] resize-none text-sm rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 text-sm border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-[#0A5D31] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#0A5D31] text-white h-9 px-6 text-sm font-semibold"
            onClick={onSave}
            disabled={isLoading || loadingData}
          >
            {isLoading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
