"use client"

import {
  Users,
  Globe,
  HardDrive,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatCard } from "@/components/stat-card"
import { globalStats, trafficData, deployments, users } from "@/lib/mock-data"

const planData = [
  { name: "Basic", value: globalStats.planDistribution.Basic },
  { name: "Medium", value: globalStats.planDistribution.Medium },
  { name: "Full", value: globalStats.planDistribution.Full },
]

const statusData = [
  { status: "Active", count: deployments.filter((d) => d.status === "Active").length },
  { status: "Updating", count: deployments.filter((d) => d.status === "Updating").length },
  { status: "Error", count: deployments.filter((d) => d.status === "Error").length },
]

export function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-balance">Admin Overview</h1>
        <p className="text-muted-foreground text-sm">
          Platform-wide statistics and monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={globalStats.totalUsers}
          description={`${users.filter((u) => u.role === "client").length} clients`}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Total Deployments"
          value={globalStats.totalDeployments}
          description={`${deployments.filter((d) => d.status === "Active").length} active`}
          icon={<Globe className="h-4 w-4" />}
        />
        <StatCard
          title="Storage Used"
          value={`${globalStats.totalStorageUsed} MB`}
          description="Across all deployments"
          icon={<HardDrive className="h-4 w-4" />}
        />
        <StatCard
          title="Total Traffic"
          value={globalStats.totalTraffic.toLocaleString()}
          description="Total visits"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planData.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deployment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusData.map((s) => (
                  <TableRow key={s.status}>
                    <TableCell className="font-medium">{s.status}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{s.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
