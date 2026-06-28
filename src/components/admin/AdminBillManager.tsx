"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useActionState, useEffect } from "react"
import { addBillCharge, updateBillPayment, deleteBillCharge } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Trash2, DollarSign } from "lucide-react"
import type { Bill } from "@/types"

const statusColors: Record<string, "default" | "secondary" | "success" | "destructive"> = {
  pending: "destructive",
  partial: "default",
  paid: "success",
}

function BillCard({ bill }: { bill: Bill }) {
  const [showAddCharge, setShowAddCharge] = useState(false)
  const [chargeDesc, setChargeDesc] = useState("")
  const [chargeAmt, setChargeAmt] = useState("")
  const [chargeQty, setChargeQty] = useState(1)
  const [addState, addAction] = useActionState(addBillCharge, null)
  const [payState, payAction] = useActionState(updateBillPayment, null)

  useEffect(() => {
    if (addState?.success) { toast.success("Charge added"); setShowAddCharge(false); setChargeDesc(""); setChargeAmt(""); setChargeQty(1) }
    else if (addState?.error) toast.error(addState.error)
  }, [addState])

  useEffect(() => {
    if (payState?.success) toast.success("Payment updated")
    else if (payState?.error) toast.error(payState.error)
  }, [payState])

  const due = bill.total - bill.paid_amount
  const isCheckedOut = bill.bookings?.checkin_status === "checked_out" || bill.payment_status === "paid"

  async function handleDeleteCharge(chargeId: string) {
    const form = new FormData()
    form.set("id", chargeId)
    form.set("bill_id", bill.id)
    const result = await deleteBillCharge(form)
    if (result.success) toast.success("Charge removed")
    else toast.error(result.error ?? "Error")
  }

  return (
    <Card className={isCheckedOut ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{bill.user_name}</CardTitle>
            <p className="text-sm text-zinc-500">{bill.user_email} &middot; {bill.user_phone} &middot; {bill.room_code}</p>
          </div>
          <div className="flex items-center gap-2">
            {isCheckedOut && <Badge variant="secondary">Checked Out</Badge>}
            <Badge variant={statusColors[bill.payment_status] ?? "default"}>{bill.payment_status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div><span className="text-zinc-500">Room:</span> Rs.{bill.room_charge}</div>
          <div><span className="text-zinc-500">Food:</span> Rs.{bill.food_charge}</div>
          <div><span className="font-semibold">Total:</span> Rs.{bill.total}</div>
          <div><span className="text-zinc-500">Paid:</span> Rs.{bill.paid_amount}</div>
        </div>

        {due > 0 && !isCheckedOut && (
          <div className="mb-3 rounded-md bg-red-50 p-2 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
            Due: Rs.{due}
          </div>
        )}

        {bill.bill_charges && bill.bill_charges.length > 0 && (
          <div className="mb-3 space-y-1 rounded-md bg-zinc-50 p-2 text-sm dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500">Extra Charges:</p>
            {bill.bill_charges.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span>{c.description}</span>
                <span className="flex items-center gap-2">
                  Rs.{c.amount}
                  {!isCheckedOut && (
                    <button onClick={() => handleDeleteCharge(c.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {!isCheckedOut && (
          <>
            {showAddCharge ? (
              <form action={addAction} className="mb-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="bill_id" value={bill.id} />
                <div>
                  <Label className="text-xs">Description</Label>
                  <Input name="description" size={16} value={chargeDesc} onChange={(e) => setChargeDesc(e.target.value)} required />
                </div>
                <div>
                  <Label className="text-xs">Amount</Label>
                  <Input name="amount" type="number" size={6} value={chargeAmt} onChange={(e) => setChargeAmt(e.target.value)} required />
                </div>
                <div>
                  <Label className="text-xs">Qty</Label>
                  <Input name="quantity" type="number" size={3} min={1} value={chargeQty} onChange={(e) => setChargeQty(Number(e.target.value))} />
                </div>
                <Button type="submit" size="sm">Add</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddCharge(false)}>Cancel</Button>
              </form>
            ) : (
              <Button variant="outline" size="sm" className="mb-3" onClick={() => setShowAddCharge(true)}>
                <Plus className="mr-1 h-3 w-3" /> Add Charge
              </Button>
            )}

            {bill.payment_status !== "paid" && (
              <form action={payAction} className="flex flex-wrap items-end gap-2 border-t pt-3">
                <input type="hidden" name="id" value={bill.id} />
                <div>
                  <Label className="text-xs">Paid Amount</Label>
                  <Input name="paid_amount" type="number" defaultValue={bill.paid_amount} step="0.01" required />
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <select name="payment_status" defaultValue={bill.payment_status} className="h-9 rounded-md border border-zinc-300 bg-background px-3 text-sm dark:border-zinc-700">
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <Button type="submit" size="sm">Update Payment</Button>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function AdminBillManager({ bills }: { bills: Bill[] }) {
  const [tab, setTab] = useState<"pending" | "paid">("pending")

  const active = bills.filter(
    (b) => b.payment_status !== "paid" && b.bookings?.checkin_status !== "checked_out"
  )
  const checkedOut = bills.filter(
    (b) => b.payment_status === "paid" || b.bookings?.checkin_status === "checked_out"
  )
  const totalDue = active.reduce((s, b) => s + (b.total - b.paid_amount), 0)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bills & Dues</h2>
        <Card className="border-crimson/30">
          <CardContent className="flex items-center gap-2 p-4">
            <DollarSign className="h-5 w-5 text-crimson" />
            <div>
              <p className="text-xs text-zinc-500">Total Due</p>
              <p className="text-xl font-bold text-crimson">Rs.{totalDue}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          onClick={() => setTab("pending")}
          className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "pending"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          Active ({active.length})
        </button>
        <button
          onClick={() => setTab("paid")}
          className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "paid"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          Checked Out ({checkedOut.length})
        </button>
      </div>

      {bills.length === 0 ? (
        <p className="text-zinc-500">No bills yet.</p>
      ) : tab === "pending" ? (
        active.length === 0 ? (
          <p className="text-zinc-500">No active bills.</p>
        ) : (
          <div className="space-y-4">
            {active.map((bill) => <BillCard key={bill.id} bill={bill} />)}
          </div>
        )
      ) : (
        checkedOut.length === 0 ? (
          <p className="text-zinc-500">No checked-out bills.</p>
        ) : (
          <div className="space-y-4">
            {checkedOut.map((bill) => <BillCard key={bill.id} bill={bill} />)}
          </div>
        )
      )}
    </div>
  )
}