import { getDictionary } from "@/get-dictionary";
import { LanguageSelectorModal } from "@/components/landing/LanguageSelectorModal";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { Faq } from "@/components/landing/Faq";

export default async function Home({ params }: { params: Promise<{ lang: 'en' | 'pt' }> }) {
    const { lang } = await params;
    const t = await getDictionary(lang);

    return (
        <div className="min-h-screen font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
            <LanguageSelectorModal />
            <Navbar dict={t} lang={lang} />
            <Hero dict={t} lang={lang} />
            <Features dict={t} />
            <Pricing dict={t} />
            <Faq dict={t} />
            <Footer dict={t} />
        </div>
    );
}
