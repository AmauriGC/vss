"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDerivedPlanStatus, getEffectivePlan } from "@/lib/plan-logic";
import { getAllPlanDefinitions, getPlanLimits } from "@/lib/plan-catalog";
import type { Plan, PlanRequestType } from "@/lib/types";
import { createPlanRequest, currentUser, getPlanRequestsForUser, getPlanUsersForUser } from "@/lib/mock-data";
import { useTodayIsoDate } from "@/lib/use-today-iso-date";

export function ClientPlanPage() {
  const [, bumpVersion] = useState(0);
  const todayIsoDate = useTodayIsoDate();
  const derivedPlanStatus = getDerivedPlanStatus(currentUser, todayIsoDate);
  const effectivePlan = getEffectivePlan(currentUser, todayIsoDate);

  const isPlanExpired = derivedPlanStatus === "Expired";
  const isPlanSuspended = currentUser.planStatus === "Suspended";
  const hasPlanIssue = isPlanExpired || isPlanSuspended;

  const planDefs = getAllPlanDefinitions();
  const planUsers = getPlanUsersForUser(currentUser.id);

  const [selectedPlan, setSelectedPlan] = useState<Plan>(effectivePlan);
  const [monthsText, setMonthsText] = useState("1");
  const months = useMemo(() => {
    const n = Number.parseInt(monthsText, 10);
    if (Number.isNaN(n)) return 1;
    return Math.max(1, n);
  }, [monthsText]);
  const total = useMemo(() => getPlanLimits(selectedPlan).price * months, [selectedPlan, months]);

  const myRequests = getPlanRequestsForUser(currentUser.id);
  const hasPending = myRequests.some((r) => r.status === "Pending");
  const pendingReq = myRequests.find((r) => r.status === "Pending") || null;
  const requestType: PlanRequestType = selectedPlan === currentUser.plan ? "Renewal" : "Upgrade";

  const [requestOpen, setRequestOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plan</h1>
          <p className="text-sm text-muted-foreground">Planes y compras (Plan_User)</p>
        </div>
        <div className="flex justify-end">
          <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
            <DialogTrigger asChild>
              <Button>Solicitud de plan</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Solicitud de plan</DialogTitle>
                <DialogDescription>
                  Selecciona plan y meses. Se envía solicitud al admin para aprobar o rechazar.
                </DialogDescription>
              </DialogHeader>

              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>nombre</TableHead>
                      <TableHead>status</TableHead>
                      <TableHead className="text-right">precio</TableHead>
                      <TableHead className="text-right">tamaño_disco_maximo (MB)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planDefs.map((def) => {
                      const limits = getPlanLimits(def.plan);
                      const status = def.enabled ? "Active" : "Inactive";
                      const isCurrent = effectivePlan === def.plan;

                      return (
                        <TableRow key={def.plan}>
                          <TableCell className="font-medium">
                            {def.plan}
                            {isCurrent ? " (current)" : ""}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{status}</TableCell>
                          <TableCell className="text-right font-medium">{limits.price}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{limits.maxDisk}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label>Plan</Label>
                    <Select value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as Plan)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {planDefs
                          .filter((d) => d.enabled)
                          .map((d) => (
                            <SelectItem key={d.plan} value={d.plan}>
                              {d.plan}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Meses</Label>
                    <Input
                      inputMode="numeric"
                      value={monthsText}
                      onChange={(e) => setMonthsText(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="text-sm">
                  Total a pagar: <span className="font-medium">{total}</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Tipo: {requestType} · Estado actual: {currentUser.planStatus}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setRequestOpen(false)}>
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    createPlanRequest({
                      userId: currentUser.id,
                      type: requestType,
                      requestedPlan: selectedPlan,
                      months,
                    });
                    bumpVersion((v) => v + 1);
                    setRequestOpen(false);
                  }}
                  disabled={hasPending}
                >
                  Enviar solicitud
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {hasPlanIssue && (
        <div
          className={`flex items-start gap-3 rounded-lg p-4 ${
            isPlanExpired ? "bg-destructive/10 border border-destructive/20" : "bg-warning/10 border border-warning/20"
          }`}
        >
          <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${isPlanExpired ? "text-destructive" : "text-warning"}`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${isPlanExpired ? "text-destructive" : "text-warning"}`}>
              {isPlanExpired ? "Tu plan ha expirado" : "Cuenta suspendida"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isPlanExpired
                ? "Tu suscripción (Plan_User) expiró."
                : "Tu cuenta está suspendida por límites o por estado de plan. Contacta al admin."}
            </p>
          </div>
        </div>
      )}

      {hasPending && (
        <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted p-4">
          <div className="flex-1">
            <p className="text-sm font-semibold">Tienes una solicitud pendiente</p>
            <p className="text-xs text-muted-foreground mt-1">
              Espera aprobación del admin.
              {pendingReq ? (
                <>
                  {" "}
                  Plan: <span className="font-medium">{pendingReq.requestedPlan}</span>
                  {" · "}Meses: <span className="font-medium">{pendingReq.months ?? 1}</span>
                  {" · "}Total: <span className="font-medium">{pendingReq.priceTotal ?? total}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compras (Plan_User)</CardTitle>
          <CardDescription>
            plan_id, user_id, fecha_compra, fecha_expiracion, total_months_bought, price_total_months_bought
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>plan_id</TableHead>
                <TableHead>user_id</TableHead>
                <TableHead>fecha_compra</TableHead>
                <TableHead>fecha_expiracion</TableHead>
                <TableHead className="text-right">total_months_bought</TableHead>
                <TableHead className="text-right">price_total_months_bought</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No records.
                  </TableCell>
                </TableRow>
              ) : (
                planUsers.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.plan_id}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.user_id}</TableCell>
                    <TableCell className="text-muted-foreground">{p.fecha_compra}</TableCell>
                    <TableCell className="text-muted-foreground">{p.fecha_expiracion}</TableCell>
                    <TableCell className="text-right">{p.total_months_bought}</TableCell>
                    <TableCell className="text-right font-medium">{p.price_total_months_bought}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
