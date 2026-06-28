"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { createBooking } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useGuestInfo } from "@/lib/guest-storage"
import { adToBsFormatted } from "@/lib/nepali-date"
import type { Room } from "@/types"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" variant="accent" className="w-full" disabled={pending}>
      {pending ? "Booking..." : "Confirm Booking"}
    </Button>
  )
}

export function BookingForm({ rooms }: { rooms: Room[] }) {
  const { guest, saveGuest } = useGuestInfo()
  const [roomId, setRoomId] = useState("")
  const [state, formAction] = useActionState(createBooking, null)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const todayStr = new Date().toISOString().split("T")[0]

  useEffect(() => {
    if (state?.success && state.user_email) {
      saveGuest({
        user_name: state.user_name ?? "",
        user_email: state.user_email,
        user_phone: state.user_phone ?? "",
      })
      toast.success("Booking confirmed! Check your email.")
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, saveGuest])

  const availableRooms = rooms.filter((r) => r.status === "available")

  return (
    <section id="booking" className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-deep-blue dark:text-deep-blue-light">
            Book Your Stay
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Fill in the details and we&apos;ll confirm your reservation
          </p>
        </div>

        <form
          action={formAction}
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user_name">Full Name</Label>
              <Input id="user_name" name="user_name" defaultValue={guest?.user_name ?? ""} placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_email">Email</Label>
              <Input id="user_email" name="user_email" type="email" defaultValue={guest?.user_email ?? ""} placeholder="your@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_phone">Phone</Label>
              <Input id="user_phone" name="user_phone" type="tel" defaultValue={guest?.user_phone ?? ""} placeholder="98XXXXXXXX" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room_id">Room</Label>
              <select
                name="room_id"
                id="room_id"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-deep-blue dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="" disabled>Select a room</option>
                {availableRooms.length === 0 ? (
                  <option value="" disabled>No rooms available</option>
                ) : (
                  availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} - Rs.{room.price}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_in">Check-in Date</Label>
              <Input id="check_in" name="check_in" type="date" min={todayStr} required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              <p className="text-xs text-zinc-500">
                {checkIn ? adToBsFormatted(checkIn) : "—"} <span className="text-zinc-400">(BS)</span>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out">Check-out Date <span className="text-zinc-400 font-normal">(optional)</span></Label>
              <Input id="check_out" name="check_out" type="date" min={checkIn || todayStr} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              <p className="text-xs text-zinc-500">
                {checkOut ? adToBsFormatted(checkOut) : "—"} <span className="text-zinc-400">(BS)</span>
              </p>
            </div>
          </div>
          <div className="mt-6">
            <SubmitButton />
          </div>
        </form>
      </div>
    </section>
  )
}
