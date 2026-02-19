"use client"

import { useState } from "react"
import { Eye, Clock, Globe, MousePointer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatCard } from "@/components/stat-card"
import { currentUser, deployments, accessLogs, deploymentTrafficData, trafficData } from "@/lib/mock-data"
import { useNavigation } from "@/lib/navigation"

export function ClientTrafficPage() {
  const { navigate } = useNavigation()
  const userDeployments = deployments.filter((d) => d.userId === currentUser.id)
  const [selectedDeployment, setSelectedDeployment] = useState<string>("all")

  const filteredLogs =
    selectedDeployment === "all"
      ? accessLogs.filter((l) => userDeployments.some((d) => d.id === l.deploymentId))
      : accessLogs.filter((l) => l.deploymentId === selectedDeployment)

  const chartData =
    selectedDeployment === "all"
      ? trafficData
      : deploymentTrafficData[selectedDeployment] || trafficData

  const totalVisits = userDeployments.reduce((acc, d) => acc + d.traffic, 0)
  const uniqueIps = new Set(filteredLogs.map((l) => l.visitorIp)).size
  const topPages = filteredLogs.reduce<Record<string, number>>((acc, l) => {
    acc[l.path] = (acc[l.path] || 0) + 1
    return acc
  }, {})
  const sortedPages = Object.entries(topPages).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Traffic Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Monitor visitor traffic across your deployments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("client-log-viewer")}>
            View detailed logs
          </Button>
          <Select value={selectedDeployment} onValueChange={setSelectedDeployment}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All deployments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deployments</SelectItem>
              {userDeployments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Visits"
          value={totalVisits.toLocaleString()}
          description="All time"
          icon={<Eye className="h-4 w-4" />}
        />
        <StatCard
          title="Unique Visitors"
          value={uniqueIps}
          description="By IP address (recent)"
          icon={<Globe className="h-4 w-4" />}
        />
        <StatCard
          title="Page Views (Recent)"
          value={filteredLogs.length}
          description="From access logs"
          icon={<MousePointer className="h-4 w-4" />}
        />
        <StatCard
          title="Top Page"
          value={sortedPages[0]?.[0] || "-"}
          description={sortedPages[0] ? `${sortedPages[0][1]} views` : "No data"}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selectedDeployment === "all"
              ? "Overall Traffic"
              : `Traffic for ${userDeployments.find((d) => d.id === selectedDeployment)?.domain}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Visits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                    No traffic data.
                  </TableCell>
                </TableRow>
              ) : (
                chartData.map((t) => (
                  <TableRow key={t.date}>
                    <TableCell className="text-muted-foreground">{t.date}</TableCell>
                    <TableCell className="text-right font-medium">{t.visits.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedPages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No page data available.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {sortedPages.map(([path, count]) => (
                  <div key={path} className="flex items-center justify-between">
                    <span className="font-mono text-sm">{path}</span>
                    <span className="text-sm text-muted-foreground">{count} views</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visitor Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const countries = filteredLogs.reduce<Record<string, number>>((acc, l) => {
                acc[l.country] = (acc[l.country] || 0) + 1
                return acc
              }, {})
              const sorted = Object.entries(countries).sort((a, b) => b[1] - a[1])
              return sorted.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No data available.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {sorted.map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{country}</span>
                      <span className="text-sm text-muted-foreground">{count} visits</span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Access Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No access logs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.visitorIp}</TableCell>
                    <TableCell className="font-mono text-xs">{log.path}</TableCell>
                    <TableCell className="text-sm">{log.action}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.userAgent}</TableCell>
                    <TableCell className="text-sm">{log.country}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
