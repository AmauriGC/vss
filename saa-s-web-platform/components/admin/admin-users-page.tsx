"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { users, deployments } from "@/lib/mock-data"
import { useNavigation } from "@/lib/navigation"
import type { Plan, PlanStatus } from "@/lib/types"

type ModalMode = "create" | "edit" | "view" | "delete" | null

function splitFullName(fullName: string): { nombre: string; apellido: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { nombre: "", apellido: "" }
  if (parts.length === 1) return { nombre: parts[0], apellido: "" }
  return { nombre: parts[0], apellido: parts.slice(1).join(" ") }
}

export function AdminUsersPage() {
  const { selectUser } = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [formNombre, setFormNombre] = useState("")
  const [formApellido, setFormApellido] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formConfirmPassword, setFormConfirmPassword] = useState("")
  const [formStatus, setFormStatus] = useState<PlanStatus>("Active")
  const [formPlanId, setFormPlanId] = useState<Plan>("Basic")

  const filteredUsers = users.filter(
    (u) =>
      u.role === "client" &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const selectedUser = users.find((u) => u.id === selectedUserId)

  const openModal = (mode: ModalMode, userId?: string) => {
    setModalMode(mode)
    if (userId) {
      setSelectedUserId(userId)
      const user = users.find((u) => u.id === userId)
      if (user) {
        const split = splitFullName(user.name)
        setFormNombre(split.nombre)
        setFormApellido(split.apellido)
        setFormEmail(user.email)
        setFormStatus(user.planStatus)
        setFormPlanId(user.plan)
        setFormPassword("")
        setFormConfirmPassword("")
      }
    } else {
      setSelectedUserId(null)
      setFormNombre("")
      setFormApellido("")
      setFormEmail("")
      setFormPassword("")
      setFormConfirmPassword("")
      setFormStatus("Active")
      setFormPlanId("Basic")
    }
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedUserId(null)
  }

  const userDeployments = selectedUserId
    ? deployments.filter((d) => d.userId === selectedUserId)
    : []

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Entidad Usuario</p>
        </div>
        <Button onClick={() => openModal("create")}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Usuarios</CardTitle>
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan_id</TableHead>
                <TableHead>Deployments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const split = splitFullName(user.name)

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{split.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{split.apellido || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">{user.planStatus}</TableCell>
                    <TableCell className="text-muted-foreground">{user.plan}</TableCell>
                    <TableCell className="text-muted-foreground">{user.deploymentsCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => selectUser(user.id)}
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openModal("edit", user.id)}
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openModal("delete", user.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog
        open={modalMode === "create" || modalMode === "edit"}
        onOpenChange={closeModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" ? "Crear usuario" : "Editar usuario"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Campos del usuario"
                : "Actualizar campos del usuario"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Nombre</Label>
                <Input
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Apellido</Label>
                <Input
                  value={formApellido}
                  onChange={(e) => setFormApellido(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Email</Label>
              <Input
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={closeModal}>
              {modalMode === "create" ? "Crear" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={modalMode === "view"} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedUser.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {(() => {
                  const split = splitFullName(selectedUser.name)
                  return (
                    <>
                      <div>
                        <p className="text-muted-foreground">Nombre</p>
                        <p className="font-medium">{split.nombre}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Apellido</p>
                        <p className="font-medium">{split.apellido || "—"}</p>
                      </div>
                    </>
                  )
                })()}
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{selectedUser.planStatus}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan_id</p>
                  <p className="font-medium">{selectedUser.plan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Password</p>
                  <p className="font-medium">••••••••</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Confirm_Password</p>
                  <p className="font-medium">••••••••</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deployments</p>
                  <p className="font-medium">{selectedUser.deploymentsCount}</p>
                </div>
              </div>
              {userDeployments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Deployments</p>
                  <div className="flex flex-col gap-2">
                    {userDeployments.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between rounded-md border p-2 text-sm"
                      >
                        <span className="font-mono">{d.domain}</span>
                        <span className="text-muted-foreground">{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={modalMode === "delete"} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedUser?.name}</span>? This
              action cannot be undone and all their deployments will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={closeModal}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
