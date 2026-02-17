"use client"

import { useState } from "react"
import { CreditCard, RefreshCcw, Save, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { Plan } from "@/lib/types"
import {
  approvePlanRequest,
  getPlanRequests,
  rejectPlanRequest,
  users,
} from "@/lib/mock-data"
import {
  getAllPlanDefinitions,
  resetPlanCatalogToDefaults,
  updatePlanDefinition,
} from "@/lib/plan-catalog"

type PlanDraft = {
  enabled: boolean
  price: string
  maxDisk: string
  maxUpload: string
}

function clampNonNegativeInt(value: string) {
  const n = Number.parseInt(value, 10)
  if (Number.isNaN(n)) return 0
  return Math.max(0, n)
}

function isoAddDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function AdminPlansPage() {
  const [, bumpPlansVersion] = useState(0)
  const planDefs = getAllPlanDefinitions()

  const [drafts, setDrafts] = useState<Record<Plan, PlanDraft>>(() => {
    const initial = getAllPlanDefinitions()
    return initial.reduce(
      (acc, def) => {
        acc[def.plan] = {
          enabled: def.enabled,
          price: String(def.price),
          maxDisk: String(def.maxDisk),
          maxUpload: String(def.maxUpload),
        }
        return acc
      },
      {} as Record<Plan, PlanDraft>,
    )
  })

  const [, bumpRequestsVersion] = useState(0)
  const requests = getPlanRequests()

  const [approveOpen, setApproveOpen] = useState(false)
  const [approveRequestId, setApproveRequestId] = useState<string | null>(null)
  const [approveExpiresAt, setApproveExpiresAt] = useState<string>("")

  const pendingRequests = requests.filter((r) => r.status === "Pending")

  const refreshPlans = () => bumpPlansVersion((v) => v + 1)
  const refreshRequests = () => bumpRequestsVersion((v) => v + 1)

  const resetDefaults = () => {
    resetPlanCatalogToDefaults()
    const latest = getAllPlanDefinitions()
    setDrafts(
      latest.reduce(
        (acc, def) => {
          acc[def.plan] = {
            enabled: def.enabled,
            price: String(def.price),
            maxDisk: String(def.maxDisk),
            maxUpload: String(def.maxUpload),
          }
          return acc
        },
        {} as Record<Plan, PlanDraft>,
      ),
    )
    refreshPlans()
  }

  const savePlans = () => {
    ;(Object.keys(drafts) as Plan[]).forEach((plan) => {
      const draft = drafts[plan]
      updatePlanDefinition(plan, {
        enabled: draft.enabled,
        price: clampNonNegativeInt(draft.price),
        maxDisk: clampNonNegativeInt(draft.maxDisk),
        maxUpload: clampNonNegativeInt(draft.maxUpload),
      })
    })
    refreshPlans()
  }

  const openApprove = (requestId: string) => {
    setApproveRequestId(requestId)
    setApproveExpiresAt(isoAddDays(30))
    setApproveOpen(true)
  }

  const confirmApprove = () => {
    if (!approveRequestId) return
    approvePlanRequest(approveRequestId, {
      expiresAt: approveExpiresAt || undefined,
    })
    setApproveOpen(false)
    setApproveRequestId(null)
    refreshRequests()
  }

  const doReject = (requestId: string) => {
    rejectPlanRequest(requestId)
    refreshRequests()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Planes</h1>
        <p className="text-sm text-muted-foreground">
          Configuración del catálogo y aprobación de solicitudes (suscripciones mensuales)
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Catálogo de planes</CardTitle>
            <CardDescription>
              Edita límites y precios. Estos valores se usan para el cálculo de límites efectivos.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetDefaults}>
              <RefreshCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={savePlans}>
              <Save className="h-4 w-4" />
              Guardar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Precio (mes)</TableHead>
                  <TableHead>Max disk (MB)</TableHead>
                  <TableHead>Max upload (MB)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planDefs.map((def) => {
                  const draft = drafts[def.plan]
                  return (
                    <TableRow key={def.plan}>
                      <TableCell className="font-medium">{def.plan}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={draft.enabled}
                            onCheckedChange={(checked) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [def.plan]: { ...prev[def.plan], enabled: checked },
                              }))
                            }
                            aria-label={`Enable ${def.plan}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[140px]">
                          <Label className="sr-only" htmlFor={`price-${def.plan}`}>
                            Precio
                          </Label>
                          <Input
                            id={`price-${def.plan}`}
                            inputMode="numeric"
                            value={draft.price}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [def.plan]: { ...prev[def.plan], price: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[160px]">
                          <Label className="sr-only" htmlFor={`maxDisk-${def.plan}`}>
                            Max disk
                          </Label>
                          <Input
                            id={`maxDisk-${def.plan}`}
                            inputMode="numeric"
                            value={draft.maxDisk}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [def.plan]: { ...prev[def.plan], maxDisk: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[160px]">
                          <Label className="sr-only" htmlFor={`maxUpload-${def.plan}`}>
                            Max upload
                          </Label>
                          <Input
                            id={`maxUpload-${def.plan}`}
                            inputMode="numeric"
                            value={draft.maxUpload}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [def.plan]: { ...prev[def.plan], maxUpload: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de plan</CardTitle>
          <CardDescription>
            Pendientes: {pendingRequests.length}. Aprobar asigna/renueva y setea expiración.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      Sin solicitudes todavía
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((r) => {
                    const reqUser = users.find((u) => u.id === r.userId)
                    return (
                      <TableRow key={r.id}>
                        <TableCell>{r.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {reqUser?.role === "admin" ? (
                              <Shield className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{reqUser?.name || r.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell>{r.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span>{r.requestedPlan}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[320px]">
                          <span className="line-clamp-2 text-sm text-muted-foreground">
                            {r.note || "—"}
                          </span>
                        </TableCell>
                        <TableCell>{r.status}</TableCell>
                        <TableCell className="text-right">
                          {r.status === "Pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" onClick={() => openApprove(r.id)}>
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => doReject(r.id)}
                              >
                                Rechazar
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar solicitud</DialogTitle>
            <DialogDescription>
              Se asigna el plan solicitado y se activa el estado.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Expira el</Label>
              <Input
                id="expiresAt"
                type="date"
                value={approveExpiresAt}
                onChange={(e) => setApproveExpiresAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Formato YYYY-MM-DD (por defecto hoy + 30 días)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmApprove}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
