/**
 * Dashboard data fetching hooks.
 *
 * Provides hooks for fetching dashboard stats and activity logs
 * with proper loading, error, and success states using SWR.
 *
 * @example
 * // Fetch dashboard stats
 * const { stats, isLoading, error } = useDashboardStats()
 *
 * // Fetch dashboard activities
 * const { activities, isLoading, error } = useDashboardActivities()
 */

import useSWR from "swr"
import type {
  DashboardActivity,
  DashboardStats,
  ActivityLogResponse,
  DashboardStatsResponse,
} from "@/lib/types"
import { getDashboardStats, getDashboardActivities } from "@/lib/api/dashboard"

/**
 * Hook to fetch dashboard statistics.
 * Calls GET /dashboard/stats endpoint.
 *
 * @returns Dashboard stats with loading and error states
 */
export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStatsResponse>(
    "dashboard-stats",
    getDashboardStats,
    {
      // Revalidate on focus for fresh data
      revalidateOnFocus: true,
      // Keep previous data while fetching new
      keepPreviousData: true,
    }
  )

  return {
    // Extract stats from nested response
    stats: data?.data ?? null,
    // Loading state
    isLoading,
    // Error state
    error: error as Error | undefined,
    // Refresh function to refetch data
    refresh: mutate,
    // Raw response for additional data
    response: data,
  }
}

/**
 * Hook to fetch dashboard activity logs.
 * Calls GET /activity/dashboard endpoint.
 *
 * @returns Activity list with loading and error states
 */
export function useDashboardActivities() {
  const { data, error, isLoading, mutate } = useSWR<ActivityLogResponse>(
    "dashboard-activities",
    getDashboardActivities,
    {
      // Revalidate on focus for fresh data
      revalidateOnFocus: true,
      // Keep previous data while fetching new
      keepPreviousData: true,
    }
  )

  return {
    // Extract activities from response
    activities: data?.data ?? [],
    // Loading state
    isLoading,
    // Error state
    error: error as Error | undefined,
    // Refresh function to refetch data
    refresh: mutate,
    // Raw response for additional data
    response: data,
  }
}

// Re-export types for convenience
export type { DashboardActivity, DashboardStats }
