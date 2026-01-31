/**
 * Settings API service.
 *
 * Operations for logo and password management.
 * Endpoints:
 * - GET  /settings/logo     - Get current app logo
 * - PUT  /settings/logo     - Update app logo (FormData)
 * - PATCH /settings/password - Change password (JSON)
 */

import type {
  GetLogoResponse,
  UpdateLogoResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
} from "@/lib/types"
import { apiFetch,IMAGE_BASE_URL } from "./client"
// import { API_CONFIG } from "@/lib/auth/config"

// ============================================================
// Logo APIs
// ============================================================

/**
 * Get the current app logo.
 * Endpoint: GET /settings/logo
 *
 * @returns GetLogoResponse with appLogo URL or null
 *
 * @example
 * const response = await getLogo()
 * // response.data.appLogo: "logo.png" or null
 */
export async function getLogo(): Promise<GetLogoResponse> {
  return apiFetch<GetLogoResponse>("/settings/logo", {
    method: "GET",
  })
}

/**
 * Update the app logo with file upload.
 * Endpoint: PUT /settings/logo
 * Uses FormData for multipart/form-data upload.
 *
 * @param file - The logo image file to upload
 * @returns UpdateLogoResponse with new logo URL
 *
 * @example
 * const response = await updateLogo(logoFile)
 * // response.data.appLogo: "new-logo.png"
 */
export async function updateLogo(file: File): Promise<UpdateLogoResponse> {
  const formData = new FormData()
  formData.append("appLogo", file)

  return apiFetch<UpdateLogoResponse>("/settings/logo", {
    method: "PUT",
    body: formData,
    isFormData: true,
  })
}

/**
 * Helper to build full logo URL from filename.
 * Constructs: {baseurl}/uploads/logo/{filename}
 *
 * @param filename - The logo filename from API
 * @returns Full URL to the logo image, or empty string if no filename
 *
 * @example
 * const url = buildLogoUrl("app-logo.png")
 * // Returns: "http://localhost:8000/uploads/logo/app-logo.png"
 */
export function buildLogoUrl(filename: string | null | undefined): string {
  if (!filename) return ""
  // If already a full URL, return as is
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename
  }
  return `${IMAGE_BASE_URL}/uploads/settings/logo/${filename}`
}

// ============================================================
// Password API
// ============================================================

/**
 * Change the admin password.
 * Endpoint: PATCH /settings/password
 *
 * @param payload - Old password, new password, and confirm password
 * @returns ChangePasswordResponse with success status
 *
 * @example
 * const response = await changePassword({
 *   oldPassword: "current123",
 *   newPassword: "newpass456",
 *   confirmPassword: "newpass456"
 * })
 */
export async function changePassword(
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> {
  return apiFetch<ChangePasswordResponse>("/settings/password", {
    method: "PATCH",
    body: payload,
  })
}

// ============================================================
// Legacy exports (kept for backward compatibility)
// ============================================================

import type {
  UpdateProfilePayload,
  UpdateProfileResponse,
  UpdateLogoPayload,
  UpdatePasswordPayload,
  UpdatePasswordResponse,
} from "@/lib/types"

const PROFILE_BASE = "/api/profile"

/**
 * @deprecated Use specific logo/password APIs instead
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> {
  return apiFetch<UpdateProfileResponse>(PROFILE_BASE, {
    method: "PUT",
    body: payload,
  })
}

/**
 * @deprecated Use specific logo/password APIs instead
 */
export async function getProfile(): Promise<UpdateProfileResponse> {
  return apiFetch<UpdateProfileResponse>(PROFILE_BASE, {
    method: "GET",
  })
}

/**
 * @deprecated Use updateLogo(file: File) instead
 */
export async function updateLogoLegacy(
  payload: UpdateLogoPayload
): Promise<UpdateLogoResponse> {
  return apiFetch<UpdateLogoResponse>("/settings/logo", {
    method: "POST",
    body: payload,
  })
}

/**
 * @deprecated Use changePassword instead
 */
export async function updatePassword(
  payload: UpdatePasswordPayload
): Promise<UpdatePasswordResponse> {
  return apiFetch<UpdatePasswordResponse>("/settings/password", {
    method: "POST",
    body: payload,
  })
}
