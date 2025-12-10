"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import Link from "next/link"
import { ApiEvent } from "@/types/event"
import { ApiDataFetcher } from "./api-data-fetcher"
import { EventCardSkeleton } from "./event-card-skeleton"

export function EventsSection() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold text-foreground">Upcoming Events</h2>
          <p className="text-muted-foreground text-base mt-2">Connect with farmers and discover local food culture</p>
        </div>
        <Link href="/events" className="text-[#0A5D31] font-semibold hover:text-[#0d7a3f] text-sm transition-colors">
          View All
        </Link>
      </div>
      
      <ApiDataFetcher<ApiEvent>
        url="/events/upcoming"
        limit={3}
        page={1}
        gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        renderItem={(event) => (
          <Card
            key={event.id}
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col bg-card border border-border rounded-2xl"
          >
            <div className="relative group overflow-hidden bg-secondary h-52">
              <img
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-[#0A5D31] text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                {event.category}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-bold text-lg text-foreground mb-4 leading-snug">{event.title}</h3>

              <div className="space-y-2 mb-5 text-sm text-muted-foreground flex-1">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#0A5D31] flex-shrink-0" />
                  <span className="font-medium">{event.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#0A5D31] flex-shrink-0" />
                  <span className="font-medium">{event.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#0A5D31] flex-shrink-0" />
                  <span className="font-medium">{event.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#0A5D31] flex-shrink-0" />
                  <span className="font-medium">{event.attendees} attending</span>
                </div>
              </div>

              <Link href={`/events/${event.id}`} className="mt-auto">
                <Button className="w-full bg-[#0A5D31] hover:bg-[#0d7a3f] text-white font-semibold rounded-xl transition-all h-10">
                  Learn More
                </Button>
              </Link>
            </div>
          </Card>
        )}
        renderLoading={() => <EventCardSkeleton count={3} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No upcoming events available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}
