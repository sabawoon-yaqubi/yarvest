import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.yarvest.health'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/settings/',
          '/orders/',
          '/profile/',
          '/volunteers/',
          '/cart/',
          '/exit/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

