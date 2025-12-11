"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { 
  User, Mail, Phone, MapPin, Edit, Save, X, 
  Settings, Bell, Shield, LogOut, Loader2, 
  CheckCircle2, Circle, Camera, Calendar,
  Award, Building2, Truck, HeartHandshake, Trash2,
  CreditCard, FileCheck, Star, Car, DollarSign, Wrench, Plus, Users
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Download } from "lucide-react"

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const refreshUser = useAuthStore((state) => state.refreshUser)
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
  const [activeTab, setActiveTab] = useState("overview")
  
  // Tab-specific data
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [verifications, setVerifications] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [pricing, setPricing] = useState<any>(null)
  const [equipment, setEquipment] = useState<any[]>([])
  const [donations, setDonations] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  const [loadingTabData, setLoadingTabData] = useState(false)
  
  // Dialog states
  const [bankAccountDialog, setBankAccountDialog] = useState({ open: false, editing: null as any })
  const [vehicleDialog, setVehicleDialog] = useState({ open: false, editing: null as any })
  const [equipmentDialog, setEquipmentDialog] = useState({ open: false, editing: null as any })
  const [pricingDialog, setPricingDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: null as number | null })
  
  // Form states
  const [bankAccountForm, setBankAccountForm] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: '',
    status: true
  })
  const [vehicleForm, setVehicleForm] = useState({
    type: '',
    licence_plate: '',
    model: ''
  })
  const [equipmentForm, setEquipmentForm] = useState({ name: '' })
  const [pricingForm, setPricingForm] = useState({ distance: '', price: '' })

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (activeTab !== 'overview' && userData) {
      fetchTabData(activeTab)
    }
  }, [activeTab, userData])

  const fetchTabData = async (tab: string) => {
    if (!userData) return
    
    try {
      setLoadingTabData(true)
      switch (tab) {
        case 'bank-accounts':
          try {
            const response = await api.get('/user/bank-accounts')
            setBankAccounts(response.data?.data || [])
          } catch (error: any) {
            if (error.response?.status !== 404) {
              console.error('Error fetching bank accounts:', error)
            }
            setBankAccounts([])
          }
          break
        case 'verifications':
          try {
            const response = await api.get('/user/verifications')
            setVerifications(response.data?.data || [])
          } catch (error: any) {
            if (error.response?.status !== 404) {
              console.error('Error fetching verifications:', error)
            }
            setVerifications([])
          }
          break
        case 'reviews':
          try {
            const response = await api.get('/user/reviews')
            setReviews(response.data?.data || [])
          } catch (error: any) {
            if (error.response?.status !== 404) {
              console.error('Error fetching reviews:', error)
            }
            setReviews([])
          }
          break
        case 'vehicles':
          try {
            const response = await api.get('/user/vehicles')
            setVehicles(response.data?.data || [])
          } catch (error: any) {
            if (error.response?.status !== 404) {
              console.error('Error fetching vehicles:', error)
            }
            setVehicles([])
          }
          break
        case 'pricing':
          try {
            const response = await api.get('/user/pricing')
            setPricing(response.data?.data || null)
          } catch (error: any) {
            if (error.response?.status !== 404) {
              console.error('Error fetching pricing:', error)
            }
            setPricing(null)
          }
          break
        case 'equipment':
          try {
            const response = await api.get('/user/equipment')
            setEquipment(response.data?.data || [])
          } catch (error: any) {
            if (error.response?.status !== 404) {
              console.error('Error fetching equipment:', error)
            }
            setEquipment([])
          }
          break
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error)
    } finally {
      setLoadingTabData(false)
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
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const calculateProfileCompletion = () => {
    if (!userData) return 0
    
    let completed = 0
    const total = 6
    
    if (userData.first_name) completed++
    if (userData.last_name) completed++
    if (userData.email) completed++
    if (userData.phone) completed++
    if (addresses.length > 0) completed++
    if (userData.image || userData.profile_picture) completed++
    
    return Math.round((completed / total) * 100)
  }

  const profileCompletion = calculateProfileCompletion()

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    // Create preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload image
    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('profile_picture', file)

      const response = await api.put('/user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update userData with the new image path from response
      if (response.data?.data) {
        setUserData({
          ...userData,
          profile_picture: response.data.data.profile_picture,
          image: response.data.data.image,
        })
      }

      await refreshUser()
      await fetchUserData()
      
      // Keep preview until data is refreshed
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
      // Reset input value to allow re-uploading the same file
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

  // Bank Account handlers
  const handleOpenBankAccountDialog = (account?: any) => {
    if (account) {
      setBankAccountForm({
        account_name: account.account_name || '',
        bank_name: account.bank_name || '',
        account_number: account.account_number || '',
        routing_number: account.routing_number || '',
        account_type: account.account_type || '',
        status: account.status ?? true
      })
      setBankAccountDialog({ open: true, editing: account })
    } else {
      setBankAccountForm({
        account_name: '',
        bank_name: '',
        account_number: '',
        routing_number: '',
        account_type: '',
        status: true
      })
      setBankAccountDialog({ open: true, editing: null })
    }
  }

  const handleSaveBankAccount = async () => {
    try {
      setSaving(true)
      if (bankAccountDialog.editing) {
        await api.put(`/user/bank-accounts/${bankAccountDialog.editing.id}`, bankAccountForm)
        toast.success('Bank account updated successfully')
      } else {
        await api.post('/user/bank-accounts', bankAccountForm)
        toast.success('Bank account added successfully')
      }
      setBankAccountDialog({ open: false, editing: null })
      await fetchTabData('bank-accounts')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save bank account')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBankAccount = async () => {
    try {
      await api.delete(`/user/bank-accounts/${deleteDialog.id}`)
      toast.success('Bank account deleted successfully')
      setDeleteDialog({ open: false, type: '', id: null })
      await fetchTabData('bank-accounts')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete bank account')
    }
  }

  // Vehicle handlers
  const handleOpenVehicleDialog = (vehicle?: any) => {
    if (vehicle) {
      setVehicleForm({
        type: vehicle.type || '',
        licence_plate: vehicle.licence_plate || '',
        model: vehicle.model || ''
      })
      setVehicleDialog({ open: true, editing: vehicle })
    } else {
      setVehicleForm({ type: '', licence_plate: '', model: '' })
      setVehicleDialog({ open: true, editing: null })
    }
  }

  const handleSaveVehicle = async () => {
    try {
      setSaving(true)
      if (vehicleDialog.editing) {
        await api.put(`/user/vehicles/${vehicleDialog.editing.id}`, vehicleForm)
        toast.success('Vehicle updated successfully')
      } else {
        await api.post('/user/vehicles', vehicleForm)
        toast.success('Vehicle added successfully')
      }
      setVehicleDialog({ open: false, editing: null })
      await fetchTabData('vehicles')
      await fetchUserData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save vehicle')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteVehicle = async () => {
    try {
      await api.delete(`/user/vehicles/${deleteDialog.id}`)
      toast.success('Vehicle deleted successfully')
      setDeleteDialog({ open: false, type: '', id: null })
      await fetchTabData('vehicles')
      await fetchUserData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete vehicle')
    }
  }

  // Equipment handlers
  const handleOpenEquipmentDialog = (item?: any) => {
    if (item) {
      setEquipmentForm({ name: item.name || '' })
      setEquipmentDialog({ open: true, editing: item })
    } else {
      setEquipmentForm({ name: '' })
      setEquipmentDialog({ open: true, editing: null })
    }
  }

  const handleSaveEquipment = async () => {
    try {
      setSaving(true)
      if (equipmentDialog.editing) {
        await api.put(`/user/equipment/${equipmentDialog.editing.id}`, equipmentForm)
        toast.success('Equipment updated successfully')
      } else {
        await api.post('/user/equipment', equipmentForm)
        toast.success('Equipment added successfully')
      }
      setEquipmentDialog({ open: false, editing: null })
      await fetchTabData('equipment')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save equipment')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEquipment = async () => {
    try {
      await api.delete(`/user/equipment/${deleteDialog.id}`)
      toast.success('Equipment deleted successfully')
      setDeleteDialog({ open: false, type: '', id: null })
      await fetchTabData('equipment')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete equipment')
    }
  }

  // Pricing handlers
  const handleOpenPricingDialog = () => {
    if (pricing) {
      setPricingForm({
        distance: pricing.distance || '',
        price: pricing.price || ''
      })
    } else {
      setPricingForm({ distance: '', price: '' })
    }
    setPricingDialog(true)
  }

  const handleSavePricing = async () => {
    try {
      setSaving(true)
      await api.put('/user/pricing', {
        distance: pricingForm.distance,
        price: parseFloat(pricingForm.price)
      })
      toast.success('Pricing updated successfully')
      setPricingDialog(false)
      await fetchTabData('pricing')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save pricing')
    } finally {
      setSaving(false)
    }
  }

  // Export reviews
  const handleExportReviews = async () => {
    try {
      const response = await api.get('/user/reviews/export', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reviews_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Reviews exported successfully')
    } catch (error: any) {
      toast.error('Failed to export reviews')
    }
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
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#0A5D31]" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please login to view your profile</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
  const memberSince = userData?.created_at 
    ? new Date(userData.created_at).getFullYear() 
    : new Date().getFullYear()

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-[#ffffff]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
                <p className="text-gray-600">Manage your account settings and preferences</p>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="gap-2 bg-[#0A5D31] hover:bg-[#0d7a3f]"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-shrink-0">
                  <User className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="bank-accounts" className="flex-shrink-0">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Bank Accounts
                </TabsTrigger>
                <TabsTrigger value="verifications" className="flex-shrink-0">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Verifications
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-shrink-0">
                  <Star className="w-4 h-4 mr-2" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="vehicles" className="flex-shrink-0">
                  <Car className="w-4 h-4 mr-2" />
                  Vehicles
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex-shrink-0">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pricing
                </TabsTrigger>
                <TabsTrigger value="equipment" className="flex-shrink-0">
                  <Wrench className="w-4 h-4 mr-2" />
                  Equipment
                </TabsTrigger>
                <TabsTrigger value="donations" className="flex-shrink-0">
                  <HeartHandshake className="w-4 h-4 mr-2" />
                  Donations
                </TabsTrigger>
                <TabsTrigger value="referrals" className="flex-shrink-0">
                  <Users className="w-4 h-4 mr-2" />
                  Referrals
                </TabsTrigger>
              </TabsList>

            {/* Profile Completion Bar */}
            <Card className="p-6 shadow-sm bg-[#ffffff] mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0A5D31] rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Profile Completion</h3>
                    <p className="text-sm text-gray-600">
                      {profileCompletion < 100 
                        ? `Complete your profile to unlock all features` 
                        : `Your profile is complete!`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#0A5D31]">{profileCompletion}%</p>
                </div>
              </div>
              <Progress value={profileCompletion} className="h-3" />
            </Card>

            {/* Tabs Content */}
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Profile */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <Card className="p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#0A5D31] hover:bg-[#0d7a3f]"
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
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-6 border-b border-gray-200">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#0A5D31] to-[#0d7a3f] rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      {getProfileImageUrl() ? (
                        <img 
                          src={getProfileImageUrl() || ''} 
                          alt={fullName} 
                          className="w-24 h-24 rounded-full object-cover" 
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <label 
                        htmlFor="profile-image-upload"
                        className="absolute bottom-0 right-0 p-2 bg-[#0A5D31] text-white rounded-full shadow-lg hover:bg-[#0d7a3f] transition-colors cursor-pointer z-10"
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{fullName}</h3>
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
                        className="rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
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
                        className="rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
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
                        className="rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium py-2">{profile.phone || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Roles Card */}
              <Card className="p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Your Roles</h2>
                  <p className="text-sm text-gray-600">Manage your roles to access different features</p>
                </div>
                {userData?.roles && userData.roles.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {userData.roles.map((role: any, index: number) => {
                      const Icon = getRoleIcon(role.name)
                      return (
                        <div
                          key={`role-${role.id}-${role.name}-${index}`}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0A5D31]/10 border border-[#0A5D31]/20 rounded-lg"
                        >
                          <Icon className="w-4 h-4 text-[#0A5D31]" />
                          <span className="font-medium text-gray-900">{role.name}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
                <RoleManagement />
              </Card>

              {/* Address Management */}
              <Card className="p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Addresses
                  </h2>
                  <p className="text-sm text-gray-600">Manage your delivery addresses</p>
                </div>
                <AddressList />
              </Card>
            </div>

            {/* Right Column - Settings & Actions */}
            <div className="space-y-6">
              {/* Helper Settings Card */}
              {hasHelperRole && (
                <Card className="p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#0A5D31]" />
                      <h2 className="text-xl font-bold text-gray-900">Helper Settings</h2>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSaveHelperSettings}
                      className="bg-[#0A5D31] hover:bg-[#0d7a3f]"
                    >
                      Save
                    </Button>
                  </div>
                  <div className="space-y-4">
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
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium text-gray-900 mb-2 block">Delivery Radius (miles)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={helperSettings.delivery_radius || ''}
                        onChange={(e) => setHelperSettings({ ...helperSettings, delivery_radius: e.target.value ? parseFloat(e.target.value) : null })}
                        placeholder="Enter radius"
                        className="rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                      />
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium text-gray-900 mb-2 block">Work Per Day (hours)</Label>
                      <Input
                        type="number"
                        value={helperSettings.work_per_day || ''}
                        onChange={(e) => setHelperSettings({ ...helperSettings, work_per_day: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Enter hours"
                        className="rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-900 mb-2 block">Start Time</Label>
                        <Input
                          type="time"
                          value={helperSettings.start_time || ''}
                          onChange={(e) => setHelperSettings({ ...helperSettings, start_time: e.target.value })}
                          className="rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-900 mb-2 block">End Time</Label>
                        <Input
                          type="time"
                          value={helperSettings.end_time || ''}
                          onChange={(e) => setHelperSettings({ ...helperSettings, end_time: e.target.value })}
                          className="rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium text-gray-900 mb-2 block">Days of Week</Label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <button
                            key={`helper-${day.value}`}
                            type="button"
                            onClick={() => toggleDayOfWeek(helperSettings, setHelperSettings, day.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              helperSettings.days_of_week.includes(day.value)
                                ? 'bg-[#0A5D31] text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:border-[#0A5D31]'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Courier Settings Card */}
              {hasCourierRole && (
                <Card className="p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#0A5D31]" />
                      <h2 className="text-xl font-bold text-gray-900">Courier Settings</h2>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSaveCourierSettings}
                      className="bg-[#0A5D31] hover:bg-[#0d7a3f]"
                    >
                      Save
                    </Button>
                  </div>
                  <div className="space-y-4">
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
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium text-gray-900 mb-2 block">Delivery Radius (miles)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={courierSettings.delivery_radius || ''}
                        onChange={(e) => setCourierSettings({ ...courierSettings, delivery_radius: e.target.value ? parseFloat(e.target.value) : null })}
                        placeholder="Enter radius"
                        className="rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                      />
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium text-gray-900 mb-2 block">Work Per Day (hours)</Label>
                      <Input
                        type="number"
                        value={courierSettings.work_per_day || ''}
                        onChange={(e) => setCourierSettings({ ...courierSettings, work_per_day: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Enter hours"
                        className="rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-900 mb-2 block">Start Time</Label>
                        <Input
                          type="time"
                          value={courierSettings.start_time || ''}
                          onChange={(e) => setCourierSettings({ ...courierSettings, start_time: e.target.value })}
                          className="rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-900 mb-2 block">End Time</Label>
                        <Input
                          type="time"
                          value={courierSettings.end_time || ''}
                          onChange={(e) => setCourierSettings({ ...courierSettings, end_time: e.target.value })}
                          className="rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium text-gray-900 mb-2 block">Days of Week</Label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <button
                            key={`courier-${day.value}`}
                            type="button"
                            onClick={() => toggleDayOfWeek(courierSettings, setCourierSettings, day.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              courierSettings.days_of_week.includes(day.value)
                                ? 'bg-[#0A5D31] text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:border-[#0A5D31]'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Notifications Card */}
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#0A5D31]" />
                    <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSaveNotifications}
                    className="bg-[#0A5D31] hover:bg-[#0d7a3f]"
                  >
                    Save
                  </Button>
                </div>
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
              </Card>

              {/* Account Actions */}
              <Card className="p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h2>
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
              </Card>
            </div>
          </div>
            </TabsContent>

            {/* Bank Accounts Tab */}
            <TabsContent value="bank-accounts" className="space-y-6">
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Bank Accounts
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your bank accounts for payments</p>
                  </div>
                  <Button onClick={() => handleOpenBankAccountDialog()} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Account
                  </Button>
                </div>
                {loadingTabData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0A5D31]" />
                  </div>
                ) : bankAccounts.length > 0 ? (
                  <div className="space-y-4">
                    {bankAccounts.map((account: any) => (
                      <Card key={account.id} className="p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{account.account_name}</h3>
                            <p className="text-sm text-gray-600">{account.bank_name}</p>
                            <p className="text-xs text-gray-500 mt-1">****{account.account_number?.slice(-4)}</p>
                            {account.routing_number && (
                              <p className="text-xs text-gray-500">Routing: {account.routing_number}</p>
                            )}
                            {account.account_type && (
                              <p className="text-xs text-gray-500">Type: {account.account_type}</p>
                            )}
                            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                              account.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {account.status ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenBankAccountDialog(account)}>Edit</Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setDeleteDialog({ open: true, type: 'bank-account', id: account.id })}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No bank accounts added yet</p>
                    <Button onClick={() => handleOpenBankAccountDialog()} className="mt-4 bg-[#0A5D31] hover:bg-[#0d7a3f]">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Account
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Verifications Tab */}
            <TabsContent value="verifications" className="space-y-6">
              <Card className="p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Verifications
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Your verification status and documents</p>
                </div>
                {loadingTabData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0A5D31]" />
                  </div>
                ) : verifications.length > 0 ? (
                  <div className="space-y-4">
                    {verifications.map((verification: any) => (
                      <Card key={verification.id} className="p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              verification.status === 'verified' ? 'bg-green-100' : 'bg-yellow-100'
                            }`}>
                              <FileCheck className={`w-5 h-5 ${
                                verification.status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{verification.verification_type?.name || 'Verification'}</h3>
                              <p className="text-sm text-gray-600">{verification.status || 'Pending'}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No verifications yet</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Reviews
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Reviews you've received from other users</p>
                  </div>
                  {reviews.length > 0 && (
                    <Button onClick={handleExportReviews} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                  )}
                </div>
                {loadingTabData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0A5D31]" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <Card key={review.id} className="p-4 shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < (review.star || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">by {review.fromUser?.first_name || 'Anonymous'}</span>
                            </div>
                            <p className="text-gray-900">{review.review}</p>
                            <p className="text-xs text-gray-500 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No reviews yet</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Vehicles Tab */}
            <TabsContent value="vehicles" className="space-y-6">
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      Vehicles
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your delivery vehicles</p>
                  </div>
                  <Button onClick={() => handleOpenVehicleDialog()} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
                {loadingTabData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0A5D31]" />
                  </div>
                ) : vehicles.length > 0 ? (
                  <div className="space-y-4">
                    {vehicles.map((vehicle: any) => (
                      <Card key={vehicle.id} className="p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{vehicle.type || 'Vehicle'}</h3>
                            {vehicle.model && <p className="text-sm text-gray-600">{vehicle.model}</p>}
                            <p className="text-xs text-gray-500 mt-1">License: {vehicle.licence_plate}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenVehicleDialog(vehicle)}>Edit</Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setDeleteDialog({ open: true, type: 'vehicle', id: vehicle.id })}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No vehicles added yet</p>
                    <Button onClick={() => handleOpenVehicleDialog()} className="mt-4 bg-[#0A5D31] hover:bg-[#0d7a3f]">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Vehicle
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Pricing
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Set your delivery or service pricing</p>
                  </div>
                  <Button onClick={handleOpenPricingDialog} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                    {pricing ? 'Update Pricing' : 'Set Pricing'}
                  </Button>
                </div>
                {loadingTabData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0A5D31]" />
                  </div>
                ) : pricing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Label className="text-sm font-medium text-gray-900 mb-2 block">Distance (miles)</Label>
                        <p className="text-lg font-semibold text-gray-900">{pricing.distance}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Label className="text-sm font-medium text-gray-900 mb-2 block">Price ($)</Label>
                        <p className="text-lg font-semibold text-gray-900">${pricing.price}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pricing set yet</p>
                    <Button onClick={handleOpenPricingDialog} className="mt-4 bg-[#0A5D31] hover:bg-[#0d7a3f]">
                      <Plus className="w-4 h-4 mr-2" />
                      Set Pricing
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Donations Tab */}
            <TabsContent value="donations" className="space-y-6">
              <Card className="p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5" />
                    Donations
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Your donation history</p>
                </div>
                {loadingTabData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0A5D31]" />
                  </div>
                ) : donations.length > 0 ? (
                  <div className="space-y-4">
                    {donations.map((donation: any) => (
                      <Card key={donation.id} className="p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{donation.donation?.title || 'Donation'}</h3>
                            <p className="text-sm text-gray-600 mt-1">${donation.amount}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(donation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                            Completed
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <HeartHandshake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No donations yet</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="space-y-6">
              <Card className="p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Referrals
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Your referral code and referred users</p>
                </div>
                {loadingTabData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0A5D31]" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Referral Code */}
                    <Card className="p-6 bg-gradient-to-br from-[#0A5D31]/5 to-[#0d7a3f]/5 border-2 border-[#0A5D31]/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-2 block">Your Referral Code</Label>
                          <p className="text-2xl font-bold text-[#0A5D31] font-mono">
                            {userData?.refferal_code || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Share this code with friends to earn rewards</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (userData?.refferal_code) {
                              navigator.clipboard.writeText(userData.refferal_code)
                              toast.success('Referral code copied!')
                            }
                          }}
                          className="border-[#0A5D31] text-[#0A5D31] hover:bg-[#0A5D31] hover:text-white"
                        >
                          Copy Code
                        </Button>
                      </div>
                    </Card>

                    {/* Referred Users */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Referred Users ({referrals.length})</h3>
                      {referrals.length > 0 ? (
                        <div className="space-y-3">
                          {referrals.map((referral: any) => (
                            <Card key={referral.id} className="p-4 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">Code: {referral.refferal_code}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(referral.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                  Active
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">No referrals yet</p>
                          <p className="text-xs text-gray-500 mt-1">Share your code to start earning rewards</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Equipment Tab */}
            <TabsContent value="equipment" className="space-y-6">
              <Card className="p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      Equipment
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your equipment and tools</p>
                  </div>
                  <Button onClick={() => handleOpenEquipmentDialog()} className="bg-[#0A5D31] hover:bg-[#0d7a3f]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Equipment
                  </Button>
                </div>
                {loadingTabData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0A5D31]" />
                  </div>
                ) : equipment.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipment.map((item: any) => (
                      <Card key={item.id} className="p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenEquipmentDialog(item)}>Edit</Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setDeleteDialog({ open: true, type: 'equipment', id: item.id })}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No equipment added yet</p>
                    <Button onClick={() => handleOpenEquipmentDialog()} className="mt-4 bg-[#0A5D31] hover:bg-[#0d7a3f]">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Equipment
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone. 
              All your data, including profile, addresses, settings, and orders will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingAccount ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, type: '', id: null })}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader className="pb-4">
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 mt-2">
              Are you sure you want to delete this {deleteDialog.type.replace('-', ' ')}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="h-11 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.type === 'bank-account') handleDeleteBankAccount()
                else if (deleteDialog.type === 'vehicle') handleDeleteVehicle()
                else if (deleteDialog.type === 'equipment') handleDeleteEquipment()
              }}
              className="bg-red-600 hover:bg-red-700 text-white h-11 px-6"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bank Account Dialog */}
      <Dialog open={bankAccountDialog.open} onOpenChange={(open) => setBankAccountDialog({ open, editing: null })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {bankAccountDialog.editing ? 'Edit Bank Account' : 'Add Bank Account'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Enter your bank account details securely
            </DialogDescription>
          </DialogHeader>
          <div className="px-6">
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="account_name" className="text-sm font-semibold text-gray-700">Account Name</Label>
                <Input
                  id="account_name"
                  value={bankAccountForm.account_name}
                  onChange={(e) => setBankAccountForm({ ...bankAccountForm, account_name: e.target.value })}
                  placeholder="John Doe"
                  className="h-11 rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name" className="text-sm font-semibold text-gray-700">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={bankAccountForm.bank_name}
                  onChange={(e) => setBankAccountForm({ ...bankAccountForm, bank_name: e.target.value })}
                  placeholder="Bank of America"
                  className="h-11 rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number" className="text-sm font-semibold text-gray-700">Account Number</Label>
                <Input
                  id="account_number"
                  value={bankAccountForm.account_number}
                  onChange={(e) => setBankAccountForm({ ...bankAccountForm, account_number: e.target.value })}
                  placeholder="1234567890"
                  className="h-11 rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="routing_number" className="text-sm font-semibold text-gray-700">Routing Number</Label>
                  <Input
                    id="routing_number"
                    value={bankAccountForm.routing_number}
                    onChange={(e) => setBankAccountForm({ ...bankAccountForm, routing_number: e.target.value })}
                    placeholder="123456789"
                    className="h-11 rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_type" className="text-sm font-semibold text-gray-700">Account Type</Label>
                  <Input
                    id="account_type"
                    value={bankAccountForm.account_type}
                    onChange={(e) => setBankAccountForm({ ...bankAccountForm, account_type: e.target.value })}
                    placeholder="Checking"
                    className="h-11 rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <Label htmlFor="account_status" className="text-sm font-semibold text-gray-700">Account Status</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Enable or disable this account</p>
                </div>
                <Switch
                  id="account_status"
                  checked={bankAccountForm.status}
                  onCheckedChange={(checked) => setBankAccountForm({ ...bankAccountForm, status: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-gray-200 pt-4 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setBankAccountDialog({ open: false, editing: null })}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveBankAccount} 
              disabled={saving} 
              className="bg-[#0A5D31] hover:bg-[#0d7a3f] h-11 px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {bankAccountDialog.editing ? 'Update' : 'Add'} Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Dialog */}
      <Dialog open={vehicleDialog.open} onOpenChange={(open) => setVehicleDialog({ open, editing: null })}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-[#0A5D31]" />
              {vehicleDialog.editing ? 'Edit Vehicle' : 'Add Vehicle'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Enter your vehicle information for delivery services
            </DialogDescription>
          </DialogHeader>
          <div className="px-6">
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="vehicle_type" className="text-sm font-semibold text-gray-700">Vehicle Type</Label>
                <Input
                  id="vehicle_type"
                  value={vehicleForm.type}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                  placeholder="Car, Truck, Motorcycle, etc."
                  className="h-11 rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licence_plate" className="text-sm font-semibold text-gray-700">License Plate</Label>
                <Input
                  id="licence_plate"
                  value={vehicleForm.licence_plate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, licence_plate: e.target.value })}
                  placeholder="ABC-1234"
                  className="h-11 rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_model" className="text-sm font-semibold text-gray-700">Model</Label>
                <Input
                  id="vehicle_model"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  placeholder="Toyota Camry 2020"
                  className="h-11 rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-gray-200 pt-4 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setVehicleDialog({ open: false, editing: null })}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveVehicle} 
              disabled={saving} 
              className="bg-[#0A5D31] hover:bg-[#0d7a3f] h-11 px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {vehicleDialog.editing ? 'Update' : 'Add'} Vehicle
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Equipment Dialog */}
      <Dialog open={equipmentDialog.open} onOpenChange={(open) => setEquipmentDialog({ open, editing: null })}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#0A5D31]" />
              {equipmentDialog.editing ? 'Edit Equipment' : 'Add Equipment'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Add equipment or tools you use for your services
            </DialogDescription>
          </DialogHeader>
          <div className="px-6">
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="equipment_name" className="text-sm font-semibold text-gray-700">Equipment Name</Label>
                <Input
                  id="equipment_name"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm({ name: e.target.value })}
                  placeholder="Harvesting Tools, Delivery Bags, etc."
                  className="h-11 rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-gray-200 pt-4 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEquipmentDialog({ open: false, editing: null })}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEquipment} 
              disabled={saving} 
              className="bg-[#0A5D31] hover:bg-[#0d7a3f] h-11 px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {equipmentDialog.editing ? 'Update' : 'Add'} Equipment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricing Dialog */}
      <Dialog open={pricingDialog} onOpenChange={setPricingDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#0A5D31]" />
              Set Pricing
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              Configure your delivery or service pricing rates
            </DialogDescription>
          </DialogHeader>
          <div className="px-6">
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="pricing_distance" className="text-sm font-semibold text-gray-700">Distance Range</Label>
                <Input
                  id="pricing_distance"
                  type="text"
                  value={pricingForm.distance}
                  onChange={(e) => setPricingForm({ ...pricingForm, distance: e.target.value })}
                  placeholder="e.g., 0-5, 5-10, 10+"
                  className="h-11 rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                />
                <p className="text-xs text-gray-500">Specify the distance range in miles</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricing_price" className="text-sm font-semibold text-gray-700">Price ($)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <Input
                    id="pricing_price"
                    type="number"
                    step="0.01"
                    value={pricingForm.price}
                    onChange={(e) => setPricingForm({ ...pricingForm, price: e.target.value })}
                    placeholder="0.00"
                    className="h-11 pl-8 rounded-lg border-gray-300 focus:border-[#0A5D31] focus:ring-[#0A5D31]"
                  />
                </div>
                <p className="text-xs text-gray-500">Enter the price for this distance range</p>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-gray-200 pt-4 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPricingDialog(false)}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSavePricing} 
              disabled={saving} 
              className="bg-[#0A5D31] hover:bg-[#0d7a3f] h-11 px-6"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Pricing
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
