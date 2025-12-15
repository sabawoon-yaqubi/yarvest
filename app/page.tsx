"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { FreshFoodCategories } from "@/components/fresh-food-categories"
import { ProductShowcase } from "@/components/product-showcase"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { useApiFetch } from "@/hooks/use-api-fetch"

// Lazy load heavy components below the fold
const DealsSection = dynamic(() => import("@/components/deals-section").then(mod => ({ default: mod.DealsSection })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})
const TrendingProducts = dynamic(() => import("@/components/trending-products").then(mod => ({ default: mod.TrendingProducts })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})
const ProducersSection = dynamic(() => import("@/components/producers-section").then(mod => ({ default: mod.ProducersSection })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})
const PartnersSection = dynamic(() => import("@/components/partners-section").then(mod => ({ default: mod.PartnersSection })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})
const EventsSection = dynamic(() => import("@/components/events-section").then(mod => ({ default: mod.EventsSection })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})
const TestimonialsSection = dynamic(() => import("@/components/testimonials-section").then(mod => ({ default: mod.TestimonialsSection })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})
const NewsletterSection = dynamic(() => import("@/components/newsletter-section").then(mod => ({ default: mod.NewsletterSection })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})
const StatsSection = dynamic(() => import("@/components/stats-section").then(mod => ({ default: mod.StatsSection })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})
const HowItWorks = dynamic(() => import("@/components/how-it-works").then(mod => ({ default: mod.HowItWorks })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})
const VolunteersSection = dynamic(() => import("@/components/volunteers-section").then(mod => ({ default: mod.VolunteersSection })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})
const CouriersSection = dynamic(() => import("@/components/couriers-section").then(mod => ({ default: mod.CouriersSection })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})
const LeaderboardSection = dynamic(() => import("@/components/leaderboard-section").then(mod => ({ default: mod.LeaderboardSection })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-2xl" />
})

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Desktop: open by default, mobile: closed
  const [isMounted, setIsMounted] = useState(false)
  const [showLoader, setShowLoader] = useState(true)

  // Track when component mounts on client and hide loader quickly
  useEffect(() => {
    setIsMounted(true)
    // Hide loader faster - no artificial delays
    const timer = setTimeout(() => {
      setShowLoader(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])



  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
          <HeroSection />
          <div className="px-6 py-16 space-y-24 max-w-7xl mx-auto">
            <FreshFoodCategories />
            <DealsSection />
            <ProductShowcase /> 
            <TrendingProducts />
            <CouriersSection />
            <HowItWorks />
            {/* <HarvestingProductsSection /> */}
            <VolunteersSection />
            {/* <FeaturedShops /> */}
            <ProducersSection />
            <LeaderboardSection />
            <TestimonialsSection />
            <EventsSection />
            <StatsSection />

            <PartnersSection />
            <NewsletterSection />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  )
}
