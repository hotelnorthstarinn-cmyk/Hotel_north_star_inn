import { createClient } from "@/lib/supabase-server"
import { RoomManager } from "@/components/admin/RoomManager"

export const metadata = {
  title: "Room Management | Hotel North Star Inn Admin",
}

export default async function AdminRoomsPage() {
  const supabase = await createClient()
  const { data: rooms } = await supabase.from("rooms").select("*").order("created_at", { ascending: false })

  return (
    <div>
      <RoomManager initialRooms={rooms ?? []} />
    </div>
  )
}
