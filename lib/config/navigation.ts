import { LayoutDashboard, Newspaper, FileText, Settings } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview and statistics",
  },
  {
    title: "News",
    href: "/news",
    icon: Newspaper,
    description: "Manage news articles",
  },
  {
    title: "PDFs",
    href: "/pdfs",
    icon: FileText,
    description: "Manage PDF documents",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration",
  },
]

export const pageTitles: Record<string, { title: string; description: string }> = {
  "/": { title: "Dashboard", description: "Overview and statistics" },
  "/news": { title: "News", description: "Manage your news articles" },
  "/pdfs": { title: "PDFs", description: "Manage your PDF documents" },
  "/profile": { title: "Profile", description: "Manage your admin profile details" },
  "/settings": { title: "Settings", description: "System configuration and preferences" },
}
