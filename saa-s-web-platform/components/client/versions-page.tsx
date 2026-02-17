"use client"

import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { deployments, versions, currentUser } from "@/lib/mock-data"

export function VersionsPage() {
  const [selectedDeployment, setSelectedDeployment] = useState(
    deployments.filter((d) => d.userId === currentUser.id)[0]?.id || ""
  )
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null)
  const [restored, setRestored] = useState(false)

  const userDeployments = deployments.filter((d) => d.userId === currentUser.id)
  const deployment = deployments.find((d) => d.id === selectedDeployment)
  const depVersions = versions
    .filter((v) => v.deploymentId === selectedDeployment)
    .sort((a, b) => b.versionNumber - a.versionNumber)

  const handleRestore = () => {
    setRestored(true)
    setTimeout(() => {
      setRestoreTarget(null)
      setRestored(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Version History</h1>
        <p className="text-sm text-muted-foreground">
          Manage and restore previous versions of your deployments
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Deployment:</label>
        <Select value={selectedDeployment} onValueChange={setSelectedDeployment}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {userDeployments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {deployment?.domain || "Select a deployment"}
          </CardTitle>
          <CardDescription>
            {depVersions.length} version{depVersions.length !== 1 ? "s" : ""} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {depVersions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No versions found for this deployment.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depVersions.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <span className="font-mono text-sm font-medium">v{v.versionNumber}</span>
                      {deployment && v.versionNumber === deployment.currentVersion && (
                        <span className="ml-2 text-xs text-success font-medium">Current</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{v.fileName}</TableCell>
                    <TableCell className="text-muted-foreground">{v.fileSize} MB</TableCell>
                    <TableCell className="text-muted-foreground">{v.uploadedAt}</TableCell>
                    <TableCell className="text-right">
                      {deployment && v.versionNumber !== deployment.currentVersion && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRestoreTarget(v.id)}
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                          Restore
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!restoreTarget} onOpenChange={() => setRestoreTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this version? The current deployment will be
              replaced with the selected version.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleRestore} disabled={restored}>
              {restored ? "Restored!" : "Confirm Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
