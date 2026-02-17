"use client"

import { CalendarClock, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanBadge, PlanStatusBadge } from "@/components/status-badge"
import { type Plan, type PlanStatus } from "@/lib/types"
import { getPlanLimits } from "@/lib/plan-catalog"

export function PlanExpirationCard({
  plan,
  status,
  expiresAt,
}: {
  plan: Plan
  status: PlanStatus
  expiresAt: string | null
}) {
  const limits = getPlanLimits(plan)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Suscripción
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">Plan actual:</span>
              <PlanBadge plan={plan} />
              <PlanStatusBadge status={status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {limits.price > 0 ? `$${limits.price}/mes` : "Gratis"} · Facturación mensual
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Expiración</p>
            <p className="text-sm font-semibold mt-1">{expiresAt || "Sin fecha"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {expiresAt ? "Renovación mensual (admin)" : "Gestionado por admin"}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Almacenamiento</p>
            <p className="text-sm font-semibold mt-1">{limits.maxDisk} MB</p>
            <p className="text-xs text-muted-foreground mt-1">Límite por plan</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Subida</p>
            <p className="text-sm font-semibold mt-1">{limits.maxUpload} MB</p>
            <p className="text-xs text-muted-foreground mt-1">Por archivo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
