/**
 * API Client.
 *
 * Centralized HTTP client for all API requests.
 * Handles authentication, error parsing, and request/response formatting.
 */

import type { ModalMode, HttpMethod } from "@/lib/types"
import { getToken } from "@/lib/auth/token"

/** Base URL for API requests */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "http://192.168.76.132:3001/api"

 
  const IMAGE_BASE_URL= process.env.NEWS_MODULE_IMAGE_BASE_URL?.replace(/\/+$/, "") ?? "http://192.168.76.132:3001"

/**
 * API Error shape returned from backend.
 */
export interface ApiErrorShape {
  message: string
  code?: string | number
  errors?: Record<string, string[] | string>
}

/**
 * Custom error class for API errors.
 * Provides structured error information.
 */
export class ApiError extends Error {
  status: number
  data?: ApiErrorShape | unknown

  constructor(message: string, status: number, data?: ApiErrorShape | unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

/**
 * Request options for apiFetch.
 */
export interface RequestOptions {
  method?: HttpMethod
  headers?: HeadersInit
  body?: unknown
  /** When true, do not send credentials/cookies or auth token. */
  anonymous?: boolean
  /** When true, body is FormData - skip JSON serialization and Content-Type header */
  isFormData?: boolean
}

/**
 * Safely parse JSON from a response.
 * Returns undefined if response is empty or not valid JSON.
 */
async function parseJsonSafe<T>(response: Response): Promise<T | undefined> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text) as T
  } catch {
    return undefined
  }
}

/**
 * Main API fetch function.
 * Handles authentication, error handling, and response parsing.
 *
 * @param path - API endpoint path (e.g., "/api/news")
 * @param options - Request options
 * @returns Parsed response data
 * @throws ApiError on non-2xx responses
 *
 * @example
 * const news = await apiFetch<NewsItem[]>("/api/news")
 * const created = await apiFetch<NewsItem>("/api/news", { method: "POST", body: payload })
 */
export async function apiFetch<TResponse>(
  path: string,
  { method = "GET", headers, body, anonymous, isFormData }: RequestOptions = {}
): Promise<TResponse> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`

  // Get auth token if available and not anonymous request
  const token = anonymous ? null : getToken()

  // Build headers - don't set Content-Type for FormData (browser will set it with boundary)
  const requestHeaders: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers ?? {}),
  }

  const init: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: anonymous ? "omit" : "include",
  }

  if (body !== undefined) {
    // Use body directly if FormData, otherwise stringify as JSON
    init.body = isFormData ? (body as FormData) : JSON.stringify(body)
  }

  const res = await fetch(url, init)

  // Try to parse JSON either way to surface backend error messages
  const data = await parseJsonSafe<TResponse | ApiErrorShape>(res)

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data && (data as ApiErrorShape).message) ||
      `Request failed with status ${res.status}`
    throw new ApiError(message, res.status, data)
  }

  return (data ?? ({} as TResponse)) as TResponse
}

/**
 * Helper for modal-based create/update flows.
 * Automatically routes to POST (create) or PUT (update) based on mode.
 *
 * @param mode - "add" for create, "edit" for update
 * @param endpoints - Object with add and edit endpoint builders
 * @param payload - The data to send (must include id for edit mode)
 *
 * @example
 * const news = await saveWithModalMode<NewsFormData, NewsItem>(
 *   "add",
 *   { add: "/api/news", edit: (id) => `/api/news/${id}` },
 *   formData
 * )
 */
export async function saveWithModalMode<TPayload, TResponse>(
  mode: ModalMode,
  endpoints: { add: string; edit: (id: number | string) => string },
  payload: TPayload & { id?: number | string }
): Promise<TResponse> {
  if (mode === "add") {
    return apiFetch<TResponse>(endpoints.add, {
      method: "POST",
      body: payload,
    })
  }

  if (!payload.id) {
    throw new Error("Missing id for edit operation.")
  }

  return apiFetch<TResponse>(endpoints.edit(payload.id), {
    method: "PUT",
    body: payload,
  })
}

/**
 * Build full API URL from path.
 * Useful for external URL generation.
 */
export function buildApiUrl(path: string): string {
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`
}

// Export base URL for reference
export { API_BASE_URL,IMAGE_BASE_URL }
