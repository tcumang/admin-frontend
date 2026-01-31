/**
 * News-related type definitions.
 * Types for news CRUD operations matching the backend API.
 */

// News status enum matching backend values
// export type NewsStatus = "PUBLISHED" | "DRAFT" | "PENDING"
export type NewsStatus = "ACTIVE" | "INACTIVE"

// News item entity from the API
export interface NewsItem {
  id: number
  title: string
  description: string
  featuredImage: string
  publishDate: string
  isFeatured: boolean
  status: NewsStatus
  isDeleted: boolean
  createdAt?: string
  updatedAt?: string
}

// Pagination info from API response
export interface NewsPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

// News list API response structure from GET /news/admin
export interface NewsListResponse {
  success: boolean
  message: string
  data: {
    data: NewsItem[]
    pagination: NewsPagination
  }
}

// Single news API response structure from GET /news/:id
export interface SingleNewsResponse {
  success: boolean
  message: string
  data: NewsItem
}

// News form data for create/update operations (frontend)
export interface NewsFormData {
  id?: number
  title: string
  description: string
  imagePreview: string // Base64 or URL for frontend preview display only
  imageFile?: File | null // Actual File object for upload
  publishDate: Date | undefined
  featured: boolean
}

// Payload for POST /news and PUT /news/:id (sent as FormData)
// Note: This is used for reference, actual upload uses FormData
export interface NewsPayload {
  title: string
  description: string
  featuredImage?: File // File for upload
  publishDate: string
  isFeatured: boolean
}

// Query params for news listing
export interface NewsListParams {
  page?: number
  limit?: number
  search?: string
}
