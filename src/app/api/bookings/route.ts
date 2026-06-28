import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_name, user_email, user_phone, check_in, check_out, room_id } = body

    if (!user_name || !user_email || !user_phone || !check_in || !room_id) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("bookings")
      .insert({ user_name, user_email, user_phone, check_in, check_out, room_id, status: "confirmed" })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, booking: data })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
