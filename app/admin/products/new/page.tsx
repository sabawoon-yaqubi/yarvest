"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, ArrowLeft, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchUnits, fetchCategories, fetchProductTypes, createProduct, type Unit, type Category, type ProductType } from "@/lib/product-api"
import api from "@/lib/axios"
import { getImageUrl } from "@/lib/utils"
import { toast } from "sonner"

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // API data
  const [units, setUnits] = useState<Unit[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  
  // Form data
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
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error("Failed to load form data")
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  // Set preview when formData.main_image changes
  useEffect(() => {
    if (formData.main_image) {
      setImagePreview(getImageUrl(formData.main_image))
    } else {
      setImagePreview(null)
    }
  }, [formData.main_image])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploadingImage(true)

    try {
      const formDataToUpload = new FormData()
      formDataToUpload.append('image', file)
      formDataToUpload.append('type', 'product')

      const response = await api.post('/upload-image', formDataToUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const imagePath = response.data?.data?.path || response.data?.data?.image
      
      if (imagePath && imagePath.length <= 255) {
        setFormData({ ...formData, main_image: imagePath })
        setImagePreview(getImageUrl(imagePath))
        setImageUrl("")
        toast.success('Image uploaded successfully')
      } else {
        toast.error('Image upload failed. Please try again.')
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.response?.data?.message || 'Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, main_image: "" })
    setImagePreview(null)
    setImageUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    if (url.trim() !== "") {
      setFormData({ ...formData, main_image: url })
      setImagePreview(url)
      if (errors.main_image) setErrors({ ...errors, main_image: "" })
    } else {
      setFormData({ ...formData, main_image: "" })
      setImagePreview(null)
    }
  }

  const handleSave = async () => {
    const validationErrors: Record<string, string> = {}

    // Validate Product Name
    if (!formData.name || formData.name.trim() === "") {
      validationErrors.name = "Product name is required"
    }

    // Validate SKU
    if (!formData.sku || formData.sku.trim() === "") {
      validationErrors.sku = "SKU is required"
    }

    // Validate Category
    if (!formData.product_category_id || formData.product_category_id === "") {
      validationErrors.product_category_id = "Category is required"
    }

    // Validate Product Type
    if (!formData.product_type_id || formData.product_type_id === "") {
      validationErrors.product_type_id = "Product type is required"
    }

    // Validate Unit
    if (!formData.unite_id || formData.unite_id === "") {
      validationErrors.unite_id = "Unit is required"
    }

    // Validate Price
    if (!formData.price || formData.price.trim() === "") {
      validationErrors.price = "Price is required"
    } else {
      const price = Number(formData.price)
      if (isNaN(price) || price <= 0) {
        validationErrors.price = "Price must be greater than 0"
      }
    }

    // Validate Discount
    if (formData.discount && formData.discount.trim() !== "") {
      const discount = Number(formData.discount)
      if (isNaN(discount) || discount < 0 || discount > 100) {
        validationErrors.discount = "Discount must be between 0 and 100"
      }
    }

    // Validate Stock
    if (!formData.stock || formData.stock.trim() === "") {
      validationErrors.stock = "Stock is required"
    } else {
      const stock = Number(formData.stock)
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        validationErrors.stock = "Stock must be a whole number"
      }
    }

    // Validate Description
    if (!formData.details || formData.details.trim() === "") {
      validationErrors.details = "Description is required"
    }

    // Validate Image
    if (!formData.main_image || formData.main_image.trim() === "") {
      validationErrors.main_image = "Product image is required"
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})

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

      await createProduct(payload)
      toast.success("Product created successfully")
      router.push('/admin/products')
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(error.response?.data?.message || "Failed to create product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2 text-gray-600 hover:text-gray-900 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Product</h1>
        </div>
        </div>

      {loadingData ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#5a9c3a]" />
            <p className="text-gray-500">Loading form data...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Product Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Product Image <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 overflow-hidden bg-gray-50 ${errors.main_image ? "border-red-500" : "border-gray-200"}`}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        if (imageUrl) {
                          setErrors({ ...errors, main_image: "Invalid image URL" })
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-gray-50 ${errors.main_image ? "border-red-500" : "border-gray-300"}`}>
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 w-full space-y-2">
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  className={`h-10 border ${errors.main_image ? "border-red-500" : "border-gray-300"}`}
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="text-xs text-gray-500">OR</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                  onChange={(e) => {
                    handleImageSelect(e)
                    if (errors.main_image) setErrors({ ...errors, main_image: "" })
                  }}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploadingImage}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  className={`w-full border-2 border-dashed hover:border-[#5a9c3a] hover:bg-green-50 ${errors.main_image ? "border-red-500" : ""}`}
                  >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                    <Upload className="w-4 h-4 mr-2" />
                      Upload Image File
                    </>
                  )}
                  </Button>
                {errors.main_image && <p className="text-xs text-red-500">{errors.main_image}</p>}
              </div>
            </div>
          </div>

          {/* Product Name - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: "" })
                  }}
                  placeholder="e.g., Organic Tomatoes"
              className={`h-10 border ${errors.name ? "border-red-500" : "border-gray-300"}`}
                />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

          {/* SKU, Category, Type - 3 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-medium text-gray-700">
                SKU <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => {
                    setFormData({ ...formData, sku: e.target.value })
                    if (errors.sku) setErrors({ ...errors, sku: "" })
                  }}
                placeholder="TOMO001"
                className={`h-10 border ${errors.sku ? "border-red-500" : "border-gray-300"}`}
                />
              {errors.sku && <p className="text-xs text-red-500">{errors.sku}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                value={formData.product_category_id}
                onChange={(e) => {
                  setFormData({ ...formData, product_category_id: e.target.value })
                  if (errors.product_category_id) setErrors({ ...errors, product_category_id: "" })
                }}
                className={`w-full h-10 px-3 border rounded-md bg-white text-sm focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a] ${errors.product_category_id ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.product_category_id && <p className="text-xs text-red-500">{errors.product_category_id}</p>}
              </div>
            <div className="space-y-2">
              <Label htmlFor="product_type" className="text-sm font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="product_type"
                value={formData.product_type_id}
                onChange={(e) => {
                  setFormData({ ...formData, product_type_id: e.target.value })
                  if (errors.product_type_id) setErrors({ ...errors, product_type_id: "" })
                }}
                className={`w-full h-10 px-3 border rounded-md bg-white text-sm focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a] ${errors.product_type_id ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select type</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={String(type.id)}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.product_type_id && <p className="text-xs text-red-500">{errors.product_type_id}</p>}
            </div>
          </div>

          {/* Pricing & Inventory - Combined */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Price <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                  min="0"
                    value={formData.price}
                    onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '')
                    setFormData({ ...formData, price: value })
                      if (errors.price) setErrors({ ...errors, price: "" })
                    }}
                    placeholder="0.00"
                  className={`h-10 pl-7 border ${errors.price ? "border-red-500" : "border-gray-300"}`}
                  />
                </div>
              {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount" className="text-sm font-medium text-gray-700">
                Discount (%)
                </Label>
                <div className="relative">
                  <Input
                    id="discount"
                    type="number"
                  step="1"
                  min="0"
                  max="100"
                    value={formData.discount}
                    onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                      setFormData({ ...formData, discount: value })
                      if (errors.discount) setErrors({ ...errors, discount: "" })
                    }
                    }}
                  placeholder="0"
                  className={`h-10 border ${errors.discount ? "border-red-500" : "border-gray-300"}`}
                  />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              {errors.discount && <p className="text-xs text-red-500">{errors.discount}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-medium text-gray-700">
                  Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                min="0"
                step="1"
                  value={formData.stock}
                  onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  setFormData({ ...formData, stock: value })
                    if (errors.stock) setErrors({ ...errors, stock: "" })
                  }}
                  placeholder="0"
                className={`h-10 border ${errors.stock ? "border-red-500" : "border-gray-300"}`}
                />
              {errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </Label>
                <select
                  id="unit"
                  value={formData.unite_id}
                  onChange={(e) => {
                    setFormData({ ...formData, unite_id: e.target.value })
                    if (errors.unite_id) setErrors({ ...errors, unite_id: "" })
                  }}
                  className={`w-full h-10 px-3 border rounded-md bg-white text-sm focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a] ${errors.unite_id ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={String(unit.id)}>
                      {unit.name} {unit.symbol ? `(${unit.symbol})` : ""}
                    </option>
                  ))}
                </select>
              {errors.unite_id && <p className="text-xs text-red-500">{errors.unite_id}</p>}
            </div>
          </div>

          {/* Description */}
              <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
                </Label>
            <textarea
              id="details"
              value={formData.details}
                  onChange={(e) => {
                setFormData({ ...formData, details: e.target.value })
                if (errors.details) setErrors({ ...errors, details: "" })
                  }}
              placeholder="Describe your product..."
              rows={2}
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a] resize-none text-sm ${errors.details ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.details && <p className="text-xs text-red-500">{errors.details}</p>}
              </div>

          {/* Status and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t gap-4">
            <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <label className="relative flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#5a9c3a] transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                <span className="text-sm font-medium text-gray-700">
                      {formData.status ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
                className="h-10 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
                disabled={isLoading}
                className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white h-10 px-6 w-full sm:w-auto"
            >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
            </Button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
