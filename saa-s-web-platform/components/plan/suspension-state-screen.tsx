"use client"

import { Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanStatusIndicator } from "@/components/plan/plan-status-indicator"
import { RenewalRequestButton } from "@/components/plan/renewal-request-button"

export function SuspensionStateScreen({
  onViewPlan,
}: {
  onViewPlan: () => void
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Ban className="h-4 w-4 text-warning" />
            Cuenta suspendida
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PlanStatusIndicator status="Suspended" />
          <p className="text-sm text-muted-foreground">
            Tus despliegues pueden estar suspendidos por exceder límites o por estado del plan.
            Contacta al admin para regularizar el estado.
          </p>
          <div className="flex flex-wrap gap-2">
            <RenewalRequestButton variant="default" />
            <Button variant="outline" onClick={onViewPlan}>
              Ver plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
