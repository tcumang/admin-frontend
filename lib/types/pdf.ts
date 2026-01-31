/**
 * PDF-related type definitions.
 * Types for PDF document CRUD operations matching the backend API.
 */

// PDF item entity from the API
export interface PDFItem {
  id: number
  author: string
  coverImage: string
  documentTitle: string
  fileName: string
  status: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

// Pagination info from API response
export interface PDFPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

// PDF list API response structure from GET /pdf
export interface PDFListResponse {
  success: boolean
  message: string
  data: {
    data: PDFItem[]
    pagination: PDFPagination
  }
}

// Single PDF API response structure from GET /pdf/:id
export interface SinglePDFResponse {
  success: boolean
  message: string
  data: PDFItem
}

// PDF form data for create/update operations (frontend)
export interface PDFFormData {
  id?: number
  author: string
  documentTitle: string
  coverImagePreview: string // Base64 or URL for frontend preview display only
  coverImageFile?: File | null // Actual File object for upload
  documentFile?: File | null // Actual PDF file for upload
}

// Payload for POST /pdf and PUT /pdf/:id (sent as FormData)
// Note: This is used for reference, actual upload uses FormData
export interface PDFPayload {
  author: string
  documentTitle: string
  coverImage?: File // File for upload
  document?: File // PDF file for upload
}

// Query params for PDF listing
export interface PDFListParams {
  page?: number
  limit?: number
  search?: string
}
