"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PageHeader } from "@/components/admin/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Save, Upload, User2 } from "lucide-react"

type ProfileForm = {
  firstName: string
  lastName: string
  email: string
}

type ProfileErrors = Partial<Record<keyof ProfileForm, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ProfilePage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<ProfileForm>({
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
  })
  const [errors, setErrors] = useState<ProfileErrors>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>("")

  useEffect(() => {
    if (!avatarFile) return
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [avatarFile])

  const initials = useMemo(() => {
    const a = form.firstName.trim().slice(0, 1)
    const b = form.lastName.trim().slice(0, 1)
    return `${a}${b}`.toUpperCase() || "AD"
  }, [form.firstName, form.lastName])

  const validate = (data: ProfileForm): ProfileErrors => {
    const next: ProfileErrors = {}
    if (!data.firstName.trim()) next.firstName = "First name is required."
    if (!data.lastName.trim()) next.lastName = "Last name is required."
    if (!data.email.trim()) next.email = "Email is required."
    else if (!EMAIL_RE.test(data.email.trim())) next.email = "Please enter a valid email."
    return next
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      toast({
        variant: "destructive",
        title: "Fix form errors",
        description: "Please fill all required fields with valid values.",
      })
      return
    }

    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    setIsSubmitting(false)

    toast({
      title: "Profile saved",
      description: "Your profile details were updated (design-only).",
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Admin Profile"
          description="Update your personal details and contact email"
        />

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Profile card */}
          <Card className="border-border overflow-hidden">
            <CardHeader className="bg-secondary/20 border-b border-border">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User2 className="h-4 w-4 text-accent" />
                Profile
              </CardTitle>
              <CardDescription>Update your profile picture and identity</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-accent/25">
                  <AvatarImage
                    src={avatarPreviewUrl || "/placeholder-user.jpg"}
                    alt="Admin avatar"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {form.firstName || "—"} {form.lastName || ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {form.email || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-border bg-secondary/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {avatarFile?.name || "Choose a profile picture"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Image files only (preview shown instantly)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-transparent border-border/50 text-foreground hover:bg-secondary/50 hover:text-foreground rounded-xl"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </Button>
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form card */}
          <Card className="border-border overflow-hidden">
            <CardHeader className="bg-secondary/20 border-b border-border">
              <CardTitle className="text-base font-semibold">Edit details</CardTitle>
              <CardDescription>Keep your profile information up to date</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                      className={cn(
                        "h-11 bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/60 rounded-xl focus:bg-secondary/40 focus:border-accent/50",
                        errors.firstName && "border-destructive/60 focus-visible:border-destructive"
                      )}
                      placeholder="Enter first name"
                      aria-invalid={!!errors.firstName}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                      className={cn(
                        "h-11 bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/60 rounded-xl focus:bg-secondary/40 focus:border-accent/50",
                        errors.lastName && "border-destructive/60 focus-visible:border-destructive"
                      )}
                      placeholder="Enter last name"
                      aria-invalid={!!errors.lastName}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive">{errors.lastName}</p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className={cn(
                        "h-11 bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/60 rounded-xl focus:bg-secondary/40 focus:border-accent/50",
                        errors.email && "border-destructive/60 focus-visible:border-destructive"
                      )}
                      placeholder="name@company.com"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

