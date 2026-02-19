"use client"

import {
  LayoutDashboard,
  Plus,
  Globe,
  CreditCard,
  User,
  LogOut,
  Globe2,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNavigation, type Page } from "@/lib/navigation"
import { currentUser, deployments } from "@/lib/mock-data"
import { PlanBadge } from "@/components/status-badge"

type NavItem =
  | { label: string; icon: typeof LayoutDashboard; type: "page"; page: Page }
  | { label: string; icon: typeof LayoutDashboard; type: "deployment" }

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, type: "page", page: "client-dashboard" },
  { label: "Mi usuario", icon: User, type: "page", page: "client-user" },
  { label: "Mi despliegue", icon: Globe, type: "deployment" },
  { label: "Plan", icon: CreditCard, type: "page", page: "client-plan" },
  { label: "New Deployment", icon: Plus, type: "page", page: "client-new-deployment" },
]

export function ClientSidebar() {
  const { currentPage, navigate, logout, selectDeployment } = useNavigation()
  const myDeployment = deployments.find((d) => d.userId === currentUser.id) || null

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <button
          onClick={() => navigate("client-dashboard")}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Globe2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">VSS</span>
        </button>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                if (item.type === "deployment") {
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        isActive={currentPage === "client-deployment-detail"}
                        onClick={() => {
                          if (myDeployment) selectDeployment(myDeployment.id)
                        }}
                        tooltip={item.label}
                        disabled={!myDeployment}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                return (
                  <SidebarMenuItem key={item.page}>
                    <SidebarMenuButton
                      isActive={currentPage === item.page}
                      onClick={() => navigate(item.page)}
                      tooltip={item.label}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {currentUser.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
              </div>
            </div>
            <PlanBadge plan={currentUser.plan} />
          </div>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
