"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle, Mail, Phone, ArrowLeft, Loader2, Shield, Clock, Award, Heart, Users, Calendar } from "lucide-react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { getImageUrl } from "@/lib/utils"
import { ApiVolunteer } from "@/components/volunteers-section"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { submitContactForm } from "@/lib/contact-api"
import { useAuthStore } from "@/stores/auth-store"

interface VolunteerDetail {
  id: number
  unique_id: string
  name: string
  email: string
  phone?: string
  image?: string
  profile_picture?: string
  location: string
  verified: boolean
  bio?: string
  description?: string
  reviews?: {
    total: number
    average_rating: number
  }
  statistics?: {
    contributions: number
    rating: number
  }
  created_at?: string
}

export default function VolunteerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const volunteerId = params.id as string
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [contactErrors, setContactErrors] = useState<{ name?: string; email?: string; subject?: string; message?: string }>({})
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const { user } = useAuthStore()

  // Fetch volunteer details by ID
  const { data: volunteerResponse, loading, error, refetch } = useApiFetch<any>(
    `/volunteers/${volunteerId}`,
    {
      enabled: !!volunteerId,
    }
  )

  // Extract volunteer from response
  const volunteer: VolunteerDetail = volunteerResponse?.data || volunteerResponse

  const imageUrl = volunteer ? getImageUrl(volunteer.image || volunteer.profile_picture, volunteer.name) : ''
  const rating = volunteer?.reviews?.average_rating ?? volunteer?.statistics?.rating ?? 0
  const reviewCount = volunteer?.reviews?.total ?? 0
  const stats = volunteer?.statistics

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!volunteer) return
    
    // Reset errors
    setContactErrors({})
    
    // Validate form
    const errors: { name?: string; email?: string; subject?: string; message?: string } = {}
    
    // If user is not authenticated, require name and email
    if (!user) {
      if (!contactFormData.name.trim()) {
        errors.name = "Name is required"
      }
      if (!contactFormData.email.trim()) {
        errors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactFormData.email)) {
        errors.email = "Please enter a valid email address"
      }
    }
    
    if (!contactFormData.subject.trim()) {
      errors.subject = "Subject is required"
    }
    if (!contactFormData.message.trim()) {
      errors.message = "Message is required"
    }
    
    if (Object.keys(errors).length > 0) {
      setContactErrors(errors)
      return
    }
    
    setIsSubmittingContact(true)
    try {
      await submitContactForm({
        ...(user ? {} : { name: contactFormData.name, email: contactFormData.email }),
        subject: contactFormData.subject,
        message: contactFormData.message,
        type: 'volunteer_contact',
        recipient_id: volunteer.id,
      })
      setContactFormData({ name: '', email: '', subject: '', message: '' })
      setContactErrors({})
      setContactModalOpen(false)
    } catch (error: any) {
      // Handle backend validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const backendErrors = error.response.data.errors
        const formattedErrors: { name?: string; email?: string; subject?: string; message?: string } = {}
        
        if (backendErrors.name) {
          formattedErrors.name = Array.isArray(backendErrors.name) ? backendErrors.name[0] : backendErrors.name
        }
        if (backendErrors.email) {
          formattedErrors.email = Array.isArray(backendErrors.email) ? backendErrors.email[0] : backendErrors.email
        }
        if (backendErrors.subject) {
          formattedErrors.subject = Array.isArray(backendErrors.subject) ? backendErrors.subject[0] : backendErrors.subject
        }
        if (backendErrors.message) {
          formattedErrors.message = Array.isArray(backendErrors.message) ? backendErrors.message[0] : backendErrors.message
        }
        
        setContactErrors(formattedErrors)
      }
      console.error('Failed to send message:', error)
    } finally {
      setIsSubmittingContact(false)
    }
  }

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('Volunteer ID from params:', volunteerId)
    console.log('Volunteer Response:', volunteerResponse)
    console.log('Found Volunteer:', volunteer)
    console.log('Loading:', loading)
    console.log('Error:', error)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="bg-white rounded-xl p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto md:mx-0"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Volunteer</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
                <Button onClick={() => router.push('/volunteers-list')} className="bg-[#5a9c3a] hover:bg-[#0d7a3f]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Volunteers
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Not found state - show if we've finished loading and volunteer is not found
  if (!loading && !error && !volunteer) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Volunteer Not Found</h1>
              <p className="text-gray-600 mb-6">
                The volunteer you're looking for doesn't exist or has been removed.
                {volunteerId && ` (ID: ${volunteerId})`}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
                <Button onClick={() => router.push('/volunteers-list')} className="bg-[#5a9c3a] hover:bg-[#0d7a3f]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Volunteers
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Don't render main content if volunteer is not found (shouldn't reach here due to check above)
  if (!volunteer) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Volunteer Profile */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-[#5a9c3a]/20 mx-auto md:mx-0">
                      {imageUrl && imageUrl !== "/placeholder.png" ? (
                        <img
                          src={imageUrl}
                          alt={volunteer.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.png"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100">
                          <Users className="w-16 h-16 text-[#5a9c3a]" />
                        </div>
                      )}
                    </div>
                    {volunteer.verified && (
                      <div className="absolute -bottom-2 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0">
                        <Badge className="bg-[#5a9c3a] text-white px-3 py-1 text-xs font-semibold flex items-center gap-1 shadow-md">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {volunteer.name}
                      </h1>
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{volunteer.location}</span>
                      </div>
                    </div>
                    {reviewCount > 0 && (
                      <div className="flex items-center justify-center md:justify-end gap-2">
                        <div className="flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-lg">
                          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-600">({reviewCount})</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Member Since */}
                  {volunteer.created_at && (
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {new Date(volunteer.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section - Real Data */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#5a9c3a]/10 rounded-full mb-3">
                  <Heart className="w-6 h-6 text-[#5a9c3a]" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.contributions || 0}
                </div>
                <div className="text-sm text-gray-600">Contributions</div>
              </div>
              {rating > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#5a9c3a]/10 rounded-full mb-3">
                    <Star className="w-6 h-6 text-[#5a9c3a]" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                  {reviewCount > 0 && (
                    <div className="text-xs text-gray-500 mt-1">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</div>
                  )}
                </div>
              )}
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#5a9c3a]/10 rounded-full mb-3">
                  <Award className="w-6 h-6 text-[#5a9c3a]" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {volunteer.verified ? 'Verified' : 'Active'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Why Work With This Volunteer?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#5a9c3a]/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#5a9c3a]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Verified & Trusted</h3>
                  <p className="text-sm text-gray-600">
                    {volunteer.verified 
                      ? 'Background checked and verified by Yarvest' 
                      : 'Active community member'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#5a9c3a]/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#5a9c3a]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Community Focused</h3>
                  <p className="text-sm text-gray-600">Dedicated to supporting local farmers and harvesting efforts</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#5a9c3a]/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#5a9c3a]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Reliable & Committed</h3>
                  <p className="text-sm text-gray-600">Consistent participation in community activities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-[#5a9c3a]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#5a9c3a]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Team Player</h3>
                  <p className="text-sm text-gray-600">
                    {reviewCount > 0 
                      ? `Rated ${rating.toFixed(1)} by ${reviewCount} community members` 
                      : 'Ready to contribute to community projects'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Contact Modal */}
      <Dialog open={contactModalOpen} onOpenChange={() => {
        setContactModalOpen(false)
        setContactFormData({ name: '', email: '', subject: '', message: '' })
        setContactErrors({})
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Mail className="w-5 h-5 text-[#5a9c3a]" />
              Contact {volunteer?.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">
              Send a message to this volunteer. They will receive an email notification.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="px-6 py-4 pb-6 space-y-6">
            {/* Name and Email fields - only show if user is not authenticated */}
            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-name" className="text-sm font-medium text-gray-900 mb-2 block">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact-name"
                    value={contactFormData.name}
                    onChange={(e) => {
                      setContactFormData({ ...contactFormData, name: e.target.value })
                      if (contactErrors.name) {
                        setContactErrors({ ...contactErrors, name: undefined })
                      }
                    }}
                    placeholder="Your name"
                    className={`bg-white ${contactErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {contactErrors.name && (
                    <p className="text-sm text-red-500 mt-1">{contactErrors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="contact-email" className="text-sm font-medium text-gray-900 mb-2 block">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactFormData.email}
                    onChange={(e) => {
                      setContactFormData({ ...contactFormData, email: e.target.value })
                      if (contactErrors.email) {
                        setContactErrors({ ...contactErrors, email: undefined })
                      }
                    }}
                    placeholder="your.email@example.com"
                    className={`bg-white ${contactErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {contactErrors.email && (
                    <p className="text-sm text-red-500 mt-1">{contactErrors.email}</p>
                  )}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="contact-subject" className="text-sm font-medium text-gray-900 mb-2 block">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact-subject"
                value={contactFormData.subject}
                onChange={(e) => {
                  setContactFormData({ ...contactFormData, subject: e.target.value })
                  if (contactErrors.subject) {
                    setContactErrors({ ...contactErrors, subject: undefined })
                  }
                }}
                placeholder="Enter subject"
                className={`bg-white ${contactErrors.subject ? 'border-red-500' : 'border-gray-300'}`}
              />
              {contactErrors.subject && (
                <p className="text-sm text-red-500 mt-1">{contactErrors.subject}</p>
              )}
            </div>
            <div>
              <Label htmlFor="contact-message" className="text-sm font-medium text-gray-900 mb-2 block">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="contact-message"
                value={contactFormData.message}
                onChange={(e) => {
                  setContactFormData({ ...contactFormData, message: e.target.value })
                  if (contactErrors.message) {
                    setContactErrors({ ...contactErrors, message: undefined })
                  }
                }}
                placeholder="Enter your message"
                rows={6}
                className={`bg-white resize-none ${contactErrors.message ? 'border-red-500' : 'border-gray-300'}`}
              />
              {contactErrors.message && (
                <p className="text-sm text-red-500 mt-1">{contactErrors.message}</p>
              )}
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setContactModalOpen(false)
                  setContactFormData({ name: '', email: '', subject: '', message: '' })
                  setContactErrors({})
                }}
                className="flex-1"
                disabled={isSubmittingContact}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white"
                disabled={isSubmittingContact}
              >
                {isSubmittingContact ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

