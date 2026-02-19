"use client";

import { HardDrive, Activity, Globe, Cpu, Rocket, AlertTriangle, CalendarClock, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { DeploymentStatusBadge } from "@/components/status-badge";
import { PlanExpirationCard } from "@/components/plan/plan-expiration-card";
import { ExpiredDashboardState } from "@/components/plan/expired-dashboard-state";
import { SuspensionStateScreen } from "@/components/plan/suspension-state-screen";
import { currentUser, deployments, activityLogs, accessLogs } from "@/lib/mock-data";
import { getDerivedPlanStatus, getEffectiveDeploymentStatus, getEffectivePlan } from "@/lib/plan-logic";
import { useNavigation } from "@/lib/navigation";
import { useTodayIsoDate } from "@/lib/use-today-iso-date";
import { getPlanLimits } from "@/lib/plan-catalog";

export function ClientDashboard() {
  const { navigate, selectDeployment } = useNavigation();
  const todayIsoDate = useTodayIsoDate();
  const userDeployments = deployments.filter((d) => d.userId === currentUser.id);
  const userActivity = activityLogs.filter((a) => a.userId === currentUser.id);
  const derivedPlanStatus = getDerivedPlanStatus(currentUser, todayIsoDate);
  const effectivePlan = getEffectivePlan(currentUser, todayIsoDate);
  const limits = getPlanLimits(effectivePlan);
  const diskPercent = limits.maxDisk > 0 ? Math.round((currentUser.diskUsage / limits.maxDisk) * 100) : 0;
  const totalTraffic = userDeployments.reduce((acc, d) => acc + d.traffic, 0);
  const isPlanExpired = derivedPlanStatus === "Expired";
  const isPlanSuspended = currentUser.planStatus === "Suspended";
  const hasPlanIssue = isPlanExpired || isPlanSuspended;

  const effectiveDeployments = userDeployments.map((d) => ({
    ...d,
    status: getEffectiveDeploymentStatus(d, currentUser, todayIsoDate),
  }));

  const recentAccess = accessLogs.filter((l) => userDeployments.some((d) => d.id === l.deploymentId)).slice(0, 6);

  const deploymentNameById = new Map(userDeployments.map((d) => [d.id, d.domain]));

  if (isPlanExpired) {
    return <ExpiredDashboardState expiresAt={currentUser.planExpiresAt} onViewPlan={() => navigate("client-plan")} />;
  }

  if (isPlanSuspended) {
    return <SuspensionStateScreen onViewPlan={() => navigate("client-plan")} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Plan Expired/Suspended Banner */}
      {hasPlanIssue && (
        <div
          className={`flex items-center gap-3 rounded-lg p-4 ${
            isPlanExpired ? "bg-destructive/10 border border-destructive/20" : "bg-warning/10 border border-warning/20"
          }`}
        >
          <AlertTriangle className={`h-5 w-5 shrink-0 ${isPlanExpired ? "text-destructive" : "text-warning"}`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${isPlanExpired ? "text-destructive" : "text-warning"}`}>
              {isPlanExpired ? "Your Plan Has Expired" : "Account Suspended"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPlanExpired
                ? "Your deployments have been suspended. Please request a plan renewal to restore access."
                : "Your account has been suspended due to a plan limit exceeded. Please contact admin for assistance."}
            </p>
          </div>
          <Button size="sm" variant={isPlanExpired ? "destructive" : "default"} onClick={() => navigate("client-plan")}>
            {"View Plan"}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {currentUser.name.split(" ")[0]}</p>
        </div>
        <Button onClick={() => navigate("client-new-deployment")} disabled={hasPlanIssue}>
          <Rocket className="h-4 w-4 mr-2" />
          New Deployment
        </Button>
      </div>

      <PlanExpirationCard plan={effectivePlan} status={derivedPlanStatus} expiresAt={currentUser.planExpiresAt} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Current Plan"
          value={effectivePlan}
          description={`Up to ${limits.maxUpload}MB per upload`}
          icon={<Cpu className="h-4 w-4" />}
        />
        <StatCard
          title="Disk Usage"
          value={`${currentUser.diskUsage} MB`}
          description={`${diskPercent}% of ${limits.maxDisk} MB used`}
          icon={<HardDrive className="h-4 w-4" />}
        />
        <StatCard
          title="Total Traffic"
          value={totalTraffic.toLocaleString()}
          description="Total visits across all sites"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Storage</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Progress value={diskPercent} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentUser.diskUsage} MB used</span>
              <span>{limits.maxDisk} MB total</span>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {effectiveDeployments.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <button onClick={() => selectDeployment(d.id)} className="text-primary hover:underline">
                    {d.domain}
                  </button>
                  <span className="text-muted-foreground">{d.diskUsage} MB</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-rows-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {userActivity.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{a.action}</span>{" "}
                      <span className="text-muted-foreground">{a.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deployment</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAccess.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No access logs yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentAccess.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {deploymentNameById.get(log.deploymentId) || log.deploymentId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.path}</TableCell>
                      <TableCell className="font-mono text-xs">{log.visitorIp}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleDateString("en-US", {
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
      </div>
    </div>
  );
}
