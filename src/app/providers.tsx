"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "sonner"
import { DateProvider } from "@/lib/date-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DateProvider>
        {children}
      </DateProvider>
      <Toaster richColors position="top-center" />
    </NextThemesProvider>
  )
}
