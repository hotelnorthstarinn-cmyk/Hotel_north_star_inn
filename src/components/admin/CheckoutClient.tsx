"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { checkoutGuest, removeOrderItem } from "@/lib/actions"
import { ArrowLeft, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Booking, Bill, Order, Room, FoodItem } from "@/types"

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Processing..." : "Confirm Check Out"}
    </Button>
  )
}

export function CheckoutClient({
  booking,
  bills,
  orders,
  menu,
}: {
  booking: Booking & { rooms?: Room }
  bills: Bill[]
  orders: Order[]
  menu: FoodItem[]
}) {
  const router = useRouter()
  const bill = bills?.[0]
  const room = booking.rooms

  const nights = booking.check_out
    ? Math.max(
        (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24),
        1,
      )
    : 1

  const [hoursStayed] = useState(() => (Date.now() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60))
  const isWithin24h = hoursStayed <= 24

  const [discount, setDiscount] = useState(bill?.discount ?? 0)
  const [extras, setExtras] = useState<{ desc: string; amt: number }[]>(
    () => bill?.bill_charges?.filter((c) => c.charge_type === "extra").map((c) => ({ desc: c.description, amt: c.amount })) ?? [],
  )
  const defaultRoomCharge = bill?.room_charge ?? (room?.price && !isWithin24h ? room.price * nights : 0)
  const [roomCharge, setRoomCharge] = useState(defaultRoomCharge)
  const [adjustTotal, setAdjustTotal] = useState<string>("")

  const [checkoutState, checkoutAction] = useActionState(checkoutGuest, null)
  const [selectedFood, setSelectedFood] = useState<{ id: string; name: string; price: number; qty: number }[]>([])

  // Food charges from approved orders
  const approvedOrders = orders.filter((o) => o.order_status === "approved" || o.order_status === "delivered")
  const foodTotal = approvedOrders.reduce((s, o) => s + o.total, 0)
  const extrasTotal = extras.reduce((s, e) => s + e.amt, 0)

  const EXTRA_CHARGE_TYPES = [
    { label: "Parking Charge", defaultAmount: 200 },
    { label: "Touring Charge", defaultAmount: 500 },
    { label: "Airport Transfer", defaultAmount: 1000 },
    { label: "Vehicle Drop", defaultAmount: 800 },
    { label: "Extra Bed", defaultAmount: 500 },
    { label: "Laundry Service", defaultAmount: 300 },
    { label: "Phone Call", defaultAmount: 50 },
    { label: "Mini Bar", defaultAmount: 0 },
    { label: "Room Service", defaultAmount: 0 },
    { label: "Sightseeing Trip", defaultAmount: 1500 },
    { label: "Other", defaultAmount: 0 },
  ]
  const finalTotal = roomCharge + foodTotal + extrasTotal - discount
  const amountDue = finalTotal - booking.security_deposit

  useEffect(() => {
    if (checkoutState?.error) {
      toast.error(checkoutState.error)
    }
  }, [checkoutState])

  function updateExtra(idx: number, field: "desc" | "amt", value: string | number) {
    setExtras((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  function removeExtra(idx: number) {
    setExtras((prev) => prev.filter((_, i) => i !== idx))
  }

  // Remove food item from an order
  async function handleRemoveItem(itemId: string, orderId: string) {
    const fd = new FormData()
    fd.set("item_id", itemId)
    fd.set("order_id", orderId)
    const result = await removeOrderItem(null, fd)
    if (result.success) {
      toast.success("Item removed")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to remove")
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/checkins" className="text-zinc-500 hover:text-deep-blue">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold">Check Out — {booking.user_name}</h2>
      </div>

      <form action={checkoutAction} className="space-y-6">
        <input type="hidden" name="id" value={booking.id} />

        {/* Guest Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Guest Information</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <span className="text-xs font-medium text-zinc-400 uppercase">Contact</span>
              <p className="mt-0.5">{booking.user_name}</p>
              <p className="text-zinc-500">{booking.user_email}</p>
              <p className="text-zinc-500">{booking.user_phone}</p>
              {booking.address && <p className="text-zinc-500">{booking.address}</p>}
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-400 uppercase">Room</span>
              <p className="mt-0.5">{room?.name} ({booking.room_code})</p>
              <p className="text-zinc-500">{booking.check_in} → {booking.check_out ?? "—"} ({nights} night{nights > 1 ? "s" : ""})</p>
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-400 uppercase">ID & Deposit</span>
              <p className="mt-0.5">{booking.id_proof_type || "No ID"} {booking.id_proof_number && `(${booking.id_proof_number})`}</p>
              <p className="font-semibold text-green-600">Deposit: Rs.{booking.security_deposit}</p>
            </div>
          </CardContent>
        </Card>

        {/* Room Charge */}
        <Card>
          <CardHeader><CardTitle className="text-base">Room Charges</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span>{room?.name} × {nights} night{nights > 1 ? "s" : ""} @ Rs.{room?.price}/night</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Override:</span>
                <Input
                  type="number"
                  value={roomCharge}
                  onChange={(e) => setRoomCharge(Number(e.target.value))}
                  className="h-8 w-28 text-right text-sm"
                  name="room_charge"
                />
              </div>
            </div>
            {isWithin24h && roomCharge === 0 && (
              <p className="mt-1 text-xs text-green-600">Covered by security deposit (stay within 24h)</p>
            )}
            <p className="mt-1 text-right text-lg font-bold">Rs.{roomCharge}</p>
          </CardContent>
        </Card>

        {/* Food Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Food Orders</span>
              <Badge variant={foodTotal > 0 ? "default" : "secondary"}>
                {foodTotal > 0 ? `Rs.${foodTotal}` : "None"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvedOrders.length > 0 && approvedOrders.map((order) => (
              <div key={order.id} className="rounded-lg border p-3 text-sm dark:border-zinc-700">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">Order #{order.id.slice(0, 8)}</span>
                  <span className="text-zinc-500">
                    {new Date(order.created_at).toLocaleString()}
                    {order.scheduled_for && ` (${order.scheduled_for})`}
                  </span>
                </div>
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-0.5 text-zinc-600 dark:text-zinc-400">
                    <span>{item.food_items?.name ?? "Item"} x{item.quantity}</span>
                    <span className="flex items-center gap-2">
                      Rs.{item.subtotal}
                      <button type="button" onClick={() => handleRemoveItem(item.id, order.id)}
                        className="text-red-400 hover:text-red-600 transition-colors" title="Remove">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  </div>
                ))}
                <div className="mt-1 border-t pt-1 text-right text-sm font-medium dark:border-zinc-700">
                  Rs.{order.total}
                </div>
              </div>
            ))}

            {/* Add new food items inline */}
            <div className="border-t pt-3 dark:border-zinc-700">
              <p className="mb-2 text-xs font-medium uppercase text-zinc-400">Add Food Items to Bill</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {menu.map((item) => {
                  const inCart = selectedFood.find((f) => f.id === item.id)
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded border px-2 py-1 text-xs dark:border-zinc-700">
                      <span className="truncate">{item.name}</span>
                      <div className="flex items-center gap-1">
                        {inCart ? (
                          <>
                            <button type="button" onClick={() => {
                              setSelectedFood((prev) => prev.map((f) => f.id === item.id ? { ...f, qty: f.qty + 1 } : f))
                            }} className="h-5 w-5 rounded bg-deep-blue text-white text-[10px]">+</button>
                            <span className="w-4 text-center">{inCart.qty}</span>
                            <button type="button" onClick={() => {
                              setSelectedFood((prev) => {
                                const next = prev.map((f) => f.id === item.id ? { ...f, qty: f.qty - 1 } : f)
                                return next.filter((f) => f.qty > 0)
                              })
                            }} className="h-5 w-5 rounded bg-zinc-200 text-[10px] dark:bg-zinc-700">-</button>
                          </>
                        ) : (
                          <button type="button" onClick={() => {
                            setSelectedFood((prev) => [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }])
                          }} className="rounded bg-deep-blue px-1.5 py-0.5 text-[10px] text-white">+Add</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {selectedFood.length > 0 && (
                <div className="mt-2 rounded bg-zinc-50 p-2 text-xs dark:bg-zinc-800">
                  <p className="mb-1 font-medium">Items to add on checkout:</p>
                  {selectedFood.map((f) => (
                    <div key={f.id} className="flex items-center justify-between py-0.5">
                      <span>{f.name} x{f.qty} @ Rs.{f.price}</span>
                      <span className="flex items-center gap-2">
                        Rs.{f.qty * f.price}
                        <input type="hidden" name="new_food_items[]" value={f.id} />
                        <input type="hidden" name="new_food_qty[]" value={f.qty} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Extra Charges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Extra Charges</span>
              <div className="flex gap-1">
                {EXTRA_CHARGE_TYPES.map((type) => (
                  <Button key={type.label} type="button" variant="outline" size="sm" className="text-xs"
                    onClick={() => {
                      setExtras((prev) => [...prev, { desc: type.label, amt: type.defaultAmount }])
                    }}
                  >
                    +{type.label.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {extras.length === 0 ? (
              <p className="text-sm text-zinc-500">Click a quick-add button above or add custom below.</p>
            ) : extras.map((ex, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={EXTRA_CHARGE_TYPES.find(t => t.label === ex.desc) ? ex.desc : "Other"}
                  onChange={(e) => {
                    const selected = EXTRA_CHARGE_TYPES.find(t => t.label === e.target.value)
                    updateExtra(i, "desc", selected?.label ?? e.target.value)
                    if (selected && selected.defaultAmount > 0) updateExtra(i, "amt", selected.defaultAmount)
                  }}
                  className="h-8 flex-1 rounded-md border border-zinc-300 bg-background px-2 text-sm dark:border-zinc-700"
                >
                  {EXTRA_CHARGE_TYPES.map((t) => (
                    <option key={t.label} value={t.label}>{t.label}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={ex.amt || ""}
                  onChange={(e) => updateExtra(i, "amt", Number(e.target.value))}
                  className="h-8 w-28 text-sm"
                  name="extra_amount[]"
                />
                <input type="hidden" name="extra_description[]" value={ex.desc} />
                <button type="button" onClick={() => removeExtra(i)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader><CardTitle className="text-base">Bill Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Room Charge</span>
                <span>Rs.{roomCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Food Charges</span>
                <span>Rs.{foodTotal}</span>
              </div>
              {extras.map((ex, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{ex.desc || "Extra"}</span>
                  <span>Rs.{ex.amt}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t pt-2 dark:border-zinc-700">
                <span>Discount</span>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="h-8 w-24 text-right text-sm"
                  name="discount"
                />
              </div>
              <div className="flex items-center justify-between border-t pt-2 text-base font-bold dark:border-zinc-700">
                <span>Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-normal text-zinc-400">Override:</span>
                  <Input
                    type="number"
                    value={adjustTotal}
                    onChange={(e) => setAdjustTotal(e.target.value)}
                    placeholder={String(finalTotal)}
                    className="h-8 w-28 text-right text-sm"
                    name="total"
                  />
                  <span className="min-w-[6rem] text-right">Rs.{adjustTotal || finalTotal}</span>
                </div>
              </div>
              {booking.security_deposit > 0 && (
                <div className="flex items-center justify-between border-t pt-2 dark:border-zinc-700">
                  <span>Security Deposit (paid)</span>
                  <span className="text-red-500">-Rs.{booking.security_deposit}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t pt-2 text-lg font-bold dark:border-zinc-700">
                <span>Amount Due</span>
                <span>Rs.{Math.max(0, amountDue)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2 text-green-600 font-medium">
                <span>Payment Status</span>
                <span>Paid</span>
              </div>
              <input type="hidden" name="payment_status" value="paid" />
              <input type="hidden" name="paid_amount_input" value={adjustTotal || Math.max(0, amountDue)} />
            </div>
          </CardContent>
        </Card>

        <SubmitBtn />
      </form>
    </div>
  )
}
