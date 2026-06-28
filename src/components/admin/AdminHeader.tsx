"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Menu, BedDouble, UtensilsCrossed, BarChart3, Download, LogOut, Calendar } from "lucide-react"
import { adminLogout } from "@/lib/actions"
import { useDateFormat } from "@/lib/date-context"

const dropdownLinks = [
  { href: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { href: "/admin/menu", label: "Food Menu", icon: UtensilsCrossed },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/export", label: "Export Data", icon: Download },
]

export function AdminHeader() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { format, toggle } = useDateFormat()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div className="flex h-14 items-center justify-end gap-2 border-b bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 lg:px-6">
      <button
        onClick={toggle}
        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        title="Toggle date format"
      >
        <Calendar className="h-4 w-4" />
        <span className="text-xs font-semibold">{format === "bs" ? "BS" : "AD"}</span>
      </button>

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Menu className="h-4 w-4" />
          <span>More</span>
        </button>
        {open && (
          <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            {dropdownLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <div className="border-t border-zinc-200 dark:border-zinc-700" />
            <form action={adminLogout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
