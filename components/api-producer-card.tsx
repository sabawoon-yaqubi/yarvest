"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle, Package, ArrowRight, Leaf, TrendingUp, Users, Sparkles, Clock, Percent, Award, Shield, Calendar, Truck } from "lucide-react"
import Link from "next/link"
import { TransformedProducer } from "@/lib/producer-api"

export interface ApiProducerCardProps {
  producer: TransformedProducer
  badge?: "Top Seller" | "Organic" | "Most Reviewed" | "New"
  className?: string
}

export function ApiProducerCard({
  producer,
  badge,
  className = "",
}: ApiProducerCardProps) {
  const getBadgeIcon = () => {
    switch (badge) {
      case "Top Seller":
        return <TrendingUp className="w-3 h-3 mr-1 inline" />
      case "Organic":
        return <Leaf className="w-3 h-3 mr-1 inline" />
      case "Most Reviewed":
        return <Users className="w-3 h-3 mr-1 inline" />
      case "New":
        return <Sparkles className="w-3 h-3 mr-1 inline" />
      default:
        return null
    }
  }

  const getBadgeColor = () => {
    switch (badge) {
      case "Top Seller":
        return "bg-[#0A5D31]"
      case "Organic":
        return "bg-[#0A5D31]"
      case "Most Reviewed":
        return "bg-[#0A5D31]"
      case "New":
        return "bg-[#0A5D31]"
      default:
        return "bg-[#0A5D31]"
    }
  }

  return (
    <Card
      className={`overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-xl border border-gray-200 bg-white flex flex-col h-full group cursor-pointer ${className}`}
    >
      <div className="relative overflow-hidden bg-gray-100 h-40">
        <img
          src={producer.image || "/placeholder.svg"}
          alt={producer.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {producer.verified && (
            <div className="bg-[#0A5D31] text-white p-2 rounded-full shadow-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          )}
        </div>
        {badge && (
          <div className="absolute top-3 left-3">
            <Badge className={`${getBadgeColor()} text-white border-0 font-bold shadow-lg`}>
              {getBadgeIcon()}
              {badge}
            </Badge>
          </div>
        )}
        {badge === "Top Seller" && (
          <div className="absolute bottom-3 left-3 right-3">
            <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-0 font-semibold text-xs">
              <Package className="w-3 h-3 mr-1 inline" />
              {producer.products} Products
            </Badge>
          </div>
        )}
        {badge === "Most Reviewed" && producer.totalReviews !== undefined && (
          <div className="absolute bottom-3 left-3 right-3">
            <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-0 font-semibold text-xs">
              {producer.totalReviews} Reviews
            </Badge>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{producer.name}</h3>
        <p className="text-xs font-semibold text-[#0A5D31] mb-3 uppercase tracking-wide">
          {producer.specialty}
        </p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-gray-900">{producer.rating}</span>
          </div>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <MapPin className="w-3 h-3" />
            <span>{producer.location}</span>
          </div>
        </div>
        {badge === "Organic" && producer.certifications && producer.certifications.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1 mb-2">
              {producer.certifications.slice(0, 2).map((cert, idx) => {
                // Handle both string and object formats
                const certName = typeof cert === 'string' ? cert : (cert?.name || cert?.id || 'Certification')
                return (
                  <Badge key={idx} variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5">
                    {certName}
                  </Badge>
                )
              })}
            </div>
            <Badge variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5 w-full justify-center">
              <Shield className="w-3 h-3 mr-1" />
              Pesticide Free
            </Badge>
          </div>
        )}
        {badge === "New" && (
          <div className="mb-4">
            <Badge variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5 w-full justify-center">
              <Calendar className="w-3 h-3 mr-1" />
              {producer.yearsInBusiness} Years Experience
            </Badge>
          </div>
        )}
        {badge === "Top Seller" && (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5">
              <Clock className="w-3 h-3 mr-1" />
              Fast Delivery
            </Badge>
            <Badge variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5">
              <Percent className="w-3 h-3 mr-1" />
              Best Prices
            </Badge>
          </div>
        )}
        {badge === "Most Reviewed" && (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs border-[#0A5D31]/30 text-[#0A5D31] bg-[#0A5D31]/5">
              <Award className="w-3 h-3 mr-1" />
              Top Rated
            </Badge>
          </div>
        )}
        <Link href={`/producers/${producer.id}`} className="mt-auto">
          <Button 
            className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            {badge === "Organic" ? "Shop Organic" : badge === "Most Reviewed" ? "View Reviews" : badge === "New" ? "Discover More" : "Shop Now"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}

