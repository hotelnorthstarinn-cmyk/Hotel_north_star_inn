import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase-server"
import { Badge } from "@/components/ui/badge"
import { Bed, Users, Check, ArrowLeft } from "lucide-react"
import { RoomGallery } from "@/components/RoomGallery"
import type { Room } from "@/types"

const statusColor: Record<string, "success" | "destructive" | "secondary" | "outline"> = {
  available: "success",
  booked: "destructive",
  maintenance: "secondary",
}

const statusLabel: Record<string, string> = {
  available: "Available",
  booked: "Booked",
  maintenance: "Under Maintenance",
}

export const metadata = {
  title: "Room Details | Hotel North Star Inn",
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single<Room>()

  if (!room) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/rooms" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-deep-blue dark:hover:text-deep-blue-light">
        <ArrowLeft className="h-4 w-4" /> Back to all rooms
      </Link>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RoomGallery images={room.gallery?.length ? room.gallery : room.image_url ? [room.image_url] : []} name={room.name} />
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-deep-blue dark:text-deep-blue-light">
                    {room.name}
                  </h1>
                  <p className="mt-1 text-sm text-zinc-500">Room Code: {room.room_code}</p>
                </div>
                <Badge variant={statusColor[room.status] ?? "secondary"}>
                  {statusLabel[room.status] ?? room.status}
                </Badge>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {room.description}
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-crimson">Rs.{room.price}</span>
              <span className="text-sm text-zinc-500">/ night</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Up to {room.capacity} guests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                <span>{room.capacity === 1 ? "Single Bed" : room.capacity <= 2 ? "Double Bed" : "Multiple Beds"}</span>
              </div>
            </div>

            {room.features.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {room.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <Check className="h-4 w-4 shrink-0 text-green-600" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              href={`/#booking`}
              className="inline-flex h-12 w-full items-center justify-center rounded-md bg-deep-blue px-6 text-sm font-medium text-white transition-colors hover:bg-deep-blue-dark dark:bg-deep-blue-light dark:hover:bg-deep-blue"
            >
              Book This Room
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
