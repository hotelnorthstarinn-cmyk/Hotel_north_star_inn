import { createClient } from "@/lib/supabase-server"
import { CheckinManager } from "@/components/admin/CheckinManager"

export const metadata = { title: "Check-ins | Hotel North Star Inn Admin" }

export default async function AdminCheckinsPage() {
  const supabase = await createClient()

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

  return (
    <CheckinManager
      activeBookings={active.data ?? []}
      pendingBookings={pending.data ?? []}
      rooms={roomsResult.data ?? []}
    />
  )
}
