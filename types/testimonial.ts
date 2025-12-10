/**
 * Testimonial-related TypeScript interfaces
 * Reusable across the application
 */

// API Testimonial interface
export interface ApiTestimonial {
  id: number
  full_name: string
  job: string
  image: string | null
  stars: number
  review: string
  status: number
  created_at?: string
  updated_at?: string
}

