"use client"

import {
  LayoutDashboard,
  Users,
  Globe,
  FileText,
  CreditCard,
  LogOut,
  Globe2,
  Shield,
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
import { Badge } from "@/components/ui/badge"
import { useNavigation, type Page } from "@/lib/navigation"
import { adminUser } from "@/lib/mock-data"

const navItems: { label: string; icon: typeof LayoutDashboard; page: Page }[] = [
  { label: "Overview", icon: LayoutDashboard, page: "admin-dashboard" },
  { label: "Planes", icon: CreditCard, page: "admin-plans" },
  { label: "Users", icon: Users, page: "admin-users" },
  { label: "Deployments", icon: Globe, page: "admin-deployments" },
  { label: "Logs", icon: FileText, page: "admin-logs" },
]

export function AdminSidebar() {
  const { currentPage, navigate, logout } = useNavigation()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <button
          onClick={() => navigate("admin-dashboard")}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Globe2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">VSS</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            Admin
          </Badge>
        </button>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
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
              ))}
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
                <Shield className="h-3.5 w-3.5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{adminUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{adminUser.email}</p>
            </div>
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
