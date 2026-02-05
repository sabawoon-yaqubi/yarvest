"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Eye, EyeOff, Mail, ArrowLeft, Lock, User, CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSafeTranslations, useSafeLocale } from "@/hooks/use-safe-translations"
import { getLocalizedPath } from "@/lib/locale-utils"
import { type Locale } from '@/i18n'
import { useAuthStore } from "@/stores/auth-store"
import { useAddressStore } from "@/stores/address-store"
import { handleLogin, migrateLocalAddressesToBackend, transformBackendUser, mapBackendRoles } from "@/lib/auth-utils"
import { getDashboardPath, storeAuthToken } from "@/lib/auth"
import api from "@/lib/axios"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: 'login' | 'signup'
}

export function AuthModal({ open, onOpenChange, initialMode = 'login' }: AuthModalProps) {
  const t = useSafeTranslations('auth')
  const tCommon = useSafeTranslations('common')
  const locale = useSafeLocale()
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  // Update mode when modal opens or initialMode changes
  useEffect(() => {
    if (open) {
      setMode(initialMode)
    }
  }, [open, initialMode])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState("")
  const [verificationError, setVerificationError] = useState("")
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [userRoles, setUserRoles] = useState<any[]>([])
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const refreshUser = useAuthStore((state) => state.refreshUser)
  const setVerificationHandledInAuthModal = useAuthStore((state) => state.setVerificationHandledInAuthModal)
  const fetchAddresses = useAddressStore((state) => state.fetchAddresses)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError(t('emailRequired') + ' ' + t('passwordRequired'))
      return
    }
    
    setIsLoading(true)

    try {
      const result = await handleLogin(email, password, rememberMe)
      
      if (result.success && result.user) {
        login(result.user)
        
        // Check if email is verified
        if (!result.user.email_verified_at) {
          // Email not verified - close modal, blocker will handle verification UI
          onOpenChange(false)
          resetForm()
          return
        }
        
        try {
          await migrateLocalAddressesToBackend()
          await fetchAddresses()
        } catch (migrationError) {
          console.error('Address migration error:', migrationError)
        }
        
        onOpenChange(false)
        resetForm()
        // Don't redirect here - let AuthModalProvider handle redirect based on returnUrl
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firstName.trim() || !lastName.trim()) {
      setError(t('nameRequired'))
      return
    }

    if (!email.trim()) {
      setError(t('emailRequired'))
      return
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'))
      return
  }

    setIsLoading(true)

    try {
      const response = await api.post('/register', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      })

      if (response.data.success && response.data.data) {
        const { user, roles, token } = response.data.data
        
        storeAuthToken(token)
        const userData = transformBackendUser(user)
        const frontendRoles = mapBackendRoles(roles)
        
        login(userData)
        setUserRoles(frontendRoles)
        
        try {
          await migrateLocalAddressesToBackend()
          await fetchAddresses()
        } catch (migrationError) {
          console.error('Address migration error:', migrationError)
        }

        // Send verification email
        const userEmail = email.trim().toLowerCase()
        setRegisteredEmail(userEmail)
        try {
          await api.post('/send-verification-email', { email: userEmail })
        } catch (verificationError) {
          console.error('Error sending verification email:', verificationError)
        }

        // Close modal - blocker will handle verification UI
          onOpenChange(false)
          resetForm()
      } else {
        setError(response.data.message || "Registration failed. Please try again.")
      }
    } catch (err: any) {
      if (err.response) {
        const errorData = err.response.data
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0]
          setError(Array.isArray(firstError) ? firstError[0] : firstError)
        } else {
          setError(errorData.message || "Registration failed. Please try again.")
        }
      } else if (err.request) {
        setError("Unable to connect. Please check your internet connection.")
      } else {
        setError("An error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!forgotEmail) {
      setError(t('emailRequired'))
      return
    }
    
    setForgotLoading(true)

    try {
      const response = await api.post('/forgot-password', {
        email: forgotEmail.trim(),
      })

      if (response.data.success) {
        setForgotSuccess(true)
    setError("")
      } else {
        setError(response.data.message || "Failed to send reset link.")
      }
    } catch (err: any) {
      if (err.response) {
        const errorMessage = err.response.data?.message || "Failed to send reset link. Please try again."
        setError(errorMessage)
      } else {
        setError("Unable to connect to server. Please check your internet connection.")
      }
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setIsSendingVerification(true)
    setVerificationError("")
    setVerificationMessage("")

    try {
      const response = await api.post('/send-verification-email', { email: registeredEmail })
      
      if (response.data.success) {
        setVerificationMessage("Verification email sent! Please check your inbox.")
      } else {
        setVerificationError(response.data.message || "Failed to send verification email")
      }
    } catch (err: any) {
      setVerificationError(err.response?.data?.message || "Failed to send verification email. Please try again.")
    } finally {
      setIsSendingVerification(false)
    }
  }

  const handleVerifyEmail = async (token: string, email: string) => {
    setIsVerifying(true)
    setVerificationError("")
    setVerificationMessage("")

    try {
      const response = await api.post('/verify-email', { token, email })
      
      if (response.data.success) {
        setIsVerified(true)
        setVerificationMessage("Email verified successfully!")
        
        // Refresh user data
        refreshUser()
        setVerificationHandledInAuthModal(false) // Clear flag since verification is done
        
        // Redirect after a short delay
        setTimeout(() => {
          onOpenChange(false)
          resetForm()
          router.push(getLocalizedPath('/', locale as Locale))
        }, 1500)
      } else {
        setVerificationError(response.data.message || "Failed to verify email")
      }
    } catch (err: any) {
      setVerificationError(err.response?.data?.message || "Failed to verify email. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  // Check for verification token in URL when modal opens or when registeredEmail changes
  useEffect(() => {
    if (open && typeof window !== 'undefined' && registeredEmail) {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const emailParam = params.get('email')
      
      if (token && emailParam && emailParam === registeredEmail && !isVerifying && !isVerified) {
        handleVerifyEmail(token, emailParam)
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, registeredEmail])

  // Also check URL when modal opens even without registeredEmail (for direct email link clicks)
  useEffect(() => {
    if (open && typeof window !== 'undefined' && !registeredEmail) {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const emailParam = params.get('email')
      
      if (token && emailParam && !isVerifying && !isVerified) {
        // If we have a token but no registered email, fetch user info or set email from URL
        setRegisteredEmail(emailParam)
        setShowVerificationMessage(true)
        handleVerifyEmail(token, emailParam)
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
    }
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setFirstName("")
    setLastName("")
    setShowPassword(false)
    setRememberMe(false)
    setError("")
    setShowForgotPassword(false)
    setForgotEmail("")
    setForgotSuccess(false)
    setShowVerificationMessage(false)
    setIsVerified(false)
    setIsVerifying(false)
    setVerificationMessage("")
    setVerificationError("")
    setIsSendingVerification(false)
    setRegisteredEmail("")
    setUserRoles([])
    setMode('login')
    setVerificationHandledInAuthModal(false) // Clear flag when modal closes
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          onOpenChange(false)
          resetForm()
        }}
      />
      
      {/* Modal */}
        <div className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#0A8542]/5 to-transparent">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.prod.website-files.com/67c12ad0bddda4257ffc4539/67c15cdb77981e22a226bc86_Navbar%20Brand.svg"
                alt="Yarvest"
                className="h-9"
              />
            </div>
            <button
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {showForgotPassword ? (
              /* Forgot Password View */
              <>
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setShowForgotPassword(false)
                      setError("")
                      setForgotSuccess(false)
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('backToLogin')}</span>
                  </button>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('forgotPasswordTitle')}</h2>
                  <p className="text-gray-600">{t('forgotPasswordMessage')}</p>
                </div>

                {forgotSuccess ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700 font-medium mb-2">✓ {t('resetLinkSent')}</p>
                    <p className="text-sm text-green-600">
                      {t('resetLinkMessage', { email: forgotEmail })}
                    </p>
                  </div>
                ) : (
                  <>
            {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

                    <form onSubmit={handleForgotPassword} className="space-y-6">
                      <div>
                        <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('email')}
                        </label>
                        <div className="relative">
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8542]/20 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors"
                            required
                            autoFocus
                          />
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full py-4 text-base font-semibold bg-[#0A8542] hover:bg-[#097038] text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {forgotLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('sending')}
                          </span>
                        ) : (
                          t('sendResetLink')
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </>
            ) : mode === 'login' ? (
              /* Login View */
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('login')}</h2>
                  <p className="text-gray-600">{t('loginWelcome')}</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('email')}
                    </label>
                    <div className="relative">
                  <Input
                        id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8542]/20 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors"
                        required
                        autoFocus
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('password')}
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8542]/20 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors"
                    required
                  />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me and Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-[#0A8542] border-gray-300 rounded focus:ring-[#0A8542] focus:ring-2 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{t('rememberMe')}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true)
                        setError("")
                      }}
                      className="text-sm text-[#0A8542] hover:text-[#097038] font-medium transition-colors"
                    >
                      {t('forgotPassword')}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 text-base font-semibold bg-[#0A8542] hover:bg-[#097038] text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('loggingIn')}
                      </span>
                    ) : (
                      t('login')
                    )}
                  </Button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-6 text-center pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    {t('dontHaveAccount')}{" "}
                  <button
                      onClick={() => {
                        setMode('signup')
                        setError("")
                      }}
                      className="text-[#0A8542] hover:text-[#097038] font-semibold hover:underline transition-colors"
                    >
                      {t('signUpLink')}
                  </button>
                  </p>
                </div>
              </>
            ) : showVerificationMessage ? (
              /* Email Verification View */
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                    {isVerified ? t('emailVerified') : t('verifyEmail')}
                  </h2>
                  <p className="text-gray-600 text-center">
                    {isVerified 
                      ? t('emailVerifiedMessage')
                      : t('verificationSent', { email: registeredEmail })
                    }
                  </p>
                </div>

                {isVerified ? (
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-green-100 p-4">
                        <CheckCircle2 className="w-16 h-16 text-green-600" />
                      </div>
                    </div>
                    <p className="text-green-600 font-medium text-lg">{t('emailVerifiedMessage')}</p>
                    <p className="text-sm text-gray-500">{t('redirecting')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-primary/10 p-4">
                        <Mail className="w-16 h-16 text-primary" />
                      </div>
                    </div>

                    {verificationMessage && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">{verificationMessage}</p>
                      </div>
                    )}

                    {verificationError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{verificationError}</p>
                      </div>
                    )}

                    {isVerifying && (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <p className="text-sm">{t('verifying')}</p>
                      </div>
                    )}

                <Button
                      onClick={handleResendVerification}
                      disabled={isSendingVerification || isVerifying}
                      className="w-full py-4 text-base font-semibold bg-[#0A8542] hover:bg-[#097038] text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                      {isSendingVerification ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t('sending')}
                        </span>
                      ) : (
                        <>
                          <Mail className="w-5 h-5 mr-2 inline" />
                          {t('resendVerification')}
                        </>
                      )}
                </Button>

                    <p className="text-xs text-center text-gray-500">
                      {t('verificationCheckSpam')}
                    </p>
                </div>
                )}
              </>
            ) : (
              /* Signup View */
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('signup')}</h2>
                  <p className="text-gray-600">{t('signupSubtitle')}</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSignupSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fullName')}
                    </label>
                <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                  <Input
                    type="text"
                          placeholder={t('firstName')}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pl-4 pr-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8542]/20 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors"
                    required
                    autoFocus
                  />
                      </div>
                      <div className="relative">
                  <Input
                    type="text"
                          placeholder={t('lastName')}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full pl-4 pr-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8542]/20 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors"
                    required
                  />
                      </div>
                    </div>
                </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('email')}
                    </label>
                    <div className="relative">
                <Input
                        id="signup-email"
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8542]/20 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors"
                  required
                />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('password')}
                    </label>
                    <div className="relative">
                <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('passwordPlaceholderSignup')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A8542]/20 focus:border-[#0A8542] focus:outline-none bg-white hover:border-gray-400 transition-colors"
                  required
                        minLength={8}
                />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                </div>
                    {password && password.length < 8 && (
                      <p className="mt-1.5 text-xs text-amber-600">{t('passwordMinLength')}</p>
                    )}
                </div>

                  {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                    className="w-full py-4 text-base font-semibold bg-[#0A8542] hover:bg-[#097038] text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('creatingAccount')}
                      </span>
                    ) : (
                      t('signup')
                    )}
                </Button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    {t('alreadyHaveAccount')}{" "}
                    <button
                      onClick={() => {
                        setMode('login')
                        setError("")
                      }}
                      className="text-[#0A8542] hover:text-[#097038] font-semibold hover:underline transition-colors"
                    >
                      {t('signInLink')}
                    </button>
                </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
