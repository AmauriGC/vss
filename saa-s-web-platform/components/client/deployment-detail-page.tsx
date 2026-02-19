"use client";

import { ArrowLeft, ExternalLink, Upload, GitBranch } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeploymentStatusBadge, DomainStatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accessLogs, createDomainRequest, deployments, domainRequests, currentUser, uploadNewVersionForDeployment, versions } from "@/lib/mock-data";
import { getEffectivePlan, getEffectiveDeploymentStatus, getPublicAccessTargetPage } from "@/lib/plan-logic";
import { useNavigation } from "@/lib/navigation";
import { useTodayIsoDate } from "@/lib/use-today-iso-date";
import { getPlanLimits } from "@/lib/plan-catalog";
import { validateStaticSiteZip } from "@/lib/static-site-zip";

function browserFromUserAgent(ua: string) {
  const trimmed = ua.trim();
  if (!trimmed) return "";
  const firstToken = trimmed.split(" ")[0] || trimmed;
  return firstToken.split("/")[0] || firstToken;
}

export function DeploymentDetailPage() {
  const { selectedDeploymentId, navigate } = useNavigation();
  const todayIsoDate = useTodayIsoDate();
  const deployment = deployments.find((d) => d.id === selectedDeploymentId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [domainSub, setDomainSub] = useState("");
  const [domainSubmitting, setDomainSubmitting] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [domainSuccess, setDomainSuccess] = useState<string | null>(null);
  const [, bumpDomainVersion] = useState(0);

  if (!deployment) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Deployment not found</p>
        <Button variant="outline" onClick={() => navigate("client-dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const depVersions = versions.filter((v) => v.deploymentId === deployment.id);
  const effectivePlan = getEffectivePlan(currentUser, todayIsoDate);
  const maxUpload = getPlanLimits(effectivePlan).maxUpload;
  const maxDisk = getPlanLimits(effectivePlan).maxDisk;
  const diskPercent = Math.round((deployment.diskUsage / maxDisk) * 100);
  const effectiveStatus = getEffectiveDeploymentStatus(deployment, currentUser, todayIsoDate);
  const publicTarget = getPublicAccessTargetPage(deployment, currentUser, todayIsoDate);

  const projectLogs = accessLogs
    .filter((l) => l.deploymentId === deployment.id)
    .slice()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const projectDomainRequests = domainRequests
    .filter((r) => r.deploymentId === deployment.id)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
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
            <Button variant="outline" size="sm" onClick={() => navigate(publicTarget)}>
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.currentTarget.value = "";
              if (!file) return;

              setUploadError(null);
              setUploadSuccess(null);

              const sizeMb = +(file.size / (1024 * 1024)).toFixed(2);
              if (sizeMb > maxUpload) {
                setUploadError(`El ZIP excede el límite de ${maxUpload}MB.`);
                return;
              }

              setUploading(true);
              try {
                await validateStaticSiteZip(file);

                const created = uploadNewVersionForDeployment({
                  deploymentId: deployment.id,
                  zipFileName: file.name,
                  zipFileSizeMb: sizeMb,
                });

                if (!created) {
                  setUploadError("No se pudo subir la nueva versión.");
                  return;
                }

                setUploadSuccess(`Versión v${created.versionNumber} subida.`);
              } catch (err) {
                const msg = err instanceof Error ? err.message : "ZIP inválido";
                setUploadError(msg);
              } finally {
                setUploading(false);
              }
            }}
          />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            {uploading ? "Uploading..." : "Upload New Version"}
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {uploadError}
        </div>
      )}
      {uploadSuccess && <div className="rounded-lg border bg-muted p-3 text-sm">{uploadSuccess}</div>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dominio</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="text-sm">
            Dominio actual: <span className="font-mono">{deployment.domain}</span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-domain">Solicitar cambio de dominio</Label>
            <div className="flex items-center gap-2">
              <Input
                id="new-domain"
                placeholder="nuevo-dominio"
                value={domainSub}
                onChange={(e) =>
                  setDomainSub(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">.vss.io</span>
              <Button
                onClick={() => {
                  if (!deployment) return;
                  setDomainError(null);
                  setDomainSuccess(null);
                  setDomainSubmitting(true);
                  try {
                    const req = createDomainRequest({
                      deploymentId: deployment.id,
                      requestedSubdomain: domainSub,
                    });
                    setDomainSuccess(`Solicitud enviada: ${req.requestedDomain}`);
                    setDomainSub("");
                    bumpDomainVersion((v) => v + 1);
                  } catch (err) {
                    const msg = err instanceof Error ? err.message : "No se pudo enviar la solicitud";
                    setDomainError(msg);
                  } finally {
                    setDomainSubmitting(false);
                  }
                }}
                disabled={domainSubmitting || !domainSub}
              >
                {domainSubmitting ? "Enviando..." : "Solicitar"}
              </Button>
            </div>
            {domainError && (
              <div className="text-xs text-destructive">{domainError}</div>
            )}
            {domainSuccess && (
              <div className="text-xs text-muted-foreground">{domainSuccess}</div>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Current Domain</TableHead>
                  <TableHead>Requested Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectDomainRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No hay solicitudes de dominio.
                    </TableCell>
                  </TableRow>
                ) : (
                  projectDomainRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs">{req.currentDomain}</TableCell>
                      <TableCell className="font-mono text-xs">{req.requestedDomain}</TableCell>
                      <TableCell>
                        <DomainStatusBadge status={req.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{req.createdAt}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Version History</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate("client-versions")}>
            <GitBranch className="h-3.5 w-3.5 mr-1.5" />
            All Versions
          </Button>
        </CardHeader>
        <CardContent>
          {depVersions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No versions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Auditoría del proyecto (Logs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {projectLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No hay logs para este proyecto.
                    </TableCell>
                  </TableRow>
                ) : (
                  projectLogs.slice(0, 50).map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">{l.visitorIp}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{l.path}</TableCell>
                      <TableCell className="text-muted-foreground">{l.action}</TableCell>
                      <TableCell className="text-muted-foreground">{browserFromUserAgent(l.userAgent)}</TableCell>
                      <TableCell className="text-muted-foreground">{l.timestamp}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{currentUser.id}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
