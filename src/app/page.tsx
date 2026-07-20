import { Hero } from "@/components/Hero"
import { HotelOverview } from "@/components/HotelOverview"
import { AmenitiesGrid } from "@/components/AmenitiesGrid"
import { BookingForm } from "@/components/BookingForm"
import { ReviewSection } from "@/components/ReviewSection"
import { ReviewForm } from "@/components/ReviewForm"
import { createClient } from "@/lib/supabase-server"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: rooms } = await supabase.from("rooms").select("*").order("price")
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(9)

  return (
    <>
      <Hero />
      <HotelOverview />
      <AmenitiesGrid />
      <BookingForm rooms={rooms ?? []} />

      {/* Location / Map Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-deep-blue dark:text-deep-blue-light">
              Our Location
            </h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              P8J4+8WW, Parijat Sadak, Kathmandu 44600
            </p>
          </div>
          <a
            href="https://maps.app.goo.gl/TV85XzECmg68whcw9"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800"
          >
            {/* Fallback image-less map card */}
            <div className="flex aspect-[21/9] items-center justify-center bg-zinc-200 dark:bg-zinc-700">
              <div className="text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-deep-blue/10 p-2.5 dark:bg-deep-blue/20">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full text-deep-blue dark:text-deep-blue-light">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Click to open in Google Maps</p>
                <p className="mt-1 text-xs text-zinc-400">P8J4+8WW, Parijat Sadak, Kathmandu 44600</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5 dark:group-hover:bg-white/5" />
          </a>
        </div>
      </section>

      {/* Review & Feedback Section */}
      <section className="bg-zinc-50 py-16 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <ReviewSection reviews={reviews ?? []} />
            </div>
            <div className="min-w-0">
              <ReviewForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
