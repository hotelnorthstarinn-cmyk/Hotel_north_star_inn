export interface Room {
  id: string
  created_at: string
  name: string
  description: string
  price: number
  capacity: number
  features: string[]
  image_url: string | null
  gallery: string[]
  room_code: string
  status: "available" | "booked" | "maintenance"
}

export interface Booking {
  id: string
  created_at: string
  user_name: string
  user_email: string
  user_phone: string
  address: string
  id_proof_type: string
  id_proof_number: string
  check_in: string
  check_out: string | null
  room_id: string
  room_code: string
  status: "confirmed" | "cancelled" | "completed"
  source: "online" | "offline"
  checkin_status: "pending" | "checked_in" | "checked_out"
  checkin_time: string | null
  checkout_time: string | null
  security_deposit: number
  rooms?: Room
}

export interface FoodItem {
  id: string
  created_at: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  gallery: string[]
  is_available: boolean
}

export interface Order {
  id: string
  created_at: string
  user_name: string
  user_email: string
  user_phone: string
  room_code: string
  booking_id: string | null
  order_status: "pending" | "approved" | "rejected" | "preparing" | "delivered" | "cancelled"
  notes: string
  total: number
  scheduled_for: string | null
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  created_at: string
  order_id: string
  food_item_id: string
  quantity: number
  unit_price: number
  subtotal: number
  food_items?: FoodItem
}

export interface Bill {
  id: string
  created_at: string
  booking_id: string | null
  user_name: string
  user_email: string
  user_phone: string
  room_code: string
  room_charge: number
  food_charge: number
  additional_charges: number
  discount: number
  total: number
  paid_amount: number
  payment_status: "pending" | "partial" | "paid"
  notes: string
  bill_date: string
  bill_charges?: BillCharge[]
  bookings?: Booking
}

export interface BillCharge {
  id: string
  created_at: string
  bill_id: string
  description: string
  amount: number
  charge_type: "extra" | "food" | "room" | "deposit" | "discount"
}

export interface Review {
  id: string
  created_at: string
  user_name: string
  user_email: string
  rating: number
  comment: string
  image_url: string | null
}

export interface Expense {
  id: string
  created_at: string
  description: string
  amount: number
  category: "utilities" | "maintenance" | "salary" | "food" | "supplies" | "other"
  expense_date: string
  notes: string
}

export interface GuestInfo {
  user_name: string
  user_email: string
  user_phone: string
}

export interface MonthlyRevenue {
  total_revenue: number
  room_revenue: number
  food_revenue: number
  extra_revenue: number
  expense_total: number
}

export interface BillSummary {
  bill_id: string
  total: number
  paid: number
  due: number
  payment_status: string
}

export const ROOM_FEATURES = [
  "AC",
  "WiFi",
  "TV",
  "Hot Water",
  "Mini Bar",
  "Room Service",
  "Balcony",
  "Mountain View",
  "Garden View",
  "City View",
  "Attached Bathroom",
  "Geyser",
  "Parking",
  "Breakfast Included",
  "Dinner Included",
  "Pickup Service",
  "Airport Transfer",
  "Iron",
  "Hairdryer",
  "Safe",
] as const

export const ROOM_STATUSES = ["available", "booked", "maintenance"] as const

export const ID_PROOF_TYPES = [
  "Citizenship",
  "Passport",
  "Driver License",
  "National ID",
  "Other",
] as const
