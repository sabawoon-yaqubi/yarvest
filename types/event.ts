/**
 * Event-related TypeScript interfaces
 * Reusable across the application
 */

// Main API Event interface
export interface ApiEvent {
  id: number
  unique_id?: string
  title: string
  date: string
  time: string
  location: string
  description?: string
  image: string | null
  attendees: number
  category: string
  created_at?: string
  updated_at?: string
}

