"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingCart, DollarSign, UserCheck } from "lucide-react"

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/checkins", label: "Check-ins", icon: UserCheck },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/bills", label: "Bills & Dues", icon: DollarSign },
]

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:w-64">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800 lg:px-6">
        <Link href="/admin/checkins" className="text-base font-bold tracking-tight lg:text-lg">
          Hotel <span className="text-crimson">North Star</span>{" "}
          <span className="text-deep-blue">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 lg:p-4">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === link.href || (link.href === "/admin/dashboard" && pathname === "/admin")
                ? "bg-deep-blue/10 text-deep-blue dark:bg-deep-blue/20 dark:text-deep-blue-light"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
