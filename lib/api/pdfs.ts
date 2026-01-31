/**
 * PDF API service.
 *
 * CRUD operations for PDF documents.
 * All endpoints match the backend API specification.
 */

import type {
  PDFItem,
  PDFListResponse,
  SinglePDFResponse,
  PDFPayload,
  PDFListParams,
} from "@/lib/types"
import { apiFetch, IMAGE_BASE_URL, API_BASE_URL } from "./client"
import { getToken } from "@/lib/auth/token"

/**
 * Build the full image URL for PDF cover images.
 * Prefix the image path with base_url/uploads/pdfs/cover/
 *
 * @param imagePath - The cover image path from API
 * @returns Full image URL
 *
 * @example
 * const url = buildPdfCoverImageUrl("image.png")
 * // Returns: "http://192.168.85.132:3001/uploads/pdfs/cover/image.png"
 */
export function buildPdfCoverImageUrl(imagePath: string): string {
  if (!imagePath) return ""
  // If already a full URL, return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath
  return `${IMAGE_BASE_URL}/uploads/pdfs/cover/${cleanPath}`
}

/**
 * Fetch all PDF items with pagination and search.
 * Endpoint: GET /pdf?page=1&limit=10&search=<query>
 *
 * @param params - Query parameters (page, limit, search)
 * @returns PDFListResponse with data and pagination
 *
 * @example
 * const response = await getPdfList({ page: 1, limit: 10, search: "tech" })
 */
export async function getPdfList(params?: PDFListParams): Promise<PDFListResponse> {
  const queryParams = new URLSearchParams()

  if (params?.page) queryParams.set("page", params.page.toString())
  if (params?.limit) queryParams.set("limit", params.limit.toString())
  if (params?.search) queryParams.set("search", params.search)

  const queryString = queryParams.toString()
  const path = `/pdf${queryString ? `?${queryString}` : ""}`

  return apiFetch<PDFListResponse>(path, { method: "GET" })
}

/**
 * Fetch a single PDF item by ID.
 * Endpoint: GET /pdf/:id
 * Used for edit/update modal to prefill form.
 *
 * @param id - The PDF item ID
 * @returns SinglePDFResponse with PDF data
 *
 * @example
 * const response = await getPdfById(1)
 */
export async function getPdfById(id: number | string): Promise<SinglePDFResponse> {
  return apiFetch<SinglePDFResponse>(`/pdf/${id}`, { method: "GET" })
}

/**
 * Create a new PDF item with file uploads.
 * Endpoint: POST /pdf
 * Uses FormData for multipart/form-data upload.
 *
 * @param data - The PDF data including cover image and document files
 * @returns SinglePDFResponse with created PDF
 *
 * @example
 * const response = await createPdf({
 *   author: "John Doe",
 *   documentTitle: "My Document",
 *   coverImage: coverImageFile, // File object
 *   document: documentFile, // PDF File object
 * })
 */
export async function createPdf(data: PDFPayload): Promise<SinglePDFResponse> {
  const formData = new FormData()
  formData.append("author", data.author)
  formData.append("documentTitle", data.documentTitle)

  if (data.coverImage) {
    formData.append("coverImage", data.coverImage)
  }

  if (data.document) {
    formData.append("document", data.document)
  }

  return apiFetch<SinglePDFResponse>("/pdf", {
    method: "POST",
    body: formData,
    isFormData: true,
  })
}

/**
 * Update an existing PDF item with optional file uploads.
 * Endpoint: PUT /pdf/:id
 * Uses FormData for multipart/form-data upload.
 *
 * @param id - The PDF item ID to update
 * @param data - The PDF data to update (including optional new files)
 * @returns SinglePDFResponse with updated PDF
 *
 * @example
 * const response = await updatePdf(1, {
 *   author: "Updated Author",
 *   documentTitle: "Updated Title",
 *   coverImage: newImageFile, // File object or undefined to keep existing
 *   document: newPdfFile, // File object or undefined to keep existing
 * })
 */
export async function updatePdf(
  id: number | string,
  data: PDFPayload
): Promise<SinglePDFResponse> {
  const formData = new FormData()
  formData.append("author", data.author)
  formData.append("documentTitle", data.documentTitle)

  // Only append files if provided
  if (data.coverImage) {
    formData.append("coverImage", data.coverImage)
  }

  if (data.document) {
    formData.append("document", data.document)
  }

  return apiFetch<SinglePDFResponse>(`/pdf/${id}`, {
    method: "PUT",
    body: formData,
    isFormData: true,
  })
}

/**
 * Delete a PDF item.
 * Endpoint: DELETE /pdf/:id
 *
 * @param id - The PDF item ID to delete
 * @returns Response with success message
 *
 * @example
 * await deletePdf(1)
 */
export async function deletePdf(
  id: number | string
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/pdf/${id}`, {
    method: "DELETE",
  })
}

/**
 * Update PDF status (active/inactive).
 * Endpoint: PATCH /pdf/:id/status
 *
 * @param id - The PDF item ID
 * @param status - The new status (true for ACTIVE, false for INACTIVE)
 * @returns Response with updated PDF status
 *
 * @example
 * await updatePdfStatus(1, true) // Activate
 * await updatePdfStatus(1, false) // Deactivate
 */
export async function updatePdfStatus(
  id: number | string,
  status: boolean
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/pdf/${id}/status`, {
    method: "PATCH",
    body: { status },
  })
}

/**
 * Download a PDF file.
 * Endpoint: GET /pdf/:id/download
 * Downloads file directly from backend - not through apiFetch
 * because we need the blob directly, not JSON parsing.
 *
 * @param id - The PDF item ID to download
 * @returns Blob data of the PDF file
 *
 * @example
 * const blob = await downloadPdf(1)
 * // Then trigger download in UI
 */
export async function downloadPdf(id: number | string): Promise<Blob> {
  // Build full URL with API_BASE_URL
  const url = `${API_BASE_URL}/pdf/${id}/download`
  const token = getToken()

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.status}`)
  }

  return response.blob()
}

/**
 * Helper to convert PDFItem to PDFFormData for editing.
 * Maps API response fields to form fields.
 *
 * @param item - The PDF item from API
 * @returns PDFFormData for the form
 */
export function pdfItemToFormData(item: PDFItem): {
  id: number
  author: string
  documentTitle: string
  coverImagePreview: string
  coverImageFile: null
  documentFile: null
} {
  return {
    id: item.id,
    author: item.author,
    documentTitle: item.documentTitle,
    coverImagePreview: buildPdfCoverImageUrl(item.coverImage),
    coverImageFile: null, // No file when editing, only preview of existing image
    documentFile: null, // No file when editing
  }
}
