import { createClient } from "@/lib/supabase-server"
import { AdminBillManager } from "@/components/admin/AdminBillManager"

export const metadata = {
  title: "Bills & Dues | Hotel North Star Inn Admin",
}

export default async function AdminBillsPage() {
  const supabase = await createClient()
  const { data: bills } = await supabase
    .from("bills")
    .select("*, bill_charges(*), bookings(checkin_status)")
    .order("created_at", { ascending: false })

  return (
    <div>
      <AdminBillManager bills={bills ?? []} />
    </div>
  )
}
