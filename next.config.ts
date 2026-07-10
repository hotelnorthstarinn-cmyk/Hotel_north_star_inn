import type { NextConfig } from "next"
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
}

export default nextConfig

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev().catch(console.error)
}
