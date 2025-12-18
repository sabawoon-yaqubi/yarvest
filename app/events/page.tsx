"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { useState, useMemo } from "react"
import { ApiEvent, BackendEvent, transformEvent } from "@/types/event"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"
import { EventCardSkeleton } from "@/components/event-card-skeleton"
import Link from "next/link"
import { getImageUrl } from "@/lib/utils"

export default function EventsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = ["Market", "Festival", "Workshop", "Dinner"]
  
  // Build API URL with category filter
  const apiUrl = useMemo(() => {
    if (selectedCategory) {
      return `/events/upcoming?category=${selectedCategory}`
    }
    return "/events/upcoming"
  }, [selectedCategory])

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto bg-gradient-to-b from-white via-gray-50/30 to-white">
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-12 text-center">
              <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Upcoming Events</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join the Yarvest community at farmers markets, festivals, and workshops. Discover fresh produce and connect with local farmers.
              </p>
            </div>

            {/* Category Filter - Modern Style */}
            <div className="mb-10 flex gap-3 flex-wrap justify-center">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full font-semibold px-6 h-11 transition-all ${
                  selectedCategory === null 
                    ? "bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white shadow-md" 
                    : "border-2 hover:border-[#5a9c3a] hover:text-[#5a9c3a]"
                }`}
              >
                All Events
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full font-semibold px-6 h-11 transition-all ${
                    selectedCategory === category 
                      ? "bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white shadow-md" 
                      : "border-2 hover:border-[#5a9c3a] hover:text-[#5a9c3a]"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Events Grid */}
            <InfiniteScrollFetcher<BackendEvent>
              key={apiUrl}
              url={apiUrl}
              limit={12}
              gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              renderItem={(backendEvent) => {
                const event = transformEvent(backendEvent)
                return (
                  <div
                    key={event.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col bg-card border border-border rounded-2xl"
                  >
                    <div className="relative group overflow-hidden bg-secondary h-52">
                      <div className="w-full h-full flex items-center justify-center bg-white">
                        <img
                          src={getImageUrl(event.image, event.title)}
                          alt={event.title}
                          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute top-3 left-3 bg-[#5a9c3a] text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {event.category}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-4 leading-snug">{event.title}</h3>

                      <div className="space-y-2 mb-5 text-sm text-muted-foreground flex-1">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-[#5a9c3a] flex-shrink-0" />
                          <span className="font-medium">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-[#5a9c3a] flex-shrink-0" />
                          <span className="font-medium">{event.location}</span>
                        </div>
                        {/* <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-[#5a9c3a] flex-shrink-0" />
                          <span className="font-medium">{event.attendees} attending</span>
                        </div> */}
                      </div>

                      <Link href={`/events/${event.unique_id || event.id}`} className="mt-auto">
                        <Button className="w-full bg-[#5a9c3a] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl transition-all h-10">
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              }}
              renderLoading={() => <EventCardSkeleton count={12} />}
              renderEmpty={() => (
                <div className="text-center py-16 col-span-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg text-gray-600 font-medium">No upcoming events available at the moment.</p>
                  <p className="text-sm text-gray-500 mt-2">Check back soon for new events!</p>
                </div>
              )}
            />
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
