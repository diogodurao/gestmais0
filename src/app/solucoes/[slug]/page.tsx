import dynamic from "next/dynamic"
import { cities } from "@/data/cities"
import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { notFound } from "next/navigation"
import { JsonLd } from "@/seo/components/JsonLd"
import { generateCityMetadata } from "@/seo/utils/metadata"

const Features = dynamic(() => import("@/components/landing/Features").then(mod => mod.Features))
const Pricing = dynamic(() => import("@/components/landing/Pricing").then(mod => mod.Pricing))
const Faq = dynamic(() => import("@/components/landing/Faq").then(mod => mod.Faq))
const Footer = dynamic(() => import("@/components/landing/Footer").then(mod => mod.Footer))

export async function generateStaticParams() {
    return cities.map((city) => ({
        slug: city.slug,
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const city = cities.find(c => c.slug === slug)

    if (!city) return {}

    return generateCityMetadata(city)
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
            <JsonLd city={city} />
        </div>
    )
}
