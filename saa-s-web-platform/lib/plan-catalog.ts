import type { BillingInterval, Plan } from "./types"
import { PLAN_LIMITS } from "./types"

export type PlanDefinition = {
  plan: Plan
  enabled: boolean
  maxDisk: number
  maxUpload: number
  price: number
  interval: BillingInterval
}

let catalog: Record<Plan, PlanDefinition> = {
  Basic: {
    plan: "Basic",
    enabled: true,
    ...PLAN_LIMITS.Basic,
  },
  Medium: {
    plan: "Medium",
    enabled: true,
    ...PLAN_LIMITS.Medium,
  },
  Full: {
    plan: "Full",
    enabled: true,
    ...PLAN_LIMITS.Full,
  },
}

export function getPlanDefinition(plan: Plan) {
  return catalog[plan]
}

export function getAllPlanDefinitions() {
  return (Object.keys(catalog) as Plan[]).map((p) => catalog[p])
}

export function getPlanLimits(plan: Plan) {
  const { maxDisk, maxUpload, price, interval } = catalog[plan]
  return { maxDisk, maxUpload, price, interval }
}

export function updatePlanDefinition(plan: Plan, patch: Partial<Omit<PlanDefinition, "plan">>) {
  catalog = {
    ...catalog,
    [plan]: {
      ...catalog[plan],
      ...patch,
    },
  }
}

export function setPlanEnabled(plan: Plan, enabled: boolean) {
  updatePlanDefinition(plan, { enabled })
}

export function resetPlanCatalogToDefaults() {
  catalog = {
    Basic: { plan: "Basic", enabled: true, ...PLAN_LIMITS.Basic },
    Medium: { plan: "Medium", enabled: true, ...PLAN_LIMITS.Medium },
    Full: { plan: "Full", enabled: true, ...PLAN_LIMITS.Full },
  }
}
