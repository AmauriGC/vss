"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, CheckCircle, XCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { currentUser, deployments, replaceSingleDeploymentForUser } from "@/lib/mock-data";
import { getDerivedPlanStatus, getEffectivePlan } from "@/lib/plan-logic";
import { useNavigation } from "@/lib/navigation";
import { useTodayIsoDate } from "@/lib/use-today-iso-date";
import { getPlanLimits } from "@/lib/plan-catalog";
import { validateStaticSiteZip } from "@/lib/static-site-zip";

export function NewDeploymentPage() {
  const { navigate, selectDeployment } = useNavigation();
  const todayIsoDate = useTodayIsoDate();
  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState("");
  const [domainValid, setDomainValid] = useState<boolean | null>(null);
  const [domainChecking, setDomainChecking] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideConfirm, setOverrideConfirm] = useState("");
  const [overrideApproved, setOverrideApproved] = useState(false);
  const domainCheckTimeoutRef = useRef<number | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [siteFile, setSiteFile] = useState<File | null>(null);
  const [zipChecking, setZipChecking] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [newDeploymentId, setNewDeploymentId] = useState<string | null>(null);
  const [replacedPrevious, setReplacedPrevious] = useState(false);

  const effectivePlan = getEffectivePlan(currentUser, todayIsoDate);
  const maxUpload = getPlanLimits(effectivePlan).maxUpload;
  const isAdmin = currentUser.role === "admin";

  const existingDeployment = deployments.find((d) => d.userId === currentUser.id) || null;
  const takenDomains = new Set(
    deployments.filter((d) => d.userId !== currentUser.id).map((d) => d.domain.toLowerCase()),
  );

  const fullDomain = domain ? `${domain}.vss.io` : "";
  const domainTaken = fullDomain ? takenDomains.has(fullDomain.toLowerCase()) : false;

  const validateDomain = (rawValue: string) => {
    const cleaned = rawValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "");

    if (domainCheckTimeoutRef.current) {
      window.clearTimeout(domainCheckTimeoutRef.current);
    }

    setDomain(cleaned);
    setOverrideApproved(false);
    setOverrideConfirm("");
    if (!cleaned) {
      setDomainChecking(false);
      setDomainValid(null);
      return;
    }

    setDomainChecking(true);
    setDomainValid(null);

    domainCheckTimeoutRef.current = window.setTimeout(() => {
      const full = `${cleaned}.vss.io`;
      const exists = takenDomains.has(full.toLowerCase());

      setDomainValid(!exists);
      setDomainChecking(false);
    }, 250);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(+(file.size / (1024 * 1024)).toFixed(2));
      setSiteFile(file);

      setZipError(null);

      setZipChecking(true);
      try {
        await validateStaticSiteZip(file);
        setZipError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "ZIP inválido";
        setZipError(msg);
      } finally {
        setZipChecking(false);
      }
    }
  };

  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          const hadExisting = deployments.some((d) => d.userId === currentUser.id);
          const created = replaceSingleDeploymentForUser({
            userId: currentUser.id,
            domain: fullDomain,
            zipFileName: fileName,
            zipFileSizeMb: fileSize,
            createdAt: todayIsoDate || undefined,
          });

          setReplacedPrevious(hadExisting);
          setNewDeploymentId(created.id);

          setUploading(false);
          setDeployed(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const fileTooLarge = fileSize > maxUpload;
  const derivedPlanStatus = getDerivedPlanStatus(currentUser, todayIsoDate);
  const hasPlanIssue = derivedPlanStatus === "Expired" || derivedPlanStatus === "Suspended";
  const canContinue = (domainValid === true && !domainChecking) || (domainTaken && overrideApproved);
  const canDeploy = !!fileName && !!siteFile && !fileTooLarge && !uploading && !zipChecking && !zipError;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">New Deployment</h1>
        <p className="text-muted-foreground text-sm">Deploy a new static site in two simple steps</p>
      </div>

      <div className="flex w-full justify-center items-center gap-4 text-sm">
        <div className="flex flex-col gap-3 justify-center items-center">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
              step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            1
          </div>
          <span className={step >= 1 ? "font-medium" : "text-muted-foreground"}>Domain</span>
        </div>
        <div className="h-px w-8 bg-border border-2" />
        <div className="flex flex-col gap-3 justify-center items-center">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
              step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </div>
          <span className={step >= 2 ? "font-medium" : "text-muted-foreground"}>Upload</span>
        </div>
      </div>

      {deployed ? (
        <div className="flex w-full justify-center">
          <Card className="flex w-1/2 flex-col">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold">Deployment Successful</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Your site is now live at <span className="font-mono text-primary">{domain}.vss.io</span>
                </p>
                {replacedPrevious && (
                  <p className="text-xs text-muted-foreground mt-2">
                    El deployment anterior fue eliminado y reemplazado por este.
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => navigate("client-dashboard")}>
                  Go to Dashboard
                </Button>
                {newDeploymentId && (
                  <Button variant="outline" onClick={() => selectDeployment(newDeploymentId)}>
                    Ver deployment
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setStep(1);
                    setDomain("");
                    setDomainValid(null);
                    setDomainChecking(false);
                    setOverrideApproved(false);
                    setOverrideConfirm("");
                    setFileName("");
                    setFileSize(0);
                    setSiteFile(null);
                    setZipError(null);
                    setZipChecking(false);
                    setUploadProgress(0);
                    setDeployed(false);
                    setNewDeploymentId(null);
                    setReplacedPrevious(false);
                  }}
                >
                  Deploy Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : step === 1 ? (
        <div className="flex w-full justify-center">
          <Card className="flex w-1/2 flex-col">
            <CardHeader>
              <CardTitle>Choose a Domain</CardTitle>
              <CardDescription>Select a unique subdomain for your static site</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {existingDeployment && (
                <Alert>
                  <AlertTitle>Solo 1 deployment por usuario</AlertTitle>
                  <AlertDescription>
                    Ya tienes <span className="font-mono">{existingDeployment.domain}</span>. Si despliegas otro ZIP, el
                    anterior se eliminará.
                  </AlertDescription>
                </Alert>
              )}
              {hasPlanIssue && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Plan access restricted</AlertTitle>
                  <AlertDescription>
                    Your account plan is not active. You can request renewal, but new deployments are disabled until
                    admin confirms.
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="domain">Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="domain"
                    placeholder="my-site"
                    value={domain}
                    onChange={(e) => validateDomain(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">.vss.io</span>
                </div>
                {domainChecking && domain && <p className="text-sm text-muted-foreground">Checking availability…</p>}
                {domainValid === true && (
                  <p className="flex items-center gap-1 text-sm text-success">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {fullDomain} is available
                  </p>
                )}
                {domainTaken && !overrideApproved && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Domain already exists</AlertTitle>
                    <AlertDescription>
                      <p>
                        <span className="font-mono">{fullDomain}</span> is already in use. Choose a different subdomain.
                      </p>
                      {isAdmin && (
                        <div className="mt-3">
                          <Button variant="outline" onClick={() => setOverrideOpen(true)}>
                            Admin override…
                          </Button>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {domainTaken && overrideApproved && (
                  <Alert>
                    <AlertTitle>Admin override enabled</AlertTitle>
                    <AlertDescription>
                      Deployment will proceed with <span className="font-mono">{fullDomain}</span>.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <Button onClick={() => setStep(2)} disabled={!canContinue || hasPlanIssue} className="self-end">
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex w-full justify-center">
          <Card className="flex w-1/2 flex-col">
            <CardHeader>
              <CardTitle>Upload ZIP File</CardTitle>
              <CardDescription>
                Upload your static site as a ZIP file (max {maxUpload}MB for {currentUser.plan} plan)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border p-8 hover:border-primary/50 transition-colors">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">{fileName || "Drop your ZIP file here or click to browse"}</p>
                  {fileName && (
                    <p className={`text-xs mt-1 ${fileTooLarge ? "text-destructive" : "text-muted-foreground"}`}>
                      {fileSize} MB {fileTooLarge ? `(exceeds ${maxUpload}MB limit)` : ""}
                    </p>
                  )}
                  {zipChecking && fileName && (
                    <p className="text-xs mt-1 text-muted-foreground">Validando contenido del ZIP…</p>
                  )}
                </div>
                <label className="cursor-pointer">
                  <Input type="file" accept=".zip" onChange={handleFileSelect} className="hidden" />
                  <span className="text-sm text-primary hover:underline">Browse files</span>
                </label>
              </div>

              {zipError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>ZIP inválido</AlertTitle>
                  <AlertDescription>
                    {zipError}. El ZIP debe contener solo HTML, CSS, JS e imágenes, e incluir{" "}
                    <span className="font-mono">index.html</span>.
                  </AlertDescription>
                </Alert>
              )}

              {uploading && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={simulateUpload} disabled={!canDeploy}>
                  {uploading ? "Deploying..." : "Deploy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin override domain uniqueness</DialogTitle>
            <DialogDescription>
              This domain is already in use. Override allows continuing anyway. Confirm by typing the full domain.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label>Type the full domain to confirm</Label>
            <Input
              value={overrideConfirm}
              onChange={(e) => setOverrideConfirm(e.target.value)}
              placeholder={fullDomain}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOverrideOpen(false);
                setOverrideConfirm("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOverrideApproved(true);
                setOverrideOpen(false);
              }}
              disabled={overrideConfirm.trim().toLowerCase() !== fullDomain.toLowerCase()}
            >
              Confirm override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
