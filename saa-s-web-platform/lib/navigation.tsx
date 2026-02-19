"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Role } from "./types"

export type Page =
  | "login"
  | "register"
  | "forgot-password"
  | "public-suspended"
  | "public-plan-expired"
  | "client-dashboard"
  | "client-user"
  | "client-new-deployment"
  | "client-deployment-detail"
  | "client-versions"
  | "client-traffic"
  | "client-log-viewer"
  | "client-plan"
  | "admin-dashboard"
  | "admin-plans"
  | "admin-users"
  | "admin-user-detail"
  | "admin-deployments"
  | "admin-deployment-detail"
  | "admin-logs"
  | "admin-monitoring"

interface NavigationState {
  currentPage: Page
  role: Role | null
  selectedDeploymentId: string | null
  selectedUserId: string | null
  navigate: (page: Page) => void
  setRole: (role: Role | null) => void
  selectDeployment: (id: string | null) => void
  selectAdminDeployment: (id: string | null) => void
  selectUser: (id: string | null) => void
  logout: () => void
}

const NavigationContext = createContext<NavigationState | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("login")
  const [role, setRole] = useState<Role | null>(null)
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const navigate = (page: Page) => setCurrentPage(page)

  const selectDeployment = (id: string | null) => {
    setSelectedDeploymentId(id)
    if (id) setCurrentPage("client-deployment-detail")
  }

  const selectAdminDeployment = (id: string | null) => {
    setSelectedDeploymentId(id)
    if (id) setCurrentPage("admin-deployment-detail")
  }

  const selectUser = (id: string | null) => {
    setSelectedUserId(id)
    if (id) setCurrentPage("admin-user-detail")
  }

  const logout = () => {
    setRole(null)
    setSelectedDeploymentId(null)
    setSelectedUserId(null)
    setCurrentPage("login")
  }

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        role,
        selectedDeploymentId,
        selectedUserId,
        navigate,
        setRole,
        selectDeployment,
        selectAdminDeployment,
        selectUser,
        logout,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider")
  return ctx
}
