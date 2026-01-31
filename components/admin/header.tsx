"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { pageTitles } from "@/lib/config/navigation"
import { ThemeToggle } from "./theme-toggle"
import { ConfirmationDialog } from "./confirmation-dialog"
import { useAuth } from "@/lib/auth"

interface HeaderProps {
  sidebarCollapsed: boolean
  onMobileMenuToggle: () => void
}

export function Header({ sidebarCollapsed, onMobileMenuToggle }: HeaderProps) {
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const pathname = usePathname()
  const pageInfo = pageTitles[pathname] || pageTitles["/"]
  const { user, logout } = useAuth()

  const handleLogoutConfirm = async () => {
    await logout()
    setLogoutConfirm(false)
  }

  const getUserInitials = () => {
    if (!user) return "AD"
    const first = user.firstName?.[0] || ""
    const last = user.lastName?.[0] || ""
    return `${first}${last}`.toUpperCase() || "AD"
  }

  const getUserDisplayName = () => {
    if (!user) return "Admin User"
    return `${user.firstName} ${user.lastName}`.trim() || "Admin User"
  }

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-background/95 backdrop-blur-xl border-b border-border transition-all duration-300 supports-[backdrop-filter]:bg-background/60",
        sidebarCollapsed ? "left-[72px]" : "left-[260px]",
        "max-lg:left-0"
      )}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              {pageInfo.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              {pageInfo.description}
            </p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-secondary/50 border-border/50 focus:bg-secondary focus:border-accent/50 transition-all rounded-xl"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-semibold bg-accent text-accent-foreground border-2 border-background">
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-popover border-border"
            >
              <DropdownMenuLabel className="font-semibold flex items-center justify-between">
                Notifications
                <Badge variant="secondary" className="text-xs font-normal">
                  3 new
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer focus:bg-secondary">
                <span className="font-medium text-foreground">
                  New user registered
                </span>
                <span className="text-xs text-muted-foreground">
                  2 minutes ago
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer focus:bg-secondary">
                <span className="font-medium text-foreground">
                  PDF upload complete
                </span>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer focus:bg-secondary">
                <span className="font-medium text-foreground">
                  System update available
                </span>
                <span className="text-xs text-muted-foreground">
                  3 hours ago
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center justify-center text-sm text-accent font-medium cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0 ring-2 ring-transparent hover:ring-accent/30 transition-all"
              >
                <Avatar className="h-9 w-9 border-2 border-accent/30">
                  <AvatarImage src={user?.profilePicture || "/avatar.png"} alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground font-semibold text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-popover border-border"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "admin@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLogoutConfirm(true)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        open={logoutConfirm}
        onOpenChange={setLogoutConfirm}
        title="Logout"
        description="Are you sure you want to logout? You will need to login again to access the admin panel."
        confirmText="Logout"
        cancelText="Stay"
        isDangerous
        onConfirm={handleLogoutConfirm}
      />
    </header>
  )
}
