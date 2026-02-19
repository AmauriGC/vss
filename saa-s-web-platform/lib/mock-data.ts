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

let __idSeq = 0

function nextId(prefix: string) {
  __idSeq = (__idSeq + 1) % 1_000_000
  return `${prefix}_${Date.now()}_${__idSeq}`
}

export type Plan_User = {
  id: string
  plan_id: Plan
  user_id: string
  fecha_compra: string
  fecha_expiracion: string
  total_months_bought: number
  price_total_months_bought: number
}

export const currentUser: User = {
  id: "u1",
  name: "Alex Rivera",
  email: "alex@example.com",
  role: "client",
  plan: "Basic",
  planStatus: "Active",
  planExpiresAt: null,
  createdAt: "2025-09-15",
  deploymentsCount: 1,
  diskUsage: 10,
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
    deploymentsCount: 1,
    diskUsage: 120,
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
    deploymentsCount: 1,
    diskUsage: 8,
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
    currentVersion: 1,
    diskUsage: 10,
    traffic: 12450,
    createdAt: "2025-10-01",
    updatedAt: "2026-02-10",
  },
  {
    id: "d4",
    userId: "u2",
    domain: "landing.vss.io",
    status: "Active",
    currentVersion: 1,
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
    currentVersion: 1,
    diskUsage: 120,
    traffic: 45000,
    createdAt: "2025-08-25",
    updatedAt: "2026-02-08",
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
    id: "d9",
    userId: "u5",
    domain: "personal.vss.io",
    status: "LimitExceeded",
    currentVersion: 1,
    diskUsage: 48,
    traffic: 300,
    createdAt: "2026-01-10",
    updatedAt: "2026-02-01",
  },
]

export const versions: Version[] = [
  { id: "v3", deploymentId: "d1", versionNumber: 1, fileName: "portfolio.zip", fileSize: 3.0, uploadedAt: "2026-02-10" },
  { id: "v9", deploymentId: "d4", versionNumber: 1, fileName: "landing.zip", fileSize: 2.2, uploadedAt: "2026-01-20" },
  { id: "v10", deploymentId: "d5", versionNumber: 1, fileName: "shop.zip", fileSize: 5.6, uploadedAt: "2026-02-08" },
  { id: "v11", deploymentId: "d7", versionNumber: 1, fileName: "resume.zip", fileSize: 1.1, uploadedAt: "2025-12-01" },
  { id: "v12", deploymentId: "d9", versionNumber: 1, fileName: "personal.zip", fileSize: 4.8, uploadedAt: "2026-02-01" },
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
    deploymentId: "d1",
    currentDomain: "portfolio.vss.io",
    requestedDomain: "myportfolio.vss.io",
    status: "Pending",
    createdAt: "2026-02-13",
  },
]

export const accessLogs: AccessLog[] = [
  { id: "al1", deploymentId: "d1", visitorIp: "203.0.113.42", timestamp: "2026-02-14T10:23:00Z", path: "/", action: "Page view", userAgent: "Chrome/120", country: "US" },
  { id: "al2", deploymentId: "d1", visitorIp: "198.51.100.17", timestamp: "2026-02-14T10:25:00Z", path: "/about", action: "Page view", userAgent: "Firefox/115", country: "UK" },
  { id: "al3", deploymentId: "d1", visitorIp: "203.0.113.42", timestamp: "2026-02-14T10:26:00Z", path: "/projects", action: "Page view", userAgent: "Chrome/120", country: "US" },
  { id: "al8", deploymentId: "d5", visitorIp: "198.51.100.55", timestamp: "2026-02-14T08:45:00Z", path: "/products", action: "Page view", userAgent: "Chrome/120", country: "US" },
  { id: "al9", deploymentId: "d5", visitorIp: "198.51.100.55", timestamp: "2026-02-14T08:46:00Z", path: "/cart", action: "Add to cart", userAgent: "Chrome/120", country: "US" },
  { id: "al12", deploymentId: "d1", visitorIp: "198.51.100.33", timestamp: "2026-02-13T22:10:00Z", path: "/contact", action: "Form submit", userAgent: "Chrome/120", country: "BR" },
  { id: "al13", deploymentId: "d4", visitorIp: "203.0.113.88", timestamp: "2026-02-13T18:45:00Z", path: "/", action: "Page view", userAgent: "Mobile Safari/17", country: "IN" },
  { id: "al14", deploymentId: "d7", visitorIp: "192.0.2.200", timestamp: "2026-02-13T16:20:00Z", path: "/", action: "Page view", userAgent: "Chrome/120", country: "KR" },
  { id: "al15", deploymentId: "d9", visitorIp: "198.51.100.120", timestamp: "2026-02-13T14:00:00Z", path: "/", action: "Page view", userAgent: "Postman/10", country: "US" },
]

export const planUsers: Plan_User[] = [
  {
    id: "pu1",
    plan_id: "Basic",
    user_id: "u1",
    fecha_compra: "2026-02-01",
    fecha_expiracion: "2026-03-01",
    total_months_bought: 1,
    price_total_months_bought: getPlanLimits("Basic").price * 1,
  },
  {
    id: "pu2",
    plan_id: "Full",
    user_id: "u3",
    fecha_compra: "2026-01-20",
    fecha_expiracion: "2026-02-20",
    total_months_bought: 1,
    price_total_months_bought: getPlanLimits("Full").price * 1,
  },
  {
    id: "pu3",
    plan_id: "Medium",
    user_id: "u4",
    fecha_compra: "2026-01-01",
    fecha_expiracion: "2026-02-01",
    total_months_bought: 1,
    price_total_months_bought: getPlanLimits("Medium").price * 1,
  },
]

export function getPlanUsersForUser(userId: string) {
  return planUsers
    .filter((p) => p.user_id === userId)
    .slice()
    .sort((a, b) => b.fecha_compra.localeCompare(a.fecha_compra))
}

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

function addMonthsIso(fromIso: string, months: number) {
  const d = new Date(`${fromIso}T00:00:00Z`)
  // Nota: JS ajusta automáticamente si el día no existe en el mes objetivo.
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

function isIsoExpired(expiresAt: string | null, todayIsoDate: string) {
  if (!expiresAt) return false
  return expiresAt <= todayIsoDate
}

function recomputeUserAggregates(todayIsoDate: string = isoToday()) {
  for (const user of users) {
    const userDeployments = deployments.filter((d) => d.userId === user.id)
    user.deploymentsCount = userDeployments.length
    user.diskUsage = userDeployments.reduce((acc, d) => acc + d.diskUsage, 0)

    const expired = isIsoExpired(user.planExpiresAt, todayIsoDate)
    const effectivePlan: Plan = expired ? "Basic" : user.plan
    user.maxDisk = getPlanLimits(effectivePlan).maxDisk
  }
}

function spliceInPlace<T>(target: T[], next: T[]) {
  target.splice(0, target.length, ...next)
}

export function replaceSingleDeploymentForUser(input: {
  userId: string
  domain: string
  zipFileName: string
  zipFileSizeMb: number
  createdAt?: string
}) {
  const nowIso = new Date().toISOString()
  const dateIso = input.createdAt || nowIso.slice(0, 10)

  const removedDeploymentIds = deployments
    .filter((d) => d.userId === input.userId)
    .map((d) => d.id)

  if (removedDeploymentIds.length > 0) {
    spliceInPlace(
      deployments,
      deployments.filter((d) => d.userId !== input.userId),
    )
    spliceInPlace(
      versions,
      versions.filter((v) => !removedDeploymentIds.includes(v.deploymentId)),
    )
    spliceInPlace(
      accessLogs,
      accessLogs.filter((l) => !removedDeploymentIds.includes(l.deploymentId)),
    )
    spliceInPlace(
      domainRequests,
      domainRequests.filter((r) => !removedDeploymentIds.includes(r.deploymentId)),
    )
    for (const id of removedDeploymentIds) {
      delete deploymentTrafficData[id]
    }
  }

  const newDeployment: Deployment = {
    id: nextId("d"),
    userId: input.userId,
    domain: input.domain,
    status: "Active",
    currentVersion: 1,
    diskUsage: +input.zipFileSizeMb.toFixed(2),
    traffic: 0,
    createdAt: dateIso,
    updatedAt: dateIso,
  }

  deployments.unshift(newDeployment)

  const newVersion: Version = {
    id: nextId("v"),
    deploymentId: newDeployment.id,
    versionNumber: 1,
    fileName: input.zipFileName,
    fileSize: +input.zipFileSizeMb.toFixed(2),
    uploadedAt: dateIso,
  }
  versions.unshift(newVersion)

  activityLogs.unshift({
    id: nextId("a"),
    userId: input.userId,
    action: removedDeploymentIds.length > 0 ? "Replaced deployment" : "Deployed",
    target: input.domain,
    timestamp: nowIso,
    ip: "client",
  })

  deploymentTrafficData[newDeployment.id] = []

  recomputeUserAggregates()
  return newDeployment
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

export function uploadNewVersionForDeployment(input: {
  deploymentId: string
  zipFileName: string
  zipFileSizeMb: number
  uploadedAt?: string
}) {
  const deployment = deployments.find((d) => d.id === input.deploymentId)
  if (!deployment) return null

  const nowIso = new Date().toISOString()
  const dateIso = input.uploadedAt || nowIso.slice(0, 10)

  const depVersions = versions.filter((v) => v.deploymentId === input.deploymentId)
  const nextVersionNumber =
    (depVersions.length ? Math.max(...depVersions.map((v) => v.versionNumber)) : 0) + 1

  const newVersion: Version = {
    id: nextId("v"),
    deploymentId: input.deploymentId,
    versionNumber: nextVersionNumber,
    fileName: input.zipFileName,
    fileSize: +input.zipFileSizeMb.toFixed(2),
    uploadedAt: dateIso,
  }

  versions.unshift(newVersion)
  deployment.currentVersion = nextVersionNumber
  deployment.diskUsage = +input.zipFileSizeMb.toFixed(2)
  deployment.updatedAt = dateIso

  activityLogs.unshift({
    id: nextId("a"),
    userId: deployment.userId,
    action: "Uploaded new version",
    target: deployment.domain,
    timestamp: nowIso,
    ip: "client",
  })

  recomputeUserAggregates()
  return newVersion
}

export function createPlanRequest(input: {
  userId: string
  type: PlanRequestType
  requestedPlan: Plan
  months?: number
  note?: string
}) {
  const months = Math.max(1, Math.floor(input.months ?? 1))
  const priceTotal = getPlanLimits(input.requestedPlan).price * months

  const req: PlanRequest = {
    id: nextId("pr"),
    userId: input.userId,
    type: input.type,
    requestedPlan: input.requestedPlan,
    status: "Pending",
    createdAt: isoToday(),
    months,
    priceTotal,
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

  const fecha_compra = isoToday()
  const months = Math.max(1, Math.floor(req.months ?? 1))
  const computedExpiresAt = addMonthsIso(fecha_compra, months)
  const priceTotal = req.priceTotal ?? getPlanLimits(req.requestedPlan).price * months

  planUsers.unshift({
    id: nextId("pu"),
    plan_id: req.requestedPlan,
    user_id: req.userId,
    fecha_compra,
    fecha_expiracion: computedExpiresAt,
    total_months_bought: months,
    price_total_months_bought: priceTotal,
  })

  user.plan = req.requestedPlan
  user.planStatus = "Active"
  user.planExpiresAt = opts?.expiresAt || computedExpiresAt

  reconcileDeploymentsForUser(user.id)
  recomputeUserAggregates()
}

export function rejectPlanRequest(requestId: string) {
  setPlanRequestStatus(requestId, "Rejected")
}

export function createDomainRequest(input: {
  deploymentId: string
  requestedSubdomain: string
}) {
  const deployment = deployments.find((d) => d.id === input.deploymentId)
  if (!deployment) throw new Error("Deployment not found")

  const cleaned = input.requestedSubdomain
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")

  if (!cleaned) throw new Error("Dominio inválido")

  const requestedDomain = `${cleaned}.vss.io`
  if (requestedDomain.toLowerCase() === deployment.domain.toLowerCase()) {
    throw new Error("El dominio solicitado es igual al actual")
  }

  const taken = new Set(
    deployments
      .filter((d) => d.id !== deployment.id)
      .map((d) => d.domain.toLowerCase()),
  )
  if (taken.has(requestedDomain.toLowerCase())) {
    throw new Error("El dominio ya está en uso")
  }

  const req: DomainRequest = {
    id: nextId("dr"),
    deploymentId: deployment.id,
    currentDomain: deployment.domain,
    requestedDomain,
    status: "Pending",
    createdAt: isoToday(),
  }

  domainRequests.unshift(req)
  return req
}

export const deploymentTrafficData: Record<string, TrafficEntry[]> = {
  d1: [
    { date: "Feb 8", visits: 120 }, { date: "Feb 9", visits: 145 }, { date: "Feb 10", visits: 200 },
    { date: "Feb 11", visits: 180 }, { date: "Feb 12", visits: 220 }, { date: "Feb 13", visits: 190 }, { date: "Feb 14", visits: 250 },
  ],
  d4: [
    { date: "Feb 8", visits: 40 }, { date: "Feb 9", visits: 55 }, { date: "Feb 10", visits: 48 },
    { date: "Feb 11", visits: 60 }, { date: "Feb 12", visits: 52 }, { date: "Feb 13", visits: 65 }, { date: "Feb 14", visits: 70 },
  ],
  d5: [
    { date: "Feb 8", visits: 380 }, { date: "Feb 9", visits: 420 }, { date: "Feb 10", visits: 395 },
    { date: "Feb 11", visits: 460 }, { date: "Feb 12", visits: 510 }, { date: "Feb 13", visits: 480 }, { date: "Feb 14", visits: 530 },
  ],
  d9: [
    { date: "Feb 8", visits: 12 }, { date: "Feb 9", visits: 8 }, { date: "Feb 10", visits: 15 },
    { date: "Feb 11", visits: 10 }, { date: "Feb 12", visits: 9 }, { date: "Feb 13", visits: 11 }, { date: "Feb 14", visits: 7 },
  ],
}

recomputeUserAggregates()

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
