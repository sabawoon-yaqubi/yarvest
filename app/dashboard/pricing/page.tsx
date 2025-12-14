"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Loader2, Save, X } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

export default function PricingPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const [pricing, setPricing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    distance: '',
    price: ''
  })

  useEffect(() => {
    if (!authLoading && user) {
      fetchPricing()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchPricing = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/pricing')
      const pricingData = response.data?.data || response.data || null
      setPricing(pricingData)
      if (pricingData) {
        setFormData({
          distance: pricingData.distance || '',
          price: pricingData.price || ''
        })
      }
    } catch (error: any) {
      console.error('Error fetching pricing:', error)
      if (error.response?.status === 401) {
        toast.error('Please log in to view pricing')
      } else if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load pricing')
      }
      setPricing(null)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setErrors({})
    if (pricing) {
      setFormData({
        distance: pricing.distance || '',
        price: pricing.price || ''
      })
    } else {
      setFormData({
        distance: '',
        price: ''
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setErrors({})
    
    // Validate form
    const newErrors: Record<string, string> = {}
    if (!formData.distance.trim()) {
      newErrors.distance = 'Distance is required'
    } else if (isNaN(parseFloat(formData.distance)) || parseFloat(formData.distance) <= 0) {
      newErrors.distance = 'Distance must be a positive number'
    }
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required'
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    try {
      setSaving(true)
      await api.put('/user/pricing', {
        distance: formData.distance,
        price: parseFloat(formData.price)
      })
      toast.success('Pricing updated successfully')
      setDialogOpen(false)
      setErrors({})
      await fetchPricing()
    } catch (error: any) {
      console.error('Error saving pricing:', error)
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        toast.error(error.response?.data?.message || 'Failed to save pricing')
      }
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: COLORS.primary }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pricing</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your delivery pricing</p>
          </div>
          <Button
            onClick={handleOpenDialog}
            style={{ backgroundColor: COLORS.primary }}
            className="text-white hover:opacity-90"
          >
            {pricing ? 'Edit Pricing' : 'Set Pricing'}
          </Button>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: COLORS.primary }} />
              Delivery Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {pricing ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Distance (miles)</p>
                  <p className="text-lg font-semibold text-gray-900">{pricing.distance || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Price per Distance</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${parseFloat(pricing.price || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No pricing set yet</p>
                <Button
                  onClick={handleOpenDialog}
                  style={{ backgroundColor: COLORS.primary }}
                  className="text-white hover:opacity-90"
                >
                  Set Pricing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>{pricing ? 'Edit Pricing' : 'Set Pricing'}</DialogTitle>
            <DialogDescription>
              Set your delivery pricing based on distance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="distance">Distance (miles)</Label>
              <Input
                id="distance"
                type="number"
                value={formData.distance}
                onChange={(e) => {
                  setFormData({ ...formData, distance: e.target.value })
                  if (errors.distance) setErrors({ ...errors, distance: '' })
                }}
                placeholder="e.g., 5"
                className={`mt-1 ${errors.distance ? 'border-red-500' : ''}`}
              />
              {errors.distance && (
                <p className="text-sm text-red-500 mt-1">{errors.distance}</p>
              )}
            </div>
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value })
                  if (errors.price) setErrors({ ...errors, price: '' })
                }}
                placeholder="e.g., 10.00"
                className={`mt-1 ${errors.price ? 'border-red-500' : ''}`}
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price}</p>
              )}
            </div>
          </div>
          <DialogFooter className="pt-4 gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: COLORS.primary }}
              className="text-white hover:opacity-90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

