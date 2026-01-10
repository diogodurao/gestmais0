import { City } from "@/data/cities"
import { BASE_URL } from "@/seo/utils/constants"

interface JsonLdProps {
    city?: City
}

export function JsonLd({ city }: JsonLdProps) {
    // Schema.org SoftwareApplication
    const softwareAppLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "GestMais",
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
        "featureList": ["Gestão de Quotas", "Registo de Ocorrências", "Arquivo Digital", "Controlo de Acessos"]
    };

    // Schema.org FAQPage
    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "O GestMais é seguro?",
                "acceptedAnswer": { "@type": "Answer", "text": "Sim. Utilizamos encriptação de nível bancário e backups diários automáticos." }
            },
            {
                "@type": "Question",
                "name": "Posso exportar os meus dados?",
                "acceptedAnswer": { "@type": "Answer", "text": "Sempre. O sistema permite a exportação de todos os registos financeiros e ocorrências em formatos padrão (CSV, PDF)." }
            },
            {
                "@type": "Question",
                "name": "Funciona para condomínios pequenos?",
                "acceptedAnswer": { "@type": "Answer", "text": "Sim. O modelo de preços por fração torna-o acessível tanto para prédios pequenos como grandes complexos." }
            }
        ]
    };

    // Build graph array - use any[] to allow different schema types
    const graphItems: any[] = [softwareAppLd, faqLd];

    // If city is provided, add LocalBusiness schema for that specific city
    if (city) {
        const localBusinessLd = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": `GestMais - Gestão de Condomínios em ${city.name}`,
            "description": `Software de gestão de condomínios para prédios em ${city.name}. Simplifique a administração com transparência e velocidade.`,
            "url": `${BASE_URL}/solucoes/${city.slug}`,
            "areaServed": {
                "@type": "City",
                "name": city.name,
                "addressRegion": city.district,
                "addressCountry": "PT"
            },
            "sameAs": [
                BASE_URL
            ],
            "priceRange": "€€",
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
                            "areaServed": {
                                "@type": "City",
                                "name": city.name
                            }
                        }
                    }
                ]
            }
        };

        graphItems.push(localBusinessLd);
    }

    const graph = {
        "@context": "https://schema.org",
        "@graph": graphItems
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
    );
}
