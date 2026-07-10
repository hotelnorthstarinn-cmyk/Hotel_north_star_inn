import { createClient } from "@/lib/supabase-server"
import { CheckinManager } from "@/components/admin/CheckinManager"

export const metadata = { title: "Check-ins | Hotel North Star Inn Admin" }

export default async function AdminCheckinsPage() {
  const supabase = await createClient()

  let activeBookings: any[] = []
  let pendingBookings: any[] = []
  let rooms: any[] = []
  let pageError: string | null = null

  try {
    const [active, pending, roomsResult] = await Promise.all([
      supabase
        .from("bookings")
        .select("*, rooms(name, room_code, price)")
        .eq("checkin_status", "checked_in")
        .order("checkin_time", { ascending: false }),
      supabase
        .from("bookings")
        .select("*, rooms(name, room_code, price)")
        .eq("checkin_status", "pending")
        .in("status", ["confirmed"])
        .order("check_in", { ascending: true }),
      supabase
        .from("rooms")
        .select("*")
        .eq("status", "available")
        .order("name"),
    ])

    activeBookings = active.data ?? []
    pendingBookings = pending.data ?? []
    rooms = roomsResult.data ?? []
  } catch (err) {
    console.error("AdminCheckinsPage error:", err)
    pageError = err instanceof Error ? err.message : "Unknown error loading page data"
  }

  if (pageError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-bold text-red-600">Error Loading Check-ins</h2>
        <p className="mt-2 text-zinc-500">{pageError}</p>
      </div>
    )
  }

  return (
    <CheckinManager
      activeBookings={activeBookings}
      pendingBookings={pendingBookings}
      rooms={rooms}
    />
  )
}
