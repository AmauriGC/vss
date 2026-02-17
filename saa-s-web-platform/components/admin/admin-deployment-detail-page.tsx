"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Download,
  Pause,
  Trash2,
  Send,
  Pencil,
  ExternalLink,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatCard } from "@/components/stat-card"
import { DeploymentStatusBadge } from "@/components/status-badge"
import { TrafficChart } from "@/components/traffic-chart"
import { AccessLogTable } from "@/components/admin/access-log-table"
import { deployments, users, versions, accessLogs, deploymentTrafficData, trafficData } from "@/lib/mock-data"
import { useNavigation } from "@/lib/navigation"

type Modal = "suspend" | "delete" | "change-domain" | "reactivate" | null

export function AdminDeploymentDetailPage() {
  const { selectedDeploymentId, navigate } = useNavigation()
  const deployment = deployments.find((d) => d.id === selectedDeploymentId)

  const [modal, setModal] = useState<Modal>(null)
  const [deleteReason, setDeleteReason] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [suspendReason, setSuspendReason] = useState("")
  const [newDomain, setNewDomain] = useState("")
  const [overrideConfirm, setOverrideConfirm] = useState("")
  const [actionDone, setActionDone] = useState(false)

  if (!deployment) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Deployment not found</p>
        <Button variant="outline" onClick={() => navigate("admin-deployments")}>
          Back to Deployments
        </Button>
      </div>
    )
  }

  const owner = users.find((u) => u.id === deployment.userId)
  const depVersions = versions.filter((v) => v.deploymentId === deployment.id)
    .sort((a, b) => b.versionNumber - a.versionNumber)
  const depAccessLogs = accessLogs.filter((l) => l.deploymentId === deployment.id)
  const chartData = deploymentTrafficData[deployment.id] || trafficData
  const isSuspended = deployment.status === "Suspended" || deployment.status === "PlanExpired" || deployment.status === "LimitExceeded"

  const handleAction = () => {
    setActionDone(true)
    setTimeout(() => {
      setModal(null)
      setActionDone(false)
      setDeleteReason("")
      setDeleteConfirm("")
      setSuspendReason("")
      setNewDomain("")
      setOverrideConfirm("")
    }, 1500)
  }

  // Check domain uniqueness
  const takenDomains = deployments.filter((d) => d.id !== deployment.id).map((d) => d.domain)
  const domainInput = newDomain ? `${newDomain}.vss.io` : ""
  const isDomainTaken = domainInput ? takenDomains.includes(domainInput) : false
  const overrideReady = !!newDomain && !isDomainTaken && overrideConfirm.trim().toLowerCase() === domainInput.toLowerCase()

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("admin-deployments")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono">{deployment.domain}</h1>
            <DeploymentStatusBadge status={deployment.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Owner: {owner?.name || "Unknown"} ({owner?.email}) | Created {deployment.createdAt}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={`https://${deployment.domain}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Visit
          </a>
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setModal("change-domain")}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Change Domain
        </Button>
        <Button size="sm" variant="outline">
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Download ZIP
        </Button>
        {isSuspended ? (
          <Button
            size="sm"
            variant="outline"
            className="text-success hover:text-success"
            onClick={() => setModal("reactivate")}
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Reactivate
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="text-warning hover:text-warning"
            onClick={() => setModal("suspend")}
          >
            <Pause className="h-3.5 w-3.5 mr-1.5" />
            Suspend
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => setModal("delete")}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Delete
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Status" value={deployment.status} icon={<div />} />
        <StatCard title="Version" value={`v${deployment.currentVersion}`} description={`${depVersions.length} total versions`} icon={<div />} />
        <StatCard title="Disk Usage" value={`${deployment.diskUsage} MB`} icon={<div />} />
        <StatCard title="Total Traffic" value={deployment.traffic.toLocaleString()} description="All-time visits" icon={<div />} />
      </div>

      {/* Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Storage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Deployment disk usage</span>
            <span>{deployment.diskUsage} MB</span>
          </div>
          <Progress value={owner ? Math.round((deployment.diskUsage / owner.maxDisk) * 100) : 0} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {owner ? `${Math.round((deployment.diskUsage / owner.maxDisk) * 100)}% of user's total ${owner.maxDisk} MB allocation` : ""}
          </p>
        </CardContent>
      </Card>

      {/* Traffic Chart */}
      <TrafficChart data={chartData} title={`Traffic for ${deployment.domain}`} />

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Version History ({depVersions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {depVersions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No versions.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depVersions.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <span className="font-mono text-sm font-medium">v{v.versionNumber}</span>
                      {v.versionNumber === deployment.currentVersion && (
                        <span className="ml-2 text-xs text-success font-medium">Current</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{v.fileName}</TableCell>
                    <TableCell className="text-muted-foreground">{v.fileSize} MB</TableCell>
                    <TableCell className="text-muted-foreground">{v.uploadedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AccessLogTable logs={depAccessLogs} title="Access Logs" />

      {/* Suspend Modal with email reason */}
      <Dialog open={modal === "suspend"} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Deployment</DialogTitle>
            <DialogDescription>
              Suspending <span className="font-mono">{deployment.domain}</span> will make it
              inaccessible to the public. An email notification will be sent to the owner.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Reason for Suspension (sent via email)</Label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Explain why this deployment is being suspended..."
                rows={3}
              />
            </div>
            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <p>
                <Send className="inline h-3 w-3 mr-1" />
                An email will be sent to <strong>{owner?.email}</strong> with the reason above.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button
              className="bg-warning text-warning-foreground hover:bg-warning/90"
              onClick={handleAction}
              disabled={!suspendReason || actionDone}
            >
              {actionDone ? "Suspended!" : "Suspend & Notify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Modal */}
      <Dialog open={modal === "reactivate"} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate Deployment</DialogTitle>
            <DialogDescription>
              This will reactivate <span className="font-mono">{deployment.domain}</span> and make it publicly accessible again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleAction} disabled={actionDone}>
              {actionDone ? "Reactivated!" : "Confirm Reactivation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal with email reason */}
      <Dialog open={modal === "delete"} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deployment</DialogTitle>
            <DialogDescription>
              Permanently delete <span className="font-mono">{deployment.domain}</span>.
              All files and version history will be removed. An email notification with the
              reason will be sent to the owner.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Reason for Deletion (required, sent via email)</Label>
              <Textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Explain why this deployment is being deleted..."
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Confirmation (type the domain to confirm)</Label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={deployment.domain}
              />
              <p className="text-xs text-muted-foreground">
                This prevents accidental deletion.
              </p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              <p>This action cannot be undone. The owner ({owner?.email}) will receive an email with the deletion reason.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleAction}
              disabled={!deleteReason || deleteConfirm !== deployment.domain || actionDone}
            >
              {actionDone ? "Deleted!" : "Delete & Notify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Domain Modal with uniqueness validation */}
      <Dialog open={modal === "change-domain"} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Domain</DialogTitle>
            <DialogDescription>
              Change the domain for <span className="font-mono">{deployment.domain}</span>.
              Admin overrides bypass the request flow.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>New Domain</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="new-domain"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.vss.io</span>
              </div>
              {newDomain && isDomainTaken && (
                <p className="text-sm text-destructive font-medium">
                  This domain is already taken by another deployment.
                </p>
              )}
              {newDomain && !isDomainTaken && (
                <p className="text-sm text-success">
                  {newDomain}.vss.io is available.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Confirmation (type the full domain to confirm)</Label>
              <Input
                value={overrideConfirm}
                onChange={(e) => setOverrideConfirm(e.target.value)}
                placeholder={domainInput || "new-domain.vss.io"}
              />
              <p className="text-xs text-muted-foreground">
                Required to prevent accidental overrides.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={handleAction} disabled={!overrideReady || actionDone}>
              {actionDone ? "Domain Changed!" : "Confirm Override"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
