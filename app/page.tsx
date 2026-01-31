"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { NewsFormModal } from "@/components/admin/news-form-modal"
import { PDFFormModal } from "@/components/admin/pdf-form-modal"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Newspaper, Plus, Upload } from "lucide-react"
import { useDashboardStats, useDashboardActivities } from "@/hooks/useDashboard"
import { formatActivityTime } from "@/lib/api/dashboard"
import type { NewsFormData, PDFFormData } from "@/lib/types"

const adminName = "Admin"

export default function DashboardPage() {
  // Fetch dashboard data
  const { stats, isLoading: statsLoading } = useDashboardStats()
  const { activities, isLoading: activitiesLoading } = useDashboardActivities()

  const [newsModalOpen, setNewsModalOpen] = useState(false)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [isBooting, setIsBooting] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    const t = setTimeout(() => setIsBooting(false), 450)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    // Avoid hydration mismatch: locale/time formatting can differ between server pre-render and client.
    setLastUpdated(
      new Date().toLocaleString(undefined, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }, [])

  const handleNewsFormSubmit = (data: NewsFormData) => {
    console.log("News form submitted:", data)
  }

  const handlePdfFormSubmit = (data: PDFFormData) => {
    console.log("PDF form submitted:", data)
  }

  // Map activities to display format
  const displayActivities = activities.slice(0, 4).map((activity) => ({
    id: activity.id,
    type: activity.action.toLowerCase().includes("pdf") ? "pdf" : "news",
    title: activity.description,
    date: formatActivityTime(activity.createdAt),
    adminName: `${activity.admin.firstName} ${activity.admin.lastName}`,
  }))

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back,{" "}
              <span className="text-accent">{adminName}</span>
            </h1>
            <p className="text-muted-foreground">
              Here’s a quick overview of your content activity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-secondary/60">
              Updated {lastUpdated || "—"}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isBooting || statsLoading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <Card key={idx} className="border-border">
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-4 w-28 bg-muted/60" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-8 w-24 bg-muted/60" />
                      <Skeleton className="h-9 w-9 rounded-xl bg-muted/60" />
                    </div>
                  </CardHeader>
                </Card>
              ))
            : stats ? [
                {
                  title: "Total News",
                  value: stats.totalNews.toString(),
                  icon: Newspaper,
                },
                {
                  title: "Published News",
                  value: stats.publishedNews.toString(),
                  icon: Newspaper,
                },
                {
                  title: "Total PDFs",
                  value: stats.totalPdfs.toString(),
                  icon: FileText,
                },
              ].map((stat) => {
                const isNews = stat.title.includes("News")
                const iconColor = isNews
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"

                return (
                  <Card
                    key={stat.title}
                    className="border-border overflow-hidden"
                  >
                    <CardHeader className="space-y-3 bg-secondary/20 border-b border-border">
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </CardTitle>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-border">
                          <stat.icon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                      </div>
                      <div className="text-3xl font-bold tracking-tight text-foreground">
                        {stat.value}
                      </div>
                    </CardHeader>
                  </Card>
                )
              })
            : null}
        </div>

        {/* Quick Actions & Recent Items */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card className="border-border overflow-hidden">
            <CardHeader className="border-b border-border bg-secondary/20">
              <CardTitle className="text-base font-semibold">
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks for managing your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              <Button
                onClick={() => setNewsModalOpen(true)}
                className="w-full justify-start bg-transparent rounded-xl"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add News Article
                <span className="ml-auto text-xs text-muted-foreground">
                  Draft or publish
                </span>
              </Button>
              <Button
                onClick={() => setPdfModalOpen(true)}
                className="w-full justify-start bg-transparent rounded-xl"
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload PDF
                <span className="ml-auto text-xs text-muted-foreground">
                  Add cover + file
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Items / Activity */}
          <Card className="border-border overflow-hidden">
            <CardHeader className="border-b border-border bg-secondary/20">
              <CardTitle className="text-base font-semibold">
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest admin actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {isBooting || activitiesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 pb-4 last:pb-0 border-b border-border last:border-0"
                    >
                      <Skeleton className="h-9 w-9 rounded-lg bg-muted/60" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 bg-muted/60" />
                        <Skeleton className="h-3 w-24 bg-muted/60" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayActivities.length === 0 ? (
                <Empty className="border-border bg-secondary/10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-secondary">
                      <Newspaper />
                    </EmptyMedia>
                    <EmptyTitle>No recent activity</EmptyTitle>
                    <EmptyDescription>
                      Admin activities will show up here.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div className="flex w-full gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-transparent rounded-xl"
                        onClick={() => setNewsModalOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add News
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-transparent rounded-xl"
                        onClick={() => setPdfModalOpen(true)}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload PDF
                      </Button>
                    </div>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="space-y-4">
                  {displayActivities.map((item) => {
                    const isNews = item.type === "news"
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 pb-4 last:pb-0 border-b border-border last:border-0"
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-border ${
                            isNews
                              ? "bg-emerald-500/10"
                              : "bg-amber-500/10"
                          }`}
                        >
                          {isNews ? (
                            <Newspaper className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium leading-tight text-foreground truncate">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-secondary/60 text-xs"
                            >
                              {item.adminName}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {item.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* News Form Modal */}
        <NewsFormModal
          open={newsModalOpen}
          onOpenChange={setNewsModalOpen}
          onSubmit={handleNewsFormSubmit}
          initialData={null}
          mode="add"
        />

        {/* PDF Form Modal */}
        <PDFFormModal
          open={pdfModalOpen}
          onOpenChange={setPdfModalOpen}
          onSubmit={handlePdfFormSubmit}
          initialData={null}
          mode="add"
        />
      </div>
    </AdminLayout>
  )
}
