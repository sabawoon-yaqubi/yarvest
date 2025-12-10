"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag, Leaf, Truck, ArrowLeft } from "lucide-react"
import { loginUser } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { getDashboardPath } = await import("@/lib/auth")
      const result = loginUser(email, password)
      
      if (result.success && result.user) {
        login(result.user)
        
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
              Fresh, local produce<br />delivered to your door
            </h1>
            <p className="text-xl text-white/90">
              Join thousands of families supporting local farmers and eating healthier.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-md">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Fresh Selection</h3>
                <p className="text-white/80 text-sm">Hand-picked produce from local farms</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Fast Delivery</h3>
                <p className="text-white/80 text-sm">Same-day delivery available</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Support Local</h3>
                <p className="text-white/80 text-sm">Help farmers in your community thrive</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2024 Yarvest. Supporting local communities.
        </div>
      </div>

      {/* Right Side - Login Form */}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">
              New to Yarvest?{" "}
              <Link href="/register" className="text-[#0A5D31] font-semibold hover:text-[#16a34a] transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-900 block">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-base border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A5D31] focus:border-transparent bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-gray-900 block">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-[#0A5D31] hover:text-[#16a34a] font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-base border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A5D31] focus:border-transparent bg-white"
                required
              />
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
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-center pt-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Continue as guest
              </Link>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="pt-4 border-t border-gray-200">
            <details className="group">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 font-medium list-none flex items-center justify-between">
                <span>Demo Accounts</span>
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 space-y-2 text-xs bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">Test with these accounts:</p>
                <p className="text-gray-700">Email: <span className="font-mono bg-white px-2 py-1 rounded">john@example.com</span></p>
                <p className="text-gray-700">Email: <span className="font-mono bg-white px-2 py-1 rounded">jane@example.com</span></p>
                <p className="text-gray-700">Password: <span className="font-mono bg-white px-2 py-1 rounded">password123</span></p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
