import Image from "next/image"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Review } from "@/types"

export function ReviewSection({ reviews }: { reviews: Review[] }) {
  return (
    <>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-deep-blue dark:text-deep-blue-light">
          Pahuna ko Anubhav &mdash; Guest Reviews
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          What our guests say about their stay
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-center text-zinc-500">No reviews yet. Be the first!</p>
      ) : (
        <div
          className="scrollbar-hide flex gap-6 overflow-x-auto pb-2 pr-8 snap-x"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
          {reviews.map((review) => (
            <Card key={review.id} className="flex w-72 shrink-0 flex-col sm:w-80 snap-start">
              <CardContent className="flex-1 p-5">
                <div className="mb-2 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-zinc-300 dark:text-zinc-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="mb-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  &ldquo;{review.comment}&rdquo;
                </p>
                {review.image_url && (
                  <div className="relative mb-3 h-36 w-full overflow-hidden rounded-lg">
                    <Image
                      src={review.image_url}
                      alt="Review photo"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <p className="mt-auto text-xs font-medium text-zinc-500">
                  &mdash; {review.user_name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
