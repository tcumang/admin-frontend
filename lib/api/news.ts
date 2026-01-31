/**
 * News API service.
 *
 * CRUD operations for news articles.
 * All endpoints match the backend API specification.
 */

import type {
  NewsItem,
  NewsListResponse,
  SingleNewsResponse,
  NewsPayload,
  NewsListParams,
} from "@/lib/types"
import { apiFetch, API_BASE_URL,IMAGE_BASE_URL } from "./client"

/**
 * Build the full image URL for news featured images.
 * Prefix the image path with baseurl/uploads/news/
 *
 * @param imagePath - The image path from API
 * @returns Full image URL
 *
 * @example
 * const url = buildNewsImageUrl("image.jpg")
 * // Returns: "http://192.168.85.132:3001/uploads/news/image.jpg"
 */
export function buildNewsImageUrl(imagePath: string): string {
  if (!imagePath) return ""
  // If already a full URL, return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath
  return `${IMAGE_BASE_URL}/uploads/news/${cleanPath}`
}

/**
 * Fetch all news items with pagination and search.
 * Endpoint: GET /news/admin?page=1&limit=10&search=<query>
 *
 * @param params - Query parameters (page, limit, search)
 * @returns NewsListResponse with data and pagination
 *
 * @example
 * const response = await getNewsList({ page: 1, limit: 10, search: "tech" })
 */
export async function getNewsList(params?: NewsListParams): Promise<NewsListResponse> {
  const queryParams = new URLSearchParams()

  if (params?.page) queryParams.set("page", params.page.toString())
  if (params?.limit) queryParams.set("limit", params.limit.toString())
  if (params?.search) queryParams.set("search", params.search)

  const queryString = queryParams.toString()
  const path = `/news/admin${queryString ? `?${queryString}` : ""}`

  return apiFetch<NewsListResponse>(path, { method: "GET" })
}

/**
 * Fetch a single news item by ID.
 * Endpoint: GET /news/:id
 * Used for edit/update modal to prefill form.
 *
 * @param id - The news item ID
 * @returns SingleNewsResponse with news data
 *
 * @example
 * const response = await getNewsById(1)
 */
export async function getNewsById(id: number | string): Promise<SingleNewsResponse> {
  return apiFetch<SingleNewsResponse>(`/news/${id}`, { method: "GET" })
}

/**
 * Create a new news item with file upload.
 * Endpoint: POST /news
 * Uses FormData for multipart/form-data upload.
 *
 * @param data - The news data including optional image file
 * @returns SingleNewsResponse with created news
 *
 * @example
 * const response = await createNews({
 *   title: "New Article",
 *   description: "Content here",
 *   publishDate: "2025-01-30",
 *   featuredImage: imageFile, // File object
 *   isFeatured: false
 * })
 */
export async function createNews(data: NewsPayload): Promise<SingleNewsResponse> {
  const formData = new FormData()
  formData.append("title", data.title)
  formData.append("description", data.description)
  formData.append("publishDate", data.publishDate)
  formData.append("isFeatured", String(data.isFeatured))
  
  if (data.featuredImage) {
    formData.append("featuredImage", data.featuredImage)
  }

  return apiFetch<SingleNewsResponse>("/news", {
    method: "POST",
    body: formData,
    isFormData: true,
  })
}

/**
 * Update an existing news item with optional file upload.
 * Endpoint: PUT /news/:id
 * Uses FormData for multipart/form-data upload.
 *
 * @param id - The news item ID to update
 * @param data - The news data to update (including optional new image file)
 * @returns SingleNewsResponse with updated news
 *
 * @example
 * const response = await updateNews(1, {
 *   title: "Updated Article",
 *   description: "Updated content",
 *   publishDate: "2025-01-30",
 *   featuredImage: newImageFile, // File object or undefined to keep existing
 *   isFeatured: true
 * })
 */
export async function updateNews(
  id: number | string,
  data: NewsPayload
): Promise<SingleNewsResponse> {
  const formData = new FormData()
  formData.append("title", data.title)
  formData.append("description", data.description)
  formData.append("publishDate", data.publishDate)
  formData.append("isFeatured", String(data.isFeatured))
  
  // Only append image if a new file is provided
  if (data.featuredImage) {
    formData.append("featuredImage", data.featuredImage)
  }

  return apiFetch<SingleNewsResponse>(`/news/${id}`, {
    method: "PUT",
    body: formData,
    isFormData: true,
  })
}

/**
 * Delete a news item.
 * Endpoint: DELETE /news/:id
 *
 * @param id - The news item ID to delete
 * @returns Response with success message
 *
 * @example
 * await deleteNews(1)
 */
export async function deleteNews(
  id: number | string
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/news/${id}`, {
    method: "DELETE",
  })
}

/**
 * Helper to convert NewsItem to NewsFormData for editing.
 * Maps API response fields to form fields.
 *
 * @param item - The news item from API
 * @returns NewsFormData for the form
 */
export function newsItemToFormData(item: NewsItem): {
  id: number
  title: string
  description: string
  imagePreview: string
  imageFile: null
  publishDate: Date | undefined
  featured: boolean
} {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    imagePreview: buildNewsImageUrl(item.featuredImage),
    imageFile: null, // No file when editing, only preview of existing image
    publishDate: item.publishDate ? new Date(item.publishDate) : undefined,
    featured: item.isFeatured,
  }
}
