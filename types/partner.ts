/**
 * Partner/Sponsor-related TypeScript interfaces
 */

export interface ApiPartner {
  id: number | string
  name: string
  logo: string | null
  description?: string | null
  href?: string | null
  website?: string | null
  image?: string | null
  [key: string]: any // Allow additional properties from API
}


