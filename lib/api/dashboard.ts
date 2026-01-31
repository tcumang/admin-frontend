/**
 * Dashboard API service.
 *
 * Fetches dashboard stats and activity logs.
 * All endpoints match the backend API specification.
 */

import type {
  DashboardActivity,
  DashboardStats,
  ActivityLogResponse,
  DashboardStatsResponse,
} from "@/lib/types"
import { apiFetch } from "./client"

/**
 * Fetch dashboard statistics.
 * Endpoint: GET /dashboard/stats
 *
 * Returns counts for:
 * - Total news articles
 * - Published news articles
 * - Total PDFs
 *
 * @returns DashboardStatsResponse with stats data
 *
 * @example
 * const response = await getDashboardStats()
 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  return apiFetch<DashboardStatsResponse>("/dashboard/stats", { method: "GET" })
}

/**
 * Fetch activity logs for dashboard.
 * Endpoint: GET /activity/dashboard
 *
 * Returns recent activity from all admins including:
 * - Admin name (firstName + lastName)
 * - Action performed
 * - Description
 * - Timestamp
 * - IP address and user agent
 *
 * @returns ActivityLogResponse with activity data
 *
 * @example
 * const response = await getDashboardActivities()
 */
export async function getDashboardActivities(): Promise<ActivityLogResponse> {
  return apiFetch<ActivityLogResponse>("/activity/dashboard", { method: "GET" })
}

/**
 * Helper to format activity timestamp.
 * Converts ISO string to human-readable format.
 *
 * @param timestamp - ISO timestamp from API
 * @returns Formatted date string
 */
export function formatActivityTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
