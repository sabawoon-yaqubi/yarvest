"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, Star, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

const featuredValidators = [
  {
    id: 1,
    name: "Fast Track Logistics",
    location: "San Francisco, CA",
    rating: 4.9,
    reviews: 156,
    verified: true,
    specialties: ["Fresh Produce", "Dairy Products"],
  },
  {
    id: 2,
    name: "Green Express Delivery",
    location: "Oakland, CA",
    rating: 4.8,
    reviews: 203,
    verified: true,
    specialties: ["Organic Products", "Farm to Table"],
  },
]

export function ValidatorsSection() {
  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-white rounded-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Validators & Curriers</h2>
          <p className="text-lg text-gray-600">Verified logistics partners for safe product transport</p>
        </div>
        <Link href="/validators">
          <Button variant="outline" className="hidden md:flex items-center gap-2 border-2 border-gray-200 hover:border-[#0A5D31] rounded-full">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredValidators.map((validator) => (
          <Card key={validator.id} className="p-6 rounded-2xl border-2 border-gray-200 hover:border-[#0A5D31] transition-all hover:shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-[#0A5D31]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-8 h-8 text-[#0A5D31]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{validator.name}</h3>
                  {validator.verified && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{validator.location}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{validator.rating}</span>
                  <span className="text-sm text-gray-500">({validator.reviews} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {validator.specialties.map((spec, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
                <Link href="/validators">
                  <Button variant="outline" size="sm" className="w-full border-2 border-gray-200 hover:border-[#0A5D31]">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center md:hidden">
        <Link href="/validators">
          <Button className="bg-[#0A5D31] hover:bg-[#0d7a3f] text-white rounded-full px-8">
            View All Validators
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}





