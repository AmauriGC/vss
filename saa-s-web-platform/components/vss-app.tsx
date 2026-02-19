"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useNavigation } from "@/lib/navigation"

import { LoginPage } from "@/components/auth/login-page"
import { RegisterPage } from "@/components/auth/register-page"
import { ForgotPasswordPage } from "@/components/auth/forgot-password-page"

import { ClientSidebar } from "@/components/client/client-sidebar"
import { ClientDashboard } from "@/components/client/client-dashboard"
import { NewDeploymentPage } from "@/components/client/new-deployment-page"
import { DeploymentDetailPage } from "@/components/client/deployment-detail-page"
import { ClientTrafficPage } from "@/components/client/client-traffic-page"
import { ClientLogViewerPage } from "@/components/client/client-log-viewer-page"
import { ClientPlanPage } from "@/components/client/client-plan-page"
import { ClientUserPage } from "@/components/client/client-user-page"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminUsersPage } from "@/components/admin/admin-users-page"
import { AdminUserDetailPage } from "@/components/admin/admin-user-detail-page"
import { AdminDeploymentsPage } from "@/components/admin/admin-deployments-page"
import { AdminDeploymentDetailPage } from "@/components/admin/admin-deployment-detail-page"
import { AdminLogsPage } from "@/components/admin/admin-logs-page"
import { AdminPlansPage } from "@/components/admin/admin-plans-page"

import { SuspendedPublicPage } from "@/components/public/suspended-public-page"
import { ExpiredPlanMessageScreen } from "@/components/public/expired-plan-message-screen"

import { TopHeader } from "@/components/top-header"

export function VSSApp() {
  const { currentPage, role } = useNavigation()

  // Public pages (no sidebar)
  if (currentPage === "public-suspended") return <SuspendedPublicPage />
  if (currentPage === "public-plan-expired") return <ExpiredPlanMessageScreen />

  // Auth pages (no sidebar)
  if (
    currentPage === "login" ||
    currentPage === "register" ||
    currentPage === "forgot-password"
  ) {
    switch (currentPage) {
      case "login":
        return <LoginPage />
      case "register":
        return <RegisterPage />
      case "forgot-password":
        return <ForgotPasswordPage />
    }
  }

  // Client pages
  if (role === "client") {
    return (
      <SidebarProvider>
        <ClientSidebar />
        <SidebarInset>
          <TopHeader />
          <div className="flex-1 overflow-auto">
            {currentPage === "client-dashboard" && <ClientDashboard />}
            {currentPage === "client-user" && <ClientUserPage />}
            {currentPage === "client-new-deployment" && <NewDeploymentPage />}
            {currentPage === "client-deployment-detail" && <DeploymentDetailPage />}
            {currentPage === "client-traffic" && <ClientTrafficPage />}
            {currentPage === "client-log-viewer" && <ClientLogViewerPage />}
            {currentPage === "client-plan" && <ClientPlanPage />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Admin pages
  if (role === "admin") {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <TopHeader />
          <div className="flex-1 overflow-auto">
            {currentPage === "admin-dashboard" && <AdminDashboard />}
            {currentPage === "admin-plans" && <AdminPlansPage />}
            {currentPage === "admin-users" && <AdminUsersPage />}
            {currentPage === "admin-user-detail" && <AdminUserDetailPage />}
            {currentPage === "admin-deployments" && <AdminDeploymentsPage />}
            {currentPage === "admin-deployment-detail" && <AdminDeploymentDetailPage />}
            {currentPage === "admin-logs" && <AdminLogsPage />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return <LoginPage />
}
