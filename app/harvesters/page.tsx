"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Star, MapPin, CheckCircle, Calendar, DollarSign, Clock, Award, TrendingUp, Shield, Phone, Mail, Map } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const harvesters = [
  {
    id: 1,
    name: "Green Thumb Harvesters",
    location: "Napa Valley, CA",
    rating: 4.9,
    reviews: 124,
    verified: true,
    experience: "5+ years",
    specialties: ["Fruit Picking", "Vegetable Harvesting", "Seasonal Work"],
    hourlyRate: "$25-35",
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    teamSize: "5-10 workers",
    languages: ["English", "Spanish"],
    certifications: ["Food Safety", "Organic Certified"],
    completedJobs: 234,
  },
  {
    id: 2,
    name: "Seasonal Harvest Team",
    location: "Sonoma County, CA",
    rating: 4.8,
    reviews: 98,
    verified: true,
    experience: "3+ years",
    specialties: ["Organic Farms", "Small Farms", "Family Farms"],
    hourlyRate: "$20-30",
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    teamSize: "3-8 workers",
    languages: ["English"],
    certifications: ["Organic Certified"],
    completedJobs: 156,
  },
  {
    id: 3,
    name: "Farm Hands Collective",
    location: "Marin County, CA",
    rating: 4.7,
    reviews: 67,
    verified: true,
    experience: "2+ years",
    specialties: ["Quick Harvest", "Large Scale", "Equipment Operation"],
    hourlyRate: "$30-40",
    availability: "Available Next Week",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    teamSize: "10-20 workers",
    languages: ["English", "Spanish", "Tagalog"],
    certifications: ["Food Safety", "Equipment Certified"],
    completedJobs: 89,
  },
  {
    id: 4,
    name: "Expert Harvesters Pro",
    location: "Sacramento, CA",
    rating: 4.9,
    reviews: 187,
    verified: true,
    experience: "8+ years",
    specialties: ["Vineyard Work", "Orchard Management", "Precision Harvesting"],
    hourlyRate: "$35-45",
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    teamSize: "8-15 workers",
    languages: ["English", "Spanish"],
    certifications: ["Food Safety", "Organic Certified", "Vineyard Certified"],
    completedJobs: 312,
  },
  {
    id: 5,
    name: "Local Harvest Crew",
    location: "Fresno, CA",
    rating: 4.8,
    reviews: 145,
    verified: true,
    experience: "4+ years",
    specialties: ["Field Crops", "Vegetable Farms", "Quick Turnaround"],
    hourlyRate: "$22-32",
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    teamSize: "6-12 workers",
    languages: ["English", "Spanish"],
    certifications: ["Food Safety"],
    completedJobs: 201,
  },
  {
    id: 6,
    name: "Premium Harvest Services",
    location: "Monterey, CA",
    rating: 5.0,
    reviews: 98,
    verified: true,
    experience: "6+ years",
    specialties: ["Organic Farms", "Premium Produce", "Quality Focus"],
    hourlyRate: "$40-50",
    availability: "Available Next Week",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?w=500&h=400&fit=crop",
    teamSize: "4-8 workers",
    languages: ["English", "Spanish"],
    certifications: ["Food Safety", "Organic Certified", "Quality Assurance"],
    completedJobs: 167,
  },
]

const benefits = [
  {
    icon: Shield,
    title: "Verified Teams",
    description: "All harvesters are verified and background checked",
  },
  {
    icon: Award,
    title: "Experienced Workers",
    description: "Skilled professionals with years of harvesting experience",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Available for same-day or scheduled harvests",
  },
  {
    icon: TrendingUp,
    title: "Quality Guaranteed",
    description: "Careful handling to preserve product quality",
  },
]

const testimonials = [
  {
    name: "Robert Martinez",
    role: "Farm Owner",
    text: "Green Thumb Harvesters helped us harvest our entire tomato crop efficiently. Professional and reliable team!",
    rating: 5,
  },
  {
    name: "Jennifer Lee",
    role: "Orchard Manager",
    text: "Expert Harvesters Pro understands the importance of timing in fruit harvesting. Highly recommended!",
    rating: 5,
  },
  {
    name: "David Thompson",
    role: "Small Farm Owner",
    text: "The Seasonal Harvest Team was perfect for our small organic farm. Affordable and quality work.",
    rating: 5,
  },
]

export default function HarvestersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)

  const specialties = ["All", "Fruit Picking", "Vegetable Harvesting", "Organic Farms", "Large Scale", "Vineyard Work"]
  const filteredHarvesters = selectedSpecialty && selectedSpecialty !== "All"
    ? harvesters.filter(h => h.specialties.some(s => s.includes(selectedSpecialty)))
    : harvesters

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
                <Users className="w-10 h-10 text-[#0A5D31]" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Harvesters</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                Connect with experienced harvesters to help with your farm operations
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0A5D31]" />
                  <span>{harvesters.length} Verified Teams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0A5D31]" />
                  <span>4.8+ Average Rating</span>
                </div>
              </div>
              <Link href="/harvesters/map">
                <Button className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
                  <Map className="w-5 h-5 mr-2" />
                  View on Map
                </Button>
              </Link>
            </div>

            {/* How It Works */}
            <Card className="p-8 mb-12 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-[#0A5D31]/5 to-white">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: "1", title: "Post Your Need", desc: "Describe your harvesting requirements and timeline" },
                  { step: "2", title: "Get Matched", desc: "We'll connect you with qualified harvesters in your area" },
                  { step: "3", title: "Review & Hire", desc: "Compare profiles, reviews, and rates to find the best fit" },
                  { step: "4", title: "Get Harvested", desc: "Professional team handles your harvest efficiently" },
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Harvesters</h2>
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

            {/* Harvesters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredHarvesters.map((harvester) => (
                <Card key={harvester.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-2xl border-2 border-gray-200">
                  <div className="relative h-48 bg-gray-100">
                    <img src={harvester.image} alt={harvester.name} className="w-full h-full object-cover" />
                    {harvester.verified && (
                      <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{harvester.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{harvester.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{harvester.rating}</span>
                      <span className="text-sm text-gray-500">({harvester.reviews} reviews)</span>
                    </div>
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Team: {harvester.teamSize}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Rate: {harvester.hourlyRate}/hr</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{harvester.availability}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span>{harvester.completedJobs} jobs completed</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-2">
                        {harvester.specialties.map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Certifications:</p>
                      <div className="flex flex-wrap gap-2">
                        {harvester.certifications.map((cert, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white">
                      Hire Harvester
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Testimonials */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">What Farm Owners Say</h2>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Become a Harvester</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join our network of professional harvesters and help local farms bring their produce to market. Apply today to start earning.
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
