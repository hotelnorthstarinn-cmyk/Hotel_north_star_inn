import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6"
import { BsGlobe2 } from "react-icons/bs"

const socialLinks = [
  {
    href: "https://facebook.com/gorkhalibisauni",
    icon: FaFacebookF,
    label: "Facebook",
    hoverColor: "hover:bg-[#1877F2] hover:border-[#1877F2]",
  },
  {
    href: "https://instagram.com/gorkhalibisauni",
    icon: FaInstagram,
    label: "Instagram",
    hoverColor: "hover:bg-[#E4405F] hover:border-[#E4405F]",
  },
  {
    href: "https://tiktok.com/@gorkhalibisauni",
    icon: FaTiktok,
    label: "TikTok",
    hoverColor: "hover:bg-[#000000] hover:border-[#000000]",
  },
  {
    href: "https://booking.com",
    icon: BsGlobe2,
    label: "Booking.com",
    hoverColor: "hover:bg-[#003580] hover:border-[#003580]",
  },
]

export function Footer() {
  return (
    <footer id="contact" className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-2xl font-bold text-deep-blue dark:text-deep-blue-light">स्वागतम् &mdash; Swagatam</p>
          <p className="mt-1 text-sm italic text-zinc-500">Ghar jasto, pariwar jasto mahaul &mdash; Feel at home</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-deep-blue dark:text-deep-blue-light">
              Hotel North Star Inn
            </h3>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-crimson" />
                <span>Gongabu, Kathmandu, Nepal</span>
              </li>
              <li>
                <a href="tel:+977014356753" className="flex items-center gap-2 transition-colors hover:text-deep-blue dark:hover:text-deep-blue-light">
                  <Phone className="h-4 w-4 shrink-0 text-crimson" />
                  01-4356753
                </a>
              </li>
              <li>
                <a href="mailto:hotelnorthstarinn@gmail.com" className="flex items-center gap-2 transition-colors hover:text-deep-blue dark:hover:text-deep-blue-light">
                  <Mail className="h-4 w-4 shrink-0 text-crimson" />
                  hotelnorthstarinn@gmail.com
                </a>
              </li>
              <li className="text-zinc-500 dark:text-zinc-500">
                Proprietor: Dhurba Bahadur Karki
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/rooms" className="text-zinc-600 transition-colors hover:text-deep-blue dark:text-zinc-400 dark:hover:text-deep-blue-light">Our Rooms</Link>
              <Link href="/food" className="text-zinc-600 transition-colors hover:text-deep-blue dark:text-zinc-400 dark:hover:text-deep-blue-light">Food Menu</Link>
              <Link href="/order-food" className="text-zinc-600 transition-colors hover:text-deep-blue dark:text-zinc-400 dark:hover:text-deep-blue-light">Order Food</Link>
              <Link href="/my-bill" className="text-zinc-600 transition-colors hover:text-deep-blue dark:text-zinc-400 dark:hover:text-deep-blue-light">My Bill &amp; Dues</Link>
              <Link href="/#booking" className="text-zinc-600 transition-colors hover:text-deep-blue dark:text-zinc-400 dark:hover:text-deep-blue-light">Book a Room</Link>
              <a href="tel:+977014356753" className="flex items-center gap-1 text-zinc-600 transition-colors hover:text-deep-blue dark:text-zinc-400 dark:hover:text-deep-blue-light">
                <Phone className="h-3.5 w-3.5" /> Click to Call
              </a>
              <a href="mailto:hotelnorthstarinn@gmail.com" className="flex items-center gap-1 text-zinc-600 transition-colors hover:text-deep-blue dark:text-zinc-400 dark:hover:text-deep-blue-light">
                <Mail className="h-3.5 w-3.5" /> Send Email
              </a>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Don&apos;t be a stranger</h3>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Follow us on social media for updates and offers.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-all hover:text-white dark:border-zinc-700 dark:text-zinc-400 ${s.hoverColor}`}
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-6 rounded-lg bg-deep-blue/5 p-4 dark:bg-deep-blue/10">
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-crimson">&ldquo;Atithi Devo Bhava&rdquo;</span><br />
                Guest is God. We treat every guest with the warmth and respect of Nepali culture.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
          &copy; {new Date().getFullYear()} Hotel North Star Inn, Gongabu, Kathmandu. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
