"use client"

import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle,
  Crown,
  CreditCard,
  Shield,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanBadge } from "@/components/status-badge"
import { PlanExpirationCard } from "@/components/plan/plan-expiration-card"
import { PlanStatusIndicator } from "@/components/plan/plan-status-indicator"
import { RenewalRequestButton } from "@/components/plan/renewal-request-button"
import {
  createPlanRequest,
  currentUser,
  getPlanRequestsForUser,
} from "@/lib/mock-data"
import { type Plan } from "@/lib/types"
import { getDerivedPlanStatus, getEffectivePlan } from "@/lib/plan-logic"
import { getPlanLimits } from "@/lib/plan-catalog"
import { useTodayIsoDate } from "@/lib/use-today-iso-date"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const planIcons: Record<Plan, typeof Shield> = {
  Basic: Shield,
  Medium: Zap,
  Full: Crown,
}

export function ClientPlanPage() {
  const todayIsoDate = useTodayIsoDate()
  const derivedPlanStatus = getDerivedPlanStatus(currentUser, todayIsoDate)
  const effectivePlan = getEffectivePlan(currentUser, todayIsoDate)

  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [requestedPlan, setRequestedPlan] = useState<Plan>("Medium")
  const [requestNote, setRequestNote] = useState("")
  const [requestSent, setRequestSent] = useState(false)

  const pendingRequests = getPlanRequestsForUser(currentUser.id).filter((r) => r.status === "Pending")

  const isPlanExpired = derivedPlanStatus === "Expired"
  const isPlanSuspended = currentUser.planStatus === "Suspended"
  const hasPlanIssue = isPlanExpired || isPlanSuspended

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Plan</h1>
        <p className="text-sm text-muted-foreground">
          Suscripciones mensuales gestionadas por admin
        </p>
      </div>

      {hasPlanIssue && (
        <div
          className={`flex items-start gap-3 rounded-lg p-4 ${
            isPlanExpired
              ? "bg-destructive/10 border border-destructive/20"
              : "bg-warning/10 border border-warning/20"
          }`}
        >
          <AlertTriangle
            className={`h-5 w-5 mt-0.5 shrink-0 ${
              isPlanExpired ? "text-destructive" : "text-warning"
            }`}
          />
          <div className="flex-1">
            <p
              className={`text-sm font-semibold ${
                isPlanExpired ? "text-destructive" : "text-warning"
              }`}
            >
              {isPlanExpired ? "Tu plan ha expirado" : "Cuenta suspendida"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isPlanExpired
                ? "Tus despliegues pueden quedar suspendidos hasta que el admin confirme la renovación."
                : "Tu cuenta está suspendida por límites o por estado de plan. Contacta al admin."}
            </p>
            <div className="mt-3">
              <RenewalRequestButton
                variant={isPlanExpired ? "destructive" : "default"}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <PlanStatusIndicator status={derivedPlanStatus} />
        <PlanExpirationCard
          plan={effectivePlan}
          status={derivedPlanStatus}
          expiresAt={currentUser.planExpiresAt}
        />
      </div>

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Solicitud pendiente</CardTitle>
            <CardDescription>
              Un admin debe confirmar el pago y aprobar tu plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              {pendingRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{r.type} → {r.requestedPlan}</p>
                    <p className="text-xs text-muted-foreground">{r.createdAt}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planes disponibles</CardTitle>
          <CardDescription>
            Los planes se asignan por admin después de confirmar el pago.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(["Basic", "Medium", "Full"] as Plan[]).map((plan) => {
              const limits = getPlanLimits(plan)
              const Icon = planIcons[plan]
              const isCurrent = effectivePlan === plan

              return (
                <div
                  key={plan}
                  className={`rounded-lg border p-4 flex flex-col gap-3 ${
                    isCurrent ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{plan}</span>
                    </div>
                    {isCurrent && <PlanBadge plan={plan} />}
                  </div>

                  <p className="text-2xl font-bold">
                    {limits.price === 0 ? "Gratis" : `$${limits.price}`}
                    {limits.price > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /mes
                      </span>
                    )}
                  </p>

                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                      <span>{limits.maxDisk} MB almacenamiento</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                      <span>{limits.maxUpload} MB subida por archivo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                      <span>Suscripción mensual</span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-auto"
                      onClick={() => {
                        setRequestedPlan(plan)
                        setPurchaseOpen(true)
                      }}
                    >
                      Solicitar compra
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Renovación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para renovar o solicitar un cambio de plan, envía una solicitud. El admin
              procesará el cambio después de confirmar el pago.
            </p>
            <RenewalRequestButton className="self-start" />
            <Button variant="outline" className="self-start" onClick={() => setPurchaseOpen(true)}>
              Comprar / renovar plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={purchaseOpen}
        onOpenChange={(open) => {
          setPurchaseOpen(open)
          if (!open) {
            setRequestSent(false)
            setRequestNote("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar plan</DialogTitle>
            <DialogDescription>
              Envía una solicitud. El admin confirmará el pago y activará la suscripción mensual.
            </DialogDescription>
          </DialogHeader>

          {requestSent ? (
            <div className="rounded-lg border p-4 text-sm">
              Solicitud enviada. Queda pendiente de aprobación por admin.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Plan</Label>
                <Select value={requestedPlan} onValueChange={(v) => setRequestedPlan(v as Plan)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Nota (opcional)</Label>
                <Textarea
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="Indica información de pago o detalles para el admin..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseOpen(false)}>
              Cerrar
            </Button>
            {!requestSent && (
              <Button
                onClick={() => {
                  createPlanRequest({
                    userId: currentUser.id,
                    requestedPlan,
                    type: requestedPlan === effectivePlan ? "Renewal" : "Purchase",
                    note: requestNote || undefined,
                  })
                  setRequestSent(true)
                }}
              >
                Enviar solicitud
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
