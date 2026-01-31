/**
 * Common/shared type definitions.
 * Reusable types used across multiple modules.
 */

// Modal operation mode
export type ModalMode = "add" | "edit"

// Image preview state for modals
export interface ImagePreviewState {
  open: boolean
  url: string
  title: string
}

// Generic form field error type
export type FormErrors<T> = Partial<Record<keyof T, string>>

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// Pagination parameters
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Paginated response
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// HTTP methods supported by the API client
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
