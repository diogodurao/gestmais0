import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { Faq } from "@/components/landing/Faq";

export default function Home() {
    return (
        <div className="min-h-screen font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <Faq />
            <Footer />
        </div>
    );
}
