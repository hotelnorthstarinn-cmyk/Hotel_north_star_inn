import { createClient } from "@/lib/supabase-server"
import { RoomCard } from "@/components/RoomCard"

export const metadata = {
  title: "Our Rooms | Hotel North Star Inn",
  description: "Browse our available rooms at Hotel North Star Inn in Gongabu, Kathmandu.",
}

export default async function RoomsPage() {
  const supabase = await createClient()
  const { data: rooms } = await supabase.from("rooms").select("*").order("price")

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-deep-blue dark:text-deep-blue-light">
          Our Rooms
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Choose from our range of comfortable accommodations
        </p>
      </div>
      {rooms && rooms.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <p className="text-center text-zinc-500">No rooms available at the moment.</p>
      )}
    </div>
  )
}
