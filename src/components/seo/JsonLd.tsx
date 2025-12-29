export function JsonLd() {
    // Schema.org SoftwareApplication
    const jsonLd = {
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

    const graph = {
        "@context": "https://schema.org",
        "@graph": [jsonLd, faqLd]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
    );
}
