/**
 * Central type exports.
 * Import all types from this file for consistency.
 *
 * Usage:
 *   import type { Admin, NewsItem, ModalMode } from "@/lib/types"
 */

// Auth types
export type {
  Admin,
  LoginPayload,
  LoginResponse,
  LoginOptions,
  AuthContextType,
  TokenOptions,
} from "./auth"

// News types
export type {
  NewsItem,
  NewsFormData,
  NewsListResponse,
  SingleNewsResponse,
  NewsPayload,
  NewsListParams,
  NewsPagination,
  NewsStatus,
} from "./news"

// PDF types
export type {
  PDFItem,
  PDFFormData,
  PDFListResponse,
  PDFResponse,
} from "./pdf"

// Settings types
export type {
  // New settings types
  GetLogoResponse,
  UpdateLogoResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  // Legacy types (kept for backward compatibility)
  UpdateProfilePayload,
  UpdateProfileResponse,
  UpdateLogoPayload,
  UpdatePasswordPayload,
  UpdatePasswordResponse,
  AppSettings,
} from "./settings"

// Common types
export type {
  ModalMode,
  ImagePreviewState,
  FormErrors,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  HttpMethod,
} from "./common"
