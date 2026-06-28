import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="min-h-[80vh] bg-[#e8e0d0] dark:bg-[#1a150e]">
      <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col-reverse items-center gap-8 px-4 sm:px-6 lg:flex-row lg:px-8">
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-4 flex justify-center lg:justify-start">
            <Image
              src="/images/logo.png"
              alt="Hotel North Star Inn"
              width={400}
              height={100}
              className="h-24 w-auto brightness-0 dark:brightness-100 sm:h-28"
              priority
            />
          </div>
          <p className="mb-1 text-sm font-medium uppercase tracking-widest text-[#7a6e5e] dark:text-[#d4c080]/70">
            स्वागतम् &bull; Swagatam &bull; Welcome
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#2a2218] dark:text-[#e8e0d0] sm:text-5xl lg:text-6xl">
            Hotel <span className="text-[#c8a84e]">North</span>{" "}
            <span className="text-[#7a6e5e] dark:text-[#d4c080]">Star</span> Inn
          </h1>
          <p className="mb-2 max-w-lg text-lg italic text-[#5a4e3e] dark:text-[#d4c080]/80">
            A home away from home
          </p>
          <p className="mb-8 max-w-xl text-[#5a4e3e] dark:text-[#d4c080]/60">
            Experience authentic Nepali hospitality in the heart of Kathmandu.
            &ldquo;Atithi Devo Bhava&rdquo; &mdash; Guest is God.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <Link href="/#booking">
              <Button size="xl" variant="accent">
                Book Now
              </Button>
            </Link>
            <Link href="/rooms">
              <Button size="xl" variant="outline" className="border-[#c8a84e]/50 text-[#2a2218] hover:bg-[#c8a84e] hover:text-white dark:border-[#d4c080]/30 dark:text-[#e8e0d0] dark:hover:bg-[#c8a84e] dark:hover:text-[#1a150e]">
                Explore Rooms
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/hotel.png"
              alt="Hotel North Star Inn"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}