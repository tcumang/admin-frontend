"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LogOut, ChevronLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { navigationItems } from "@/lib/config/navigation"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/80 shadow-lg shadow-accent/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
                AdminHub
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all",
              collapsed && "hidden"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-accent/20 to-accent/10 text-sidebar-primary shadow-sm"
                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                        collapsed && "justify-center px-0"
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
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {isActive && (
                            <div className="h-2 w-2 rounded-full bg-sidebar-primary animate-pulse" />
                          )}
                        </>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent
                      side="right"
                      className="font-medium bg-popover border-border"
                    >
                      {item.title}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200",
                  collapsed && "justify-center px-0"
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg">
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                </div>
                {!collapsed && <span>Logout</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent
                side="right"
                className="font-medium bg-popover border-border"
              >
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Collapse Button (visible when collapsed) */}
        {collapsed && (
          <div className="px-3 pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-9 w-full text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}
