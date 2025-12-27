export type Dictionary = {
    nav: {
        modules: string
        pricing: string
        docs: string
        login: string
        getAccess: string
    }
    hero: {
        systemStatus: string
        titleLine1: string
        titleLine2: string
        subtitle: string
        ctaPrimary: string
        dashboardPreview: string
        paid: string
        late: string
    }
    features: {
        title: string
        cards: {
            finance: {
                title: string
                items: string[]
            }
            occurrences: {
                title: string
                items: string[]
            }
            documents: {
                title: string
                items: string[]
            }
        }
    }
    pricing: {
        title: string
        subtitle: string
        card: {
            price: string
            unit: string
            feature1: string
            feature2: string
            feature3: string
            cta: string
        }
    }
    faq: {
        title: string
        items: {
            question: string
            answer: string
        }[]
    }
    footer: {
        designedIn: string
        rights: string
        sitemap: string
        legal: string
    }
}
