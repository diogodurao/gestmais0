import { MetadataRoute } from 'next'
import { BASE_URL } from '@/seo/utils/constants'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/dashboard/',
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    }
}
