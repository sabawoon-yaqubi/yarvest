"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, Plus, Edit, Trash2, Loader2, Save, X } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const COLORS = {
  primary: "#5a9c3a",
  primaryDark: "#0d7a3f",
  primaryLight: "#7ab856",
  accent: "#e8f5e9",
}

export default function VehiclesPage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null as number | null })
  const [editingVehicle, setEditingVehicle] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    type: '',
    licence_plate: '',
    model: ''
  })

  useEffect(() => {
    if (!authLoading && user) {
      fetchVehicles()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/vehicles')
      const data = response.data?.data || response.data || []
      setVehicles(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error fetching vehicles:', error)
      if (error.response?.status === 401) {
        toast.error('Please log in to view vehicles')
      } else if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load vehicles')
      }
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (vehicle?: any) => {
    setErrors({})
    if (vehicle) {
      setEditingVehicle(vehicle)
      setFormData({
        type: vehicle.type || '',
        licence_plate: vehicle.licence_plate || '',
        model: vehicle.model || ''
      })
    } else {
      setEditingVehicle(null)
      setFormData({
        type: '',
        licence_plate: '',
        model: ''
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setErrors({})
    
    // Validate form
    const newErrors: Record<string, string> = {}
    if (!formData.type.trim()) {
      newErrors.type = 'Vehicle type is required'
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required'
    }
    if (!formData.licence_plate.trim()) {
      newErrors.licence_plate = 'License plate is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    try {
      setSaving(true)
      if (editingVehicle) {
        await api.put(`/user/vehicles/${editingVehicle.id}`, formData)
        toast.success('Vehicle updated successfully')
      } else {
        await api.post('/user/vehicles', formData)
        toast.success('Vehicle added successfully')
      }
      setDialogOpen(false)
      setErrors({})
      await fetchVehicles()
    } catch (error: any) {
      console.error('Error saving vehicle:', error)
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        toast.error(error.response?.data?.message || 'Failed to save vehicle')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.id) return
    try {
      await api.delete(`/user/vehicles/${deleteDialog.id}`)
      toast.success('Vehicle deleted successfully')
      setDeleteDialog({ open: false, id: null })
      await fetchVehicles()
    } catch (error: any) {
      console.error('Error deleting vehicle:', error)
      toast.error(error.response?.data?.message || 'Failed to delete vehicle')
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
      <div className="max-w-8xl mx-auto px-10 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your delivery vehicles</p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            style={{ backgroundColor: COLORS.primary }}
            className="text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {vehicles.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles</h3>
              <p className="text-gray-500 mb-6">Add your first vehicle for deliveries</p>
              <Button
                onClick={() => handleOpenDialog()}
                style={{ backgroundColor: COLORS.primary }}
                className="text-white hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Vehicle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" style={{ color: COLORS.primary }} />
                    {vehicle.model || 'Vehicle'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Type</p>
                      <p className="text-sm font-medium text-gray-900">{vehicle.type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Model</p>
                      <p className="text-sm font-medium text-gray-900">{vehicle.model || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">License Plate</p>
                      <p className="text-sm font-medium text-gray-900">{vehicle.licence_plate || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(vehicle)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, id: vehicle.id })}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
            <DialogDescription>
              {editingVehicle ? 'Update your vehicle information' : 'Add a new vehicle for deliveries'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Vehicle Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => {
                  setFormData({ ...formData, type: e.target.value })
                  if (errors.type) setErrors({ ...errors, type: '' })
                }}
                placeholder="e.g., Car, Truck, Motorcycle"
                className={`mt-1 ${errors.type ? 'border-red-500' : ''}`}
              />
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type}</p>
              )}
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => {
                  setFormData({ ...formData, model: e.target.value })
                  if (errors.model) setErrors({ ...errors, model: '' })
                }}
                placeholder="e.g., Toyota Camry 2020"
                className={`mt-1 ${errors.model ? 'border-red-500' : ''}`}
              />
              {errors.model && (
                <p className="text-sm text-red-500 mt-1">{errors.model}</p>
              )}
            </div>
            <div>
              <Label htmlFor="licence_plate">License Plate</Label>
              <Input
                id="licence_plate"
                value={formData.licence_plate}
                onChange={(e) => {
                  setFormData({ ...formData, licence_plate: e.target.value })
                  if (errors.licence_plate) setErrors({ ...errors, licence_plate: '' })
                }}
                placeholder="License plate number"
                className={`mt-1 ${errors.licence_plate ? 'border-red-500' : ''}`}
              />
              {errors.licence_plate && (
                <p className="text-sm text-red-500 mt-1">{errors.licence_plate}</p>
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

