"use client"

import { useEffect, useState, useCallback } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PageHeader } from "@/components/admin/page-header"
import { ImagePreviewModal } from "@/components/admin/image-preview-modal"
import { NewsFormModal } from "@/components/admin/news-form-modal"
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Newspaper, Eye, Search, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  useFetchNews,
  useFetchSingleNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
} from "@/hooks/use-news"
import { buildNewsImageUrl, newsItemToFormData } from "@/lib/api/news"
import type { NewsItem, NewsFormData, ImagePreviewState, ModalMode, NewsStatus, NewsPayload } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"


const statusConfig: Record<NewsStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  
}
// Default pagination settings
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

// Debounce delay for search input (ms)
const SEARCH_DEBOUNCE_MS = 400

export default function NewsPage() {
  const { toast } = useToast()

  // Search state with debounce
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE)

  // Image preview modal state
  const [imagePreview, setImagePreview] = useState<ImagePreviewState>({
    open: false,
    url: "",
    title: "",
  })

  // Form modal state
  const [formModal, setFormModal] = useState<{
    open: boolean
    mode: ModalMode
    newsId: number | null
  }>({
    open: false,
    mode: "add",
    newsId: null,
  })

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    newsId: number | null
    newsTitle: string
  }>({
    open: false,
    newsId: null,
    newsTitle: "",
  })

  // Fetch news list with current page and search
  const { news, pagination, isLoading, error, refresh } = useFetchNews({
    page: currentPage,
    limit: DEFAULT_LIMIT,
    search: searchQuery || undefined,
  })

  // Fetch single news for editing (only when modal is open in edit mode)
  const { newsItem: editingNews, isLoading: isLoadingEditNews } = useFetchSingleNews(
    formModal.open && formModal.mode === "edit" ? formModal.newsId : null
  )

  // Mutation hooks
  const { createNews, isCreating } = useCreateNews()
  const { updateNews, isUpdating } = useUpdateNews()
  const { deleteNews, isDeleting } = useDeleteNews()

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
      // Reset to first page when search changes
      setCurrentPage(DEFAULT_PAGE)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Handle add news click
  const handleAddNews = useCallback(() => {
    setFormModal({ open: true, mode: "add", newsId: null })
  }, [])

  // Handle edit news click
  const handleEditNews = useCallback((newsItem: NewsItem) => {
    setFormModal({
      open: true,
      mode: "edit",
      newsId: newsItem.id,
    })
  }, [])

  // Handle form submission (create or update)
  const handleFormSubmit = useCallback(
    async (data: NewsFormData) => {
      try {
        // Convert form data to API payload with File object for image
        const payload: NewsPayload = {
          title: data.title,
          description: data.description,
          // Only include file if a new image was selected
          featuredImage: data.imageFile || undefined,
          publishDate: data.publishDate ? format(data.publishDate, "yyyy-MM-dd") : "",
          isFeatured: data.featured,
        }

        if (formModal.mode === "add") {
          // Create new news
          await createNews(payload)
          toast({
            title: "Article created",
            description: "The news article has been created successfully.",
          })
        } else if (formModal.newsId) {
          // Update existing news
          await updateNews(formModal.newsId, payload)
          toast({
            title: "Article updated",
            description: "The news article has been updated successfully.",
          })
        }

        // Close modal on success
        setFormModal({ open: false, mode: "add", newsId: null })
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred"
        toast({
          title: formModal.mode === "add" ? "Failed to create article" : "Failed to update article",
          description: message,
          variant: "destructive",
        })
      }
    },
    [formModal.mode, formModal.newsId, createNews, updateNews, toast]
  )

  // Handle delete click (open confirmation)
  const handleDeleteClick = useCallback((newsItem: NewsItem) => {
    setDeleteConfirm({
      open: true,
      newsId: newsItem.id,
      newsTitle: newsItem.title,
    })
  }, [])

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm.newsId) return

    try {
      await deleteNews(deleteConfirm.newsId)
      toast({
        title: "Article deleted",
        description: "The news article has been deleted successfully.",
      })
      setDeleteConfirm({ open: false, newsId: null, newsTitle: "" })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Failed to delete article",
        description: message,
        variant: "destructive",
      })
    }
  }, [deleteConfirm.newsId, deleteNews, toast])

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Get form initial data for edit mode
  const getFormInitialData = (): NewsFormData | null => {
    if (formModal.mode === "add") return null
    if (!editingNews) return null
    return newsItemToFormData(editingNews)
  }

  // Calculate total count for display
  const totalCount = pagination?.total ?? news.length

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="News Articles"
          description="Manage your news articles and publications"
        >
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-9 bg-secondary/40 border-border rounded-xl"
              />
            </div>
            <Button
              onClick={handleAddNews}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Article
            </Button>
          </div>
        </PageHeader>

        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="border-b border-border bg-secondary/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-accent" />
                All Articles
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing {news.length} of {totalCount} articles
                    {searchQuery && ` matching "${searchQuery}"`}
                  </>
                )}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Error state */}
            {error && !isLoading && (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Failed to load articles</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
                  <Button onClick={() => refresh()} variant="outline" className="rounded-xl">
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && !error && (
              <div className="p-5 space-y-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/10 p-3"
                  >
                    <Skeleton className="h-7 w-7 rounded-lg bg-muted/60" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-2/3 bg-muted/60" />
                      <Skeleton className="h-3 w-1/2 bg-muted/60" />
                    </div>
                    <Skeleton className="h-12 w-16 rounded-lg bg-muted/60" />
                    <Skeleton className="h-7 w-24 rounded-md bg-muted/60" />
                    <Skeleton className="h-8 w-20 rounded-lg bg-muted/60" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && news.length === 0 && (
              <div className="p-6">
                <Empty className="border-border bg-secondary/10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-secondary">
                      <Newspaper />
                    </EmptyMedia>
                    <EmptyTitle>
                      {searchQuery ? "No articles found" : "No articles yet"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {searchQuery
                        ? `No articles match your search "${searchQuery}". Try a different search term.`
                        : "Create your first news article to start publishing updates."}
                    </EmptyDescription>
                  </EmptyHeader>
                  {!searchQuery && (
                    <EmptyContent>
                      <Button
                        type="button"
                        onClick={handleAddNews}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-xl w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Article
                      </Button>
                    </EmptyContent>
                  )}
                </Empty>
              </div>
            )}

            {/* Data table */}
            {!isLoading && !error && news.length > 0 && (
              <div className="max-h-[70vh] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-secondary/60 backdrop-blur supports-[backdrop-filter]:bg-secondary/40">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-semibold w-[60px] text-center">
                        #
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold min-w-[220px]">
                        Title
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold w-[100px]">
                        Image
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold min-w-[280px]">
                        Description
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold w-[130px]">
                        Publish Date
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold w-[110px]">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold w-[120px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news.map((newsItem, index) => {
                      // Calculate row number based on pagination
                      const rowNumber = (currentPage - 1) * DEFAULT_LIMIT + index + 1
                      // Build full image URL
                      const imageUrl = buildNewsImageUrl(newsItem.featuredImage)
                      // Get status config with fallback
                      const status = statusConfig[newsItem.status] ?? statusConfig.PENDING

                      return (
                        <TableRow
                          key={newsItem.id}
                          className="border-border group hover:bg-secondary/40 transition-colors"
                        >
                          <TableCell className="text-center">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-xs font-medium text-muted-foreground ring-1 ring-border">
                              {rowNumber}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block max-w-[260px] truncate">
                                  {truncateText(newsItem.title, 50)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-popover border border-border text-foreground">
                                {newsItem.title}
                                {newsItem.isFeatured && (
                                  <Badge className="ml-2 bg-accent/20 text-accent border-accent/30">
                                    Featured
                                  </Badge>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {imageUrl ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setImagePreview({
                                        open: true,
                                        url: imageUrl,
                                        title: newsItem.title,
                                      })
                                    }
                                    className="group/img relative overflow-hidden rounded-lg border border-border hover:border-accent/50 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    aria-label={`Preview image for ${newsItem.title}`}
                                  >
                                    <img
                                      src={imageUrl || "/placeholder.svg"}
                                      alt={newsItem.title}
                                      className="h-12 w-16 object-cover transition-transform group-hover/img:scale-110"
                                      crossOrigin="anonymous"
                                      onError={(e) => {
                                        // Fallback to placeholder on error
                                        e.currentTarget.src = "/placeholder.svg"
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-accent/0 group-hover/img:bg-accent/30 transition-colors flex items-center justify-center">
                                      <Eye className="h-4 w-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                    </div>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover border border-border text-foreground">
                                  Preview image
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-xs text-muted-foreground">No image</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-normal">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block line-clamp-2 max-w-[420px]">
                                  {newsItem.description || "—"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-sm bg-popover border border-border text-foreground">
                                {newsItem.description || "No description"}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(newsItem.publishDate)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn("font-medium", status.className)}
                            >
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditNews(newsItem)}
                                    className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit {newsItem.title}</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Edit</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(newsItem)}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete {newsItem.title}</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Delete</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/20">
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={currentPage === pagination.totalPages}
                        className="rounded-lg"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Preview Modal */}
        <ImagePreviewModal
          preview={imagePreview}
          onClose={() => setImagePreview((prev) => ({ ...prev, open: false }))}
        />

        {/* News Form Modal */}
        <NewsFormModal
          open={formModal.open}
          onOpenChange={(open) => {
            if (!open) {
              setFormModal({ open: false, mode: "add", newsId: null })
            }
          }}
          onSubmit={handleFormSubmit}
          initialData={getFormInitialData()}
          mode={formModal.mode}
          isLoading={formModal.mode === "edit" ? isLoadingEditNews : false}
          isSubmitting={isCreating || isUpdating}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}
          title="Delete Article"
          description={`Are you sure you want to delete "${deleteConfirm.newsTitle}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous
          onConfirm={handleDeleteConfirm}
          isLoading={isDeleting}
        />
      </div>
    </AdminLayout>
  )
}
