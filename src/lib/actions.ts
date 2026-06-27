"use server"

import { createClient } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase-admin"
import { Resend } from "resend"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = "gorkhalibisauni@gmail.com"

// ========== HELPER ==========

async function uploadImage(supabase: ReturnType<typeof createAdminClient>, file: File, folder: string) {
  const ext = file.name.split(".").pop()
  const fileName = `${folder}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("hotel_images")
    .upload(`${folder}/${fileName}`, file)
  if (uploadError) {
    console.error("Upload error:", uploadError)
    return null
  }
  if (!uploadData) return null
  const { data: urlData } = supabase.storage.from("hotel_images").getPublicUrl(uploadData.path)
  return urlData?.publicUrl ?? null
}

// ========== BOOKING ==========

export async function createBooking(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const user_name = formData.get("user_name") as string
  const user_email = formData.get("user_email") as string
  const user_phone = formData.get("user_phone") as string
  const check_in = formData.get("check_in") as string
  const check_out = formData.get("check_out") as string
  const room_id = formData.get("room_id") as string

  if (!user_name || !user_email || !user_phone || !check_in || !check_out || !room_id) {
    return { error: "All fields are required" }
  }

  if (new Date(check_in) >= new Date(check_out)) {
    return { error: "Check-out date must be after check-in date" }
  }

  const { data: room } = await supabase
    .from("rooms")
    .select("room_code")
    .eq("id", room_id)
    .single()

  const room_code = room?.room_code ?? ""

  const { error } = await supabase.from("bookings").insert({
    user_name, user_email, user_phone, check_in, check_out, room_id, room_code,
    status: "confirmed", source: "online",
  })

  if (error) return { error: error.message }

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [user_email, ADMIN_EMAIL],
      subject: "Booking Confirmed - Gorkhali Bisauni Lodge And Hotel",
      html: `
        <h1>Booking Confirmed!</h1>
        <p>Dear ${user_name},</p>
        <p>Your booking at Gorkhali Bisauni Lodge And Hotel has been confirmed.</p>
        <p><strong>Check-in:</strong> ${check_in}</p>
        <p><strong>Check-out:</strong> ${check_out}</p>
        ${room_code ? `<p><strong>Your Room Code:</strong> ${room_code}</p>
        <p>Use this code with your email to order food during your stay.</p>` : ""}
        <p>Thank you for choosing us!</p>
        <p><strong>Gorkhali Bisauni Lodge And Hotel</strong><br/>
        Gongabu, Kathmandu, Nepal<br/>
        Tel: 01-4356753</p>
      `,
    })
  } catch { /* non-blocking */ }

  revalidatePath("/")
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/checkins")
  return { success: true, user_name, user_email, user_phone, room_code }
}

export async function adminCreateBooking(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()

  const user_name = formData.get("user_name") as string
  const user_email = formData.get("user_email") as string
  const user_phone = formData.get("user_phone") as string
  const address = formData.get("address") as string
  const id_proof_type = formData.get("id_proof_type") as string
  const id_proof_number = formData.get("id_proof_number") as string
  const check_in = formData.get("check_in") as string
  const check_out = formData.get("check_out") as string
  const room_id = formData.get("room_id") as string
  const security_deposit = Number.parseFloat(formData.get("security_deposit") as string) || 0

  if (!user_name || !check_in || !check_out || !room_id) {
    return { error: "Name, check-in, check-out, and room are required" }
  }

  const { data: room } = await supabase
    .from("rooms")
    .select("room_code, price")
    .eq("id", room_id)
    .single()

  if (!room) return { error: "Room not found" }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      user_name, user_email, user_phone, address,
      id_proof_type: id_proof_type || "", id_proof_number: id_proof_number || "",
      check_in, check_out, room_id, room_code: room.room_code,
      status: "confirmed", source: "offline",
      checkin_status: "checked_in", checkin_time: new Date().toISOString(),
      security_deposit,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // If security deposit was taken, record on bill
  if (security_deposit > 0) {
    const { data: bill } = await supabase
      .from("bills")
      .select("id")
      .eq("booking_id", booking.id)
      .single()

    if (bill) {
      await supabase.from("bill_charges").insert({
        bill_id: bill.id,
        description: "Security Deposit",
        amount: security_deposit,
        charge_type: "deposit",
      })
      await supabase
        .from("bills")
        .update({ paid_amount: security_deposit, payment_status: "partial" })
        .eq("id", bill.id)
    }
  }

  revalidatePath("/admin/checkins")
  revalidatePath("/admin/dashboard")
  return { success: true }
}

// ========== CHECK-IN / CHECK-OUT ==========

export async function checkinGuest(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get("id") as string
  const security_deposit = Number.parseFloat(formData.get("security_deposit") as string) || 0

  const { error } = await supabase
    .from("bookings")
    .update({
      checkin_status: "checked_in",
      checkin_time: new Date().toISOString(),
      security_deposit,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  // Record deposit in bill
  if (security_deposit > 0) {
    const { data: bill } = await supabase
      .from("bills")
      .select("id, paid_amount")
      .eq("booking_id", id)
      .single()

    if (bill) {
      await supabase.from("bill_charges").insert({
        bill_id: bill.id,
        description: "Security Deposit",
        amount: security_deposit,
        charge_type: "deposit",
      })
      await supabase
        .from("bills")
        .update({
          paid_amount: (bill.paid_amount || 0) + security_deposit,
          payment_status: "partial",
        })
        .eq("id", bill.id)
    }
  }

  revalidatePath("/admin/checkins")
  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function checkoutGuest(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get("id") as string
  const discount = Number.parseFloat(formData.get("discount") as string) || 0
  const payment_status = formData.get("payment_status") as string || "paid"
  const paid_amount_input = formData.get("paid_amount_input") as string
  const totalInput = formData.get("total") as string
  const roomChargeOverride = formData.get("room_charge") as string

  const extraDescriptions = formData.getAll("extra_description[]") as string[]
  const extraAmounts = formData.getAll("extra_amount[]") as string[]
  const newFoodItems = formData.getAll("new_food_items[]") as string[]
  const newFoodQtys = formData.getAll("new_food_qty[]") as string[]

  const { error: bookingError } = await supabase
    .from("bookings")
    .update({
      checkin_status: "checked_out",
      checkout_time: new Date().toISOString(),
      status: "completed",
    })
    .eq("id", id)

  if (bookingError) return { error: bookingError.message }

  // Create approved order for items added during checkout
  if (newFoodItems.length > 0) {
    const { data: bookingInfo } = await supabase
      .from("bookings")
      .select("user_name, user_email, user_phone, room_code")
      .eq("id", id)
      .single()

    if (bookingInfo) {
      const { data: menuItems } = await supabase
        .from("food_menu")
        .select("id, name, price")
        .in("id", newFoodItems)

      const combinedItems = newFoodItems.map((fid, i) => {
        const menuItem = menuItems?.find((m) => m.id === fid)
        return {
          food_item_id: fid,
          qty: Number.parseInt(newFoodQtys[i] as string) || 1,
          price: menuItem?.price ?? 0,
          name: menuItem?.name ?? "Item",
        }
      }).filter((item) => item.qty > 0 && item.price > 0)

      if (combinedItems.length > 0) {
        const orderTotal = combinedItems.reduce((s, item) => s + item.price * item.qty, 0)

        const { data: newOrder } = await supabase
          .from("orders")
          .insert({
            user_name: bookingInfo.user_name,
            user_email: bookingInfo.user_email,
            user_phone: bookingInfo.user_phone,
            room_code: bookingInfo.room_code,
            booking_id: id,
            order_status: "approved",
            total: orderTotal,
            notes: "Added during checkout",
          })
          .select("id")
          .single()

        if (newOrder) {
          await supabase.from("order_items").insert(
            combinedItems.map((item) => ({
              order_id: newOrder.id,
              food_item_id: item.food_item_id,
              quantity: item.qty,
              unit_price: item.price,
              subtotal: item.price * item.qty,
            }))
          )

          await supabase.rpc("add_order_to_bill", { p_order_id: newOrder.id })
        }
      }
    }
  }

  const { data: bills } = await supabase
    .from("bills")
    .select("id, total, room_charge, food_charge, additional_charges, discount")
    .eq("booking_id", id)

  const bill = bills?.[0]
  if (!bill) return { error: "No bill found" }

  // Update room charge if overridden
  if (roomChargeOverride) {
    await supabase.from("bill_charges").insert({
      bill_id: bill.id,
      description: "Room Charge",
      amount: Number.parseFloat(roomChargeOverride),
      charge_type: "room",
    })
  }

  for (let i = 0; i < extraDescriptions.length; i++) {
    const desc = extraDescriptions[i]?.trim()
    const amt = Number.parseFloat(extraAmounts[i] as string) || 0
    if (desc && amt > 0) {
      await supabase.from("bill_charges").insert({
        bill_id: bill.id,
        description: desc,
        amount: amt,
        charge_type: "extra",
      })
    }
  }

  let finalTotal = bill.total
  if (totalInput) {
    finalTotal = Number.parseFloat(totalInput)
  }

  if (extraDescriptions.some((d) => d?.trim()) || roomChargeOverride) {
    await supabase.rpc("update_bill_totals", { p_bill_id: bill.id })
    const { data: updated } = await supabase
      .from("bills")
      .select("total")
      .eq("id", bill.id)
      .single()
    if (updated) finalTotal = updated.total
  }

  if (discount > 0) {
    await supabase.from("bill_charges").insert({
      bill_id: bill.id,
      description: "Discount",
      amount: discount,
      charge_type: "discount",
    })
  }

  const finalPaid = paid_amount_input ? Number.parseFloat(paid_amount_input) : (payment_status === "paid" ? finalTotal : 0)

  const updates: Record<string, unknown> = {
    discount,
    payment_status,
    paid_amount: finalPaid,
  }

  if (totalInput) updates.total = finalTotal

  await supabase.from("bills").update(updates).eq("id", bill.id)

  // Also apply deposit to paid amount if paid
  if (payment_status === "paid") {
    const { data: booking } = await supabase.from("bookings").select("security_deposit").eq("id", id).single()
    if (booking?.security_deposit) {
      const { data: currentBill } = await supabase.from("bills").select("paid_amount").eq("id", bill.id).single()
      if (currentBill) {
        await supabase.from("bills").update({ paid_amount: currentBill.paid_amount + booking.security_deposit }).eq("id", bill.id)
      }
    }
  }

  revalidatePath("/admin/checkins")
  revalidatePath("/admin/bills")
  revalidatePath("/admin/dashboard")
  redirect(`/bill/${id}`)
}

// ========== FOOD ORDERING ==========

export async function placeOrder(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const user_email = formData.get("user_email") as string
  const room_code = formData.get("room_code") as string
  const items_json = formData.get("items") as string
  const notes = (formData.get("notes") as string) || ""
  const scheduled_for = (formData.get("scheduled_for") as string) || null

  if (!user_email || !room_code || !items_json) {
    return { error: "Email and room code are required" }
  }

  type GuestLookup = { user_name: string; user_phone: string; booking_id: string }
  const { data: guest, error: lookupError } = await supabase
    .rpc("lookup_guest", { p_email: user_email, p_room_code: room_code })
    .single<GuestLookup>()

  if (lookupError || !guest) {
    return { error: "No active booking found with this email and room code. Please check in first." }
  }

  const items: { food_item_id: string; quantity: number; unit_price: number; name: string }[] =
    JSON.parse(items_json)

  if (items.length === 0) return { error: "No items in order" }

  const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_name: guest.user_name, user_email, user_phone: guest.user_phone,
      room_code, booking_id: guest.booking_id,
      order_status: "pending", notes, total,
      scheduled_for: scheduled_for || null,
    })
    .select()
    .single()

  if (orderError) return { error: orderError.message }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    food_item_id: item.food_item_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.unit_price * item.quantity,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
  if (itemsError) return { error: itemsError.message }

  try {
    await resend.emails.send({
      from: "Gorkhali Bisauni <orders@gorkhalibisauni.com>",
      to: [ADMIN_EMAIL],
      subject: `New Food Order from ${guest.user_name} (Room ${room_code})`,
      html: `<h2>New Food Order</h2>
        <p><strong>Guest:</strong> ${guest.user_name} (${user_email})</p>
        <p><strong>Room:</strong> ${room_code}</p>
        <p><strong>Scheduled:</strong> ${scheduled_for || "Now"}</p>
        <p><strong>Notes:</strong> ${notes || "None"}</p>
        <p><strong>Total:</strong> Rs.${total}</p>`,
    })
  } catch { /* non-blocking */ }

  revalidatePath("/order-food")
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/orders")
  return { success: true }
}

export async function updateOrderStatus(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get("id") as string
  const status = formData.get("order_status") as string

  const { error } = await supabase.from("orders").update({ order_status: status }).eq("id", id)
  if (error) return { error: error.message }

  // Charge bill on approval, remove on rejection/cancellation
  if (status === "approved") {
    await supabase.rpc("add_order_to_bill", { p_order_id: id })
  } else if (status === "rejected" || status === "cancelled") {
    const { data: order } = await supabase.from("orders").select("order_status").eq("id", id).single()
    // Only remove from bill if it was previously approved
    if (order && order.order_status !== "approved") {
      // already approved → remove
    }
    await supabase.rpc("remove_order_from_bill", { p_order_id: id })
  }

  revalidatePath("/admin/orders")
  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function approveOrder(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get("id") as string

  const { error } = await supabase.from("orders").update({ order_status: "approved" }).eq("id", id)
  if (error) return { error: error.message }

  await supabase.rpc("add_order_to_bill", { p_order_id: id })

  revalidatePath("/admin/orders")
  revalidatePath("/admin/bills")
  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function rejectOrder(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get("id") as string

  const { data: order } = await supabase.from("orders").select("order_status").eq("id", id).single()
  const wasApproved = order?.order_status === "approved"

  const { error } = await supabase.from("orders").update({ order_status: "rejected" }).eq("id", id)
  if (error) return { error: error.message }

  if (wasApproved) {
    await supabase.rpc("remove_order_from_bill", { p_order_id: id })
  }

  revalidatePath("/admin/orders")
  revalidatePath("/admin/bills")
  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function removeOrderItem(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const item_id = formData.get("item_id") as string
  const order_id = formData.get("order_id") as string

  // Get the item to know the amount to subtract
  const { data: item } = await supabase
    .from("order_items")
    .select("subtotal")
    .eq("id", item_id)
    .single()

  if (!item) return { error: "Item not found" }

  // Delete the item
  const { error: deleteError } = await supabase.from("order_items").delete().eq("id", item_id)
  if (deleteError) return { error: deleteError.message }

  // Recalculate order total
  const { data: remaining } = await supabase
    .from("order_items")
    .select("subtotal")
    .eq("order_id", order_id)

  const newTotal = (remaining ?? []).reduce((s, i) => s + i.subtotal, 0)

  const { error: updateError } = await supabase
    .from("orders")
    .update({ total: newTotal })
    .eq("id", order_id)

  if (updateError) return { error: updateError.message }

  // If order was already approved, adjust the bill
  const { data: order } = await supabase
    .from("orders")
    .select("order_status")
    .eq("id", order_id)
    .single()

  if (order?.order_status === "approved") {
    // Remove old amount and re-add new amount
    // Simpler: just subtract the removed item's subtotal
    await supabase.rpc("remove_order_from_bill", { p_order_id: order_id })
    if (newTotal > 0) {
      await supabase.rpc("add_order_to_bill", { p_order_id: order_id })
    }
  }

  revalidatePath("/admin/orders")
  revalidatePath("/admin/bills")
  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function adminAddOrder(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const booking_id = formData.get("booking_id") as string
  const items_json = formData.get("items") as string
  const notes = formData.get("notes") as string || ""

  if (!booking_id || !items_json) return { error: "Booking and items required" }

  // Get booking info
  const { data: booking } = await supabase
    .from("bookings")
    .select("user_name, user_email, user_phone, room_code")
    .eq("id", booking_id)
    .single()

  if (!booking) return { error: "Booking not found" }

  const items: { food_item_id: string; quantity: number; unit_price: number; name: string }[] =
    JSON.parse(items_json)

  if (items.length === 0) return { error: "No items" }

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)

  // Create order with approved status (charged to bill immediately)
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_name: booking.user_name, user_email: booking.user_email,
      user_phone: booking.user_phone, room_code: booking.room_code,
      booking_id, order_status: "approved", notes, total,
    })
    .select()
    .single()

  if (orderError) return { error: orderError.message }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    food_item_id: item.food_item_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.unit_price * item.quantity,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
  if (itemsError) return { error: itemsError.message }

  // Charge to bill
  await supabase.rpc("add_order_to_bill", { p_order_id: order.id })

  revalidatePath("/admin/checkins")
  revalidatePath("/admin/orders")
  revalidatePath("/admin/bills")
  return { success: true }
}

// ========== ADMIN ROOM MANAGEMENT ==========

export async function addRoom(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = Number.parseFloat(formData.get("price") as string)
  const capacity = Number.parseInt(formData.get("capacity") as string) || 1
  const room_code = formData.get("room_code") as string
  const status = (formData.get("status") as string) || "available"
  const featuresRaw = formData.getAll("features") as string[]
  const features = featuresRaw.filter(Boolean)
  const imageFiles = formData.getAll("images") as File[]

  if (!room_code) return { error: "Room code is required" }

  const uploadedUrls: string[] = []
  for (const file of imageFiles) {
    if (file.size > 0) {
      const url = await uploadImage(supabase, file, "rooms")
      if (url) uploadedUrls.push(url)
    }
  }

  const { error } = await supabase.from("rooms").insert({
    name, description, price, capacity, features,
    image_url: uploadedUrls[0] ?? null,
    gallery: uploadedUrls,
    room_code, status,
  })

  if (error) return { error: error.message }
  revalidatePath("/admin/rooms")
  revalidatePath("/rooms")
  return { success: true }
}

export async function updateRoom(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get("id") as string
  const updates: Record<string, unknown> = {}

  const name = formData.get("name") as string | null
  const description = formData.get("description") as string | null
  const priceRaw = formData.get("price") as string | null
  const capacityRaw = formData.get("capacity") as string | null
  const room_code = formData.get("room_code") as string | null
  const status = formData.get("status") as string | null
  const existingGalleryRaw = formData.get("existing_gallery") as string | null
  const featuresRaw = formData.getAll("features") as string[]
  const imageFiles = formData.getAll("images") as File[]

  if (name) updates.name = name
  if (description) updates.description = description
  if (priceRaw) updates.price = Number.parseFloat(priceRaw)
  if (capacityRaw) updates.capacity = Number.parseInt(capacityRaw)
  if (room_code) updates.room_code = room_code
  if (status) updates.status = status

  const features = featuresRaw.filter(Boolean)
  if (features.length > 0) updates.features = features

  const uploadedUrls: string[] = []
  for (const file of imageFiles) {
    if (file.size > 0) {
      const url = await uploadImage(supabase, file, "rooms")
      if (url) uploadedUrls.push(url)
    }
  }

  if (uploadedUrls.length > 0) {
    try {
      const existingGallery = existingGalleryRaw ? JSON.parse(existingGalleryRaw) : []
      updates.gallery = [...existingGallery, ...uploadedUrls]
      updates.image_url = (updates.gallery as string[])[0] ?? null
    } catch {
      updates.gallery = uploadedUrls
      updates.image_url = uploadedUrls[0] ?? null
    }
  }

  const { error } = await supabase.from("rooms").update(updates).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/rooms")
  revalidatePath("/rooms")
  return { success: true }
}

export async function deleteRoom(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("rooms").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/rooms")
  revalidatePath("/rooms")
  return { success: true }
}

// ========== ADMIN FOOD MANAGEMENT ==========

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export async function addFoodItem(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = Number.parseFloat(formData.get("price") as string)
  const category = formData.get("category") as string
  const imageFiles = formData.getAll("images") as File[]

  const uploadedUrls: string[] = []
  const folder = slugify(category || "uncategorized")
  for (const file of imageFiles) {
    if (file.size > 0) {
      const url = await uploadImage(supabase, file, `food/${folder}`)
      if (url) uploadedUrls.push(url)
    }
  }

  const { error } = await supabase.from("food_menu").insert({
    name, description, price, category,
    image_url: uploadedUrls[0] ?? null,
    gallery: uploadedUrls,
    is_available: true,
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/menu")
  revalidatePath("/food")
  return { success: true }
}

export async function updateFoodItem(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get("id") as string
  const updates: Record<string, unknown> = {}

  const name = formData.get("name") as string | null
  const description = formData.get("description") as string | null
  const priceRaw = formData.get("price") as string | null
  const category = formData.get("category") as string | null
  const is_availableRaw = formData.get("is_available") as string | null
  const existingGalleryRaw = formData.get("existing_gallery") as string | null
  const imageFiles = formData.getAll("images") as File[]

  if (name) updates.name = name
  if (description) updates.description = description
  if (priceRaw) updates.price = Number.parseFloat(priceRaw)
  if (category) updates.category = category
  if (is_availableRaw !== null) updates.is_available = is_availableRaw === "true"

  const uploadedUrls: string[] = []
  const folder = slugify(category || "uncategorized")
  for (const file of imageFiles) {
    if (file.size > 0) {
      const url = await uploadImage(supabase, file, `food/${folder}`)
      if (url) uploadedUrls.push(url)
    }
  }

  if (uploadedUrls.length > 0) {
    try {
      const existingGallery = existingGalleryRaw ? JSON.parse(existingGalleryRaw) : []
      updates.gallery = [...existingGallery, ...uploadedUrls]
      updates.image_url = (updates.gallery as string[])[0] ?? null
    } catch {
      updates.gallery = uploadedUrls
      updates.image_url = uploadedUrls[0] ?? null
    }
  }

  const { error } = await supabase.from("food_menu").update(updates).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/menu")
  revalidatePath("/food")
  return { success: true }
}

export async function deleteFoodItem(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("food_menu").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/menu")
  revalidatePath("/food")
  return { success: true }
}

// ========== REVIEWS ==========

export async function submitReview(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const user_name = formData.get("user_name") as string
  const user_email = formData.get("user_email") as string
  const rating = Number.parseInt(formData.get("rating") as string)
  const comment = formData.get("comment") as string
  const imageFile = formData.get("image") as File | null

  if (!user_name || !user_email || !rating || !comment) {
    return { error: "Name, email, rating and comment are required" }
  }

  let image_url: string | null = null
  if (imageFile && imageFile.size > 0) {
    const url = await uploadImage(createAdminClient(), imageFile, "reviews")
    if (url) image_url = url
  }

  const { error } = await supabase.from("reviews").insert({
    user_name, user_email, rating, comment, image_url,
  })
  if (error) return { error: error.message }
  revalidatePath("/")
  return { success: true }
}

// ========== ADMIN AUTH ==========

export async function adminLogin(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: "Invalid email or password" }
  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function adminLogout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/admin")
}

// ========== BILL MANAGEMENT ==========

export async function addBillCharge(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const bill_id = formData.get("bill_id") as string
  const description = formData.get("description") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const charge_type = (formData.get("charge_type") as string) || "extra"

  if (!bill_id || !description || !amount) return { error: "All fields required" }

  const { error: chargeError } = await supabase
    .from("bill_charges")
    .insert({ bill_id, description, amount, charge_type })

  if (chargeError) return { error: chargeError.message }

  const { error: updateError } = await supabase.rpc("update_bill_totals", { p_bill_id: bill_id })
  if (updateError) return { error: updateError.message }

  revalidatePath("/admin/bills")
  return { success: true }
}

export async function updateBillPayment(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get("id") as string
  const paid_amount = Number.parseFloat(formData.get("paid_amount") as string)
  const payment_status = formData.get("payment_status") as string

  const { error } = await supabase
    .from("bills")
    .update({ paid_amount, payment_status })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/admin/bills")
  return { success: true }
}

export async function deleteBillCharge(formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get("id") as string
  const bill_id = formData.get("bill_id") as string

  const { error } = await supabase.from("bill_charges").delete().eq("id", id)
  if (error) return { error: error.message }

  const { error: updateError } = await supabase.rpc("update_bill_totals", { p_bill_id: bill_id })
  if (updateError) return { error: updateError.message }

  revalidatePath("/admin/bills")
  return { success: true }
}

// ========== EXPENSES ==========

export async function addExpense(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()
  const description = formData.get("description") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const category = formData.get("category") as string
  const expense_date = formData.get("expense_date") as string
  const notes = formData.get("notes") as string || ""

  const { error } = await supabase.from("expenses").insert({
    description, amount, category, expense_date: expense_date || new Date().toISOString().split("T")[0], notes,
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/analytics")
  return { success: true }
}

// ========== ANALYTICS ==========

export async function getAnalytics(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()

  const year = Number.parseInt(formData.get("year") as string) || new Date().getFullYear()
  const month = Number.parseInt(formData.get("month") as string) || (new Date().getMonth() + 1)

  const { data: revenue } = await supabase
    .rpc("monthly_revenue", { p_year: year, p_month: month })

  const { count: activeGuests } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("checkin_status", "checked_in")

  const { count: totalRooms } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })

  const { count: availableRooms } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true })
    .eq("status", "available")

  const { count: totalBookingsThisMonth } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${year}-${String(month).padStart(2, "0")}-01`)
    .lt("created_at", `${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, "0")}-01`)

  return {
    success: true,
    revenue: (revenue as unknown as Array<{ total_revenue: number; room_revenue: number; food_revenue: number; extra_revenue: number; expense_total: number }>)?.[0] ?? null,
    activeGuests: activeGuests ?? 0,
    totalRooms: totalRooms ?? 0,
    availableRooms: availableRooms ?? 0,
    totalBookingsThisMonth: totalBookingsThisMonth ?? 0,
  }
}

// ========== DATA EXPORT ==========

export async function exportData(prevState: unknown, formData: FormData) {
  const supabase = createAdminClient()

  const type = formData.get("type") as string // 'bookings', 'bills', 'orders', 'expenses'
  const from_date = formData.get("from_date") as string
  const to_date = formData.get("to_date") as string

  if (!type || !from_date || !to_date) return { error: "All fields required" }

  let data: Record<string, unknown>[] = []
  let headers: string[] = []

  if (type === "bookings") {
    const { data: rows } = await supabase
      .from("bookings")
      .select("user_name, user_email, user_phone, address, room_code, check_in, check_out, source, checkin_status, security_deposit")
      .gte("created_at", from_date)
      .lte("created_at", `${to_date}T23:59:59`)
      .order("created_at", { ascending: false })

    data = rows ?? []
    headers = ["Name", "Email", "Phone", "Address", "Room", "Check In", "Check Out", "Source", "Status", "Deposit"]
  } else if (type === "bills") {
    const { data: rows } = await supabase
      .from("bills")
      .select("user_name, user_email, user_phone, room_code, room_charge, food_charge, additional_charges, discount, total, paid_amount, payment_status, bill_date")
      .gte("created_at", from_date)
      .lte("created_at", `${to_date}T23:59:59`)
      .order("created_at", { ascending: false })

    data = rows ?? []
    headers = ["Name", "Email", "Phone", "Room", "Room Charge", "Food", "Extras", "Discount", "Total", "Paid", "Status", "Date"]
  } else if (type === "orders") {
    const { data: rows } = await supabase
      .from("orders")
      .select("user_name, user_email, room_code, order_status, total, notes, created_at")
      .gte("created_at", from_date)
      .lte("created_at", `${to_date}T23:59:59`)
      .order("created_at", { ascending: false })

    data = rows ?? []
    headers = ["Name", "Email", "Room", "Status", "Total", "Notes", "Date"]
  } else if (type === "expenses") {
    const { data: rows } = await supabase
      .from("expenses")
      .select("description, amount, category, expense_date, notes")
      .gte("expense_date", from_date)
      .lte("expense_date", to_date)
      .order("expense_date", { ascending: false })

    data = rows ?? []
    headers = ["Description", "Amount", "Category", "Date", "Notes"]
  }

  return {
    success: true,
    headers,
    rows: data.map((row) => Object.values(row).map((v) => String(v ?? ""))),
  }
}
