"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { X, Chrome, Phone, ShoppingBag, Store, Users, Truck, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { loginUser, getUserByEmail, ROLES, type Role } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: "login" | "signup"
}

export function AuthModal({ open, onOpenChange, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)
  const [step, setStep] = useState<"email" | "password" | "register" | "role" | "address">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([])
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street_address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    apt: "",
    business_name: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleEmailContinue = () => {
    if (!email) return
    
    setError("")
    // Check if user exists
    const user = getUserByEmail(email)
    
    if (mode === "login") {
      if (user) {
        setStep("password")
      } else {
        setError("No account found with this email. Please sign up.")
      }
    } else {
      if (user) {
        setError("An account with this email already exists. Please log in.")
      } else {
        setStep("register")
      }
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { getDashboardPath } = await import("@/lib/auth")
      const result = loginUser(email, password)
      
      if (result.success && result.user) {
        login(result.user)
        onOpenChange(false)
        resetForm()
        
        // Redirect to appropriate dashboard based on role
        if (result.roles && result.roles.length > 0) {
          const dashboardPath = getDashboardPath(result.roles)
          router.push(dashboardPath)
        } else {
          router.push("/")
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setError("Please fill in all required fields")
      return
    }

    // Move to role selection step
    setStep("role")
  }

  const handleRoleStep = () => {
    if (selectedRoles.length === 0) {
      setError("Please select at least one role")
      return
    }
    setError("")
    setStep("address")
  }

  const handleRegisterFinal = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { registerUser, getDashboardPath } = await import("@/lib/auth")
      const result = registerUser(
        formData.firstName,
        formData.lastName,
        email,
        password,
        formData.phone,
        selectedRoles,
        {
          street_address: formData.street_address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postal_code,
          apt: formData.apt,
          business_name: formData.business_name,
        }
      )
      
      if (result.success) {
        const loginResult = loginUser(email, password)
        if (loginResult.success && loginResult.user) {
          login(loginResult.user)
          onOpenChange(false)
          resetForm()
          
          // Redirect to appropriate dashboard based on role
          const dashboardPath = getDashboardPath(selectedRoles)
          router.push(dashboardPath)
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep("email")
    setEmail("")
    setPassword("")
    setSelectedRoles([])
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      street_address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      apt: "",
      business_name: "",
    })
    setError("")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const toggleRole = (role: Role) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
    setError("")
  }

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "buyer": return ShoppingBag
      case "seller": return Store
      case "helper": return Users
      case "deliverer": return Truck
      default: return ShoppingBag
    }
  }

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login")
    resetForm()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          onOpenChange(false)
          resetForm()
        }}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[600px] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-12">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <button
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors -ml-1"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={switchMode}
              className="text-base font-medium text-gray-700 hover:bg-gray-100 px-5 py-2.5 rounded-full transition-colors bg-gray-50"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-[32px] font-semibold text-gray-900 mb-8">
              {mode === "login" ? "Log in" : "Sign up"}
            </h2>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm mb-6">
                {error}
              </div>
            )}

            {step === "email" && (
              <>
                <form onSubmit={(e) => { e.preventDefault(); handleEmailContinue(); }} className="space-y-5">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full py-4 text-base font-semibold bg-[#0A8542] hover:bg-[#097038] text-white rounded-full transition-all h-14"
                  >
                    Continue
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-600 font-normal">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3.5 px-4 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full transition-all bg-white"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-800">Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3.5 px-4 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full transition-all bg-white"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-800">Facebook</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3.5 px-4 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full transition-all bg-white"
                  >
                    <Phone className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-medium text-gray-800">Phone</span>
                  </button>
                </div>
              </>
            )}

            {step === "password" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="text-sm text-gray-600 mb-6">
                  <span className="font-medium">{email}</span>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-[#0A8542] hover:underline font-medium"
                  >
                    Change
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                  required
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 text-base font-semibold bg-[#0A8542] hover:bg-[#097038] text-white rounded-full transition-all h-14 disabled:opacity-50"
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    className="text-sm text-[#0A8542] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            )}

            {step === "register" && (
              <form onSubmit={handleRegisterStep1} className="space-y-4">
                <div className="text-sm text-gray-600 mb-6">
                  <span className="font-medium">{email}</span>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-[#0A8542] hover:underline font-medium"
                  >
                    Change
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="First name *"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                    required
                    autoFocus
                  />
                  <Input
                    type="text"
                    placeholder="Last name *"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                    required
                  />
                </div>

                <Input
                  type="tel"
                  placeholder="Phone number *"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                  required
                />

                <Input
                  type="password"
                  placeholder="Create a password (min. 6 characters) *"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                  required
                  minLength={6}
                />

                <Button
                  type="submit"
                  className="w-full py-4 text-base font-semibold bg-[#0A8542] hover:bg-[#097038] text-white rounded-full transition-all h-14"
                >
                  Continue to role selection
                </Button>

                <p className="text-xs text-gray-500 text-center pt-2">
                  * Required fields
                </p>
              </form>
            )}

            {step === "role" && (
              <div className="space-y-6">
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Select your role(s)</span>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => setStep("register")}
                    className="text-[#0A8542] hover:underline font-medium"
                  >
                    Back
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Choose one or more roles that apply to you:
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {Object.values(ROLES).map((role) => {
                    const Icon = getRoleIcon(role.name)
                    const isSelected = selectedRoles.includes(role.name as Role)
                    
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => toggleRole(role.name as Role)}
                        className={`relative p-4 border-2 rounded-xl text-left transition-all ${
                          isSelected 
                            ? 'border-[#0A8542] bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-[#0A8542] text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900">{role.label}</h3>
                              {isSelected && (
                                <Check className="w-5 h-5 text-[#0A8542]" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <Button
                  type="button"
                  onClick={handleRoleStep}
                  className="w-full py-4 text-base font-semibold bg-[#0A8542] hover:bg-[#097038] text-white rounded-full transition-all h-14"
                >
                  Continue to address
                </Button>
              </div>
            )}

            {step === "address" && (
              <form onSubmit={handleRegisterFinal} className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Delivery address</span>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => setStep("role")}
                    className="text-[#0A8542] hover:underline font-medium"
                  >
                    Back
                  </button>
                </div>

                <Input
                  type="text"
                  placeholder="Street address *"
                  value={formData.street_address}
                  onChange={(e) => handleInputChange("street_address", e.target.value)}
                  className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                  required
                  autoFocus
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="Apt/Suite (optional)"
                    value={formData.apt}
                    onChange={(e) => handleInputChange("apt", e.target.value)}
                    className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                  />
                  <Input
                    type="text"
                    placeholder="City *"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="State *"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Postal code *"
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange("postal_code", e.target.value)}
                    className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                    required
                  />
                </div>

                <Input
                  type="text"
                  placeholder="Country *"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                  required
                />

                <Input
                  type="text"
                  placeholder="Business name (optional)"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange("business_name", e.target.value)}
                  className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors h-14"
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 text-base font-semibold bg-[#0A8542] hover:bg-[#097038] text-white rounded-full transition-all h-14 disabled:opacity-50"
                >
                  {isLoading ? "Creating account..." : "Complete sign up"}
                </Button>

                <p className="text-xs text-gray-500 text-center pt-2">
                  By continuing, you agree to our{" "}
                  <a href="/terms" className="text-[#0A8542] hover:underline">Terms</a>
                  {" "}and{" "}
                  <a href="/privacy" className="text-[#0A8542] hover:underline">Privacy Policy</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

