"use client"

/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */

import { useState, useEffect, useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  adminCreateBooking, checkinGuest, addExtraCharge, cancelBooking,
} from "@/lib/actions"
import { Plus, LogIn, LogOut, User, Eye, EyeOff, CreditCard, MapPin, Phone, Mail, XCircle } from "lucide-react"
import { DateDisplay } from "@/components/DateDisplay"
import { toast } from "sonner"
import { ID_PROOF_TYPES } from "@/types"
import type { Room } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const statusColor: Record<string, "success" | "destructive" | "secondary"> = {
  checked_in: "success",
  checked_out: "secondary",
  pending: "destructive",
}
const statusLabel: Record<string, string> = {
  checked_in: "Checked In",
  checked_out: "Checked Out",
  pending: "Pending",
}

function SubmitButton({ label = "Save" }: { label?: string }) {
  const { pending } = useFormStatus()
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : label}</Button>
}

export function CheckinManager({
  activeBookings,
  pendingBookings,
  rooms,
}: {
  activeBookings: any[]
  pendingBookings: any[]
  rooms: Room[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active")
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false)
  const [checkinTarget, setCheckinTarget] = useState<any>(null)
  const [newBookingOpen, setNewBookingOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Add charge
  const [chargeTarget, setChargeTarget] = useState<any>(null)
  const [chargeDialogOpen, setChargeDialogOpen] = useState(false)
  const [chargeState, chargeAction] = useActionState(addExtraCharge, null)

  const [checkinState, checkinAction] = useActionState(checkinGuest, null)
  const [cancelState, cancelBookingAction] = useActionState(cancelBooking, null)
  const [createState, createAction] = useActionState(adminCreateBooking, null)

  function handleCloseCharge() {
    setChargeDialogOpen(false)
    setChargeTarget(null)
  }

  function handleCloseCheckin() {
    setCheckinDialogOpen(false)
    setCheckinTarget(null)
  }

  function handleCloseNewBooking() {
    setNewBookingOpen(false)
  }

  useEffect(() => {
    if (chargeState?.success) { toast.success("Charge added!"); handleCloseCharge(); router.refresh() }
    else if (chargeState?.error) toast.error(chargeState.error)
  }, [chargeState, router])

  useEffect(() => {
    if (checkinState?.success) { toast.success("Guest checked in!"); handleCloseCheckin(); router.refresh() }
    else if (checkinState?.error) toast.error(checkinState.error)
  }, [checkinState, router])

  useEffect(() => {
    if (cancelState?.success) { toast.success("Booking cancelled!"); router.refresh() }
    else if (cancelState?.error) toast.error(cancelState.error)
  }, [cancelState, router])

  useEffect(() => {
    if (createState?.success) { toast.success("Guest checked in!"); handleCloseNewBooking(); router.refresh() }
    else if (createState?.error) toast.error(createState.error)
  }, [createState, router])

  const todayStr = new Date().toISOString().split("T")[0]
  const [newCheckIn, setNewCheckIn] = useState(todayStr)
  const currentList = activeTab === "active" ? activeBookings : pendingBookings

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Guest Management</h2>
        <div className="flex gap-2">
          <Dialog open={newBookingOpen} onOpenChange={setNewBookingOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Walk-in Guest</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader><DialogTitle>New Walk-in Guest (Offline)</DialogTitle></DialogHeader>
              <form action={createAction} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Guest Name</Label>
                    <Input name="user_name" required />
                  </div>
                  <div className="space-y-1">
                    <Label>Phone</Label>
                    <Input name="user_phone" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input name="user_email" type="email" />
                </div>
                <div className="space-y-1">
                  <Label>Address</Label>
                  <Input name="address" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>ID Proof</Label>
                    <select name="id_proof_type" className="flex h-9 w-full rounded-md border border-zinc-300 bg-background px-3 py-1 text-sm dark:border-zinc-700">
                      <option value="">None</option>
                      {ID_PROOF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>ID Number</Label>
                    <Input name="id_proof_number" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Check-in</Label>
                    <Input name="check_in" type="date" defaultValue={todayStr} min={todayStr} required onChange={(e) => setNewCheckIn(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Check-out <span className="text-zinc-400 font-normal">(optional)</span></Label>
                    <Input name="check_out" type="date" min={newCheckIn} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Room</Label>
                  <select name="room_id" className="flex h-9 w-full rounded-md border border-zinc-300 bg-background px-3 py-1 text-sm dark:border-zinc-700" required>
                    <option value="">Select room</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.room_code}) - Rs.{r.price}/night</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Security Deposit (Rs.)</Label>
                  <Input name="security_deposit" type="number" defaultValue="0" />
                </div>
                <SubmitButton label="Check In Guest" />
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <button onClick={() => setActiveTab("active")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === "active" ? "bg-white shadow-sm dark:bg-zinc-900" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
        >Active ({activeBookings.length})</button>
        <button onClick={() => setActiveTab("pending")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === "pending" ? "bg-white shadow-sm dark:bg-zinc-900" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
        >Pending ({pendingBookings.length})</button>
      </div>

      <div className="space-y-3">
        {currentList.length === 0 ? (
          <p className="py-8 text-center text-zinc-500">No {activeTab} guests.</p>
        ) : currentList.map((booking: any) => {
          const room = booking.rooms as Room | undefined
          const isExpanded = expandedId === booking.id

          return (
            <Card key={booking.id}>
              <CardContent className="p-4">
                {/* Summary row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-deep-blue/10 dark:bg-deep-blue/20">
                      <User className="h-5 w-5 text-deep-blue dark:text-deep-blue-light" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{booking.user_name}</span>
                        <Badge variant={statusColor[booking.checkin_status]}>{statusLabel[booking.checkin_status]}</Badge>
                        <Badge variant={booking.source === "online" ? "secondary" : "outline"}>
                          {booking.source === "online" ? "Online" : "Walk-in"}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">
                        {room?.name ?? "Room"} ({booking.room_code}) &middot; <DateDisplay date={booking.check_in} /> to <DateDisplay date={booking.check_out} />
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : booking.id)}>
                      {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {booking.checkin_status === "checked_in" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => { setChargeTarget(booking); setChargeDialogOpen(true) }}>
                          <CreditCard className="mr-1 h-3 w-3" /> Add Charge
                        </Button>
                        <Link href={`/admin/checkout/${booking.id}`}>
                          <Button size="sm">
                            <LogOut className="mr-1 h-3 w-3" /> Check Out
                          </Button>
                        </Link>
                      </>
                    )}
                    {booking.checkin_status === "pending" && (
                      <>
                        <Dialog open={checkinDialogOpen && checkinTarget?.id === booking.id}
                          onOpenChange={(o) => { setCheckinDialogOpen(o); if (!o) setCheckinTarget(null) }}>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setCheckinTarget(booking)}>
                              <LogIn className="mr-1 h-3 w-3" /> Check In
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Check In {booking.user_name}</DialogTitle></DialogHeader>
                            <form action={checkinAction} className="space-y-4">
                              <input type="hidden" name="id" value={booking.id} />
                              <div className="space-y-1">
                                <Label>Security Deposit (Rs.)</Label>
                                <Input name="security_deposit" type="number" defaultValue="0" />
                              </div>
                              <SubmitButton label="Confirm Check In" />
                            </form>
                          </DialogContent>
                        </Dialog>
                        {booking.source === "online" && (
                          <form action={cancelBookingAction}>
                            <input type="hidden" name="id" value={booking.id} />
                            <Button type="submit" size="sm" variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" /> Cancel
                            </Button>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 grid gap-3 rounded-lg bg-zinc-50 p-4 text-sm dark:bg-zinc-800/50 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <span className="block text-xs font-medium text-zinc-400 uppercase">Contact</span>
                      <p className="flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" /> {booking.user_email || "—"}</p>
                      <p className="flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {booking.user_phone || "—"}</p>
                      <p className="flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {booking.address || "—"}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-zinc-400 uppercase">ID Proof</span>
                      <p className="mt-0.5">{booking.id_proof_type || "—"}{booking.id_proof_number ? `: ${booking.id_proof_number}` : ""}</p>
                      <span className="block mt-2 text-xs font-medium text-zinc-400 uppercase">Deposit</span>
                      <p className="mt-0.5 font-semibold text-green-600">Rs.{booking.security_deposit}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-zinc-400 uppercase">Room</span>
                      <p className="mt-0.5">{room?.name} ({booking.room_code})</p>
                      <p className="mt-0.5 text-zinc-500">Rs.{room?.price}/night</p>
                      {booking.checkin_time && <p className="mt-0.5 text-xs text-zinc-400">Checked in: <DateDisplay date={booking.checkin_time} /></p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Charge Dialog */}
      <Dialog open={chargeDialogOpen} onOpenChange={setChargeDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Charge — {chargeTarget?.user_name}</DialogTitle></DialogHeader>
          <form action={chargeAction} className="space-y-4">
            <input type="hidden" name="booking_id" value={chargeTarget?.id ?? ""} />
            <div className="space-y-1">
              <Label>Description</Label>
              <Input name="description" placeholder="e.g. Parking, Chowmein, Extra Bed" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Unit Price (Rs.)</Label>
                <Input name="amount" type="number" placeholder="0" required />
              </div>
              <div className="space-y-1">
                <Label>Quantity</Label>
                <Input name="quantity" type="number" defaultValue="1" min="1" />
              </div>
            </div>
            <SubmitButton label="Add Charge" />
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
