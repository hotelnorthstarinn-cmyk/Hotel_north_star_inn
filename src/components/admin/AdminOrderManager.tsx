"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { approveOrder, rejectOrder, removeOrderItem, updateOrderStatus } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, X, Trash2, Clock } from "lucide-react"
import type { Order, OrderItem } from "@/types"

const statusColors: Record<string, "default" | "secondary" | "success" | "destructive"> = {
  pending: "default",
  approved: "success",
  rejected: "destructive",
  preparing: "secondary",
  delivered: "success",
  cancelled: "destructive",
}

export function AdminOrderManager({ orders }: { orders: (Order & { order_items?: (OrderItem & { food_items?: { name: string } })[] })[] }) {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Food Orders</h2>
      {orders.length === 0 ? (
        <p className="text-zinc-500">No orders yet.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

function ApproveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" variant="default" disabled={pending} className="bg-green-600 hover:bg-green-700">
      <Check className="mr-1 h-3 w-3" /> {pending ? "..." : "Approve"}
    </Button>
  )
}

function RejectButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" variant="destructive" disabled={pending}>
      <X className="mr-1 h-3 w-3" /> {pending ? "..." : "Reject"}
    </Button>
  )
}

function OrderCard({ order }: { order: Order & { order_items?: (OrderItem & { food_items?: { name: string } })[] } }) {
  const [statusState, statusAction] = useActionState(updateOrderStatus, null)
  const [approveState, approveAction] = useActionState(approveOrder, null)
  const [rejectState, rejectAction] = useActionState(rejectOrder, null)
  const [removeState, removeAction] = useActionState(removeOrderItem, null)

  useEffect(() => {
    if (statusState?.success) toast.success("Status updated")
    else if (statusState?.error) toast.error(statusState.error)
  }, [statusState])

  useEffect(() => {
    if (approveState?.success) toast.success("Order approved & charged to bill")
    else if (approveState?.error) toast.error(approveState.error)
  }, [approveState])

  useEffect(() => {
    if (rejectState?.success) toast.success("Order rejected")
    else if (rejectState?.error) toast.error(rejectState.error)
  }, [rejectState])

  useEffect(() => {
    if (removeState?.success) toast.success("Item removed & bill adjusted")
    else if (removeState?.error) toast.error(removeState.error)
  }, [removeState])

  const isPending = order.order_status === "pending"
  const isApproved = order.order_status === "approved"
  const canEdit = isPending || isApproved

  return (
    <Card className={isPending ? "border-amber-300 dark:border-amber-700" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{order.user_name}</CardTitle>
              <Badge variant={statusColors[order.order_status] ?? "default"}>
                {order.order_status}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-zinc-500">
              <span>{order.user_email}</span>
              <span>{order.user_phone}</span>
              <span className="font-medium text-deep-blue dark:text-deep-blue-light">Room {order.room_code}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <span>{new Date(order.created_at).toLocaleString()}</span>
          {order.scheduled_for && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Scheduled: {order.scheduled_for}
            </span>
          )}
          <span className="font-semibold text-deep-blue dark:text-deep-blue-light">
            Total: Rs.{order.total}
          </span>
        </div>

        {order.notes && (
          <p className="mb-2 text-sm italic text-zinc-500">Note: {order.notes}</p>
        )}

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="mb-3 space-y-1">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md bg-zinc-50 px-2 py-1 text-sm dark:bg-zinc-800">
                <span>
                  {item.food_items?.name ?? `Item #${item.food_item_id}`}
                  <span className="text-zinc-400"> x{item.quantity}</span>
                </span>
                <span className="flex items-center gap-2">
                  Rs.{item.subtotal}
                  {canEdit && (
                    <form action={removeAction}>
                      <input type="hidden" name="item_id" value={item.id} />
                      <input type="hidden" name="order_id" value={order.id} />
                      <button
                        type="submit"
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </form>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {isPending && (
            <div className="flex gap-2">
              <form action={approveAction}>
                <input type="hidden" name="id" value={order.id} />
                <ApproveButton />
              </form>
              <form action={rejectAction}>
                <input type="hidden" name="id" value={order.id} />
                <RejectButton />
              </form>
            </div>
          )}
          <form action={statusAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={order.id} />
            <select
              name="order_status"
              defaultValue={order.order_status}
              className="rounded-md border border-zinc-300 bg-background px-3 py-1 text-sm dark:border-zinc-700"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="preparing">Preparing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button type="submit" size="sm" variant="outline">Update</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
