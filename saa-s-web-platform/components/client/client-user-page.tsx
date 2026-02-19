"use client"

import { User, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { currentUser, deployments } from "@/lib/mock-data"
import { useNavigation } from "@/lib/navigation"
import { useTodayIsoDate } from "@/lib/use-today-iso-date"
import { getDerivedPlanStatus, getEffectiveDeploymentStatus } from "@/lib/plan-logic"
import { DeploymentStatusBadge } from "@/components/status-badge"

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  const nombre = parts[0] ?? ""
  const apellido = parts.slice(1).join(" ")
  return { nombre, apellido }
}

export function ClientUserPage() {
  const { selectDeployment } = useNavigation()
  const todayIsoDate = useTodayIsoDate()

  const { nombre, apellido } = splitName(currentUser.name)
  const derivedStatus = getDerivedPlanStatus(currentUser, todayIsoDate)
  const myDeployments = deployments.filter((d) => d.userId === currentUser.id)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mi usuario</h1>
          <p className="text-sm text-muted-foreground">Datos del usuario y despliegues</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <User className="h-5 w-5" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableBody>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableCell>{nombre}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Apellido</TableHead>
                  <TableCell>{apellido}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableCell className="font-mono text-xs">{currentUser.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableCell className="text-muted-foreground">{derivedStatus}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead>Plan_id</TableHead>
                  <TableCell className="text-muted-foreground">{currentUser.plan}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          {myDeployments.length === 0 ? (
            <div className="text-sm text-muted-foreground">No tienes despliegues.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {myDeployments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => selectDeployment(d.id)}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{d.domain}</div>
                      <div className="text-xs text-muted-foreground">
                        v{d.currentVersion} · {d.updatedAt}
                      </div>
                    </div>
                  </div>
                  <DeploymentStatusBadge
                    status={getEffectiveDeploymentStatus(d, currentUser, todayIsoDate)}
                  />
                </button>
              ))}
            </div>
          )}

          {myDeployments.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => selectDeployment(myDeployments[0].id)}>
                Ver detalles
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
