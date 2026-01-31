/**
 * Main library exports.
 *
 * Central export file for the lib directory.
 * Provides convenient access to common utilities.
 *
 * Usage:
 *   import { cn } from "@/lib"
 *
 * For specific modules, import directly:
 *   import { useAuth } from "@/lib/auth"
 *   import { apiFetch } from "@/lib/api"
 *   import type { Admin, NewsItem } from "@/lib/types"
 */

// Core utilities
export { cn } from "./utils"

// Re-export common types for convenience
export type {
  Admin,
  NewsItem,
  PDFItem,
  ModalMode,
  LoginPayload,
  LoginResponse,
} from "./types"
