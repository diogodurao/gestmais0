import { cities } from "@/data/cities"
import { getDictionary } from "@/get-dictionary"
import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { Pricing } from "@/components/landing/Pricing"
import { Footer } from "@/components/landing/Footer"
import { Faq } from "@/components/landing/Faq"
import { notFound } from "next/navigation"
import { JsonLd } from "@/components/seo/JsonLd"

export async function generateStaticParams() {
    return cities.map((city) => ({
        slug: city.slug,
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: 'pt' | 'en', slug: string }> }) {
    const { lang, slug } = await params
    const city = cities.find(c => c.slug === slug)

    if (!city) return {}

    const title = lang === 'pt'
        ? `Software de Condomínio em ${city.name} | GestMais`
        : `Condo Management in ${city.name} | GestMais`

    return {
        title,
        description: lang === 'pt'
            ? `A solução de gestão de condomínios mais rápida e transparente para prédios em ${city.name}.`
            : `The fastest and most transparent condominium management solution for buildings in ${city.name}.`
    }
}

export default async function CityPage({ params }: { params: Promise<{ lang: 'pt' | 'en', slug: string }> }) {
    const { lang, slug } = await params
    const t = await getDictionary(lang as 'pt' | 'en') // Cast to ensure type safety
    const city = cities.find(c => c.slug === slug)

    if (!city) {
        notFound()
    }

    // Override the Hero title to include the city name
    const cityDict = {
        ...t,
        hero: {
            ...t.hero,
            titleLine1: lang === 'pt' ? `Gestão em ${city.name}.` : `Management in ${city.name}.`,
            // Keep titleLine2 ("Precision Engineered")
            subtitle: lang === 'pt'
                ? `Abandone o caos. O GestMais é o sistema operacional para condomínios em ${city.name}, desenhado para transparência e velocidade.`
                : `Abandon the chaos. GestMais is the operating system for condominiums in ${city.name}, designed for transparency and speed.`
        }
    }

    return (
        <div className="min-h-screen font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
            <Navbar dict={t} lang={lang as 'pt' | 'en'} />

            {/* We pass the custom dictionary with the City Name injected */}
            <Hero dict={cityDict} lang={lang as 'pt' | 'en'} />

            <Features dict={t} />
            <Pricing dict={t} />
            <Faq dict={t} />
            <Footer dict={t} />
            <JsonLd lang={lang as 'pt' | 'en'} />
        </div>
    )
}
