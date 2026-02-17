"use client"

import {
  ArrowLeft,
  ExternalLink,
  Upload,
  Download,
  GitBranch,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { TrafficChart } from "@/components/traffic-chart"
import { DeploymentStatusBadge } from "@/components/status-badge"
import { deployments, versions, trafficData, currentUser } from "@/lib/mock-data"
import { getEffectivePlan, getEffectiveDeploymentStatus, getPublicAccessTargetPage } from "@/lib/plan-logic"
import { useNavigation } from "@/lib/navigation"
import { useTodayIsoDate } from "@/lib/use-today-iso-date"
import { getPlanLimits } from "@/lib/plan-catalog"

export function DeploymentDetailPage() {
  const { selectedDeploymentId, navigate } = useNavigation()
  const todayIsoDate = useTodayIsoDate()
  const deployment = deployments.find((d) => d.id === selectedDeploymentId)

  if (!deployment) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Deployment not found</p>
        <Button variant="outline" onClick={() => navigate("client-dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const depVersions = versions.filter((v) => v.deploymentId === deployment.id)
  const effectivePlan = getEffectivePlan(currentUser, todayIsoDate)
  const maxDisk = getPlanLimits(effectivePlan).maxDisk
  const diskPercent = Math.round((deployment.diskUsage / maxDisk) * 100)
  const effectiveStatus = getEffectiveDeploymentStatus(deployment, currentUser, todayIsoDate)
  const publicTarget = getPublicAccessTargetPage(deployment, currentUser, todayIsoDate)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("client-dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{deployment.domain}</h1>
            <DeploymentStatusBadge status={effectiveStatus} />
          </div>
          <p className="text-sm text-muted-foreground">
            Version {deployment.currentVersion} &middot; Created {deployment.createdAt}
          </p>
        </div>
        <div className="flex gap-2">
          {publicTarget ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(publicTarget)}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Visit
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <a href={`https://${deployment.domain}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Visit
              </a>
            </Button>
          )}
          <Button size="sm">
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Upload New Version
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <DeploymentStatusBadge status={effectiveStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{deployment.diskUsage} MB</p>
            <Progress value={diskPercent} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Total Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{deployment.traffic.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">total visits</p>
          </CardContent>
        </Card>
      </div>

      <TrafficChart data={trafficData} title={`Traffic for ${deployment.domain}`} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Version History</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("client-versions")}
          >
            <GitBranch className="h-3.5 w-3.5 mr-1.5" />
            All Versions
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {depVersions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No versions found.</p>
            ) : (
              depVersions.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-mono font-medium">
                      v{v.versionNumber}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{v.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.fileSize} MB &middot; {v.uploadedAt}
                      </p>
                    </div>
                  </div>
                  {v.versionNumber === deployment.currentVersion && (
                    <span className="text-xs font-medium text-success">Current</span>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Download Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download access logs (.txt)
            </Button>

            <Separator className="hidden sm:block h-6" orientation="vertical" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("public-suspended")}
            >
              Preview suspended page
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("public-plan-expired")}
            >
              Preview expired plan message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
