import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep authenticated areas out of search results.
      disallow: ['/app', '/account', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
