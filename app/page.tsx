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
import { EventsSection } from "@/components/events-section"
import { SponsorsSection } from "@/components/sponsors-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { StatsSection } from "@/components/stats-section"
import { HowItWorks } from "@/components/how-it-works"
import { HarvestingProductsSection } from "@/components/harvesting-products-section"
import { ValidatorsSection } from "@/components/validators-section"
import { useState } from "react"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Desktop: open by default, mobile: closed

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
            <HowItWorks />
            <HarvestingProductsSection />
            <ValidatorsSection />
            <FeaturedShops />
            <ProducersSection />
            <TestimonialsSection />
            <EventsSection />
            <SponsorsSection />
            <NewsletterSection />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  )
}
