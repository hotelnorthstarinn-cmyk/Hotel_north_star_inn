import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { PrintableBill } from "@/components/PrintableBill"
import type { Bill, Booking } from "@/types"

export const metadata = { title: "Bill | Hotel North Star Inn" }

export default async function BillPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, rooms(name, room_code, price)")
    .eq("id", bookingId)
    .single<Booking>()

  if (!booking) notFound()

  const { data: bills } = await supabase
    .from("bills")
    .select("*, bill_charges(*)")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })

  return (
    <PrintableBill
      booking={booking}
      bills={(bills ?? []) as unknown as Bill[]}
    />
  )
}
