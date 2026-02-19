"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useNavigation } from "@/lib/navigation"

const pageTitles: Record<string, string> = {
  "client-dashboard": "Dashboard",
  "client-user": "Mi usuario",
  "client-new-deployment": "New Deployment",
  "client-deployment-detail": "Deployment Detail",
  "client-versions": "Version History",
  "client-plan": "Plan",
  "admin-dashboard": "Admin Overview",
  "admin-users": "User Management",
  "admin-deployments": "Deployment Management",
  "admin-logs": "Logs & Monitoring",
}

export function TopHeader() {
  const { currentPage } = useNavigation()

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <h2 className="text-sm font-medium text-muted-foreground">
        {pageTitles[currentPage] || "VSS"}
      </h2>
    </header>
  )
}
