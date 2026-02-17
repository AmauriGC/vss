"use client"

import { CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigation } from "@/lib/navigation"

export function ExpiredPlanMessageScreen() {
  const { navigate } = useNavigation()

  return (
    <div className="min-h-[calc(100vh-0px)] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-5 w-5" />
            </span>
            Subscription Required
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            This site is currently unavailable because the owner’s plan is expired.
            If you manage this site, sign in to renew and restore access.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => navigate("login")}>
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
