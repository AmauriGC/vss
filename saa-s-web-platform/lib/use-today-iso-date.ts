"use client"

import { useSyncExternalStore } from "react"

let cachedTodayIsoDate: string | null = null

function subscribe() {
  return () => {}
}

function getClientSnapshot() {
  if (!cachedTodayIsoDate) {
    cachedTodayIsoDate = new Date().toISOString().slice(0, 10)
  }
  return cachedTodayIsoDate
}

function getServerSnapshot() {
  return null
}

export function useTodayIsoDate() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}
