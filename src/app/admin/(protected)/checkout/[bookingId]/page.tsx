import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { CheckoutClient } from "@/components/admin/CheckoutClient"
import type { Booking, Bill, Order, Room } from "@/types"

export const metadata = { title: "Check Out | Hotel North Star Inn Admin" }

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, rooms(*)")
    .eq("id", bookingId)
    .single<Booking>()

  if (!booking || booking.checkin_status !== "checked_in") notFound()

  const { data: bills } = await supabase
    .from("bills")
    .select("*, bill_charges(*)")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, food_items:food_item_id(*))")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })

  const { data: menu } = await supabase
    .from("food_menu")
    .select("*")
    .order("name")

  return (
    <CheckoutClient
      booking={booking as Booking & { rooms?: Room }}
      bills={(bills ?? []) as Bill[]}
      orders={(orders ?? []) as Order[]}
      menu={menu ?? []}
    />
  )
}
