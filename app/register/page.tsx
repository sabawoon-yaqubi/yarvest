"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag, Leaf, Users, ArrowLeft, CheckCircle } from "lucide-react"
import { registerUser, loginUser } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      // Split the name into first and last name
      const nameParts = formData.name.trim().split(/\s+/)
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || nameParts[0] || ""
      
      // Register with default values for phone and buyer role
      const result = registerUser(
        firstName,
        lastName,
        formData.email,
        formData.password,
        "", // phone - optional, can be added later
        ["buyer"] // default role
      )
      
      if (result.success) {
        // Auto-login after registration
        const loginResult = loginUser(formData.email, formData.password)
        if (loginResult.success && loginResult.user) {
          login(loginResult.user)
          router.push("/")
        } else {
          router.push("/login")
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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A5D31] to-[#16a34a] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Start your journey to<br />healthier eating today
            </h1>
            <p className="text-xl text-white/90">
              Join our community and discover the best local produce.
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <p className="text-lg">Access to 100+ local farmers and producers</p>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <p className="text-lg">Fresh produce delivered same-day</p>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <p className="text-lg">Support your local community</p>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <p className="text-lg">Exclusive deals and seasonal offers</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">15,000+</p>
                <p className="text-white/80 text-sm">Happy customers</p>
              </div>
            </div>
            <p className="text-white/90 text-sm italic">
              "Best decision I made this year. The quality and freshness is unmatched!"
            </p>
            <p className="text-white/70 text-xs mt-2">- Sarah M., San Francisco</p>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2024 Yarvest. Supporting local communities.
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <img
                src="https://cdn.prod.website-files.com/67c12ad0bddda4257ffc4539/67c15cdb77981e22a226bc86_Navbar%20Brand.svg"
                alt="Yarvest"
                className="h-10 mx-auto"
              />
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[#0A5D31] font-semibold hover:text-[#16a34a] transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-900 block">
                Full name
              </label>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A5D31] focus:border-transparent bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-900 block">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A5D31] focus:border-transparent bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-900 block">
                Password
              </label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A5D31] focus:border-transparent bg-white"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900 block">
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A5D31] focus:border-transparent bg-white"
                required
              />
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-600">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-[#0A5D31] hover:text-[#16a34a] underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#0A5D31] hover:text-[#16a34a] underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 text-base font-semibold bg-[#0A5D31] hover:bg-[#16a34a] text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </Button>

            <div className="text-center pt-2">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Continue as guest
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
