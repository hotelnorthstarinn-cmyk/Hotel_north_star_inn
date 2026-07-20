"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Printer, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendBillEmail } from "@/lib/actions"
import { formatDateWithBoth } from "@/lib/nepali-date"
import { toast } from "sonner"
import type { Booking, Bill } from "@/types"

export function PrintableBill({
  booking,
  bills,
}: {
  booking: Booking & { rooms?: { name: string; price: number } }
  bills: Bill[]
}) {
  const bill = bills?.[0]
  const dueAmount = (bill?.total ?? 0) - (bill?.paid_amount ?? 0)
  const [email, setEmail] = useState(booking.user_email || "")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const sentRef = useRef(false)

  useEffect(() => {
    if (booking.user_email && bill && !sentRef.current) {
      sentRef.current = true
      setSending(true)
      const fd = new FormData()
      fd.set("booking_id", booking.id)
      fd.set("email", booking.user_email)
      sendBillEmail(fd).then((res) => {
        setSending(false)
        if (res.success) {
          setSent(true)
          toast.success("Bill sent to " + booking.user_email)
        } else {
          toast.error(res.error || "Failed to send")
        }
      })
    }
  }, [booking.id, booking.user_email, bill])

  async function handleSend() {
    if (!email) { toast.error("Email is required"); return }
    setSending(true)
    const fd = new FormData()
    fd.set("booking_id", booking.id)
    fd.set("email", email)
    const res = await sendBillEmail(fd)
    setSending(false)
    if (res.success) {
      setSent(true)
      toast.success("Bill sent to " + email)
    } else {
      toast.error(res.error || "Failed to send")
    }
  }

  function handlePrint() { window.print() }

  const checkIn = booking.check_in ? formatDateWithBoth(booking.check_in) : "—"
  const checkOut = booking.check_out ? formatDateWithBoth(booking.check_out) : "—"

  return (
    <div>
      <style>{`
        @page { size: auto; margin: 6mm; }
        @media print {
          nav, footer, aside, [role="status"], [data-sonner-toast], .sonner-toast,
          .sonner-toaster, [data-radix-toast-viewport], #sonner-toaster,
          div:has(> [data-sonner-toast]) {
            display: none !important;
          }
          body * { color: black !important; background: white !important; }
          th, td { color: black !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Screen-only toolbar */}
      <div className="mx-auto max-w-lg px-4 pt-4 print:hidden">
        <div className="mb-3 flex items-center justify-between">
          <Link href="/admin/checkins" className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-deep-blue dark:text-zinc-300 dark:hover:text-deep-blue-light">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            {!booking.user_email && !sent && (
              <div className="flex flex-wrap items-center gap-1">
                <Input
                  type="email"
                  placeholder="Guest email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8 w-36 text-sm sm:w-44"
                />
                <Button onClick={handleSend} size="sm" disabled={sending}>
                  <Mail className="mr-1 h-3 w-3" /> {sending ? "Sending..." : "Send"}
                </Button>
              </div>
            )}
            {sent && (
              <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" /> Sent
              </span>
            )}
            {sending && <span className="text-sm text-zinc-500 dark:text-zinc-400">Sending...</span>}
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="mr-1 h-3 w-3" /> Print
            </Button>
          </div>
        </div>

        {!booking.user_email && !sent && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-900/30">
            <p className="mb-2 font-medium text-amber-800 dark:text-amber-300">No email on file</p>
            <div className="flex flex-wrap gap-2">
              <Input
                type="email"
                placeholder="Enter guest email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 min-w-0 flex-1 text-sm"
              />
              <Button onClick={handleSend} size="sm" disabled={sending}>
                {sending ? "Sending..." : "Send Bill"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Print layout */}
      <div className="mx-auto max-w-lg px-4 py-2 print:max-w-full print:mx-0 print:px-3 print:py-1">
        <div className="rounded-xl border bg-white text-zinc-900 print:border print:rounded-none print:shadow-none">
          {/* Header */}
          <div className="border-b px-4 py-2 text-center print:pb-1.5 print:pt-0">
            <Image src="/images/logo.png" alt="" width={100} height={30} className="mx-auto h-10 w-auto" />
            <h1 className="text-sm font-bold text-zinc-900">Hotel North Star Inn</h1>
            <p className="text-[9px] text-zinc-500 dark:text-zinc-600">Gongabu, Kathmandu, Nepal | Tel: 01-4356753</p>
          </div>

          {/* Guest info + dates */}
          <div className="border-b px-4 py-1.5 text-[10px]">
            <div className="flex items-start justify-between">
              <div className="text-zinc-900">
                <span className="font-semibold">{booking.user_name}</span>
                {booking.user_email && <span className="ml-1.5 text-zinc-500 dark:text-zinc-600">{booking.user_email}</span>}
                {booking.user_phone && <span className="ml-1.5 text-zinc-500 dark:text-zinc-600">{booking.user_phone}</span>}
              </div>
              <div className="text-right whitespace-nowrap text-zinc-900">
                <span className="font-semibold">{booking.rooms?.name ?? "Room"}</span>
              </div>
            </div>
            <div className="mt-0.5 text-zinc-500 dark:text-zinc-600">
              <span>In: {checkIn}</span>
              <span className="ml-3">Out: {checkOut}</span>
            </div>
          </div>

          {/* Charges table */}
          <table className="w-full border-collapse text-[10px] text-zinc-900">
            <thead>
              <tr className="border-b font-semibold text-zinc-700 dark:text-zinc-700">
                <th className="px-4 py-0.5 text-left">Item</th>
                <th className="px-4 py-0.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-0.5">Room Charge</td>
                <td className="px-4 py-0.5 text-right">Rs.{(bill?.room_charge ?? 0).toLocaleString()}</td>
              </tr>
              {(bill?.food_charge ?? 0) > 0 && (
                <tr className="border-b">
                  <td className="px-4 py-0.5">Food &amp; Beverages</td>
                  <td className="px-4 py-0.5 text-right">Rs.{bill!.food_charge.toLocaleString()}</td>
                </tr>
              )}
              {(bill?.bill_charges ?? []).filter((c: any) => c.charge_type === "extra").map((c: any, i: number) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-0.5">{c.description}</td>
                  <td className="px-4 py-0.5 text-right">Rs.{c.amount.toLocaleString()}</td>
                </tr>
              ))}
              {(bill?.discount ?? 0) > 0 && (
                <tr className="border-b">
                  <td className="px-4 py-0.5">Discount</td>
                  <td className="px-4 py-0.5 text-right">-Rs.{bill!.discount.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-b-2 font-bold">
                <td className="px-4 py-0.5">Total</td>
                <td className="px-4 py-0.5 text-right">Rs.{(bill?.total ?? 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="px-4 py-0.5">Paid</td>
                <td className="px-4 py-0.5 text-right">-Rs.{(bill?.paid_amount ?? 0).toLocaleString()}</td>
              </tr>
              <tr className="font-bold">
                <td className="px-4 pb-0.5">Due</td>
                <td className="px-4 pb-0.5 text-right">Rs.{dueAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          {/* Security deposit */}
          {booking.security_deposit > 0 && (
            <div className="border-t px-4 py-0.5 text-[9px] text-zinc-500 dark:text-zinc-600">
              Security Deposit: Rs.{booking.security_deposit}
              {bill?.payment_status === "paid" && <span className="ml-1">(Adjusted)</span>}
            </div>
          )}

          {/* Footer */}
          <div className="border-t px-4 py-1 text-center text-[8px] text-zinc-400 dark:text-zinc-500">
            &ldquo;Atithi Devo Bhava&rdquo; &mdash; Thank you, {booking.user_name}, for staying at Hotel North Star Inn
          </div>

          {/* Sent confirmation — visible only in print */}
          {sent && <div className="text-center text-[9px] text-green-600 dark:text-green-400 pt-0.5 print-only">Bill sent to {booking.user_email}</div>}
        </div>
      </div>
    </div>
  )
}
