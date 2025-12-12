"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight, Gift, Loader2 } from "lucide-react"
import { useState } from "react"
import { subscribeToNewsletter } from "@/lib/newsletter-api"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      return
    }

    setIsLoading(true)
    try {
      await subscribeToNewsletter(email.trim())
      setEmail("")
    } catch (error) {
      // Error handling is done in the API function with toast notifications
      console.error("Newsletter subscription error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0A5D31] to-[#0d7a3f] rounded-3xl p-8 md:p-12 text-white">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
      
      <div className="relative max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest updates on fresh produce, special deals, and community events.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-6 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white placeholder:text-white/70 focus:border-white rounded-xl"
              required
            />
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-white text-[#0A5D31] hover:bg-gray-100 px-8 py-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                Subscribe
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-6 text-white/80 text-sm">
          <Gift className="w-4 h-4" />
          <span>Get 10% off your first order when you subscribe!</span>
        </div>
      </div>
    </div>
  )
}

