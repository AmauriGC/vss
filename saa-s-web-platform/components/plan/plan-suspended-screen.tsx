"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RenewalRequestButton } from "@/components/plan/renewal-request-button"
import { PlanStatusIndicator } from "@/components/plan/plan-status-indicator"
import type { PlanStatus } from "@/lib/types"

export function PlanSuspendedScreen({
  status,
  onViewPlan,
}: {
  status: Extract<PlanStatus, "Suspended"> | "Suspended"
  onViewPlan: () => void
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Acceso restringido
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PlanStatusIndicator status={status} />
          <p className="text-sm text-muted-foreground">
            Mientras tu cuenta esté suspendida, no podrás crear nuevos despliegues.
            Si ya realizaste el pago, solicita la reactivación para que el admin confirme y asigne el plan.
          </p>
          <div className="flex flex-wrap gap-2">
            <RenewalRequestButton />
            <Button variant="outline" onClick={onViewPlan}>
              Ver plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
