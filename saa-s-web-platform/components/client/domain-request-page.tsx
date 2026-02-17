"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DomainStatusBadge } from "@/components/status-badge"
import { deployments, domainRequests, currentUser } from "@/lib/mock-data"

export function DomainRequestPage() {
  const userDeployments = deployments.filter((d) => d.userId === currentUser.id)
  const [selectedDeployment, setSelectedDeployment] = useState("")
  const [newDomain, setNewDomain] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDeployment && newDomain) {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setSelectedDeployment("")
        setNewDomain("")
      }, 2000)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Domain Requests</h1>
        <p className="text-sm text-muted-foreground">
          Request a domain change for your deployments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Domain Request</CardTitle>
          <CardDescription>
            Submit a request to change the domain of one of your deployments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Deployment</Label>
              <Select value={selectedDeployment} onValueChange={setSelectedDeployment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a deployment" />
                </SelectTrigger>
                <SelectContent>
                  {userDeployments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-domain">New Domain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-domain"
                  placeholder="new-domain"
                  value={newDomain}
                  onChange={(e) =>
                    setNewDomain(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                    )
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.vss.io</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!selectedDeployment || !newDomain || submitted}
              className="self-end"
            >
              {submitted ? (
                "Request Submitted!"
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request History</CardTitle>
        </CardHeader>
        <CardContent>
          {domainRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No domain requests yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Current Domain</TableHead>
                  <TableHead>Requested Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domainRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-sm">
                      {req.currentDomain}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {req.requestedDomain}
                    </TableCell>
                    <TableCell>
                      <DomainStatusBadge status={req.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {req.createdAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
