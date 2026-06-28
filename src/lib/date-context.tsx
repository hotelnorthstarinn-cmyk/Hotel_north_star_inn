"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type DateFormat = "ad" | "bs"

const DateContext = createContext<{
  format: DateFormat
  toggle: () => void
}>({ format: "ad", toggle: () => {} })

export function DateProvider({ children }: { children: ReactNode }) {
  const [format, setFormat] = useState<DateFormat>("ad")

  useEffect(() => {
    const stored = localStorage.getItem("admin-date-format") as DateFormat | null
    if (stored) setFormat(stored)
  }, [])

  function toggle() {
    setFormat((prev) => {
      const next = prev === "ad" ? "bs" : "ad"
      localStorage.setItem("admin-date-format", next)
      return next
    })
  }

  return (
    <DateContext.Provider value={{ format, toggle }}>
      {children}
    </DateContext.Provider>
  )
}

export function useDateFormat() {
  return useContext(DateContext)
}
