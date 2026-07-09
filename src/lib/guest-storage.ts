"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react"
import type { GuestInfo } from "@/types"

const STORAGE_KEY = "northstar_guest"

export function useGuestInfo() {
  const [guest, setGuest] = useState<GuestInfo | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setGuest(JSON.parse(stored))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const saveGuest = useCallback((info: GuestInfo) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info))
    setGuest(info)
  }, [])

  const clearGuest = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setGuest(null)
  }, [])

  return { guest, saveGuest, clearGuest }
}
