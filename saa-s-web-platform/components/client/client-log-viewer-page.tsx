"use client"

import { useMemo, useState } from "react"
import { Download, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { accessLogs, currentUser, deployments } from "@/lib/mock-data"

export function ClientLogViewerPage() {
  const userDeployments = useMemo(
    () => deployments.filter((d) => d.userId === currentUser.id),
    [],
  )

  const [ipFilter, setIpFilter] = useState("")
  const [pathFilter, setPathFilter] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const actionOptions = useMemo(() => {
    const logsForUser = accessLogs.filter((l) => userDeployments.some((d) => d.id === l.deploymentId))
    return Array.from(new Set(logsForUser.map((l) => l.action))).sort((a, b) => a.localeCompare(b))
  }, [userDeployments])

  const filteredLogs = useMemo(() => {
    const logsForUser = accessLogs.filter((l) => userDeployments.some((d) => d.id === l.deploymentId))

    return logsForUser
      .filter((l) => {
        if (actionFilter !== "all" && l.action !== actionFilter) return false
        if (ipFilter && !l.visitorIp.toLowerCase().includes(ipFilter.toLowerCase().trim())) return false
        if (pathFilter && !l.path.toLowerCase().includes(pathFilter.toLowerCase().trim())) return false

        if (dateFrom) {
          const logDate = new Date(l.timestamp)
          const fromDate = new Date(dateFrom)
          if (logDate < fromDate) return false
        }

        if (dateTo) {
          const logDate = new Date(l.timestamp)
          const toDate = new Date(dateTo)
          toDate.setHours(23, 59, 59, 999)
          if (logDate > toDate) return false
        }

        return true
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [actionFilter, dateFrom, dateTo, ipFilter, pathFilter, userDeployments])

  const getBrowser = (ua: string) => {
    const head = ua.split("/")[0]?.trim()
    return head || ua
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Logs</h1>
          <p className="text-sm text-muted-foreground">Entidad Logs</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base">Filters</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="h-4 w-4" />
              {filteredLogs.length} results
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="flex flex-col gap-2">
              <Label>IP contains</Label>
              <Input value={ipFilter} onChange={(e) => setIpFilter(e.target.value)} placeholder="e.g. 192.168" />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Path contains</Label>
              <Input value={pathFilter} onChange={(e) => setPathFilter(e.target.value)} placeholder="e.g. /pricing" />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {actionOptions.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logs</CardTitle>
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No logs found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.visitorIp}</TableCell>
                    <TableCell className="font-mono text-xs">{log.path}</TableCell>
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
                    <TableCell className="font-mono text-xs text-muted-foreground">{currentUser.id}</TableCell>
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
