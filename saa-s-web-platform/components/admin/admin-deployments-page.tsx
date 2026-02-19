"use client"

import { useState } from "react"
import { Search, Pause, Trash2, Pencil, Eye } from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeploymentStatusBadge } from "@/components/status-badge"
import { accessLogs, deployments, users, versions } from "@/lib/mock-data"
import { useNavigation } from "@/lib/navigation"

type ModalType = "change-domain" | "suspend" | "delete" | null

export function AdminDeploymentsPage() {
  const { selectAdminDeployment } = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [modal, setModal] = useState<ModalType>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newDomain, setNewDomain] = useState("")
  const [domainConfirm, setDomainConfirm] = useState("")
  const [suspendReason, setSuspendReason] = useState("")
  const [deleteReason, setDeleteReason] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState("")

  const filtered = deployments.filter(
    (d) =>
      d.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      users
        .find((u) => u.id === d.userId)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase())
  )

  const selected = deployments.find((d) => d.id === selectedId)

  const openModal = (type: ModalType, id: string) => {
    setModal(type)
    setSelectedId(id)
    if (type === "change-domain" && selected) {
      setNewDomain("")
    }
  }

  const closeModal = () => {
    setModal(null)
    setSelectedId(null)
    setNewDomain("")
    setDomainConfirm("")
    setSuspendReason("")
    setDeleteReason("")
    setDeleteConfirm("")
  }

  const takenDomains = new Set(
    deployments
      .filter((d) => d.id !== selectedId)
      .map((d) => d.domain.toLowerCase()),
  )
  const domainInput = newDomain ? `${newDomain}.vss.io` : ""
  const isDomainTaken = domainInput ? takenDomains.has(domainInput.toLowerCase()) : false
  const domainOverrideReady = !!newDomain && !isDomainTaken && domainConfirm.trim().toLowerCase() === domainInput.toLowerCase()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Deployments</h1>
        <p className="text-sm text-muted-foreground">Entidad Deployment</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Deployments</CardTitle>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por dominio o usuario"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario_id</TableHead>
                <TableHead>Dominio</TableHead>
                <TableHead>Url</TableHead>
                <TableHead className="text-right">Disk_used (MB)</TableHead>
                <TableHead className="text-right">Traffic_Visit</TableHead>
                <TableHead className="text-right">Versions</TableHead>
                <TableHead>Logs_id</TableHead>
                <TableHead>.zip</TableHead>
                <TableHead>status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => {
                const depVersions = versions.filter((v) => v.deploymentId === d.id)
                const currentZip = depVersions.find((v) => v.versionNumber === d.currentVersion)?.fileName || "—"

                const latestLog = accessLogs
                  .filter((l) => l.deploymentId === d.id)
                  .slice()
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

                const url = `https://${d.domain}`

                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{d.userId}</TableCell>
                    <TableCell className="font-mono text-sm">{d.domain}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <a className="hover:underline" href={url} target="_blank" rel="noreferrer">
                        {url}
                      </a>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{d.diskUsage}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{d.traffic.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      v{d.currentVersion} / {depVersions.length}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{latestLog?.id || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{currentZip}</TableCell>
                    <TableCell>
                      <DeploymentStatusBadge status={d.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => selectAdminDeployment(d.id)}
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openModal("change-domain", d.id)}
                          title="Cambiar dominio"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-warning hover:text-warning"
                          onClick={() => openModal("suspend", d.id)}
                          title="Suspender"
                        >
                          <Pause className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openModal("delete", d.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Change Domain Modal */}
      <Dialog open={modal === "change-domain"} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Domain</DialogTitle>
            <DialogDescription>
              Change the domain for <span className="font-mono">{selected?.domain}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>New Domain</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newDomain}
                  onChange={(e) =>
                    setNewDomain(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                    )
                  }
                  placeholder="new-domain"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  .vss.io
                </span>
              </div>
              {newDomain && isDomainTaken && (
                <p className="text-sm text-destructive font-medium">
                  This domain is already taken by another deployment.
                </p>
              )}
              {newDomain && !isDomainTaken && (
                <p className="text-sm text-success">{newDomain}.vss.io is available.</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Confirmation (type the full domain to confirm)</Label>
              <Input
                value={domainConfirm}
                onChange={(e) => setDomainConfirm(e.target.value)}
                placeholder={domainInput || "new-domain.vss.io"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={closeModal} disabled={!domainOverrideReady}>
              Update Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Modal */}
      <Dialog open={modal === "suspend"} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Deployment</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend{" "}
              <span className="font-mono">{selected?.domain}</span>? The site
              will become inaccessible until reactivated.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label>Reason (required, sent via email)</Label>
            <Input
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Explain why this deployment is being suspended..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              className="bg-warning text-warning-foreground hover:bg-warning/90"
              onClick={closeModal}
              disabled={!suspendReason}
            >
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={modal === "delete"} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deployment</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-mono">{selected?.domain}</span>? All files
              and version history will be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Reason (required, sent via email)</Label>
              <Input
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Explain why this deployment is being deleted..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Confirmation (type the domain to confirm)</Label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={selected?.domain || "domain"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={closeModal}
              disabled={!deleteReason || deleteConfirm !== (selected?.domain || "")}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
