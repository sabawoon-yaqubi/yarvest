import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.yarvest.health'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/products',
    '/producers',
    '/shops',
    '/events',
    '/partners',
    '/sponsors',
    '/volunteers-list',
    '/couriers-list',
    '/harvesters',
    '/categories',
    '/deals',
    '/trending',
    '/featured-products',
    '/gift-cards',
    '/donations',
    '/contact',
    '/help',
    '/privacy',
    '/terms',
    '/cookies',
    '/shipping',
    '/returns',
    '/community',
    '/leaderboard',
    '/news',
  ]

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}


