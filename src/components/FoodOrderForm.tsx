"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useActionState, useEffect } from "react"
import { placeOrder } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, ShoppingCart, KeyRound, Mail, ChevronUp } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { FoodItem } from "@/types"

export function FoodOrderForm({ menu }: { menu: FoodItem[] }) {
  const [email, setEmail] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [notes, setNotes] = useState("")
  const [scheduledFor, setScheduledFor] = useState("")
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [state, action, isPending] = useActionState(placeOrder, null)

  useEffect(() => {
    if (state?.success) {
      toast.success("Order placed! We'll prepare it shortly.")
      setCart({})
      setNotes("")
      setScheduledFor("")
      setCartOpen(false)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  const availableItems = menu.filter((item) => item.is_available)

  function addToCart(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  function removeFromCart(id: string) {
    setCart((prev) => {
      const next = { ...prev }
      if (next[id] <= 1) delete next[id]
      else next[id]--
      return next
    })
  }

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = availableItems.find((i) => i.id === id)
    return sum + (item?.price ?? 0) * qty
  }, 0)

  const itemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const hasItems = Object.keys(cart).length > 0

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-12 sm:px-6 lg:pb-12 lg:pt-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-crimson">Order Food</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Order food for delivery to your room
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Guest Auth - Desktop sidebar, full width on mobile */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-crimson" />
                Verify Your Stay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input
                  id="email"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room_code" className="flex items-center gap-1">
                  <KeyRound className="h-3.5 w-3.5" /> Room Code
                </Label>
                <Input
                  id="room_code"
                  placeholder="e.g. A101"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-zinc-500">
                Use the room code from your room key or booking confirmation email.
              </p>
            </CardContent>
          </Card>

          {/* Desktop Cart sidebar */}
          <Card className="hidden lg:block">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Cart</CardTitle>
              <ShoppingCart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              {!hasItems ? (
                <p className="text-sm text-zinc-500">Your cart is empty</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = availableItems.find((i) => i.id === id)
                    if (!item) return null
                    return (
                      <div key={id} className="flex items-center justify-between text-sm">
                        <span className="flex-1 truncate">{item.name} x{qty}</span>
                        <span className="ml-2 font-medium">Rs.{item.price * qty}</span>
                      </div>
                    )
                  })}
                  <div className="border-t pt-2 text-lg font-bold">
                    Total: Rs.{total}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="lg:col-span-2">
          <form action={action} className="space-y-6">
            <input type="hidden" name="user_email" value={email} />
            <input type="hidden" name="room_code" value={roomCode} />
            <input
              type="hidden"
              name="items"
              value={JSON.stringify(
                Object.entries(cart).map(([id, qty]) => {
                  const item = availableItems.find((i) => i.id === id)!
                  return { food_item_id: id, quantity: qty, unit_price: item.price, name: item.name }
                }),
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {availableItems.map((item) => (
                <Card key={item.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">{item.name}</CardTitle>
                      <span className="text-sm font-bold text-crimson">Rs.{item.price}</span>
                    </div>
                    <Badge variant="outline" className="w-fit text-xs">{item.category}</Badge>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="mb-3 text-xs text-zinc-500 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => removeFromCart(item.id)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{cart[item.id] || 0}</span>
                      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => addToCart(item.id)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden grid-cols-2 gap-4 lg:grid">
              <div className="space-y-2">
                <Label htmlFor="scheduled_for">Schedule for (optional)</Label>
                <Input
                  id="scheduled_for"
                  name="scheduled_for"
                  type="time"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests?"
                />
              </div>
            </div>

            {/* Desktop Place Order button */}
            <Button type="submit" variant="accent" size="lg" className="hidden w-full lg:inline-flex" disabled={!hasItems || !email || !roomCode || isPending}>
              {isPending ? "Placing Order..." : `Place Order (Rs.${total})`}
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile sticky bottom cart bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)] transition-all dark:border-zinc-700 dark:bg-zinc-900 lg:hidden",
        cartOpen ? "pb-safe" : "",
      )}>
        {/* Collapsed bar */}
        <button
          type="button"
          onClick={() => setCartOpen(!cartOpen)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <ShoppingCart className="h-5 w-5 text-deep-blue dark:text-deep-blue-light" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-crimson text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-sm font-medium">
              {hasItems ? `${itemCount} item${itemCount > 1 ? "s" : ""}` : "Cart"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-crimson">Rs.{total}</span>
            <ChevronUp className={cn("h-4 w-4 transition-transform", cartOpen && "rotate-180")} />
          </div>
        </button>

        {/* Expanded cart */}
        {cartOpen && (
          <form action={action} className="border-t border-zinc-100 px-4 pb-4 pt-2 dark:border-zinc-800">
            {hasItems ? (
              <div className="mb-3 space-y-1.5">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = availableItems.find((i) => i.id === id)
                  if (!item) return null
                  return (
                    <div key={id} className="flex items-center justify-between text-sm">
                      <span className="flex-1 truncate">{item.name} x{qty}</span>
                      <span className="ml-2 font-medium">Rs.{item.price * qty}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="mb-3 text-sm text-zinc-500">Your cart is empty</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Schedule</Label>
                <Input
                  name="scheduled_for"
                  type="time"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Input
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any requests?"
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-base font-bold">Rs.{total}</span>
              <Button type="submit" variant="accent" size="sm" disabled={!hasItems || !email || !roomCode || isPending}>
                {isPending ? "Placing..." : "Place Order"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
