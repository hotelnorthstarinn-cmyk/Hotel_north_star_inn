import { createClient } from "@/lib/supabase-server"
import { FoodCard } from "@/components/FoodCard"

export const metadata = {
  title: "Food Menu | Hotel North Star Inn",
  description: "Explore our delicious food menu at Hotel North Star Inn.",
}

export default async function FoodPage() {
  const supabase = await createClient()
  const { data: items } = await supabase.from("food_menu").select("*").order("category")

  const categories = items ? [...new Set(items.map((i) => i.category))] : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-crimson">
          Our Food Menu
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Delicious meals prepared with love
        </p>
      </div>
      {items && items.length > 0 ? (
        categories.length > 0 ? (
          categories.map((category) => (
            <div key={category} className="mb-10">
              <h2 className="mb-4 text-2xl font-semibold text-deep-blue dark:text-deep-blue-light">
                {category}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <FoodCard key={item.id} item={item} />
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )
      ) : (
        <p className="text-center text-zinc-500">Menu coming soon!</p>
      )}
    </div>
  )
}
