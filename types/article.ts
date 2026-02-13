/**
 * Article / Seed guide (Blog) types from API
 */

export interface BlogTypeRef {
  id: number
  unique_id: string
  name: string
}

export interface BackendArticle {
  id: number
  unique_id: string
  name: string
  description: string
  image: string | null
  video: string | null
  date: string
  status: boolean
  blog_type_id: number
  blog_type: BlogTypeRef | null
  created_at?: string
  updated_at?: string
}

export interface BackendArticleDetail extends BackendArticle {
  user?: {
    id: number
    first_name: string
    last_name: string
    email: string
  } | null
}

export interface BackendArticleType {
  id: number
  unique_id: string
  name: string
  articles_count: number
}

export interface ArticlesApiResponse {
  success: boolean
  message: string
  data: BackendArticle[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}
