import type {
  User,
  Deployment,
  Version,
  ActivityLog,
  TrafficEntry,
  DomainRequest,
  AccessLog,
  PlanRequest,
  PlanRequestStatus,
  PlanRequestType,
  Plan,
} from "./types"
import { getPlanLimits } from "./plan-catalog"

export const currentUser: User = {
  id: "u1",
  name: "Alex Rivera",
  email: "alex@example.com",
  role: "client",
  plan: "Basic",
  planStatus: "Active",
  planExpiresAt: null,
  createdAt: "2025-09-15",
  deploymentsCount: 3,
  diskUsage: 28,
  maxDisk: 50,
}

export const adminUser: User = {
  id: "u0",
  name: "Sarah Chen",
  email: "sarah@vss.io",
  role: "admin",
  plan: "Full",
  planStatus: "Active",
  planExpiresAt: null,
  createdAt: "2025-01-01",
  deploymentsCount: 0,
  diskUsage: 0,
  maxDisk: 500,
}

export const users: User[] = [
  currentUser,
  {
    id: "u2",
    name: "Jordan Lee",
    email: "jordan@example.com",
    role: "client",
    plan: "Basic",
    planStatus: "Active",
    planExpiresAt: null,
    createdAt: "2025-10-02",
    deploymentsCount: 1,
    diskUsage: 12,
    maxDisk: 50,
  },
  {
    id: "u3",
    name: "Morgan Patel",
    email: "morgan@example.com",
    role: "client",
    plan: "Full",
    planStatus: "Active",
    planExpiresAt: "2026-04-20",
    createdAt: "2025-08-20",
    deploymentsCount: 5,
    diskUsage: 310,
    maxDisk: 500,
  },
  {
    id: "u4",
    name: "Casey Nguyen",
    email: "casey@example.com",
    role: "client",
    plan: "Medium",
    planStatus: "Expired",
    planExpiresAt: "2026-02-01",
    createdAt: "2025-11-10",
    deploymentsCount: 2,
    diskUsage: 45,
    maxDisk: 200,
  },
  {
    id: "u5",
    name: "Taylor Brooks",
    email: "taylor@example.com",
    role: "client",
    plan: "Basic",
    planStatus: "Suspended",
    planExpiresAt: null,
    createdAt: "2026-01-05",
    deploymentsCount: 1,
    diskUsage: 48,
    maxDisk: 50,
  },
]

export const deployments: Deployment[] = [
  {
    id: "d1",
    userId: "u1",
    domain: "portfolio.vss.io",
    status: "Active",
    currentVersion: 3,
    diskUsage: 10,
    traffic: 12450,
    createdAt: "2025-10-01",
    updatedAt: "2026-02-10",
  },
  {
    id: "d2",
    userId: "u1",
    domain: "docs.vss.io",
    status: "Active",
    currentVersion: 1,
    diskUsage: 8,
    traffic: 3200,
    createdAt: "2025-11-15",
    updatedAt: "2025-11-15",
  },
  {
    id: "d3",
    userId: "u1",
    domain: "blog.vss.io",
    status: "Updating",
    currentVersion: 5,
    diskUsage: 10,
    traffic: 8900,
    createdAt: "2025-09-20",
    updatedAt: "2026-02-12",
  },
  {
    id: "d4",
    userId: "u2",
    domain: "landing.vss.io",
    status: "Active",
    currentVersion: 2,
    diskUsage: 12,
    traffic: 1500,
    createdAt: "2025-10-10",
    updatedAt: "2026-01-20",
  },
  {
    id: "d5",
    userId: "u3",
    domain: "shop.vss.io",
    status: "Error",
    currentVersion: 4,
    diskUsage: 120,
    traffic: 45000,
    createdAt: "2025-08-25",
    updatedAt: "2026-02-08",
  },
  {
    id: "d6",
    userId: "u3",
    domain: "api-docs.vss.io",
    status: "Active",
    currentVersion: 2,
    diskUsage: 55,
    traffic: 22000,
    createdAt: "2025-09-05",
    updatedAt: "2026-01-30",
  },
  {
    id: "d7",
    userId: "u4",
    domain: "resume.vss.io",
    status: "PlanExpired",
    currentVersion: 1,
    diskUsage: 8,
    traffic: 750,
    createdAt: "2025-12-01",
    updatedAt: "2025-12-01",
  },
  {
    id: "d8",
    userId: "u3",
    domain: "gallery.vss.io",
    status: "Active",
    currentVersion: 3,
    diskUsage: 85,
    traffic: 15000,
    createdAt: "2025-10-15",
    updatedAt: "2026-02-05",
  },
  {
    id: "d9",
    userId: "u5",
    domain: "personal.vss.io",
    status: "LimitExceeded",
    currentVersion: 2,
    diskUsage: 48,
    traffic: 300,
    createdAt: "2026-01-10",
    updatedAt: "2026-02-01",
  },
  {
    id: "d10",
    userId: "u4",
    domain: "project.vss.io",
    status: "Suspended",
    currentVersion: 3,
    diskUsage: 37,
    traffic: 2100,
    createdAt: "2025-11-20",
    updatedAt: "2026-01-15",
  },
]

export const versions: Version[] = [
  { id: "v1", deploymentId: "d1", versionNumber: 1, fileName: "portfolio-v1.zip", fileSize: 2.1, uploadedAt: "2025-10-01" },
  { id: "v2", deploymentId: "d1", versionNumber: 2, fileName: "portfolio-v2.zip", fileSize: 2.4, uploadedAt: "2025-12-15" },
  { id: "v3", deploymentId: "d1", versionNumber: 3, fileName: "portfolio-v3.zip", fileSize: 3.0, uploadedAt: "2026-02-10" },
  { id: "v4", deploymentId: "d3", versionNumber: 1, fileName: "blog-v1.zip", fileSize: 1.8, uploadedAt: "2025-09-20" },
  { id: "v5", deploymentId: "d3", versionNumber: 2, fileName: "blog-v2.zip", fileSize: 2.0, uploadedAt: "2025-10-10" },
  { id: "v6", deploymentId: "d3", versionNumber: 3, fileName: "blog-v3.zip", fileSize: 2.5, uploadedAt: "2025-11-20" },
  { id: "v7", deploymentId: "d3", versionNumber: 4, fileName: "blog-v4.zip", fileSize: 2.8, uploadedAt: "2026-01-05" },
  { id: "v8", deploymentId: "d3", versionNumber: 5, fileName: "blog-v5.zip", fileSize: 3.2, uploadedAt: "2026-02-12" },
]

export const activityLogs: ActivityLog[] = [
  { id: "a1", userId: "u1", action: "Deployed", target: "portfolio.vss.io", timestamp: "2026-02-10T14:30:00Z", ip: "192.168.1.100" },
  { id: "a2", userId: "u1", action: "Updated version", target: "blog.vss.io", timestamp: "2026-02-12T09:15:00Z", ip: "192.168.1.100" },
  { id: "a3", userId: "u1", action: "Created deployment", target: "docs.vss.io", timestamp: "2025-11-15T16:45:00Z", ip: "192.168.1.100" },
  { id: "a4", userId: "u2", action: "Deployed", target: "landing.vss.io", timestamp: "2026-01-20T11:00:00Z", ip: "10.0.0.55" },
  { id: "a5", userId: "u3", action: "Error occurred", target: "shop.vss.io", timestamp: "2026-02-08T22:10:00Z", ip: "172.16.0.12" },
  { id: "a6", userId: "u3", action: "Deployed", target: "gallery.vss.io", timestamp: "2026-02-05T08:30:00Z", ip: "172.16.0.12" },
  { id: "a7", userId: "u4", action: "Created deployment", target: "resume.vss.io", timestamp: "2025-12-01T13:20:00Z", ip: "10.0.0.88" },
  { id: "a8", userId: "u1", action: "Domain change request", target: "blog.vss.io", timestamp: "2026-02-13T10:00:00Z", ip: "192.168.1.100" },
  { id: "a9", userId: "u0", action: "Plan changed", target: "Casey Nguyen -> Medium", timestamp: "2025-11-10T08:00:00Z", ip: "10.0.0.1" },
  { id: "a10", userId: "u0", action: "Suspended deployment", target: "resume.vss.io", timestamp: "2026-02-01T00:00:00Z", ip: "system" },
  { id: "a11", userId: "u4", action: "Renewal requested", target: "Medium Plan", timestamp: "2026-02-10T14:00:00Z", ip: "10.0.0.88" },
  { id: "a12", userId: "u0", action: "Plan expired (auto)", target: "Casey Nguyen", timestamp: "2026-02-01T00:00:00Z", ip: "system" },
]

export const trafficData: TrafficEntry[] = [
  { date: "Jan 1", visits: 320 },
  { date: "Jan 8", visits: 450 },
  { date: "Jan 15", visits: 380 },
  { date: "Jan 22", visits: 520 },
  { date: "Jan 29", visits: 610 },
  { date: "Feb 1", visits: 580 },
  { date: "Feb 5", visits: 720 },
  { date: "Feb 8", visits: 690 },
  { date: "Feb 10", visits: 850 },
  { date: "Feb 12", visits: 920 },
  { date: "Feb 13", visits: 780 },
  { date: "Feb 14", visits: 1050 },
]

export const domainRequests: DomainRequest[] = [
  {
    id: "dr1",
    deploymentId: "d3",
    currentDomain: "blog.vss.io",
    requestedDomain: "myblog.vss.io",
    status: "Pending",
    createdAt: "2026-02-13",
  },
]

export const accessLogs: AccessLog[] = [
  { id: "al1", deploymentId: "d1", visitorIp: "203.0.113.42", timestamp: "2026-02-14T10:23:00Z", path: "/", action: "Page view", userAgent: "Chrome/120", country: "US" },
  { id: "al2", deploymentId: "d1", visitorIp: "198.51.100.17", timestamp: "2026-02-14T10:25:00Z", path: "/about", action: "Page view", userAgent: "Firefox/115", country: "UK" },
  { id: "al3", deploymentId: "d1", visitorIp: "203.0.113.42", timestamp: "2026-02-14T10:26:00Z", path: "/projects", action: "Page view", userAgent: "Chrome/120", country: "US" },
  { id: "al4", deploymentId: "d2", visitorIp: "192.0.2.89", timestamp: "2026-02-14T11:00:00Z", path: "/docs/getting-started", action: "Page view", userAgent: "Safari/17", country: "DE" },
  { id: "al5", deploymentId: "d2", visitorIp: "192.0.2.89", timestamp: "2026-02-14T11:02:00Z", path: "/docs/api-reference", action: "Page view", userAgent: "Safari/17", country: "DE" },
  { id: "al6", deploymentId: "d3", visitorIp: "198.51.100.200", timestamp: "2026-02-14T09:15:00Z", path: "/", action: "Page view", userAgent: "Chrome/120", country: "FR" },
  { id: "al7", deploymentId: "d3", visitorIp: "203.0.113.100", timestamp: "2026-02-14T09:30:00Z", path: "/post/hello-world", action: "Page view", userAgent: "Edge/120", country: "JP" },
  { id: "al8", deploymentId: "d5", visitorIp: "198.51.100.55", timestamp: "2026-02-14T08:45:00Z", path: "/products", action: "Page view", userAgent: "Chrome/120", country: "US" },
  { id: "al9", deploymentId: "d5", visitorIp: "198.51.100.55", timestamp: "2026-02-14T08:46:00Z", path: "/cart", action: "Add to cart", userAgent: "Chrome/120", country: "US" },
  { id: "al10", deploymentId: "d6", visitorIp: "203.0.113.75", timestamp: "2026-02-14T12:00:00Z", path: "/v1/endpoints", action: "Page view", userAgent: "Firefox/115", country: "CA" },
  { id: "al11", deploymentId: "d8", visitorIp: "192.0.2.150", timestamp: "2026-02-14T07:30:00Z", path: "/gallery/landscape", action: "Page view", userAgent: "Safari/17", country: "AU" },
  { id: "al12", deploymentId: "d1", visitorIp: "198.51.100.33", timestamp: "2026-02-13T22:10:00Z", path: "/contact", action: "Form submit", userAgent: "Chrome/120", country: "BR" },
  { id: "al13", deploymentId: "d1", visitorIp: "203.0.113.88", timestamp: "2026-02-13T18:45:00Z", path: "/", action: "Page view", userAgent: "Mobile Safari/17", country: "IN" },
  { id: "al14", deploymentId: "d3", visitorIp: "192.0.2.200", timestamp: "2026-02-13T16:20:00Z", path: "/post/react-tips", action: "Page view", userAgent: "Chrome/120", country: "KR" },
  { id: "al15", deploymentId: "d6", visitorIp: "198.51.100.120", timestamp: "2026-02-13T14:00:00Z", path: "/v1/auth", action: "Page view", userAgent: "Postman/10", country: "US" },
]

let planRequests: PlanRequest[] = []

export function getPlanRequests() {
  return planRequests
}

export function getPlanRequestsForUser(userId: string) {
  return planRequests.filter((r) => r.userId === userId)
}

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

function addDaysIso(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function isIsoExpired(expiresAt: string | null, todayIsoDate: string) {
  if (!expiresAt) return false
  return expiresAt <= todayIsoDate
}

export function reconcileDeploymentsForUser(userId: string, todayIsoDate: string = isoToday()) {
  const user = users.find((u) => u.id === userId)
  if (!user) return

  const expired = isIsoExpired(user.planExpiresAt, todayIsoDate)
  const limitsPlan: Plan = expired ? "Basic" : user.plan
  const maxDisk = getPlanLimits(limitsPlan).maxDisk

  deployments
    .filter((d) => d.userId === userId)
    .forEach((d) => {
      if (expired) {
        d.status = "PlanExpired"
        return
      }

      if (d.diskUsage > maxDisk) {
        d.status = "LimitExceeded"
        return
      }

      // Restore only plan-driven statuses.
      if (d.status === "PlanExpired" || d.status === "LimitExceeded") {
        d.status = "Active"
      }
    })
}

export function createPlanRequest(input: {
  userId: string
  type: PlanRequestType
  requestedPlan: Plan
  note?: string
}) {
  const req: PlanRequest = {
    id: `pr_${Date.now()}`,
    userId: input.userId,
    type: input.type,
    requestedPlan: input.requestedPlan,
    status: "Pending",
    createdAt: isoToday(),
    note: input.note,
  }

  planRequests = [req, ...planRequests]
  return req
}

export function setPlanRequestStatus(requestId: string, status: PlanRequestStatus) {
  planRequests = planRequests.map((r) => (r.id === requestId ? { ...r, status } : r))
}

export function approvePlanRequest(requestId: string, opts?: { expiresAt?: string }) {
  const req = planRequests.find((r) => r.id === requestId)
  if (!req) return

  setPlanRequestStatus(requestId, "Approved")

  const user = users.find((u) => u.id === req.userId)
  if (!user) return

  user.plan = req.requestedPlan
  user.planStatus = "Active"
  user.planExpiresAt = opts?.expiresAt || addDaysIso(30)

  reconcileDeploymentsForUser(user.id)
}

export function rejectPlanRequest(requestId: string) {
  setPlanRequestStatus(requestId, "Rejected")
}

export const deploymentTrafficData: Record<string, TrafficEntry[]> = {
  d1: [
    { date: "Feb 8", visits: 120 }, { date: "Feb 9", visits: 145 }, { date: "Feb 10", visits: 200 },
    { date: "Feb 11", visits: 180 }, { date: "Feb 12", visits: 220 }, { date: "Feb 13", visits: 190 }, { date: "Feb 14", visits: 250 },
  ],
  d2: [
    { date: "Feb 8", visits: 40 }, { date: "Feb 9", visits: 55 }, { date: "Feb 10", visits: 48 },
    { date: "Feb 11", visits: 60 }, { date: "Feb 12", visits: 52 }, { date: "Feb 13", visits: 65 }, { date: "Feb 14", visits: 70 },
  ],
  d3: [
    { date: "Feb 8", visits: 80 }, { date: "Feb 9", visits: 110 }, { date: "Feb 10", visits: 95 },
    { date: "Feb 11", visits: 130 }, { date: "Feb 12", visits: 150 }, { date: "Feb 13", visits: 120 }, { date: "Feb 14", visits: 160 },
  ],
}

export const globalStats = {
  totalUsers: users.filter((u) => u.role === "client").length,
  totalDeployments: deployments.length,
  totalStorageUsed: deployments.reduce((acc, d) => acc + d.diskUsage, 0),
  totalTraffic: deployments.reduce((acc, d) => acc + d.traffic, 0),
  planDistribution: {
    Basic: users.filter((u) => u.plan === "Basic" && u.role === "client").length,
    Medium: users.filter((u) => u.plan === "Medium" && u.role === "client").length,
    Full: users.filter((u) => u.plan === "Full" && u.role === "client").length,
  },
  activePlans: users.filter((u) => u.planStatus === "Active" && u.role === "client").length,
  expiredPlans: users.filter((u) => u.planStatus === "Expired" && u.role === "client").length,
  suspendedPlans: users.filter((u) => u.planStatus === "Suspended" && u.role === "client").length,
}
