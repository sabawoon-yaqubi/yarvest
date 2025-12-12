/**
 * Event-related TypeScript interfaces
 * Reusable across the application
 */

// Backend Event interface (matches API response)
export interface BackendEvent {
  id: number
  unique_id: string
  name: string
  date: string
  location: string
  description?: string
  image: string | null
  event_type?: string | null
  attendances_count?: number
  attendances?: EventAttendance[]
  created_at?: string
  updated_at?: string
}

// Event Attendance interface
export interface EventAttendance {
  id: number
  name: string
  email: string
  phone?: string | null
  event_id: number
  created_at?: string
  updated_at?: string
}

// Main API Event interface (for frontend display)
export interface ApiEvent {
  id: number
  unique_id?: string
  title: string
  date: string
  time?: string
  location: string
  description?: string
  image: string | null
  attendees: number
  category: string
  created_at?: string
  updated_at?: string
}

// Transform backend event to frontend format
export function transformEvent(backendEvent: BackendEvent): ApiEvent {
  return {
    id: backendEvent.id,
    unique_id: backendEvent.unique_id,
    title: backendEvent.name,
    date: backendEvent.date,
    time: '', // Backend doesn't provide time separately
    location: backendEvent.location,
    description: backendEvent.description,
    image: backendEvent.image,
    attendees: backendEvent.attendances_count || 0,
    category: backendEvent.event_type || 'Event',
    created_at: backendEvent.created_at,
    updated_at: backendEvent.updated_at,
  }
}

