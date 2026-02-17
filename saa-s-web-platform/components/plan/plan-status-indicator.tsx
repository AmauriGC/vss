"use client"

import { CheckCircle2, AlertTriangle, Ban, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { PlanStatusBadge } from "@/components/status-badge"
import type { PlanStatus } from "@/lib/types"

const statusIcon: Record<PlanStatus, typeof CheckCircle2> = {
  Active: CheckCircle2,
  PendingPayment: Clock,
  Expired: AlertTriangle,
  Suspended: Ban,
}

const statusText: Record<PlanStatus, { title: string; description: string }> = {
  Active: {
    title: "Suscripción activa",
    description: "Tu plan está activo y tus despliegues pueden operar normalmente.",
  },
  PendingPayment: {
    title: "Pago pendiente",
    description: "El admin asignará o activará el plan después de confirmar el pago.",
  },
  Expired: {
    title: "Plan expirado",
    description: "Tus despliegues pueden quedar suspendidos hasta renovar.",
  },
  Suspended: {
    title: "Cuenta suspendida",
    description: "Tu cuenta está suspendida por límites o estado de plan. Contacta al admin.",
  },
}

export function PlanStatusIndicator({
  status,
  className,
}: {
  status: PlanStatus
  className?: string
}) {
  const Icon = statusIcon[status]
  const copy = statusText[status]

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{copy.title}</p>
          <PlanStatusBadge status={status} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{copy.description}</p>
      </div>
    </div>
  )
}
