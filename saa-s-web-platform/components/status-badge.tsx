import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DeploymentStatus, DomainRequestStatus, Plan, PlanStatus } from "@/lib/types"

const statusStyles: Record<DeploymentStatus, string> = {
  Active: "bg-success text-success-foreground hover:bg-success/90",
  Updating: "bg-warning text-warning-foreground hover:bg-warning/90",
  Error: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  Suspended: "bg-muted text-muted-foreground hover:bg-muted/90",
  PlanExpired: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20",
  LimitExceeded: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
}

const statusLabels: Record<DeploymentStatus, string> = {
  Active: "Active",
  Updating: "Updating",
  Error: "Error",
  Suspended: "Suspended",
  PlanExpired: "Plan Expired",
  LimitExceeded: "Plan Limit Exceeded",
}

export function DeploymentStatusBadge({ status }: { status: DeploymentStatus }) {
  return (
    <Badge className={cn("border-0", statusStyles[status])}>
      {statusLabels[status]}
    </Badge>
  )
}

const domainStatusStyles: Record<DomainRequestStatus, string> = {
  Pending: "bg-warning text-warning-foreground hover:bg-warning/90",
  Approved: "bg-success text-success-foreground hover:bg-success/90",
  Rejected: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
}

export function DomainStatusBadge({ status }: { status: DomainRequestStatus }) {
  return (
    <Badge className={cn("border-0", domainStatusStyles[status])}>
      {status}
    </Badge>
  )
}

const planStyles: Record<Plan, string> = {
  Basic: "bg-muted text-muted-foreground hover:bg-muted/90",
  Medium: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
  Full: "bg-success/10 text-success hover:bg-success/20 border-success/20",
}

export function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <Badge className={cn(planStyles[plan])}>
      {plan}
    </Badge>
  )
}

const planStatusStyles: Record<PlanStatus, string> = {
  Active: "bg-success/10 text-success hover:bg-success/20 border-success/20",
  PendingPayment: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
  Expired: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20",
  Suspended: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
}

const planStatusLabels: Record<PlanStatus, string> = {
  Active: "Active",
  PendingPayment: "Payment Pending",
  Expired: "Expired",
  Suspended: "Suspended",
}

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  return (
    <Badge className={cn(planStatusStyles[status])}>
      {planStatusLabels[status]}
    </Badge>
  )
}
