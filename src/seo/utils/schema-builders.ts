import type {
    SoftwareApplication,
    FAQPage,
    LocalBusiness,
    BreadcrumbList,
    SchemaGraph,
    Question,
    Place,
} from '@/seo/types/schema'
import { City } from '@/data/cities'
import { BASE_URL, SITE_NAME } from './constants'

/**
 * Build SoftwareApplication schema for GestMais
 */
export function buildSoftwareApplicationSchema(): SoftwareApplication {
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": SITE_NAME,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "3.00",
            "priceCurrency": "EUR",
            "description": "3€ por fração / mês. Frações e Edifícios Ilimitados."
        },
        "description": "Sistema de gestão de condomínios de alta densidade desenhado para transparência e velocidade.",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "124"
        },
        "featureList": [
            "Gestão de Quotas",
            "Registo de Ocorrências",
            "Arquivo Digital",
            "Controlo de Acessos"
        ]
    }
}

/**
 * Build FAQPage schema
 */
export function buildFAQPageSchema(): FAQPage {
    const questions: Question[] = [
        {
            "@type": "Question",
            "name": "O GestMais é seguro?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim. Utilizamos encriptação de nível bancário e backups diários automáticos."
            }
        },
        {
            "@type": "Question",
            "name": "Posso exportar os meus dados?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sempre. O sistema permite a exportação de todos os registos financeiros e ocorrências em formatos padrão (CSV, PDF)."
            }
        },
        {
            "@type": "Question",
            "name": "Funciona para condomínios pequenos?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim. O modelo de preços por fração torna-o acessível tanto para prédios pequenos como grandes complexos."
            }
        }
    ]

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions
    }
}

/**
 * Build LocalBusiness schema for a specific city
 */
export function buildLocalBusinessSchema(city: City): LocalBusiness {
    const areaServed: Place = {
        "@type": "City",
        "name": city.name,
        "addressRegion": city.district,
        "addressCountry": "PT"
    }

    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": `${SITE_NAME} - Gestão de Condomínios em ${city.name}`,
        "description": `Software de gestão de condomínios para prédios em ${city.name}. Simplifique a administração com transparência e velocidade.`,
        "url": `${BASE_URL}/solucoes/${city.slug}`,
        "areaServed": areaServed,
        "sameAs": [BASE_URL],
        "priceRange": "€€",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "124",
            "bestRating": "5",
            "worstRating": "1"
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Serviços de Gestão de Condomínios",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": `Gestão de Condomínios em ${city.name}`,
                        "description": "Sistema completo de gestão de quotas, ocorrências e arquivo digital.",
                        "areaServed": areaServed
                    }
                }
            ]
        }
    }
}

/**
 * Build BreadcrumbList schema for city pages
 */
export function buildBreadcrumbSchema(city: City): BreadcrumbList {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": BASE_URL
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Soluções",
                "item": `${BASE_URL}/solucoes`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": city.name,
                "item": `${BASE_URL}/solucoes/${city.slug}`
            }
        ]
    }
}

/**
 * Build complete schema graph for home page
 */
export function buildHomePageSchemas(): SchemaGraph {
    return {
        "@context": "https://schema.org",
        "@graph": [
            buildSoftwareApplicationSchema(),
            buildFAQPageSchema()
        ]
    }
}

/**
 * Build complete schema graph for city pages
 */
export function buildCityPageSchemas(city: City): SchemaGraph {
    return {
        "@context": "https://schema.org",
        "@graph": [
            buildSoftwareApplicationSchema(),
            buildFAQPageSchema(),
            buildLocalBusinessSchema(city),
            buildBreadcrumbSchema(city)
        ]
    }
}
