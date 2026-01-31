"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { useToast } from "@/hooks/use-toast"
import { useFetchLogo, useUpdateLogo, useChangePassword } from "@/hooks/use-settings"
import type { ChangePasswordPayload } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, ImageIcon, Lock, Save, Upload, Loader2, AlertCircle, RefreshCw } from "lucide-react"

type LogoErrors = {
  logoFile?: string
}

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type PasswordErrors = Partial<Record<keyof PasswordForm, string>>

export default function SettingsPage() {
  const { toast } = useToast()

  // ============================================================
  // Logo Tab - API Integration
  // ============================================================
  const {
    logoUrl: currentLogoUrl,
    isLoading: isLoadingLogo,
    error: logoFetchError,
    refetch: refetchLogo,
  } = useFetchLogo()

  const { updateLogo: apiUpdateLogo, isUpdating: isUpdatingLogo } = useUpdateLogo()

  const fileRef = useRef<HTMLInputElement>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>("")
  const [logoErrors, setLogoErrors] = useState<LogoErrors>({})

  // ============================================================
  // Password Tab - API Integration
  // ============================================================
  const { changePassword: apiChangePassword, isChanging: isChangingPassword } = useChangePassword()

  const [pw, setPw] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [pwErrors, setPwErrors] = useState<PasswordErrors>({})
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Create preview URL when file is selected
  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl("")
      return
    }
    const url = URL.createObjectURL(logoFile)
    setLogoPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [logoFile])

  const logoName = useMemo(() => logoFile?.name ?? "", [logoFile])

  // Use preview URL if file is selected, otherwise use current logo from API
  const displayLogoUrl = logoPreviewUrl || currentLogoUrl

  // ============================================================
  // Validation
  // ============================================================
  const validateLogo = (file: File | null): LogoErrors => {
    if (!file) return { logoFile: "Please select a logo image." }
    if (!file.type.startsWith("image/")) return { logoFile: "Only image files are allowed." }
    if (file.size > 5 * 1024 * 1024) return { logoFile: "Image must be less than 5MB." }
    return {}
  }

  const validatePassword = (data: PasswordForm): PasswordErrors => {
    const next: PasswordErrors = {}
    if (!data.currentPassword.trim()) next.currentPassword = "Current password is required."
    if (!data.newPassword.trim()) next.newPassword = "New password is required."
    else if (data.newPassword.trim().length < 8) next.newPassword = "New password must be at least 8 characters."
    if (!data.confirmPassword.trim()) next.confirmPassword = "Confirm password is required."
    else if (data.newPassword !== data.confirmPassword) next.confirmPassword = "Passwords do not match."
    return next
  }

  // ============================================================
  // Form Submissions
  // ============================================================
  const onLogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateLogo(logoFile)
    setLogoErrors(validationErrors)

    if (Object.keys(validationErrors).length) {
      toast({
        variant: "destructive",
        title: "Invalid logo",
        description: validationErrors.logoFile,
      })
      return
    }

    try {
      await apiUpdateLogo(logoFile!)
      toast({
        title: "Logo updated",
        description: "App logo has been updated successfully.",
      })
      // Clear the selected file after successful upload
      setLogoFile(null)
      if (fileRef.current) fileRef.current.value = ""
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update logo"
      toast({
        variant: "destructive",
        title: "Update failed",
        description: message,
      })
    }
  }

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validatePassword(pw)
    setPwErrors(validationErrors)

    if (Object.keys(validationErrors).length) {
      toast({
        variant: "destructive",
        title: "Fix password form",
        description: "Please correct the highlighted fields.",
      })
      return
    }

    try {
      // Map form fields to API payload format
      const payload: ChangePasswordPayload = {
        oldPassword: pw.currentPassword,
        newPassword: pw.newPassword,
        confirmPassword: pw.confirmPassword,
      }

      await apiChangePassword(payload)
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      })
      // Reset form
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setPwErrors({})
      setShowCurrent(false)
      setShowNew(false)
      setShowConfirm(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password"
      toast({
        variant: "destructive",
        title: "Password change failed",
        description: message,
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Update branding and security preferences"
        />

        <Card className="border-border overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border">
            <CardTitle className="text-base font-semibold">Settings</CardTitle>
            <CardDescription>Manage logo and password</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="logo" className="gap-4">
              <TabsList className="bg-secondary/30 rounded-xl p-1 h-11 w-full sm:w-fit">
                <TabsTrigger
                  value="logo"
                  className="gap-2 rounded-lg px-4 py-2 data-[state=active]:ring-1 data-[state=active]:ring-border"
                >
                  <ImageIcon className="h-4 w-4" />
                  Change Logo
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="gap-2 rounded-lg px-4 py-2 data-[state=active]:ring-1 data-[state=active]:ring-border"
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </TabsTrigger>
              </TabsList>

              {/* Tab: Logo */}
              <TabsContent value="logo" className="mt-2">
                <form onSubmit={onLogoSubmit} className="space-y-6" noValidate>
                  <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    <Card className="border-border overflow-hidden">
                      <CardHeader className="bg-secondary/10 border-b border-border">
                        <CardTitle className="text-sm font-semibold">Preview</CardTitle>
                        <CardDescription>
                          {logoFile ? "New logo preview" : "Current app logo"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="aspect-video rounded-xl border border-border bg-secondary/10 flex items-center justify-center overflow-hidden">
                          {/* Loading state */}
                          {isLoadingLogo ? (
                            <div className="text-center">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground">Loading current logo...</p>
                            </div>
                          ) : logoFetchError ? (
                            /* Error state */
                            <div className="text-center">
                              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/20">
                                <AlertCircle className="h-6 w-6 text-destructive" />
                              </div>
                              <p className="text-sm font-medium text-foreground">Failed to load logo</p>
                              <p className="text-xs text-muted-foreground mt-1 mb-3">
                                {logoFetchError.message}
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => refetchLogo()}
                                className="rounded-lg"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Retry
                              </Button>
                            </div>
                          ) : displayLogoUrl ? (
                            /* Logo preview */
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={displayLogoUrl}
                              alt="Logo preview"
                              className="h-full w-full object-contain p-4"
                            />
                          ) : (
                            /* Empty state */
                            <div className="text-center">
                              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary ring-1 ring-border">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <p className="text-sm font-medium text-foreground">No logo set</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Choose an image to preview it here.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-foreground">
                          Upload Logo <span className="text-destructive">*</span>
                        </Label>
                        <div
                          className={cn(
                            "rounded-xl border border-border bg-secondary/10 p-4",
                            "transition-colors hover:bg-secondary/20"
                          )}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {logoName || "Choose an image file"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG, SVG, WEBP (max 5MB)
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="bg-transparent border-border/50 text-foreground hover:bg-secondary/50 hover:text-foreground rounded-xl"
                                onClick={() => fileRef.current?.click()}
                                disabled={isUpdatingLogo}
                              >
                                <Upload className="h-4 w-4" />
                                Browse
                              </Button>
                            </div>
                          </div>
                          <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null
                              setLogoFile(file)
                              setLogoErrors({})
                            }}
                          />
                        </div>
                        {logoErrors.logoFile && (
                          <p className="text-xs text-destructive">{logoErrors.logoFile}</p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isUpdatingLogo || !logoFile}
                          className="h-11 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
                        >
                          {isUpdatingLogo ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </TabsContent>

              {/* Tab: Password */}
              <TabsContent value="password" className="mt-2">
                <form onSubmit={onPasswordSubmit} className="space-y-6" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="currentPassword" className="text-foreground">
                        Current Password <span className="text-destructive">*</span>
                      </Label>
                      <InputGroup className="rounded-xl bg-secondary/30 border-border/50">
                        <InputGroupInput
                          id="currentPassword"
                          type={showCurrent ? "text" : "password"}
                          value={pw.currentPassword}
                          onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
                          aria-invalid={!!pwErrors.currentPassword}
                          disabled={isChangingPassword}
                          className="h-11"
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            size="sm"
                            className="rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => setShowCurrent((v) => !v)}
                            aria-label={showCurrent ? "Hide current password" : "Show current password"}
                          >
                            {showCurrent ? <EyeOff /> : <Eye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {pwErrors.currentPassword && (
                        <p className="text-xs text-destructive">{pwErrors.currentPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-foreground">
                        New Password <span className="text-destructive">*</span>
                      </Label>
                      <InputGroup className="rounded-xl bg-secondary/30 border-border/50">
                        <InputGroupInput
                          id="newPassword"
                          type={showNew ? "text" : "password"}
                          value={pw.newPassword}
                          onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
                          aria-invalid={!!pwErrors.newPassword}
                          disabled={isChangingPassword}
                          className="h-11"
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            size="sm"
                            className="rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => setShowNew((v) => !v)}
                            aria-label={showNew ? "Hide new password" : "Show new password"}
                          >
                            {showNew ? <EyeOff /> : <Eye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {pwErrors.newPassword ? (
                        <p className="text-xs text-destructive">{pwErrors.newPassword}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">
                        Confirm Password <span className="text-destructive">*</span>
                      </Label>
                      <InputGroup className="rounded-xl bg-secondary/30 border-border/50">
                        <InputGroupInput
                          id="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          value={pw.confirmPassword}
                          onChange={(e) => setPw((p) => ({ ...p, confirmPassword: e.target.value }))}
                          aria-invalid={!!pwErrors.confirmPassword}
                          disabled={isChangingPassword}
                          className="h-11"
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            size="sm"
                            className="rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => setShowConfirm((v) => !v)}
                            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                          >
                            {showConfirm ? <EyeOff /> : <Eye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {pwErrors.confirmPassword && (
                        <p className="text-xs text-destructive">{pwErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="h-11 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
