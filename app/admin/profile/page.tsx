"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Store, 
  Edit, 
  Save, 
  X,
  Upload,
  CheckCircle,
  Building,
  Globe,
  Calendar,
  Lock,
  Shield,
  Award,
  FileText,
  CreditCard,
  Bell,
  Key,
  Verified,
  AlertCircle,
  AlertTriangle
} from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { fetchUserProfile, updateUserProfile, fetchUserAddresses, updateAddress, deleteUser, type User, type Address } from "@/lib/user-api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { useSafeTranslations } from "@/hooks/use-safe-translations"

export default function ProfilePage() {
  const router = useRouter()
  const t = useSafeTranslations("admin.profile")
  const logout = useAuthStore((state) => state.logout)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [verificationData, setVerificationData] = useState({
    businessLicense: "",
    taxId: "",
    documents: [] as string[],
  })
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    bio: "Family-owned organic farm specializing in fresh, locally grown produce. We've been serving our community for over 20 years with sustainable farming practices.",
    storeName: "Green Valley Farm Store",
    website: "www.greenvalleyfarm.com",
    established: "2003",
    certifications: ["USDA Organic", "Non-GMO Project Verified", "Fair Trade"],
    businessType: "Farm",
    taxId: "12-3456789",
    isVerified: false,
    verificationStatus: "pending", // pending, approved, rejected
  })

  const [stats] = useState({
    totalProducts: 124,
    totalOrders: 342,
    totalRevenue: 12450,
    rating: 4.8,
    reviews: 156,
  })

  // Fetch user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)
      try {
        const user = await fetchUserProfile()
        if (user) {
          setUserData(user)
          setProfile(prev => ({
            ...prev,
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            phone: user.phone || "",
            isVerified: user.roles?.some(r => r.name === "Admin") || false,
          }))
        }
        
        // Fetch addresses
        const userAddresses = await fetchUserAddresses()
        setAddresses(userAddresses)
        if (userAddresses.length > 0) {
          const activeAddress = userAddresses.find(a => a.status === true || a.status === "true") || userAddresses[0]
          setSelectedAddress(activeAddress)
          if (activeAddress) {
            const addressParts = [
              activeAddress.street_address,
              activeAddress.apt && `Apt ${activeAddress.apt}`,
              activeAddress.city,
              activeAddress.state,
              activeAddress.postal_code,
            ].filter(Boolean)
            setProfile(prev => ({
              ...prev,
              address: addressParts.join(", "),
            }))
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUserData()
  }, [])

  const handleSave = async () => {
    if (!userData) return
    
    setIsSaving(true)
    try {
      const payload: any = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
      }
      
      // Only include role_id if user has roles
      if (userData.roles && userData.roles.length > 0) {
        // Get the first role ID (or you can make this configurable)
        payload.role_id = userData.roles[0].id
      }
      
      const updatedUser = await updateUserProfile(payload)
      if (updatedUser) {
        setUserData(updatedUser)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      // Error is already handled in the API service with toast
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords don't match!")
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    try {
      await updateUserProfile({
        password: passwordData.newPassword,
      })
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      console.error('Error changing password:', error)
      // Error is already handled in the API service with toast
    }
  }

  const handleAddressUpdate = async (addressId: number, addressData: Partial<Address>) => {
    try {
      const updatedAddress = await updateAddress(addressId, {
        city: addressData.city,
        country: addressData.country,
        state: addressData.state,
        street_address: addressData.street_address,
        postal_code: addressData.postal_code,
        latitude: typeof addressData.latitude === 'number' ? addressData.latitude : undefined,
        longitude: typeof addressData.longitude === 'number' ? addressData.longitude : undefined,
        apt: addressData.apt,
        business_name: addressData.business_name,
        status: typeof addressData.status === 'boolean' ? addressData.status : undefined,
      })
      
      if (updatedAddress) {
        // Refresh addresses
        const userAddresses = await fetchUserAddresses()
        setAddresses(userAddresses)
      }
    } catch (error) {
      console.error('Error updating address:', error)
    }
  }

  const handleVerificationSubmit = () => {
    console.log("Submitting verification:", verificationData)
    setShowVerificationModal(false)
    setProfile({ ...profile, verificationStatus: "pending" })
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      await deleteUser()
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      // Error is already handled in the API service with toast
      setIsDeletingAccount(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A5D31]" />
          <p className="text-gray-600">{t("loadingProfile")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t("title")}</h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>
        {!isEditing ? (
          <Button 
            className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white gap-2 shadow-lg"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="w-4 h-4" />
            {t("editProfile")}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2" disabled={isSaving}>
              <X className="w-4 h-4" />
              {t("cancel")}
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white gap-2 shadow-lg"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t("saveChanges")}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">{t("totalProducts")}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">{t("totalOrders")}</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">{t("totalRevenue")}</p>
            <p className="text-2xl font-bold text-[#5a9c3a]">${stats.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">{t("rating")}</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.rating} ⭐</p>
            <p className="text-xs text-gray-500">{stats.reviews} {t("reviews")}</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">{t("status")}</p>
            {userData?.roles && userData.roles.length > 0 ? (
              <Badge className="bg-emerald-500 text-white mt-2">
                <Verified className="w-3 h-3 mr-1" />
                {t("verified")}
              </Badge>
            ) : (
              <Badge className="bg-yellow-500 text-white mt-2">
                <AlertCircle className="w-3 h-3 mr-1" />
                {t("unverified")}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification Badge Section */}
      {(!userData?.roles || userData.roles.length === 0) && (
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-yellow-100">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">{t("getVerifiedBadge")}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{t("verifyBusinessDescription")}</p>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white gap-2"
                onClick={() => setShowVerificationModal(true)}
              >
                <Shield className="w-4 h-4" />
                {t("applyForVerification")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-yellow-200">
                <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{t("increasedTrust")}</p>
                  <p className="text-sm text-gray-600">{t("buildCredibility")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-yellow-200">
                <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{t("moreVisibility")}</p>
                  <p className="text-sm text-gray-600">{t("getFeaturedInSearch")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-yellow-200">
                <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{t("prioritySupport")}</p>
                  <p className="text-sm text-gray-600">{t("accessDedicatedSupport")}</p>
                </div>
              </div>
            </div>
            {profile.verificationStatus === "pending" && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">{t("verificationUnderReview")}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#5a9c3a]" />
                {t("basicInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="storeName" className="flex items-center gap-2 mb-2 text-base font-semibold">
                    <Store className="w-4 h-4" />
                    {t("storeName")}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="storeName"
                      value={profile.storeName}
                      onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
                      className="h-12 border-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium text-lg">{profile.storeName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="first_name" className="flex items-center gap-2 mb-2 text-base font-semibold">
                    <UserIcon className="w-4 h-4" />
                    {t("firstName")}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="first_name"
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      className="h-12 border-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium text-lg">{profile.first_name || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="last_name" className="flex items-center gap-2 mb-2 text-base font-semibold">
                    <UserIcon className="w-4 h-4" />
                    {t("lastName")}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="last_name"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      className="h-12 border-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium text-lg">{profile.last_name || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-2 text-base font-semibold">
                    <Mail className="w-4 h-4" />
                    {t("email")}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="h-12 border-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium text-lg">{profile.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2 mb-2 text-base font-semibold">
                    <Phone className="w-4 h-4" />
                    {t("phone")}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="h-12 border-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium text-lg">{profile.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-2 mb-2 text-base font-semibold">
                    <MapPin className="w-4 h-4" />
                    {t("address")}
                  </Label>
                  {isEditing && selectedAddress ? (
                    <div className="space-y-2">
                      <Input
                        id="street_address"
                        value={selectedAddress.street_address || ""}
                        onChange={(e) => {
                          const updated = { ...selectedAddress, street_address: e.target.value }
                          setSelectedAddress(updated)
                        }}
                        placeholder={t("streetAddress")}
                        className="h-12 border-2"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          id="city"
                          value={selectedAddress.city || ""}
                          onChange={(e) => {
                            const updated = { ...selectedAddress, city: e.target.value }
                            setSelectedAddress(updated)
                          }}
                          placeholder={t("city")}
                          className="h-12 border-2"
                        />
                        <Input
                          id="state"
                          value={selectedAddress.state || ""}
                          onChange={(e) => {
                            const updated = { ...selectedAddress, state: e.target.value }
                            setSelectedAddress(updated)
                          }}
                          placeholder={t("state")}
                          className="h-12 border-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          id="postal_code"
                          value={selectedAddress.postal_code || ""}
                          onChange={(e) => {
                            const updated = { ...selectedAddress, postal_code: e.target.value }
                            setSelectedAddress(updated)
                          }}
                          placeholder={t("postalCode")}
                          className="h-12 border-2"
                        />
                        <Input
                          id="apt"
                          value={selectedAddress.apt || ""}
                          onChange={(e) => {
                            const updated = { ...selectedAddress, apt: e.target.value }
                            setSelectedAddress(updated)
                          }}
                          placeholder={t("aptSuiteOptional")}
                          className="h-12 border-2"
                        />
                      </div>
                      {selectedAddress && (
                        <Button
                          type="button"
                          onClick={() => selectedAddress && handleAddressUpdate(selectedAddress.id, selectedAddress)}
                          className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white"
                        >
                          {t("updateAddress")}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium text-lg">{profile.address || t("noAddressProvided")}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website" className="flex items-center gap-2 mb-2 text-base font-semibold">
                    <Globe className="w-4 h-4" />
                    {t("website")}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      placeholder="www.example.com"
                      className="h-12 border-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium text-lg">{profile.website || "Not provided"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#5a9c3a]" />
                {t("businessInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="businessType" className="flex items-center gap-2 mb-2 text-base font-semibold">
                    <Building className="w-4 h-4" />
                    {t("businessType")}
                  </Label>
                  {isEditing ? (
                    <select
                      id="businessType"
                      value={profile.businessType}
                      onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a]"
                    >
                      <option>Farm</option>
                      <option>Producer</option>
                      <option>Distributor</option>
                      <option>Retailer</option>
                      <option>Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium text-lg">{profile.businessType}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="established" className="flex items-center gap-2 mb-2 text-base font-semibold">
                    <Calendar className="w-4 h-4" />
                    {t("establishedYear")}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="established"
                      type="number"
                      value={profile.established}
                      onChange={(e) => setProfile({ ...profile, established: e.target.value })}
                      className="h-12 border-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium text-lg">{profile.established}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="taxId">{t("taxIdEin")}</Label>
                  {isEditing ? (
                    <Input
                      id="taxId"
                      value={profile.taxId}
                      onChange={(e) => setProfile({ ...profile, taxId: e.target.value })}
                      placeholder="12-3456789"
                      className="mt-2 h-12 border-2"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium text-lg mt-2">{profile.taxId}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <CardTitle>{t("aboutYourBusiness")}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Label htmlFor="bio" className="text-base font-semibold">{t("bioDescription")}</Label>
              {isEditing ? (
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={6}
                  className="mt-3 w-full p-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-[#5a9c3a] focus:border-[#5a9c3a] resize-none"
                  placeholder={t("tellCustomersAboutBusiness")}
                />
              ) : (
                <p className="text-gray-700 mt-3 text-lg leading-relaxed">{profile.bio}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Image */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <CardTitle>{t("profileImage")}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#5a9c3a] to-[#0d7a3f] flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                  {profile.storeName.charAt(0)}
                </div>
                {isEditing && (
                  <Button variant="outline" className="gap-2 w-full">
                    <Upload className="w-4 h-4" />
                    {t("uploadImage")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#5a9c3a]" />
                {t("certifications")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {profile.certifications.map((cert, index) => (
                  <Badge key={index} className="w-full justify-center py-3 bg-emerald-50 text-emerald-800 border-2 border-emerald-200 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {cert}
                  </Badge>
                ))}
                {isEditing && (
                  <Button variant="outline" className="w-full mt-3 border-2">
                    {t("addCertification")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security & Settings */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#5a9c3a]" />
                {t("securitySettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 border-2 h-12"
                onClick={() => setShowPasswordModal(true)}
              >
                <Key className="w-4 h-4" />
                {t("changePassword")}
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 border-2 h-12" asChild>
                <a href="/admin/settings">
                  <CreditCard className="w-4 h-4" />
                  {t("paymentSettings")}
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 border-2 h-12" asChild>
                <a href="/admin/settings">
                  <Bell className="w-4 h-4" />
                  {t("notifications")}
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 border-2 h-12 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("deleting")}
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    {t("deleteAccount")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Lock className="w-6 h-6 text-[#5a9c3a]" />
              {t("changePasswordTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("changePasswordDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentPassword" className="text-base font-semibold">{t("currentPassword")}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="mt-2 h-12 border-2"
                placeholder={t("enterCurrentPassword")}
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-base font-semibold">{t("newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="mt-2 h-12 border-2"
                placeholder={t("enterNewPassword")}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-base font-semibold">{t("confirmNewPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="mt-2 h-12 border-2"
                placeholder={t("confirmNewPasswordPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="h-12">
              {t("cancel")}
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white h-12"
              onClick={handlePasswordChange}
              disabled={!passwordData.newPassword || !passwordData.confirmPassword}
            >
              {t("updatePassword")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#5a9c3a]" />
              {t("applyForVerificationBadge")}
            </DialogTitle>
            <DialogDescription>
              {t("submitBusinessDocuments")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <Label htmlFor="businessLicense" className="text-base font-semibold">{t("businessLicenseNumber")}</Label>
              <Input
                id="businessLicense"
                value={verificationData.businessLicense}
                onChange={(e) => setVerificationData({ ...verificationData, businessLicense: e.target.value })}
                className="mt-2 h-12 border-2"
                placeholder={t("enterBusinessLicense")}
              />
            </div>
            <div>
              <Label htmlFor="taxId" className="text-base font-semibold">{t("taxIdEinLabel")}</Label>
              <Input
                id="taxId"
                value={verificationData.taxId}
                onChange={(e) => setVerificationData({ ...verificationData, taxId: e.target.value })}
                className="mt-2 h-12 border-2"
                placeholder="12-3456789"
              />
            </div>
            <div>
              <Label className="text-base font-semibold mb-3 block">{t("uploadDocuments")}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#5a9c3a] transition-colors cursor-pointer">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600 mb-1">{t("clickToUpload")}</p>
                <p className="text-xs text-gray-500">{t("businessLicenseTaxDocuments")}</p>
                <Button variant="outline" className="mt-4 gap-2">
                  <Upload className="w-4 h-4" />
                  {t("chooseFiles")}
                </Button>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">{t("verificationProcess")}</p>
                  <p className="text-xs text-blue-700">{t("documentsReviewed")}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerificationModal(false)} className="h-12">
              {t("cancel")}
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#5a9c3a] to-[#0d7a3f] hover:from-[#0d7a3f] hover:to-[#5a9c3a] text-white h-12"
              onClick={handleVerificationSubmit}
            >
              {t("submitForVerification")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {t("deleteProfile")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-600 pt-2">
              {t("deleteProfileDescription")}
              <br />
              <br />
              <span className="text-red-600 font-medium">{t("actionCannotBeUndone")}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeletingAccount}
              className="h-10"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-red-600 hover:bg-red-700 text-white h-10"
            >
              {isDeletingAccount ? t("deleting") : t("deleteProfileButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
