"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { FreshFoodCategories } from "@/components/fresh-food-categories"
import { ProductShowcase } from "@/components/product-showcase"
import { DealsSection } from "@/components/deals-section"
import { TrendingProducts } from "@/components/trending-products"
import { FeaturedShops } from "@/components/featured-shops"
import { ProducersSection } from "@/components/producers-section"
import { PartnersSection } from "@/components/partners-section"
import { EventsSection } from "@/components/events-section"
import { SponsorsSection } from "@/components/sponsors-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { StatsSection } from "@/components/stats-section"
import { HowItWorks } from "@/components/how-it-works"
import { HarvestingProductsSection } from "@/components/harvesting-products-section"
import { VolunteersSection } from "@/components/volunteers-section"
import { CouriersSection } from "@/components/couriers-section"
import { useState } from "react"
import { ValidatorsSection } from "@/components/validators-section"
import { useState, useEffect } from "react"
import { YarvestLoader } from "@/components/yarvest-loader"
import { useApiFetch } from "@/hooks/use-api-fetch"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Desktop: open by default, mobile: closed
  const [isMounted, setIsMounted] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  const [minDisplayTimeElapsed, setMinDisplayTimeElapsed] = useState(false)

  // Track when component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch data for sections that use API
  const { loading: dealsLoading } = useApiFetch('/special-deals', { enabled: true })
  const { loading: trendingLoading } = useApiFetch('/trending-products', { enabled: true })
  const { loading: producersLoading } = useApiFetch('/stores/producers', { enabled: true })

  // Minimum display time for loader (800ms) to ensure it's visible
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDisplayTimeElapsed(true)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // Hide loader when all data is loaded AND minimum display time has elapsed
  useEffect(() => {
    if (isMounted && minDisplayTimeElapsed && !dealsLoading && !trendingLoading && !producersLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowLoader(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isMounted, minDisplayTimeElapsed, dealsLoading, trendingLoading, producersLoading])

  // Show loader during initial load or when data is fetching
  if (showLoader && isMounted) {
    return <YarvestLoader />
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
          <HeroSection />
          <div className="px-6 py-16 space-y-24 max-w-7xl mx-auto">
            <FreshFoodCategories />
            <StatsSection />
            <DealsSection />
            <ProductShowcase /> 
            <TrendingProducts />
            <CouriersSection />
            <HowItWorks />
            <HarvestingProductsSection />
            <VolunteersSection />
            <FeaturedShops />
            <ProducersSection />
            <TestimonialsSection />
            <EventsSection />
            <PartnersSection />
            <NewsletterSection />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  )
}
