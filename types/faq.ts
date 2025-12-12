import { LucideIcon } from "lucide-react"

export interface FAQ {
  id: number
  question: string
  answer: string
  categoryId: string
  order?: number
  createdAt?: string
  updatedAt?: string
}

export interface FAQCategory {
  id: string
  title: string
  icon: LucideIcon | string
  description?: string
  order?: number
  faqs?: FAQ[]
}

export interface FAQData {
  categories: FAQCategory[]
  faqs: FAQ[]
}
