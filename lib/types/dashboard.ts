/**
 * Dashboard-related type definitions.
 * Types for dashboard stats and activity logs.
 */

// Admin info from activity log
export interface AdminInfo {
  firstName: string
  lastName: string
}

// Dashboard activity log item
export interface DashboardActivity {
  id: number
  adminId: number
  action: string
  description: string
  ipAddress: string
  userAgent: string
  createdAt: string
  admin: AdminInfo
}

// Activity log API response
export interface ActivityLogResponse {
  success: boolean
  message: string
  data: DashboardActivity[]
}

// Dashboard statistics
export interface DashboardStats {
  totalNews: number
  publishedNews: number
  totalPdfs: number
}

// Dashboard stats API response
export interface DashboardStatsResponse {
  success: boolean
  message: string
  data: DashboardStats
}
