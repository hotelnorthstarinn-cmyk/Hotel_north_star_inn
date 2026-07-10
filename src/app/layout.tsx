import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/app/providers"
import { NavbarWrapper } from "@/components/NavbarWrapper"
import { Footer } from "@/components/Footer"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Hotel North Star Inn | Gongabu, Kathmandu",
  description:
    "Experience authentic Nepali hospitality at Hotel North Star Inn in Gongabu, Kathmandu. Book AC rooms, enjoy free parking, and explore Kathmandu tours.",
  keywords: ["hotel", "kathmandu", "nepal", "gongabu", "north star", "inn", "lodge", "booking"],
  openGraph: {
    title: "Hotel North Star Inn",
    description: "Experience authentic Nepali hospitality in Kathmandu.",
    type: "website",
    locale: "en_US",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background font-sans text-foreground antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `if(typeof __name==="undefined"){__name=function(t,v){return Object.defineProperty(t,"name",{value:v,configurable:true}),t}}`,
          }}
        />
        <Providers>
          <NavbarWrapper />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
