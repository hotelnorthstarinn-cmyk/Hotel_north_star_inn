import { createClient } from "@/lib/supabase-server"
import { FoodOrderForm } from "@/components/FoodOrderForm"

export const metadata = {
  title: "Order Food | Hotel North Star Inn",
  description: "Order food for delivery to your room at Hotel North Star Inn.",
}

export default async function OrderFoodPage() {
  const supabase = await createClient()
  const { data: menu } = await supabase.from("food_menu").select("*").order("category")

  return <FoodOrderForm menu={menu ?? []} />
}
