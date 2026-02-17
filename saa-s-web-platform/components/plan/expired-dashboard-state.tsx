"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RenewalRequestButton } from "@/components/plan/renewal-request-button"
import { PlanStatusIndicator } from "@/components/plan/plan-status-indicator"

export function ExpiredDashboardState({
  expiresAt,
  onViewPlan,
}: {
  expiresAt: string | null
  onViewPlan: () => void
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Plan expirado
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PlanStatusIndicator status="Expired" />
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Fecha de expiración</p>
            <p className="text-sm font-semibold mt-1">{expiresAt || "No disponible"}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Tus despliegues pueden quedar suspendidos hasta que el admin confirme la renovación.
            Las suscripciones son mensuales.
          </p>
          <div className="flex flex-wrap gap-2">
            <RenewalRequestButton variant="destructive" />
            <Button variant="outline" onClick={onViewPlan}>
              Ver plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
