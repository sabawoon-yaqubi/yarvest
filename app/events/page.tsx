"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { useState, useMemo } from "react"
import { ApiEvent } from "@/types/event"
import { InfiniteScrollFetcher } from "@/components/infinite-scroll-fetcher"
import { EventCardSkeleton } from "@/components/event-card-skeleton"

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
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-12 bg-gradient-to-b from-white to-secondary/10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h1 className="text-5xl font-bold text-foreground mb-3">Upcoming Events</h1>
              <p className="text-lg text-muted-foreground">
                Join the Yarvest community at farmers markets, festivals, and workshops
              </p>
            </div>

            {/* Category Filter - Modern Style */}
            <div className="mb-10 flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="rounded-full font-semibold px-6 h-11"
              >
                All Events
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full font-semibold px-6 h-11"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Events Grid */}
            <InfiniteScrollFetcher<ApiEvent>
              key={apiUrl}
              url={apiUrl}
              limit={12}
              gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              renderItem={(event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-3xl border border-border bg-white flex flex-col h-full"
                >
                  <div className="relative group overflow-hidden bg-secondary h-56">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-xs font-bold uppercase shadow-lg">
                      {event.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-3 leading-snug">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{event.description}</p>

                    <div className="space-y-3 mb-6 pb-6 border-b border-border flex-1 text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Users className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium">{event.attendees} attending</span>
                      </div>
                    </div>

                    <Button className="w-full bg-primary hover:bg-accent text-white font-semibold rounded-lg mt-auto h-11 transition-all">
                      Learn More
                    </Button>
                  </div>
                </Card>
              )}
              renderLoading={() => <EventCardSkeleton count={12} />}
              renderEmpty={() => (
                <div className="text-center py-12 col-span-full">
                  <p className="text-muted-foreground">No upcoming events available at the moment.</p>
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
