import { MetadataRoute } from 'next'
import { cities } from '@/data/cities'

const BASE_URL = 'https://gestmais.pt'

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        '',
        '/sign-in',
        '/pricing', // Even if it scrolls, good to have if we split later, or just map to home
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    const cityRoutes = cities.map((city) => ({
        url: `${BASE_URL}/pt/solucoes/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...routes, ...cityRoutes]
}
