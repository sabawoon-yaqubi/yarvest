import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { AuthInitializer } from "@/components/auth-initializer"
import { FirstTimeAddressPrompt } from "@/components/first-time-address-prompt"
import { EmailVerificationBlocker } from "@/components/email-verification-blocker"
import { MarkerInitializer } from "@/components/marker-initializer"
import { AuthModalProvider } from "@/components/auth-modal-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.yarvest.health'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Yarvest - Fresh Food & Local Grown Marketplace | Neighborhoods & Local",
    template: "%s | Yarvest"
  },
  description: "Shop fresh produce and locally grown foods delivered to your door. Connect with local farmers, neighbors, and producers in your community. Support local agriculture and enjoy the freshest local food.",
  keywords: [
    "fresh food",
    "local food",
    "locally grown",
    "farmers market",
    "local produce",
    "neighborhoods",
    "neighbors",
    "local farmers",
    "community supported agriculture",
    "CSA",
    "organic food",
    "farm to table",
    "local marketplace",
    "fresh produce delivery",
    "local food delivery",
    "sustainable food",
    "local agriculture"
  ],
  authors: [{ name: "Yarvest" }],
  creator: "Yarvest",
  publisher: "Yarvest",
  generator: "Next.js",
  applicationName: "Yarvest",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Yarvest",
    title: "Yarvest - Fresh Food & Local Grown Marketplace | Neighborhoods & Local",
    description: "Shop fresh produce and locally grown foods delivered to your door. Connect with local farmers, neighbors, and producers in your community. Support local agriculture and enjoy the freshest local food.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Yarvest - Fresh Food & Local Grown Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yarvest - Fresh Food & Local Grown Marketplace | Neighborhoods & Local",
    description: "Shop fresh produce and locally grown foods delivered to your door. Connect with local farmers, neighbors, and producers in your community.",
    images: ["/logo.png"],
    creator: "@yarvest",
  },
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
  alternates: {
    canonical: siteUrl,
  },
  category: "Food & Agriculture",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "Yarvest",
    "description": "Fresh Food & Local Grown Marketplace. Connect with local farmers, neighbors, and producers in your community.",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "image": `${siteUrl}/logo.png`,
    "sameAs": [],
    "offers": {
      "@type": "AggregateOffer",
      "offerCount": "Multiple",
      "priceCurrency": "USD"
    },
    "areaServed": {
      "@type": "Country",
      "name": "USA"
    },
    "keywords": "fresh food, local food, locally grown, farmers market, local produce, neighborhoods, neighbors, local farmers, community supported agriculture, CSA, organic food, farm to table, local marketplace, fresh produce delivery, local food delivery, sustainable food, local agriculture"
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body >
        <AuthInitializer />
        <EmailVerificationBlocker />
        <FirstTimeAddressPrompt />
        <MarkerInitializer />
        <AuthModalProvider />
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
