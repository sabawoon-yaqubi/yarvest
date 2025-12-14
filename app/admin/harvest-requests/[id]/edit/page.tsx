"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Leaf, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { updateHarvestRequest, fetchHarvestRequest, fetchUserAddresses, type Address } from "@/lib/harvest-requests-api"
import { fetchUserProducts, type Product } from "@/lib/product-api"
import { toast } from "sonner"

export default function EditHarvestRequestPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  
  const [formData, setFormData] = useState({
    product_ids: [] as number[],
    address_ids: [] as number[],
    date: "",
    number_of_people: "",
    description: "",
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch existing request data, products and addresses on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true)
      try {
        const [requestData, productsData, addressesData] = await Promise.all([
          fetchHarvestRequest(requestId),
          fetchUserProducts(),
          fetchUserAddresses(),
        ])
        
        if (!requestData) {
          toast.error("Harvest request not found")
          router.push('/admin/harvest-requests')
          return
        }
        
        setProducts(productsData)
        setAddresses(addressesData)
        
        // Pre-fill form with existing request data
        if (requestData.products && requestData.products.length > 0) {
          const productIds = requestData.products.map(p => p.id)
          setFormData(prev => ({
            ...prev,
            product_ids: productIds,
          }))
        } else if (requestData.product?.id) {
          setFormData(prev => ({
            ...prev,
            product_ids: [requestData.product.id],
          }))
        }
        
        // Handle address - harvest requests typically have one address
        if (requestData.address?.id) {
          setFormData(prev => ({
            ...prev,
            address_ids: [requestData.address.id],
          }))
        }
        
        // Set other fields
        setFormData(prev => ({
          ...prev,
          date: requestData.date || requestData.requested_date || "",
          number_of_people: requestData.number_of_people?.toString() || "",
          description: requestData.description || "",
        }))
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error("Failed to load harvest request data")
        router.push('/admin/harvest-requests')
      } finally {
        setLoadingData(false)
      }
    }
    
    if (requestId) {
      loadData()
    }
  }, [requestId, router])

  const handleSave = async () => {
    const validationErrors: Record<string, string> = {}

    // Validate Products
    if (formData.product_ids.length === 0) {
      validationErrors.product_ids = "Please select at least one product"
    }

    // Validate Addresses
    if (formData.address_ids.length === 0) {
      validationErrors.address_ids = "Please select at least one address"
    }

    // Validate Date
    if (!formData.date || formData.date.trim() === "") {
      validationErrors.date = "Harvest date is required"
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const payload: any = {
        date: formData.date,
      }

      // Use product_ids if multiple, product_id if single
      if (formData.product_ids.length === 1) {
        payload.product_id = formData.product_ids[0]
      } else {
        payload.product_ids = formData.product_ids
      }

      // Use user_address_id (single address for updates)
      if (formData.address_ids.length > 0) {
        payload.user_address_id = formData.address_ids[0]
      }

      // Optional fields
      if (formData.number_of_people) {
        payload.number_of_people = Number(formData.number_of_people)
      }
      if (formData.description) {
        payload.description = formData.description
      }

      await updateHarvestRequest(requestId, payload)
      
      // Navigate back to harvest requests list
      router.push('/admin/harvest-requests')
    } catch (error) {
      console.error('Error updating harvest request:', error)
      // Error is already handled in the API service with toast
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A5D31]" />
          <p className="text-gray-600">Loading harvest request data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto px-10">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-[#5a9c3a]" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Harvest Request</h1>
        </div>
        <div className="w-20"></div>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
        {/* Products Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Products <span className="text-red-500">*</span>
          </Label>
          <div className={`border rounded-md p-2 bg-white ${
            errors.product_ids ? 'border-red-300' : 'border-gray-300'
          }`}>
            {products.length === 0 ? (
              <p className="text-sm text-gray-500 py-2 text-center">No products available</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {products.map((product) => {
                  const isSelected = formData.product_ids.includes(product.id)
                  return (
                    <label
                      key={product.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              product_ids: [...formData.product_ids, product.id],
                            })
                            if (errors.product_ids) {
                              setErrors({ ...errors, product_ids: "" })
                            }
                          } else {
                            setFormData({
                              ...formData,
                              product_ids: formData.product_ids.filter((id) => id !== product.id),
                            })
                          }
                        }}
                        className="w-4 h-4 text-[#5a9c3a] border-gray-300 rounded focus:ring-[#5a9c3a] focus:ring-1"
                      />
                      <span className="text-sm text-gray-900">{product.name}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
          {errors.product_ids && (
            <p className="text-xs text-red-600 mt-1">{errors.product_ids}</p>
          )}
          {formData.product_ids.length > 0 && !errors.product_ids && (
            <p className="text-xs text-gray-500 mt-1">
              {formData.product_ids.length} selected
            </p>
          )}
        </div>

        {/* Addresses Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Addresses <span className="text-red-500">*</span>
          </Label>
          <div className={`border rounded-md p-2 bg-white ${
            errors.address_ids ? 'border-red-300' : 'border-gray-300'
          }`}>
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500 py-2 text-center">No addresses available</p>
            ) : (
              <div className="space-y-1.5">
                {addresses.map((address) => {
                  const isSelected = formData.address_ids.includes(address.id)
                  const formatAddress = () => {
                    const parts = [
                      address.street_address,
                      address.apt && `Apt ${address.apt}`,
                      address.city,
                      address.state,
                      address.postal_code,
                    ].filter(Boolean)
                    return parts.join(", ")
                  }
                  return (
                    <label
                      key={address.id}
                      className="flex items-start gap-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // For edit, allow only one address selection
                            setFormData({
                              ...formData,
                              address_ids: [address.id],
                            })
                            if (errors.address_ids) {
                              setErrors({ ...errors, address_ids: "" })
                            }
                          } else {
                            setFormData({
                              ...formData,
                              address_ids: [],
                            })
                          }
                        }}
                        className="w-4 h-4 mt-0.5 text-[#0A5D31] border-gray-300 rounded focus:ring-[#0A5D31] focus:ring-1"
                      />
                      <div className="flex-1 min-w-0">
                        {address.business_name && (
                          <span className="text-sm font-medium text-gray-900 block truncate">
                            {address.business_name}
                          </span>
                        )}
                        <span className="text-xs text-gray-600 block truncate">{formatAddress()}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
          {errors.address_ids && (
            <p className="text-xs text-red-600 mt-1">{errors.address_ids}</p>
          )}
          {formData.address_ids.length > 0 && !errors.address_ids && (
            <p className="text-xs text-gray-500 mt-1">
              {formData.address_ids.length} selected
            </p>
          )}
        </div>

        {/* Date and Number of People in Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Harvest Date */}
          <div>
            <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Harvest Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value })
                if (errors.date) {
                  setErrors({ ...errors, date: "" })
                }
              }}
              min={new Date().toISOString().split('T')[0]}
              className={`h-9 border text-sm ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              } focus:border-[#5a9c3a] focus:ring-[#5a9c3a]`}
            />
            {errors.date && (
              <p className="text-xs text-red-600 mt-1">{errors.date}</p>
            )}
          </div>

          {/* Number of People */}
          <div>
            <Label htmlFor="number_of_people" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Number of People
            </Label>
            <Input
              id="number_of_people"
              type="number"
              value={formData.number_of_people}
              onChange={(e) => setFormData({ ...formData, number_of_people: e.target.value })}
              placeholder="Optional"
              min="1"
              className="h-9 border border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a] text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Description
          </Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Additional details or instructions..."
            rows={3}
            className="w-full p-2.5 border border-gray-300 focus:ring-1 focus:ring-[#5a9c3a] focus:border-[#5a9c3a] resize-none text-sm rounded-md"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-3 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Request"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

