"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LogOut, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { navigationItems } from "@/lib/config/navigation"

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[280px] bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out flex flex-col lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/80 shadow-lg shadow-accent/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
              AdminHub
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-accent/20 to-accent/10 text-sidebar-primary shadow-sm"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                      isActive
                        ? "bg-accent/20 text-sidebar-primary"
                        : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <span className="block">{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <div className="h-2 w-2 rounded-full bg-sidebar-primary animate-pulse" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <button
            type="button"
            className="group flex w-full items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg">
              <LogOut className="h-5 w-5 flex-shrink-0" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
