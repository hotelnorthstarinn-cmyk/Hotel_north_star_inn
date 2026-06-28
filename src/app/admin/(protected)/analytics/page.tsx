import { createClient } from "@/lib/supabase-server"
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard"

export const metadata = { title: "Analytics | Hotel North Star Inn Admin" }

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const { data: revenue } = await supabase
    .rpc("monthly_revenue", { p_year: currentYear, p_month: currentMonth })

  const { count: activeGuests } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("checkin_status", "checked_in")

  const { count: totalRooms } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })

  const { count: availableRooms } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })
    .eq("status", "available")

  const { data: recentBills } = await supabase
    .from("bills")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .limit(5)

  const revenueData = (revenue as unknown as Array<{
    total_revenue: number; room_revenue: number; food_revenue: number; extra_revenue: number; expense_total: number
  }>)?.[0] ?? null

  return (
    <AnalyticsDashboard
      revenue={revenueData}
      activeGuests={activeGuests ?? 0}
      totalRooms={totalRooms ?? 0}
      availableRooms={availableRooms ?? 0}
      recentBills={recentBills ?? []}
      expenses={expenses ?? []}
    />
  )
}
