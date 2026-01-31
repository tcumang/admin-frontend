/**
 * Settings-related type definitions.
 * Types for logo and password management.
 */

// ============================================================
// App Logo Types
// ============================================================

/**
 * Response from GET /settings/logo
 */
export interface GetLogoResponse {
  success: boolean
  message: string
  data: {
    appLogo: string | null
  }
}

/**
 * Response from PUT /settings/logo
 */
export interface UpdateLogoResponse {
  success: boolean
  message: string
  data?: {
    appLogo: string
  }
}

// ============================================================
// Change Password Types
// ============================================================

/**
 * Payload for PATCH /settings/password
 */
export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Response from PATCH /settings/password
 */
export interface ChangePasswordResponse {
  success: boolean
  message: string
}

// ============================================================
// Legacy Types (kept for backward compatibility)
// ============================================================

import type { Admin } from "./auth"

// Profile update payload (for future use)
export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  email?: string
  profilePicture?: string | null
}

// Profile update response (for future use)
export interface UpdateProfileResponse {
  success: boolean
  message: string
  data: Admin
}

// Legacy logo update payload (deprecated - use FormData instead)
export interface UpdateLogoPayload {
  fileUrl: string
}

// Legacy password update payload (deprecated - use ChangePasswordPayload)
export interface UpdatePasswordPayload {
  currentPassword: string
  newPassword: string
}

// Legacy password update response (deprecated - use ChangePasswordResponse)
export interface UpdatePasswordResponse {
  success: boolean
  message: string
}

// App settings/configuration (for future use)
export interface AppSettings {
  siteName?: string
  logoUrl?: string
  theme?: "light" | "dark" | "system"
}
