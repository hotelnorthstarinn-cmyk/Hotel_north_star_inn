"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/food", label: "Food Menu" },
  { href: "/#booking", label: "Book Now" },
]

const serviceLinks = [
  { href: "/order-food", label: "Order Food" },
  { href: "/my-bill", label: "My Bill" },
  { href: "/#contact", label: "Contact" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!servicesOpen) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [servicesOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e0d8ce] bg-[#faf7f0]/80 backdrop-blur-md dark:border-[#3d3229] dark:bg-[#1a150e]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Hotel North Star Inn"
            width={500}
            height={200}
            className="h-30 w-auto brightness-0 dark:brightness-100"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[#5a4e3e] transition-colors hover:bg-[#c8a84e]/10 hover:text-[#c8a84e] dark:text-[#d4c080]/70 dark:hover:bg-[#c8a84e]/15 dark:hover:text-[#c8a84e]"
            >
              {link.label}
            </Link>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#5a4e3e] transition-colors hover:bg-[#c8a84e]/10 hover:text-[#c8a84e] dark:text-[#d4c080]/70 dark:hover:bg-[#c8a84e]/15 dark:hover:text-[#c8a84e]"
            >
              Services
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", servicesOpen && "rotate-180")} />
            </button>
            {servicesOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-[#e0d8ce] bg-[#faf7f0] shadow-lg dark:border-[#3d3229] dark:bg-[#1a150e]">
                {serviceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setServicesOpen(false)}
                    className="block px-4 py-2.5 text-sm text-[#5a4e3e] transition-colors hover:bg-[#c8a84e]/10 hover:text-[#c8a84e] dark:text-[#d4c080]/70 dark:hover:bg-[#c8a84e]/15 dark:hover:text-[#c8a84e]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-[#e0d8ce] bg-[#faf7f0] transition-all duration-300 dark:border-[#3d3229] dark:bg-[#1a150e] md:hidden",
          mobileOpen ? "max-h-[32rem]" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 pb-4 pt-2">
          {[...navLinks, ...serviceLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-[#5a4e3e] transition-colors hover:bg-[#c8a84e]/10 hover:text-[#c8a84e] dark:text-[#d4c080]/70 dark:hover:bg-[#c8a84e]/15 dark:hover:text-[#c8a84e]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
