import React from "react"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-shell">
      <AppSidebar />
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}
