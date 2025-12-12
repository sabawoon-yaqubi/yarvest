"use client"

import { Card } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { ApiTestimonial } from "@/types/testimonial"
import { ApiDataFetcher } from "./api-data-fetcher"
import { TestimonialCardSkeleton } from "./testimonial-card-skeleton"
import { getImageUrl } from "@/lib/utils"

export function TestimonialsSection() {
  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-3">What Our Customers Say</h2>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          Real stories from people who love fresh, local produce
        </p>
      </div>
      
      <ApiDataFetcher<ApiTestimonial>
        url="/testimonials"
        limit={4}
        page={1}
        gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        renderItem={(testimonial) => (
          <Card
            key={testimonial.id}
            className="p-6 bg-card border border-border rounded-2xl hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <Quote className="w-8 h-8 text-[#0A5D31] mb-4 opacity-50" />
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.stars)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-foreground mb-6 flex-1 leading-relaxed text-sm">
              "{testimonial.review}"
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <img
                src={getImageUrl(testimonial.image) || "/placeholder.svg"}
                alt={testimonial.full_name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-foreground text-sm">{testimonial.full_name}</p>
                <p className="text-muted-foreground text-xs">{testimonial.job}</p>
              </div>
            </div>
          </Card>
        )}
        renderLoading={() => <TestimonialCardSkeleton count={4} />}
        renderEmpty={() => (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">No testimonials available at the moment.</p>
          </div>
        )}
      />
    </div>
  )
}
