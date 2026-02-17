import type { Deployment, DeploymentStatus, Plan, PlanStatus, User } from "./types"
import { getPlanLimits } from "./plan-catalog"

function isIsoDateExpired(expiresAt: string | null, todayIsoDate: string | null) {
  if (!expiresAt || !todayIsoDate) return false
  // Both are YYYY-MM-DD strings.
  return expiresAt <= todayIsoDate
}

export function getDerivedPlanStatus(user: User, todayIsoDate: string | null): PlanStatus {
  if (isIsoDateExpired(user.planExpiresAt, todayIsoDate)) return "Expired"
  return user.planStatus
}

export function getEffectivePlan(user: User, todayIsoDate: string | null = null): Plan {
  // When a plan expires, the user reverts logically to BASIC limits.
  if (getDerivedPlanStatus(user, todayIsoDate) === "Expired") return "Basic"
  return user.plan
}

export function getEffectivePlanLimits(user: User, todayIsoDate: string | null = null) {
  return getPlanLimits(getEffectivePlan(user, todayIsoDate))
}

export function getEffectiveDeploymentStatus(
  deployment: Deployment,
  owner: User,
  todayIsoDate: string | null = null,
): DeploymentStatus {
  // Expired plan => all deployments are blocked.
  if (getDerivedPlanStatus(owner, todayIsoDate) === "Expired") return "PlanExpired"

  const maxDisk = getPlanLimits(getEffectivePlan(owner, todayIsoDate)).maxDisk
  if (deployment.diskUsage > maxDisk) return "LimitExceeded"

  return deployment.status
}

export function getPublicAccessTargetPage(
  deployment: Deployment,
  owner: User,
  todayIsoDate: string | null = null,
): "public-plan-expired" | "public-suspended" | null {
  if (getDerivedPlanStatus(owner, todayIsoDate) === "Expired") return "public-plan-expired"

  const effectiveStatus = getEffectiveDeploymentStatus(deployment, owner, todayIsoDate)
  if (effectiveStatus === "Suspended" || effectiveStatus === "LimitExceeded" || effectiveStatus === "PlanExpired") {
    return "public-suspended"
  }

  return null
}
