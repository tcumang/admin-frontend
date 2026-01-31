"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Upload,
  X,
  ImageIcon,
  Newspaper,
  Type,
  AlignLeft,
  Star,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { NewsFormData, ModalMode } from "@/lib/types"

interface NewsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: NewsFormData) => void
  initialData?: NewsFormData | null
  mode: ModalMode
  /** Loading state when fetching data for edit mode */
  isLoading?: boolean
  /** Submitting state when creating/updating */
  isSubmitting?: boolean
}

const defaultFormData: NewsFormData = {
  title: "",
  description: "",
  imagePreview: "",
  imageFile: null,
  publishDate: undefined,
  featured: false,
}

export function NewsFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
  isLoading = false,
  isSubmitting: isSubmittingProp = false,
}: NewsFormModalProps) {
  const [formData, setFormData] = useState<NewsFormData>(defaultFormData)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof NewsFormData, string>>>({})
  
  // Use external submitting state if provided, otherwise use local state
  const isSubmitting = isSubmittingProp || isLocalSubmitting
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData)
        setImagePreview(initialData.imagePreview)
      } else {
        setFormData(defaultFormData)
        setImagePreview("")
      }
      setErrors({})
    }
  }, [open, initialData])

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof NewsFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleImageUpload = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, imagePreview: "Image must be less than 5MB" }))
        return
      }
      // Store the actual File object for upload
      setFormData((prev) => ({ ...prev, imageFile: file }))
      
      // Create preview URL for display only
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, imagePreview: result }))
        setErrors((prev) => ({ ...prev, imagePreview: undefined }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleImageUpload(file)
  }

  const removeImage = () => {
    setImagePreview("")
    setFormData((prev) => ({ ...prev, imagePreview: "", imageFile: null }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // Only use local submitting state if external state is not provided
    if (!isSubmittingProp) {
      setIsLocalSubmitting(true)
    }
    
    try {
      await onSubmit(formData)
    } finally {
      if (!isSubmittingProp) {
        setIsLocalSubmitting(false)
      }
    }
  }

  const updateField = <K extends keyof NewsFormData>(field: K, value: NewsFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
              <Newspaper className="h-5 w-5 text-accent" />
            </div>
            {mode === "add" ? "Create New Article" : "Edit Article"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === "add"
              ? "Fill in the details below to create a new news article."
              : "Update the article details below."}
          </DialogDescription>
        </DialogHeader>

        {/* Loading state for edit mode */}
        {isLoading ? (
          <div className="px-6 pb-6">
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted/60 rounded animate-pulse" />
                <div className="h-11 w-full bg-muted/60 rounded-xl animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-20 bg-muted/60 rounded animate-pulse" />
                <div className="h-32 w-full bg-muted/60 rounded-xl animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-28 bg-muted/60 rounded animate-pulse" />
                <div className="h-48 w-full bg-muted/60 rounded-xl animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted/60 rounded animate-pulse" />
                <div className="h-11 w-full bg-muted/60 rounded-xl animate-pulse" />
              </div>
              <div className="h-16 w-full bg-muted/60 rounded-xl animate-pulse" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
              <div className="h-10 w-24 bg-muted/60 rounded-xl animate-pulse" />
              <div className="h-10 w-36 bg-muted/60 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="space-y-5 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                Article Title
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter article title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                className={cn(
                  "bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-secondary focus:border-accent/50 transition-all rounded-xl h-11",
                  errors.title && "border-destructive focus:border-destructive"
                )}
              />
              {errors.title && (
                <p className="text-xs text-destructive mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-muted-foreground" />
                Description
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter article description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={cn(
                  "bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-secondary focus:border-accent/50 transition-all rounded-xl min-h-[120px] resize-none",
                  errors.description && "border-destructive focus:border-destructive"
                )}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">{errors.description}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Featured Image
                <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl transition-all duration-200",
                  isDragging
                    ? "border-accent bg-accent/10 scale-[1.02]"
                    : "border-border hover:border-muted-foreground/50 hover:bg-secondary/30",
                  imagePreview ? "p-3" : "p-8"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="mr-2"
                      >
                        Replace
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                      >
                        Remove
                      </Button>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 hover:bg-background text-foreground transition-colors shadow-sm"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-3 rounded-full bg-secondary mb-3">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-foreground font-medium mb-1">
                      Drop your image here
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-transparent border-border text-foreground hover:bg-secondary rounded-lg"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {errors.imagePreview && (
                <p className="text-xs text-destructive">{errors.imagePreview}</p>
              )}
            </div>

            {/* Publish Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Publish Date
                <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-secondary/50 border-border text-foreground hover:bg-secondary hover:text-foreground hover:border-accent/50 focus-visible:bg-secondary focus-visible:text-foreground rounded-xl h-11",
                      !formData.publishDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.publishDate ? (
                      format(formData.publishDate, "PPP")
                    ) : (
                      <span>Select publish date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.publishDate}
                    onSelect={(date) => updateField("publishDate", date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => updateField("featured", checked as boolean)}
                className="border-accent/50 bg-background/60 dark:bg-input/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground focus-visible:border-accent focus-visible:ring-accent/30"
              />
              <div className="flex-1">
                <Label htmlFor="featured" className="text-foreground cursor-pointer flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  Featured Article
                </Label>
                <span className="text-xs text-muted-foreground">
                  Featured articles appear prominently on the homepage
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-border mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="bg-transparent border-border text-foreground hover:bg-secondary hover:text-foreground focus-visible:bg-secondary focus-visible:text-foreground rounded-xl flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl flex-1 sm:flex-none min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === "add" ? "Creating..." : "Saving..."}
                </>
              ) : mode === "add" ? (
                "Create Article"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export type { NewsFormData }
