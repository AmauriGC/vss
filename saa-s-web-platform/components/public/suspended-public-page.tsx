"use client"

import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigation } from "@/lib/navigation"

export function SuspendedPublicPage() {
  const { navigate } = useNavigation()

  return (
    <div className="min-h-[calc(100vh-0px)] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <AlertTriangle className="h-5 w-5" />
            </span>
            Site Suspended
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            This site is temporarily unavailable due to an administrative suspension.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => navigate("login")}>
              Site owner login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
