"use client"

import { NavigationProvider } from "@/lib/navigation"
import { VSSApp } from "@/components/vss-app"

export default function Page() {
  return (
    <NavigationProvider>
      <VSSApp />
    </NavigationProvider>
  )
}
