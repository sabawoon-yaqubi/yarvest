"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar, MapPin, Users, Clock, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useApiFetch } from "@/hooks/use-api-fetch"
import { BackendEvent } from "@/types/event"
import api from "@/lib/axios"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSignUpDialog, setShowSignUpDialog] = useState(false)
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
        }, 1000)
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

  const handleCloseDialog = () => {
    setShowSignUpDialog(false)
    setSignUpSuccess(false)
    setError("")
    setFormData({ name: "", email: "", phone: "" })
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-12 bg-gradient-to-b from-white to-secondary/10">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (fetchError || !event) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-12 bg-gradient-to-b from-white to-secondary/10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Event Not Found</h2>
              <p className="text-muted-foreground mb-8">{fetchError || "The event you're looking for doesn't exist."}</p>
              <Link href="/events">
                <Button className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white">
                  Back to Events
                </Button>
              </Link>
            </div>
          </div>
        </main>
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
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/30 to-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Back Button */}
          <Link href="/events">
            <Button variant="ghost" className="mb-6 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>

          {/* Event Image */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl mb-8">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.name}
              className="w-full h-[400px] object-cover"
            />
            {event.event_type && (
              <div className="absolute top-6 left-6 bg-[#0A5D31] text-white px-4 py-2 rounded-full text-xs font-bold uppercase shadow-lg">
                {event.event_type}
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground mb-4">{event.name}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            {/* Event Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5 bg-white border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#0A5D31]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold text-foreground">{formattedDate}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-white border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground">{event.location}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-white border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attendees</p>
                    <p className="font-semibold text-foreground">{attendancesCount} registered</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sign Up Button */}
            <div className="pt-6">
              <Button
                onClick={() => setShowSignUpDialog(true)}
                className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl h-14 text-lg shadow-lg"
              >
                Sign Up for This Event
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </main>

      {/* Sign Up Dialog */}
      <Dialog open={showSignUpDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Sign Up for Event</DialogTitle>
            <DialogDescription>
              Fill in your details to register for "{event.name}"
            </DialogDescription>
          </DialogHeader>

          {signUpSuccess ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Successfully Registered!</h3>
              <p className="text-muted-foreground mb-6">
                You've been registered for this event. We'll send you a confirmation email shortly.
              </p>
              <Button
                onClick={handleCloseDialog}
                className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-5 py-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-foreground mb-2 block">
                  Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#0A5D31] hover:bg-[#0d7a3f] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Register"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
