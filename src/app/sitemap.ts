import { MetadataRoute } from 'next'
import { cities } from '@/data/cities'
import { BASE_URL } from '@/seo/utils/constants'

export default function sitemap(): MetadataRoute.Sitemap {
    // Use a fixed date for content that doesn't change frequently
    // Update this date when you make significant content changes
    const contentLastModified = new Date('2026-01-10')

    const routes = [
        '',
        '/sign-in',
        '/pricing', // Even if it scrolls, good to have if we split later, or just map to home
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: contentLastModified,
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    const cityRoutes = cities.map((city) => ({
        url: `${BASE_URL}/solucoes/${city.slug}`,
        lastModified: contentLastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...routes, ...cityRoutes]
}
