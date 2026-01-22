"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Handshake, Loader2, Building2, User, Phone, Mail, MessageSquare, Briefcase, Globe } from "lucide-react"
import { useState } from "react"
import { submitPartnerApplication, PartnerApplicationData } from "@/lib/partner-api"

export function BecomePartnerSection() {
  const [formData, setFormData] = useState<PartnerApplicationData>({
    company: "",
    name: "",
    phone: "",
    email: "",
    message: "",
    type_of_business: "",
    website: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: keyof PartnerApplicationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Basic validation
    if (!formData.name.trim()) {
      setErrors(prev => ({ ...prev, name: "Name is required" }))
      return
    }
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: "Email is required" }))
      return
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
      return
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      setErrors(prev => ({ ...prev, website: "Please enter a valid URL (starting with http:// or https://)" }))
      return
    }

    setIsLoading(true)
    try {
      await submitPartnerApplication(formData)
      // Reset form on success
      setFormData({
        company: "",
        name: "",
        phone: "",
        email: "",
        message: "",
        type_of_business: "",
        website: "",
      })
      setErrors({})
    } catch (error: any) {
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string[]> = error.response.data.errors
        const formattedErrors: Record<string, string> = {}
        Object.keys(backendErrors).forEach(key => {
          formattedErrors[key] = backendErrors[key][0]
        })
        setErrors(formattedErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5a9c3a]/10 rounded-full mb-4">
          <Handshake className="w-8 h-8 text-[#5a9c3a]" />
        </div>
        <h3 className="font-bold text-2xl sm:text-4xl text-foreground mb-2">Become Our Partner</h3>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          Join our network of trusted partners and help us build a sustainable food community together.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Company Name
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="Your company name"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className={errors.company ? "border-red-500" : ""}
              />
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Your Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Type of Business */}
            <div className="space-y-2">
              <Label htmlFor="type_of_business" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Type of Business
              </Label>
              <Input
                id="type_of_business"
                type="text"
                placeholder="e.g., Food Supplier, Distributor, etc."
                value={formData.type_of_business}
                onChange={(e) => handleChange("type_of_business", e.target.value)}
                className={errors.type_of_business ? "border-red-500" : ""}
              />
              {errors.type_of_business && (
                <p className="text-sm text-red-500">{errors.type_of_business}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className={errors.website ? "border-red-500" : ""}
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website}</p>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Tell us about your business and how you'd like to partner with us..."
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              rows={5}
              className={errors.message ? "border-red-500" : ""}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl transition-all h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Handshake className="w-5 h-5 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}





