export const metadata = {
  title: "Orders | Hotel North Star Inn Admin",
}

import { createClient } from "@/lib/supabase-server"
import { AdminOrderManager } from "@/components/admin/AdminOrderManager"

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, food_items:food_item_id(*))")
    .in("order_status", ["pending", "approved", "preparing", "delivered"])
    .order("created_at", { ascending: false })

  return (
    <div>
      <AdminOrderManager orders={orders ?? []} />
    </div>
  )
}
