"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addExpense } from "@/lib/actions"
import { DollarSign, Users, BedDouble, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import type { Bill } from "@/types"

function SubmitButton({ label = "Save" }: { label?: string }) {
  const { pending } = useFormStatus()
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : label}</Button>
}

export function AnalyticsDashboard({
  revenue,
  activeGuests,
  totalRooms,
  availableRooms,
  recentBills,
  expenses,
}: {
  revenue: { total_revenue: number; room_revenue: number; food_revenue: number; extra_revenue: number; expense_total: number } | null
  activeGuests: number
  totalRooms: number
  availableRooms: number
  recentBills: Bill[]
  expenses: Record<string, unknown>[]
}) {
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [expenseState, expenseAction] = useActionState(addExpense, null)

  useEffect(() => {
    if (expenseState?.success) { toast.success("Expense added!"); setExpenseOpen(false) }
    else if (expenseState?.error) toast.error(expenseState.error)
  }, [expenseState])

  const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <div className="flex gap-2">
          {expenseOpen ? (
            <form action={expenseAction} className="flex flex-wrap items-end gap-2">
              <div>
                <Label className="text-xs">Description</Label>
                <Input name="description" size={15} required />
              </div>
              <div>
                <Label className="text-xs">Amount</Label>
                <Input name="amount" type="number" size={8} required />
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <select name="category" className="h-9 rounded-md border border-zinc-300 bg-background px-2 text-sm dark:border-zinc-700">
                  <option value="utilities">Utilities</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="salary">Salary</option>
                  <option value="food">Food</option>
                  <option value="supplies">Supplies</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <SubmitButton label="Add" />
              <Button type="button" variant="ghost" size="sm" onClick={() => setExpenseOpen(false)}>Cancel</Button>
            </form>
          ) : (
            <Button onClick={() => setExpenseOpen(true)}>+ Add Expense</Button>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">Rs.{revenue?.total_revenue?.toLocaleString() ?? 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Active Guests</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-deep-blue" />
              <span className="text-2xl font-bold">{activeGuests}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Occupancy Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-crimson" />
              <span className="text-2xl font-bold">{occupancyRate}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-500">Available Rooms</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{availableRooms}/{totalRooms}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Room Revenue", value: revenue?.room_revenue ?? 0, color: "bg-deep-blue" },
                { label: "Food Revenue", value: revenue?.food_revenue ?? 0, color: "bg-crimson" },
                { label: "Extra Charges", value: revenue?.extra_revenue ?? 0, color: "bg-amber-500" },
                { label: "Expenses", value: revenue?.expense_total ?? 0, color: "bg-red-500" },
              ].map((item) => {
                const maxVal = Math.max(revenue?.total_revenue ?? 1, 1)
                return (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-medium">Rs.{item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${(item.value / maxVal) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Bills</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentBills.length === 0 ? (
              <p className="text-sm text-zinc-500">No recent bills</p>
            ) : recentBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">{bill.user_name}</span>
                <span className="font-medium">Rs.{bill.total.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Expenses</CardTitle></CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-sm text-zinc-500">No expenses recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-zinc-500 dark:border-zinc-700">
                    <th className="pb-2 pr-4">Description</th>
                    <th className="pb-2 pr-4">Category</th>
                    <th className="pb-2 pr-4">Amount</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e: Record<string, unknown>) => (
                    <tr key={String(e.id)} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-2 pr-4">{String(e.description)}</td>
                      <td className="py-2 pr-4 capitalize">{String(e.category)}</td>
                      <td className="py-2 pr-4 font-medium">Rs.{String(e.amount)}</td>
                      <td className="py-2">{String(e.expense_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
