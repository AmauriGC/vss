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
import type { AccessLog } from "@/lib/types"

type ActionFilter = "__all__" | string

export function AccessLogTable({
  logs,
  title = "Access Logs",
}: {
  logs: AccessLog[]
  title?: string
}) {
  const [ipQuery, setIpQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [action, setAction] = useState<ActionFilter>("__all__")

  const actionOptions = useMemo(() => {
    const actions = Array.from(new Set(logs.map((l) => l.action))).sort((a, b) => a.localeCompare(b))
    return actions
  }, [logs])

  const filtered = useMemo(() => {
    const ipNeedle = ipQuery.trim()

    return logs.filter((log) => {
      if (ipNeedle && !log.visitorIp.includes(ipNeedle)) return false
      if (action !== "__all__" && log.action !== action) return false

      const date = log.timestamp.slice(0, 10) // YYYY-MM-DD
      if (startDate && date < startDate) return false
      if (endDate && date > endDate) return false

      return true
    })
  }, [logs, ipQuery, action, startDate, endDate])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <span className="text-xs text-muted-foreground">({filtered.length})</span>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Filters</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="log-ip">IP</Label>
              <Input
                id="log-ip"
                value={ipQuery}
                onChange={(e) => setIpQuery(e.target.value)}
                placeholder="203.0.113.42"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Action</Label>
              <Select value={action} onValueChange={(v) => setAction(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All actions</SelectItem>
                  {actionOptions.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="log-start">Start date</Label>
              <Input
                id="log-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="log-end">End date</Label>
              <Input
                id="log-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Browser</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No access logs.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((log) => (
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
  )
}
