export type Plan = "Basic" | "Medium" | "Full"

// Plans are monthly subscriptions (pricing is per-month).
export type BillingInterval = "monthly"

export const DEFAULT_PLAN: Plan = "Basic"
export const BILLING_INTERVAL: BillingInterval = "monthly"

export type PlanStatus = "Active" | "PendingPayment" | "Expired" | "Suspended"
export type Role = "admin" | "client"
export type DeploymentStatus = "Active" | "Updating" | "Error" | "Suspended" | "PlanExpired" | "LimitExceeded"
export type DomainRequestStatus = "Pending" | "Approved" | "Rejected"

export type PlanRequestType = "Purchase" | "Renewal" | "Upgrade"
export type PlanRequestStatus = "Pending" | "Approved" | "Rejected"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  plan: Plan
  planStatus: PlanStatus
  planExpiresAt: string | null
  createdAt: string
  deploymentsCount: number
  diskUsage: number
  maxDisk: number
}

export interface Deployment {
  id: string
  userId: string
  domain: string
  status: DeploymentStatus
  currentVersion: number
  diskUsage: number
  traffic: number
  createdAt: string
  updatedAt: string
}

export interface Version {
  id: string
  deploymentId: string
  versionNumber: number
  fileName: string
  fileSize: number
  uploadedAt: string
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  target: string
  timestamp: string
  ip?: string
}

export interface TrafficEntry {
  date: string
  visits: number
}

export interface DomainRequest {
  id: string
  deploymentId: string
  currentDomain: string
  requestedDomain: string
  status: DomainRequestStatus
  createdAt: string
}

export interface AccessLog {
  id: string
  deploymentId: string
  visitorIp: string
  timestamp: string
  path: string
  action: string
  userAgent: string
  country: string
}

export interface PlanRequest {
  id: string
  userId: string
  type: PlanRequestType
  requestedPlan: Plan
  status: PlanRequestStatus
  createdAt: string
  months?: number
  priceTotal?: number
  note?: string
}

export const PLAN_LIMITS: Record<
  Plan,
  { maxDisk: number; maxUpload: number; price: number; interval: BillingInterval }
> = {
  Basic: { maxDisk: 50, maxUpload: 5, price: 0, interval: "monthly" },
  Medium: { maxDisk: 200, maxUpload: 10, price: 19, interval: "monthly" },
  Full: { maxDisk: 500, maxUpload: 20, price: 49, interval: "monthly" },
}
