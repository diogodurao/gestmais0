import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { JsonLd } from "@/seo/components/JsonLd";

const Features = dynamic(() => import("@/components/landing/Features").then(mod => mod.Features));
const Pricing = dynamic(() => import("@/components/landing/Pricing").then(mod => mod.Pricing));
const Faq = dynamic(() => import("@/components/landing/Faq").then(mod => mod.Faq));
const Footer = dynamic(() => import("@/components/landing/Footer").then(mod => mod.Footer));

export default function Home() {
    return (
        <div className="min-h-screen font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <Faq />
            <Footer />
            <JsonLd />
        </div>
    );
}
