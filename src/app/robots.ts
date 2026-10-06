import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/payload'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/vhod', '/poisk', '/polka', '/kabinet', '/litmoby/sozdat'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
