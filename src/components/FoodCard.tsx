import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Utensils } from "lucide-react"
import type { FoodItem } from "@/types"

export function FoodCard({ item }: { item: FoodItem }) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative h-40 w-full overflow-hidden sm:h-48">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
            <Utensils className="h-12 w-12 text-zinc-400" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge variant={item.is_available ? "secondary" : "destructive"}>
            {item.is_available ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <span className="text-lg font-bold text-crimson">
            Rs.{item.price}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{item.description}</p>
        <Badge variant="outline" className="mt-2">
          {item.category}
        </Badge>
      </CardContent>
    </Card>
  )
}
