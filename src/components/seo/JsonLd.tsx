export function JsonLd({ lang }: { lang: 'pt' | 'en' }) {
    const isPt = lang === 'pt';

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
            "description": isPt
                ? "3€ por fração / mês. Frações e Edifícios Ilimitados."
                : "3€ per unit / month. Unlimited Units and Buildings."
        },
        "description": isPt
            ? "Sistema de gestão de condomínios de alta densidade desenhado para transparência e velocidade."
            : "High-density condominium management system designed for transparency and speed.",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "124"
        },
        "featureList": isPt
            ? ["Gestão de Quotas", "Registo de Ocorrências", "Arquivo Digital", "Controlo de Acessos"]
            : ["Quota Management", "Incident Tracking", "Digital Archive", "Access Control"]
    };

    // Schema.org FAQPage
    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": isPt
            ? [
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
            : [
                {
                    "@type": "Question",
                    "name": "Is GestMais secure?",
                    "acceptedAnswer": { "@type": "Answer", "text": "Yes. We use bank-level encryption and automated daily backups." }
                },
                {
                    "@type": "Question",
                    "name": "Can I export my data?",
                    "acceptedAnswer": { "@type": "Answer", "text": "Always. The system allows exporting all financial records and incidents in standard formats (CSV, PDF)." }
                },
                {
                    "@type": "Question",
                    "name": "Does it work for small buildings?",
                    "acceptedAnswer": { "@type": "Answer", "text": "Yes. The per-unit pricing model makes it accessible for both small buildings and large complexes." }
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
