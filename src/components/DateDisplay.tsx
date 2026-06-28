"use client"

import { useDateFormat } from "@/lib/date-context"
import { formatDateWithBoth } from "@/lib/nepali-date"

export function DateDisplay({ date }: { date: string | Date }) {
  const { format: dateFormat } = useDateFormat()

  if (!date) return <span>—</span>

  if (dateFormat === "bs") {
    return <span>{formatDateWithBoth(date)}</span>
  }

  const d = new Date(date)
  const ad = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`
  return <span>{ad}</span>
}
