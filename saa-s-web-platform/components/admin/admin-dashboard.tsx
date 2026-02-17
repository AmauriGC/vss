"use client"

import {
  Users,
  Globe,
  HardDrive,
  Activity,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { TrafficChart } from "@/components/traffic-chart"
import { globalStats, trafficData, deployments, users } from "@/lib/mock-data"

const PLAN_COLORS = [
  "hsl(220 10% 46%)",
  "hsl(215 100% 50%)",
  "hsl(152 60% 42%)",
]

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
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={3}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {planData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PLAN_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deployment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="status"
                    tick={{ fill: "hsl(220 10% 46%)", fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(220 10% 46%)", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 100%)",
                      border: "1px solid hsl(220 13% 91%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(215 100% 50%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <TrafficChart data={trafficData} title="Global Traffic" />
    </div>
  )
}
