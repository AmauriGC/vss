"use client"

import { useState } from "react"
import { RefreshCcw, Save } from "lucide-react"
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
import type { Plan } from "@/lib/types"
import {
  getAllPlanDefinitions,
  resetPlanCatalogToDefaults,
  updatePlanDefinition,
} from "@/lib/plan-catalog"
import { approvePlanRequest, getPlanRequests, rejectPlanRequest, users } from "@/lib/mock-data"

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

// Nota: isoAddDays se mantiene para compatibilidad futura.

export function AdminPlansPage() {
  const [, bumpPlansVersion] = useState(0)
  const planDefs = getAllPlanDefinitions()
  const planRequests = getPlanRequests()

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

  const refreshPlans = () => bumpPlansVersion((v) => v + 1)

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

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Planes</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo de planes (entidad Plan)
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Catálogo de planes</CardTitle>
            <CardDescription>
              Campos: nombre, status, precio, tamaño_disco_maximo.
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
                  <TableHead>nombre</TableHead>
                  <TableHead>status</TableHead>
                  <TableHead>precio</TableHead>
                  <TableHead>tamaño_disco_maximo (MB)</TableHead>
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
                            aria-label={`Status ${def.plan}`}
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
                            tamaño_disco_maximo
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
            El admin puede aprobar o rechazar solicitudes (compra/renovación/upgrade).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan_id</TableHead>
                  <TableHead>User_id</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Months</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No hay solicitudes.
                    </TableCell>
                  </TableRow>
                ) : (
                  planRequests.map((r) => {
                    const user = users.find((u) => u.id === r.userId)
                    const months = r.months ?? 1
                    const total = r.priceTotal ?? 0
                    const canAct = r.status === "Pending"

                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.requestedPlan}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {user?.id ?? r.userId}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{r.type}</TableCell>
                        <TableCell className="text-right">{months}</TableCell>
                        <TableCell className="text-right font-medium">{total}</TableCell>
                        <TableCell className="text-muted-foreground">{r.status}</TableCell>
                        <TableCell className="text-muted-foreground">{r.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                approvePlanRequest(r.id)
                                refreshPlans()
                              }}
                              disabled={!canAct}
                            >
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                rejectPlanRequest(r.id)
                                refreshPlans()
                              }}
                              disabled={!canAct}
                            >
                              Rechazar
                            </Button>
                          </div>
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
    </div>
  )
}
