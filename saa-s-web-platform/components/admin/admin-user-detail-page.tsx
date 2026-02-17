"use client"

import { useState } from "react"
import {
  ArrowLeft,
  HardDrive,
  Globe,
  Activity,
  CalendarClock,
  Download,
  CreditCard,
  Send,
  Pause,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatCard } from "@/components/stat-card"
import { PlanBadge, PlanStatusBadge, DeploymentStatusBadge } from "@/components/status-badge"
import { TrafficChart } from "@/components/traffic-chart"
import { AccessLogTable } from "@/components/admin/access-log-table"
import { users, deployments, accessLogs, activityLogs, trafficData } from "@/lib/mock-data"
import { type Plan } from "@/lib/types"
import { getEffectiveDeploymentStatus, getEffectivePlan } from "@/lib/plan-logic"
import { useNavigation } from "@/lib/navigation"
import { useTodayIsoDate } from "@/lib/use-today-iso-date"
import { getPlanLimits } from "@/lib/plan-catalog"

type Modal = "change-plan" | "renew" | "suspend-user" | "email" | null

export function AdminUserDetailPage() {
  const { selectedUserId, navigate, selectAdminDeployment } = useNavigation()
  const todayIsoDate = useTodayIsoDate()
  const user = users.find((u) => u.id === selectedUserId)

  const [modal, setModal] = useState<Modal>(null)
  const [newPlan, setNewPlan] = useState<Plan>("Basic")
  const [renewDate, setRenewDate] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [suspendReason, setSuspendReason] = useState("")
  const [actionDone, setActionDone] = useState(false)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">User not found</p>
        <Button variant="outline" onClick={() => navigate("admin-users")}>
          Back to Users
        </Button>
      </div>
    )
  }

  const userDeployments = deployments.filter((d) => d.userId === user.id)
  const userLogs = activityLogs.filter((l) => l.userId === user.id)
  const userAccessLogs = accessLogs.filter((l) =>
    userDeployments.some((d) => d.id === l.deploymentId)
  )
  const totalTraffic = userDeployments.reduce((acc, d) => acc + d.traffic, 0)
  const effectivePlan = getEffectivePlan(user, todayIsoDate)
  const limits = getPlanLimits(effectivePlan)
  const diskPercent = limits.maxDisk > 0 ? Math.round((user.diskUsage / limits.maxDisk) * 100) : 0


  const handleAction = () => {
    setActionDone(true)
    setTimeout(() => {
      setModal(null)
      setActionDone(false)
      setNewPlan("Basic")
      setRenewDate("")
      setEmailSubject("")
      setEmailBody("")
      setSuspendReason("")
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("admin-users")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PlanBadge plan={effectivePlan} />
          <PlanStatusBadge status={user.planStatus} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => { setNewPlan(user.plan); setModal("change-plan") }}>
          <CreditCard className="h-3.5 w-3.5 mr-1.5" />
          Change Plan
        </Button>
        <Button size="sm" variant="outline" onClick={() => setModal("renew")}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Renew Plan
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-warning hover:text-warning"
          onClick={() => setModal("suspend-user")}
        >
          <Pause className="h-3.5 w-3.5 mr-1.5" />
          Suspend All
        </Button>
        <Button size="sm" variant="outline" onClick={() => setModal("email")}>
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Send Email
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Plan"
          value={`${effectivePlan} (${user.planStatus})`}
          description={user.planExpiresAt
            ? user.planStatus === "Expired"
              ? `Expired on ${user.planExpiresAt}`
              : `Expires on ${user.planExpiresAt}`
            : "No expiration"}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Disk Usage"
          value={`${user.diskUsage} / ${limits.maxDisk} MB`}
          description={`${diskPercent}% used`}
          icon={<HardDrive className="h-4 w-4" />}
        />
        <StatCard
          title="Deployments"
          value={userDeployments.length}
          description={`${userDeployments.filter((d) => d.status === "Active").length} active`}
          icon={<Globe className="h-4 w-4" />}
        />
        <StatCard
          title="Total Traffic"
          value={totalTraffic.toLocaleString()}
          description="All-time visits"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      {/* Plan Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Plan Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
            <div>
              <p className="text-muted-foreground">Plan</p>
              <p className="font-medium">{effectivePlan}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <PlanStatusBadge status={user.planStatus} />
            </div>
            <div>
              <p className="text-muted-foreground">Expires</p>
              <p className="font-medium">{user.planExpiresAt || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly Price</p>
              <p className="font-medium">{limits.price > 0 ? `$${limits.price}` : "Free"}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Storage usage</span>
              <span>{user.diskUsage} / {limits.maxDisk} MB</span>
            </div>
            <Progress value={diskPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* User Deployments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Deployments ({userDeployments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {userDeployments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No deployments.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Disk</TableHead>
                  <TableHead>Traffic</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userDeployments.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-sm">{d.domain}</TableCell>
                    <TableCell>
                      <DeploymentStatusBadge status={getEffectiveDeploymentStatus(d, user, todayIsoDate)} />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">v{d.currentVersion}</TableCell>
                    <TableCell className="text-muted-foreground">{d.diskUsage} MB</TableCell>
                    <TableCell className="text-muted-foreground">{d.traffic.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{d.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="View monitoring"
                          onClick={() => selectAdminDeployment(d.id)}
                        >
                          <Globe className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-warning hover:text-warning"
                          title="Suspend (open deployment)"
                          onClick={() => selectAdminDeployment(d.id)}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          title="Delete (open deployment)"
                          onClick={() => selectAdminDeployment(d.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Traffic */}
      <TrafficChart data={trafficData} title={`Traffic for ${user.name}`} />

      {/* Access Logs */}
      <AccessLogTable logs={userAccessLogs} title="Access Logs" />

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {userLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activity.</p>
            ) : (
              userLogs.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{a.action}</span>{" "}
                      <span className="text-muted-foreground">{a.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.timestamp).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                      {a.ip && ` | IP: ${a.ip}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change Plan Modal */}
      <Dialog open={modal === "change-plan"} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan for {user.name}</DialogTitle>
            <DialogDescription>
              Assign a new plan to this user. The change takes effect immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-muted/60 p-3 text-sm">
              <p>Current: <strong>{user.plan}</strong> ({user.planStatus})</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>New Plan</Label>
              <Select value={newPlan} onValueChange={(v) => setNewPlan(v as Plan)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic - Free (50MB, 5MB upload)</SelectItem>
                  <SelectItem value="Medium">Medium - $19/mo (200MB, 10MB upload)</SelectItem>
                  <SelectItem value="Full">Full - $49/mo (500MB, 20MB upload)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleAction} disabled={actionDone}>
              {actionDone ? "Plan Changed!" : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Plan Modal */}
      <Dialog open={modal === "renew"} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Plan for {user.name}</DialogTitle>
            <DialogDescription>
              Set a new expiration date for this user&apos;s plan. Payment should be confirmed before renewal.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-muted/60 p-3 text-sm">
              <p>Current: <strong>{user.plan}</strong> | Expires: <strong>{user.planExpiresAt || "N/A"}</strong></p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>New Expiration Date</Label>
              <Input
                type="date"
                value={renewDate}
                onChange={(e) => setRenewDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleAction} disabled={!renewDate || actionDone}>
              {actionDone ? "Plan Renewed!" : "Renew Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend All Modal */}
      <Dialog open={modal === "suspend-user"} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend All Deployments</DialogTitle>
            <DialogDescription>
              This will suspend all deployments for {user.name}. Their sites will become
              inaccessible to the public. An email notification will be sent.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label>Reason (required, sent via email)</Label>
            <Textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Explain why all deployments are being suspended..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Email will be sent to <strong>{user.email}</strong>.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button
              className="bg-warning text-warning-foreground hover:bg-warning/90"
              onClick={handleAction}
              disabled={!suspendReason || actionDone}
            >
              {actionDone ? "Suspended!" : "Suspend All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      <Dialog open={modal === "email"} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email to {user.name}</DialogTitle>
            <DialogDescription>
              Send a notification email to {user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Subject</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Message</Label>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your message..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleAction} disabled={!emailSubject || !emailBody || actionDone}>
              {actionDone ? "Email Sent!" : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
