import { Metadata } from 'next'
import { City } from '@/data/cities'
import { BASE_URL, SITE_NAME, SOCIAL_METADATA, OG_IMAGE } from './constants'

interface GenerateMetadataParams {
    title: string
    description: string
    path: string
    ogImage?: string
}

/**
 * Generate complete metadata for a page with Open Graph, Twitter Cards, and canonical URLs
 */
export function generatePageMetadata({
    title,
    description,
    path,
    ogImage = '/opengraph-image',
}: GenerateMetadataParams): Metadata {
    const url = `${BASE_URL}${path}`
    const fullTitle = path === '' ? title : `${title} | ${SITE_NAME}`

    return {
        title: fullTitle,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: fullTitle,
            description,
            url,
            siteName: SOCIAL_METADATA.openGraph.siteName,
            locale: SOCIAL_METADATA.openGraph.locale,
            type: SOCIAL_METADATA.openGraph.type,
            images: [
                {
                    url: ogImage,
                    width: OG_IMAGE.width,
                    height: OG_IMAGE.height,
                    alt: OG_IMAGE.alt,
                },
            ],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    }
}

/**
 * Generate metadata specifically for city pages
 */
export function generateCityMetadata(city: City): Metadata {
    const title = `Software de Condomínio em ${city.name}`
    const description = `A solução de gestão de condomínios mais rápida e transparente para prédios em ${city.name}. Sistema completo com gestão de quotas, ocorrências e arquivo digital.`
    const path = `/solucoes/${city.slug}`

    return generatePageMetadata({
        title,
        description,
        path,
        // Future: Use city-specific OG image: `/og-images/${city.slug}.png`
        ogImage: '/opengraph-image',
    })
}

/**
 * Generate metadata for home page
 */
export function generateHomeMetadata(): Metadata {
    return generatePageMetadata({
        title: 'GestMais - gestão de condominios inteligente',
        description: 'O sistema de gestão de condomínios de alta densidade desenhado para transparência e velocidade. 3€ por fração/mês. Frações e edifícios ilimitados.',
        path: '',
        ogImage: '/opengraph-image',
    })
}
