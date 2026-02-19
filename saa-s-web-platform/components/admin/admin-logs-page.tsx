"use client"

import { useState } from "react"
import { Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { accessLogs, deployments } from "@/lib/mock-data"

export function AdminLogsPage() {
  const [userFilter, setUserFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const userIds = Array.from(new Set(deployments.map((d) => d.userId))).sort((a, b) =>
    a.localeCompare(b),
  )

  const getUserIdForLog = (deploymentId: string) =>
    deployments.find((d) => d.id === deploymentId)?.userId || "-"

  const getBrowser = (ua: string) => {
    const head = ua.split("/")[0]?.trim()
    return head || ua
  }

  const filteredLogs = accessLogs.filter((log) => {
    const logUserId = getUserIdForLog(log.deploymentId)
    if (userFilter !== "all" && logUserId !== userFilter) return false
    if (dateFrom) {
      const logDate = new Date(log.timestamp)
      const fromDate = new Date(dateFrom)
      if (logDate < fromDate) return false
    }
    if (dateTo) {
      const logDate = new Date(log.timestamp)
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      if (logDate > toDate) return false
    }
    return true
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Logs</h1>
          <p className="text-sm text-muted-foreground">Entidad Logs</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base">Logs</CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Filter by user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {userIds.map((id) => (
                      <SelectItem key={id} value={id}>
                        {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-36"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-36"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>User_id</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No logs found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs
                  .slice()
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((log) => {
                    const userId = getUserIdForLog(log.deploymentId)
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.visitorIp}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{log.path}</TableCell>
                        <TableCell className="text-sm">{log.action}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{getBrowser(log.userAgent)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{userId}</TableCell>
                      </TableRow>
                    )
                  })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
