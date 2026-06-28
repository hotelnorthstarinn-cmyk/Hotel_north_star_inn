import { createClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BedDouble, CalendarCheck, UtensilsCrossed } from "lucide-react"

export const metadata = {
  title: "Dashboard | Hotel North Star Inn Admin",
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { count: totalRooms } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })

  const { count: availableRooms } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })
    .eq("status", "available")

  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })

  const { count: activeBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "confirmed")

  const { count: menuItems } = await supabase
    .from("food_menu")
    .select("*", { count: "exact", head: true })

  const bookedCount = (totalRooms ?? 0) - (availableRooms ?? 0)

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Rooms</CardTitle>
            <BedDouble className="h-4 w-4 text-deep-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRooms ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Booked</CardTitle>
            <BedDouble className="h-4 w-4 text-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-crimson">{bookedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Available</CardTitle>
            <BedDouble className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{availableRooms ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Active Bookings</CardTitle>
            <CalendarCheck className="h-4 w-4 text-deep-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeBookings ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Bookings</CardTitle>
            <CalendarCheck className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBookings ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Menu Items</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{menuItems ?? 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
