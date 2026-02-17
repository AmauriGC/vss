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
import { PlanBadge, PlanStatusBadge } from "@/components/status-badge"
import { users, deployments } from "@/lib/mock-data"
import { useNavigation } from "@/lib/navigation"

type ModalMode = "create" | "edit" | "view" | "delete" | null

export function AdminUsersPage() {
  const { selectUser } = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")

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
        setFormName(user.name)
        setFormEmail(user.email)
      }
    } else {
      setSelectedUserId(null)
      setFormName("")
      setFormEmail("")
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
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage platform users and their plans
          </p>
        </div>
        <Button onClick={() => openModal("create")}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">All Users</CardTitle>
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deployments</TableHead>
                <TableHead>Disk Usage</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PlanBadge plan={user.plan} />
                  </TableCell>
                  <TableCell>
                    <PlanStatusBadge status={user.planStatus} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.deploymentsCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.diskUsage} / {user.maxDisk} MB
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => selectUser(user.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openModal("edit", user.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => openModal("delete", user.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
              {modalMode === "create" ? "Create User" : "Edit User"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new user to the platform"
                : "Update user details"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Full Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Email</Label>
              <Input
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            {modalMode === "create" && (
              <p className="text-xs text-muted-foreground">
                New users are created with the BASIC plan and Active status. Plan upgrades and renewals are assigned by admin after payment confirmation.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={closeModal}>
              {modalMode === "create" ? "Create" : "Save Changes"}
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
                <PlanBadge plan={selectedUser.plan} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Disk Usage</p>
                  <p className="font-medium">
                    {selectedUser.diskUsage} / {selectedUser.maxDisk} MB
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">{selectedUser.createdAt}</p>
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
