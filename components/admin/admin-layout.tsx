"use client"

import React from "react"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { MobileSidebar } from "./mobile-sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Header */}
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />

        {/* Main Content */}
        <main
          className={cn(
            "pt-16 min-h-screen transition-all duration-300",
            sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
          )}
        >
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
