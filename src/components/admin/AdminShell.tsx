"use client"

import { useState } from "react"
import { AdminSidebar } from "./AdminSidebar"
import { AdminHeader } from "./AdminHeader"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent className="p-0">
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <aside className="hidden md:flex md:h-screen md:w-56 md:flex-col md:border-r md:border-zinc-200 md:bg-white md:dark:border-zinc-800 md:dark:bg-zinc-950 lg:w-64">
        <AdminSidebar />
      </aside>

      <div className="flex flex-1 flex-col overflow-auto">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 bg-zinc-50 p-4 dark:bg-zinc-950 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
