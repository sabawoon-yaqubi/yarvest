"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, Star, MapPin, CheckCircle, Phone, Mail, Shield, Clock, Package, TrendingUp, Users, Award } from "lucide-react"
import { useState } from "react"

const volunteers = [
  {
    id: 1,
    name: "Fast Track Logistics",
    location: "San Francisco, CA",
    rating: 4.9,
    reviews: 156,
    verified: true,
    specialties: ["Fresh Produce", "Dairy Products", "Meat"],
    image: "https://images.unsplash.com/photo-1601581875033-18beb83b8e7c?w=500&h=400&fit=crop",
    phone: "(415) 555-0123",
    email: "contact@fasttrack.com",
    deliveryTime: "Same Day",
    coverage: "Bay Area",
    vehicles: 12,
    experience: "8 years",
  },
  {
    id: 2,
    name: "Green Express Delivery",
    location: "Oakland, CA",
    rating: 4.8,
    reviews: 203,
    verified: true,
    specialties: ["Organic Products", "Farm to Table"],
    image: "https://images.unsplash.com/photo-1601581875033-18beb83b8e7c?w=500&h=400&fit=crop",
    phone: "(510) 555-0456",
    email: "info@greenexpress.com",
    deliveryTime: "Next Day",
    coverage: "East Bay",
    vehicles: 8,
    experience: "5 years",
  },
  {
    id: 3,
    name: "Local Movers Co.",
    location: "Berkeley, CA",
    rating: 4.7,
    reviews: 89,
    verified: true,
    specialties: ["Bulk Orders", "Equipment Transport"],
    image: "https://images.unsplash.com/photo-1601581875033-18beb83b8e7c?w=500&h=400&fit=crop",
    phone: "(510) 555-0789",
    email: "hello@localmovers.com",
    deliveryTime: "Scheduled",
    coverage: "North Bay",
    vehicles: 15,
    experience: "12 years",
  },
  {
    id: 4,
    name: "Fresh Route Transport",
    location: "San Jose, CA",
    rating: 4.9,
    reviews: 234,
    verified: true,
    specialties: ["Temperature Controlled", "Express Delivery"],
    image: "https://images.unsplash.com/photo-1601581875033-18beb83b8e7c?w=500&h=400&fit=crop",
    phone: "(408) 555-0321",
    email: "contact@freshroute.com",
    deliveryTime: "Same Day",
    coverage: "South Bay",
    vehicles: 20,
    experience: "10 years",
  },
  {
    id: 5,
    name: "Eco Logistics Solutions",
    location: "Palo Alto, CA",
    rating: 4.8,
    reviews: 167,
    verified: true,
    specialties: ["Eco-Friendly", "Sustainable Transport"],
    image: "https://images.unsplash.com/photo-1601581875033-18beb83b8e7c?w=500&h=400&fit=crop",
    phone: "(650) 555-0654",
    email: "info@ecologistics.com",
    deliveryTime: "Next Day",
    coverage: "Peninsula",
    vehicles: 10,
    experience: "6 years",
  },
  {
    id: 6,
    name: "Premium Courier Services",
    location: "Fremont, CA",
    rating: 4.9,
    reviews: 145,
    verified: true,
    specialties: ["Premium Products", "White Glove Service"],
    image: "https://images.unsplash.com/photo-1601581875033-18beb83b8e7c?w=500&h=400&fit=crop",
    phone: "(510) 555-0987",
    email: "service@premiumcourier.com",
    deliveryTime: "Same Day",
    coverage: "Tri-Valley",
    vehicles: 6,
    experience: "4 years",
  },
]

const benefits = [
  {
    icon: Shield,
    title: "Verified & Insured",
    description: "All volunteers are verified and fully insured for your peace of mind",
  },
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Same-day and next-day delivery options available",
  },
  {
    icon: Package,
    title: "Safe Handling",
    description: "Specialized equipment for temperature-sensitive products",
  },
  {
    icon: TrendingUp,
    title: "Track Your Order",
    description: "Real-time tracking for all deliveries",
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Farm Owner",
    text: "Fast Track Logistics has been amazing. They handle our produce with care and always deliver on time.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Restaurant Owner",
    text: "Green Express Delivery is reliable and professional. They understand the importance of fresh ingredients.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Market Manager",
    text: "The volunteers on Yarvest are top-notch. Our customers always receive fresh products.",
    rating: 5,
  },
]

export default function VolunteersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)

  const specialties = ["All", "Fresh Produce", "Dairy Products", "Meat", "Organic Products", "Bulk Orders", "Temperature Controlled"]
  const filteredVolunteers = selectedSpecialty && selectedSpecialty !== "All"
    ? volunteers.filter(v => v.specialties.some(s => s.includes(selectedSpecialty)))
    : volunteers

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-16 bg-gradient-to-b from-white to-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0A5D31]/10 rounded-full mb-6">
                <Truck className="w-10 h-10 text-[#0A5D31]" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Volunteers & Couriers</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                Verified logistics partners who safely transport goods from farms to your door
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0A5D31]" />
                  <span>{volunteers.length} Verified Volunteers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0A5D31]" />
                  <span>4.8+ Average Rating</span>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <Card className="p-8 mb-12 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-[#0A5D31]/5 to-white">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: "1", title: "Choose Validator", desc: "Browse verified volunteers and select one that fits your needs" },
                  { step: "2", title: "Schedule Pickup", desc: "Coordinate pickup time and location with your chosen validator" },
                  { step: "3", title: "Track Delivery", desc: "Monitor your shipment in real-time from pickup to delivery" },
                  { step: "4", title: "Receive Goods", desc: "Get fresh products delivered safely to your door" },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-16 h-16 bg-[#0A5D31] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Benefits */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Volunteers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, idx) => (
                  <Card key={idx} className="p-6 rounded-2xl border-2 border-gray-200 hover:border-[#0A5D31] transition-all text-center">
                    <div className="w-14 h-14 bg-[#0A5D31]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-7 h-7 text-[#0A5D31]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Specialty Filter */}
            <div className="mb-8 flex flex-wrap gap-2 justify-center">
              {specialties.map((specialty) => (
                <Button
                  key={specialty}
                  variant={selectedSpecialty === specialty || (!selectedSpecialty && specialty === "All") ? "default" : "outline"}
                  onClick={() => setSelectedSpecialty(specialty === "All" ? null : specialty)}
                  className={`rounded-full ${
                    selectedSpecialty === specialty || (!selectedSpecialty && specialty === "All")
                      ? "bg-[#0A5D31] text-white"
                      : ""
                  }`}
                >
                  {specialty}
                </Button>
              ))}
            </div>

            {/* Volunteers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredVolunteers.map((validator) => (
                <Card key={validator.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-2xl border-2 border-gray-200">
                  <div className="relative h-48 bg-gray-100">
                    <img src={validator.image} alt={validator.name} className="w-full h-full object-cover" />
                    {validator.verified && (
                      <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{validator.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{validator.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{validator.rating}</span>
                      <span className="text-sm text-gray-500">({validator.reviews} reviews)</span>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-2">
                        {validator.specialties.map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Delivery: {validator.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Coverage: {validator.coverage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        <span>{validator.vehicles} Vehicles • {validator.experience}</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{validator.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{validator.email}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white">
                      Contact Validator
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Testimonials */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">What Our Partners Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, idx) => (
                  <Card key={idx} className="p-6 rounded-2xl border-2 border-gray-200">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <Card className="p-8 rounded-2xl border-2 border-[#0A5D31] bg-gradient-to-br from-[#0A5D31]/5 to-white text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Become a Validator</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join our network of verified volunteers and help connect local farms with customers. Apply today to start delivering fresh products.
              </p>
              <Button size="lg" className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white px-8">
                Apply Now
              </Button>
            </Card>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
