import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HotelOverview() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="relative h-64 overflow-hidden rounded-xl sm:h-80 md:h-96">
            <Image
              src="/hotel.png"
              alt="Hotel North Star Inn"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <Image
              src="/images/logo.png"
              alt="Hotel North Star Inn"
              width={260}
              height={65}
              className="mb-4 h-16 w-auto"
            />
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-deep-blue dark:text-deep-blue-light">
              A Home Away From Home
            </h2>
            <p className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
              At Hotel North Star Inn, we pride ourselves on creating a warm,
              family-like atmosphere where every guest is treated with genuine Nepali hospitality.
              Located in the vibrant Gongabu area of Kathmandu, our lodge offers the perfect
              blend of comfort, convenience, and cultural authenticity.
            </p>
            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                <span className="block text-2xl font-bold text-crimson">9</span>
                <span className="text-zinc-600 dark:text-zinc-400">Total Rooms</span>
              </div>
              <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                <span className="block text-2xl font-bold text-deep-blue">2</span>
                <span className="text-zinc-600 dark:text-zinc-400">AC Rooms</span>
              </div>
              <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                <span className="block text-2xl font-bold text-crimson">5</span>
                <span className="text-zinc-600 dark:text-zinc-400">Attached Bathrooms</span>
              </div>
              <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                <span className="block text-2xl font-bold text-deep-blue">✓</span>
                <span className="text-zinc-600 dark:text-zinc-400">Parking Available</span>
              </div>
            </div>
            <Link href="/#booking">
              <Button variant="accent" size="lg">
                Book Your Stay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
