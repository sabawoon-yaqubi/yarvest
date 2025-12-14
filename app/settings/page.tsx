"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  User, Mail, Phone, MapPin, Edit, Save, X, 
  Settings, Bell, Shield, LogOut, Loader2, 
  CheckCircle2, Camera, Calendar,
  Award, Truck, HeartHandshake, Trash2,
  Building2, Users
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { RoleManagement } from "@/components/role-management"
import { AddressList } from "@/components/address-list"
import api from "@/lib/axios"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"
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

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const refreshUser = useAuthStore((state) => state.refreshUser)
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })
  
  const [helperSettings, setHelperSettings] = useState({
    availablity: true,
    delivery_radius: null as number | null,
    work_per_day: null as number | null,
    start_time: null as string | null,
    end_time: null as string | null,
    days_of_week: [] as number[],
  })
  
  const [courierSettings, setCourierSettings] = useState({
    availablity: true,
    delivery_radius: null as number | null,
    work_per_day: null as number | null,
    start_time: null as string | null,
    end_time: null as string | null,
    days_of_week: [] as number[],
  })
  
  const [notifications, setNotifications] = useState<Array<{id: number, name: string, enabled: boolean}>>([])

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const [userResponse, addressesResponse, settingsResponse, notificationsResponse] = await Promise.all([
        api.get('/user'),
        api.get('/addresses').catch(() => ({ data: { data: [] } })),
        api.get('/user/settings').catch(() => ({ data: { data: {} } })),
        api.get('/user/notifications').catch(() => ({ data: { data: [] } }))
      ])
      
      setUserData(userResponse.data)
      setAddresses(addressesResponse.data?.data || [])
      
      if (settingsResponse.data?.data) {
        if (settingsResponse.data.data.helper) {
          setHelperSettings({
            availablity: settingsResponse.data.data.helper.availablity ?? true,
            delivery_radius: settingsResponse.data.data.helper.delivery_radius,
            work_per_day: settingsResponse.data.data.helper.work_per_day,
            start_time: settingsResponse.data.data.helper.start_time,
            end_time: settingsResponse.data.data.helper.end_time,
            days_of_week: settingsResponse.data.data.helper.days_of_week || [],
          })
        }
        if (settingsResponse.data.data.courier) {
          setCourierSettings({
            availablity: settingsResponse.data.data.courier.availablity ?? true,
            delivery_radius: settingsResponse.data.data.courier.delivery_radius,
            work_per_day: settingsResponse.data.data.courier.work_per_day,
            start_time: settingsResponse.data.data.courier.start_time,
            end_time: settingsResponse.data.data.courier.end_time,
            days_of_week: settingsResponse.data.data.courier.days_of_week || [],
          })
        }
      }
      
      if (notificationsResponse.data?.data) {
        setNotifications(notificationsResponse.data.data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load settings data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userData) {
      setProfile({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
      })
    }
  }, [userData])

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.put('/user', {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
      })
      
      await refreshUser()
      await fetchUserData()
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('profile_picture', file)

      const response = await api.put('/user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data?.data) {
        setUserData({
          ...userData,
          profile_picture: response.data.data.profile_picture,
          image: response.data.data.image,
        })
      }

      await refreshUser()
      await fetchUserData()
      
      setTimeout(() => {
        setImagePreview(null)
      }, 500)
      
      toast.success('Profile picture updated successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.response?.data?.message || 'Failed to upload image')
      setImagePreview(null)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }
  
  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview
    if (userData?.profile_picture) {
      return getImageUrl(userData.profile_picture)
    }
    if (userData?.image) {
      return getImageUrl(userData.image)
    }
    return null
  }
  
  const handleSaveHelperSettings = async () => {
    try {
      await api.put('/user/settings', {
        type: 'helper',
        ...helperSettings,
      })
      toast.success('Helper settings updated successfully')
      await fetchUserData()
    } catch (error: any) {
      console.error('Error saving helper settings:', error)
      toast.error(error.response?.data?.message || 'Failed to update helper settings')
    }
  }
  
  const handleSaveCourierSettings = async () => {
    try {
      await api.put('/user/settings', {
        type: 'courier',
        ...courierSettings,
      })
      toast.success('Courier settings updated successfully')
      await fetchUserData()
    } catch (error: any) {
      console.error('Error saving courier settings:', error)
      toast.error(error.response?.data?.message || 'Failed to update courier settings')
    }
  }
  
  const toggleDayOfWeek = (
    settings: typeof helperSettings, 
    setSettings: React.Dispatch<React.SetStateAction<typeof helperSettings>>, 
    day: number
  ) => {
    setSettings({
      ...settings,
      days_of_week: settings.days_of_week.includes(day)
        ? settings.days_of_week.filter(d => d !== day)
        : [...settings.days_of_week, day].sort()
    })
  }
  
  const hasHelperRole = userData?.roles?.some((r: any) => r.name === 'Helper')
  const hasCourierRole = userData?.roles?.some((r: any) => r.name === 'Courier')
  
  const daysOfWeek = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' },
  ]
  
  const handleSaveNotifications = async () => {
    try {
      const enabledIds = notifications.filter(n => n.enabled).map(n => n.id)
      await api.put('/user/notifications', { notification_item_ids: enabledIds })
      toast.success('Notification preferences updated successfully')
      await fetchUserData()
    } catch (error: any) {
      console.error('Error saving notifications:', error)
      toast.error(error.response?.data?.message || 'Failed to update notifications')
    }
  }
  
  const handleToggleNotification = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    )
  }

  const handleCancel = () => {
    if (userData) {
      setProfile({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
      })
    }
    setIsEditing(false)
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      await api.delete('/user')
      toast.success('Your account has been deleted successfully')
      await logout()
      router.push('/')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast.error(error.response?.data?.message || 'Failed to delete account')
      setIsDeletingAccount(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    router.push("/")
    router.refresh()
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getRoleIcon = (roleName: string) => {
    const icons: Record<string, any> = {
      Buyer: HeartHandshake,
      Seller: Building2,
      Courier: Truck,
      Helper: Award,
    }
    return icons[roleName] || User
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: COLORS.primary }} />
          <p className="text-sm text-gray-500 font-medium">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
  const memberSince = userData?.created_at 
    ? new Date(userData.created_at).getFullYear() 
    : new Date().getFullYear()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Profile Section */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: COLORS.primary }} />
                Profile Information
              </CardTitle>
              {!isEditing && (
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  style={{ backgroundColor: COLORS.primary }}
                  className="text-white hover:opacity-90"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6 pb-6 border-b border-gray-100">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                  {getProfileImageUrl() ? (
                    <img 
                      src={getProfileImageUrl() || ''} 
                      alt={fullName} 
                      className="w-20 h-20 rounded-full object-cover" 
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                {isEditing && (
                  <label 
                    htmlFor="profile-image-upload"
                    className="absolute bottom-0 right-0 p-2 bg-[#5a9c3a] text-white rounded-full shadow-lg hover:bg-[#0d7a3f] transition-colors cursor-pointer z-10"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{fullName}</h3>
                <p className="text-gray-600 mb-2">{profile.email || user?.email || 'No email'}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name
                </Label>
                {isEditing ? (
                  <Input
                    id="first_name"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    className="rounded-lg border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a]"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium py-2">{profile.first_name || 'Not set'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Last Name
                </Label>
                {isEditing ? (
                  <Input
                    id="last_name"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    className="rounded-lg border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a]"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium py-2">{profile.last_name || 'Not set'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <p className="text-gray-900 font-medium py-2">{profile.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="rounded-lg border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a]"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900 font-medium py-2">{profile.phone || 'Not set'}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
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
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roles Section - Middle */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: COLORS.primary }} />
              Your Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-4">Manage your roles to access different features</p>
            {userData?.roles && userData.roles.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {userData.roles.map((role: any, index: number) => {
                  const Icon = getRoleIcon(role.name)
                  return (
                    <div
                      key={`role-${role.id}-${role.name}-${index}`}
                      className="flex items-center gap-2 px-4 py-2 bg-[#5a9c3a]/10 border border-[#5a9c3a]/20 rounded-lg"
                    >
                      <Icon className="w-4 h-4 text-[#5a9c3a]" />
                      <span className="font-medium text-gray-900">{role.name}</span>
                    </div>
                  )
                })}
              </div>
            )}
            <RoleManagement />
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: COLORS.primary }} />
              Addresses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-4">Manage your delivery addresses</p>
            <AddressList />
          </CardContent>
        </Card>

        {/* Courier Settings */}
        {hasCourierRole && (
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" style={{ color: COLORS.primary }} />
                  Courier Settings
                </CardTitle>
                <Button
                  size="sm"
                  onClick={handleSaveCourierSettings}
                  style={{ backgroundColor: COLORS.primary }}
                  className="text-white hover:opacity-90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Availability</p>
                  <p className="text-xs text-gray-600">Set your availability status</p>
                </div>
                <Switch
                  checked={courierSettings.availablity}
                  onCheckedChange={(checked) => 
                    setCourierSettings({ ...courierSettings, availablity: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Delivery Radius (miles)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={courierSettings.delivery_radius || ''}
                    onChange={(e) => setCourierSettings({ ...courierSettings, delivery_radius: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Enter radius"
                    className="rounded-lg border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Work Per Day (hours)</Label>
                  <Input
                    type="number"
                    value={courierSettings.work_per_day || ''}
                    onChange={(e) => setCourierSettings({ ...courierSettings, work_per_day: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Enter hours"
                    className="rounded-lg border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Start Time</Label>
                  <Input
                    type="time"
                    value={courierSettings.start_time || ''}
                    onChange={(e) => setCourierSettings({ ...courierSettings, start_time: e.target.value })}
                    className="rounded-lg border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">End Time</Label>
                  <Input
                    type="time"
                    value={courierSettings.end_time || ''}
                    onChange={(e) => setCourierSettings({ ...courierSettings, end_time: e.target.value })}
                    className="rounded-lg border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a]"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Days of Week</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={`courier-${day.value}`}
                      type="button"
                      onClick={() => toggleDayOfWeek(courierSettings, setCourierSettings, day.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        courierSettings.days_of_week.includes(day.value)
                          ? 'bg-[#5a9c3a] text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-[#5a9c3a]'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Helper Settings */}
        {hasHelperRole && (
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" style={{ color: COLORS.primary }} />
                  Helper Settings
                </CardTitle>
                <Button
                  size="sm"
                  onClick={handleSaveHelperSettings}
                  style={{ backgroundColor: COLORS.primary }}
                  className="text-white hover:opacity-90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Availability</p>
                  <p className="text-xs text-gray-600">Set your availability status</p>
                </div>
                <Switch
                  checked={helperSettings.availablity}
                  onCheckedChange={(checked) => 
                    setHelperSettings({ ...helperSettings, availablity: checked })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Delivery Radius (miles)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={helperSettings.delivery_radius || ''}
                    onChange={(e) => setHelperSettings({ ...helperSettings, delivery_radius: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Enter radius"
                    className="rounded-lg border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Work Per Day (hours)</Label>
                  <Input
                    type="number"
                    value={helperSettings.work_per_day || ''}
                    onChange={(e) => setHelperSettings({ ...helperSettings, work_per_day: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Enter hours"
                    className="rounded-lg border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Start Time</Label>
                  <Input
                    type="time"
                    value={helperSettings.start_time || ''}
                    onChange={(e) => setHelperSettings({ ...helperSettings, start_time: e.target.value })}
                    className="rounded-lg border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a]"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">End Time</Label>
                  <Input
                    type="time"
                    value={helperSettings.end_time || ''}
                    onChange={(e) => setHelperSettings({ ...helperSettings, end_time: e.target.value })}
                    className="rounded-lg border-gray-300 focus:border-[#5a9c3a] focus:ring-[#5a9c3a]"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-2 block">Days of Week</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={`helper-${day.value}`}
                      type="button"
                      onClick={() => toggleDayOfWeek(helperSettings, setHelperSettings, day.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        helperSettings.days_of_week.includes(day.value)
                          ? 'bg-[#5a9c3a] text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-[#5a9c3a]'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" style={{ color: COLORS.primary }} />
                Notifications
              </CardTitle>
              <Button
                size="sm"
                onClick={handleSaveNotifications}
                style={{ backgroundColor: COLORS.primary }}
                className="text-white hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{notification.name}</p>
                  </div>
                  <Switch
                    checked={notification.enabled}
                    onCheckedChange={() => handleToggleNotification(notification.id)}
                  />
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No notification preferences available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: COLORS.primary }} />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeletingAccount}
                className="w-full flex items-center justify-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4" />
                {isDeletingAccount ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

