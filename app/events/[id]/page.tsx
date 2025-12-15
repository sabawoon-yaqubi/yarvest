"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle2, User, Mail, Phone } from "lucide-react"
import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { BackendEvent } from "@/types/event"
import api from "@/lib/axios"
import { EventDetailSkeleton } from "@/components/event-detail-skeleton"

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [error, setError] = useState("")

  // Fetch event details
  const { data: eventResponse, loading, error: fetchError, refetch } = useApiFetch<BackendEvent>(
    `/events/${eventId}`
  )

  const event = eventResponse || null

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!formData.name.trim()) {
      setError("Please enter your name")
      return
    }
    
    if (!formData.email.trim()) {
      setError("Please enter your email")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post(`/events/${eventId}/attend`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
      })

      if (response.data.success) {
        setSignUpSuccess(true)
        setFormData({ name: "", email: "", phone: "" })
        // Refetch event to update attendee count
        setTimeout(() => {
          refetch()
          setSignUpSuccess(false)
        }, 3000)
      } else {
        setError(response.data.message || "Failed to sign up for event")
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to sign up for event"
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <EventDetailSkeleton />
        </main>
        <Footer />
      </div>
    )
  }

  if (fetchError || !event) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-12 bg-gradient-to-b from-white to-secondary/10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Event Not Found</h2>
              <p className="text-muted-foreground mb-8">{fetchError || "The event you're looking for doesn't exist."}</p>
              <Link href="/events">
                <Button className="bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white">
                  Back to Events
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const attendancesCount = event.attendances_count || event.attendances?.length || 0
  const eventDate = new Date(event.date)
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/30 to-white pb-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Back Button */}
          <Link href="/events">
            <Button variant="ghost" className="mb-6 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Image */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.name}
                  className="w-full h-[450px] object-cover"
                />
                {event.event_type && (
                  <div className="absolute top-6 left-6 bg-[#5a9c3a] text-white px-4 py-2 rounded-full text-xs font-bold uppercase shadow-lg">
                    {event.event_type}
                  </div>
                )}
              </div>

              {/* Event Title and Description */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{event.name}</h1>
                <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>

              {/* Event Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-7 h-7 text-[#5a9c3a]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date</p>
                      <p className="font-semibold text-gray-900 text-base">{formattedDate}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="font-semibold text-gray-900 text-base">{event.location}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Attendees</p>
                      <p className="font-semibold text-gray-900 text-base">{attendancesCount} registered</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column - Sign Up Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 bg-white border border-gray-200 shadow-lg rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Join This Event</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Register now to secure your spot at this amazing event!
                </p>

                {signUpSuccess ? (
                  <div className="py-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Successfully Registered!</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      You've been registered for this event. We'll send you a confirmation email shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-5">
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5a9c3a]/20 focus:border-[#5a9c3a] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5a9c3a]/20 focus:border-[#5a9c3a] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Phone Number <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5a9c3a]/20 focus:border-[#5a9c3a] transition-colors"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl h-12 text-base shadow-md transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Registering...
                        </span>
                      ) : (
                        "Register for Event"
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center pt-2">
                      By registering, you agree to receive event updates via email.
                    </p>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
