import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { AuthInitializer } from "@/components/auth-initializer"
import { FirstTimeAddressPrompt } from "@/components/first-time-address-prompt"
import { EmailVerificationBlocker } from "@/components/email-verification-blocker"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Yarvest - Fresh Food & Local Grown Marketplace",
  description: "Shop fresh produce and locally grown foods delivered to your door",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geist.className} ${_geistMono.className} font-sans antialiased`}>
        <AuthInitializer />
        <EmailVerificationBlocker />
        <FirstTimeAddressPrompt />
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          duration={3000}
          closeButton
          toastOptions={{
            duration: 3000,
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
