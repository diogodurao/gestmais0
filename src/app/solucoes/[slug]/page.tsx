import { cities } from "@/data/cities"
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const city = cities.find(c => c.slug === slug)

    if (!city) return {}

    return {
        title: `Software de Condomínio em ${city.name} | GestMais`,
        description: `A solução de gestão de condomínios mais rápida e transparente para prédios em ${city.name}.`
    }
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const city = cities.find(c => c.slug === slug)

    if (!city) {
        notFound()
    }

    return (
        <div className="min-h-screen font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
            <Navbar />
            <Hero cityName={city.name} />
            <Features />
            <Pricing />
            <Faq />
            <Footer />
            <JsonLd />
        </div>
    )
}
