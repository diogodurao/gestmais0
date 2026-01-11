import Link from "next/link";
import { PrefetchedLink } from "@/components/performance/PrefetchedLink";

export function Footer() {
    const topCities = [
        { name: "Lisboa", slug: "lisboa" },
        { name: "Porto", slug: "porto" },
        { name: "Braga", slug: "braga" },
        { name: "Coimbra", slug: "coimbra" },
    ];

    return (
        <footer className="pt-8 pb-6 bg-pearl border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-900 mb-3">
                            <div className="w-3 h-3 bg-gray-900 text-white rounded-sm flex items-center justify-center text-label">
                                G
                            </div>
                            <span className="text-subtitle">GestMais</span>
                        </div>
                    </Link>
                    <p className="max-w-xs text-body text-gray-500 leading-normal">
                        Desenvolvido em Portugal.
                        <br />
                        © 2026 GestMais. Todos os direitos reservados.
                    </p>
                </div>

                <div>
                    <h4 className="text-gray-900 font-semibold text-body mb-3">
                        Mapa do Site
                    </h4>
                    <ul className="space-y-1.5">
                        <li>
                            <Link href="/" className="hover:text-gray-900 text-gray-600 transition-colors text-body">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/#features" className="hover:text-gray-900 text-gray-600 transition-colors text-body">
                                Features
                            </Link>
                        </li>
                        <li>
                            <Link href="/#pricing" className="hover:text-gray-900 text-gray-600 transition-colors text-body">
                                Pricing
                            </Link>
                        </li>
                        <li>
                            <Link href="/sign-in" className="hover:text-gray-900 text-gray-600 transition-colors text-body">
                                Login
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-gray-900 font-semibold text-body mb-3">
                        Jurídico
                    </h4>
                    <ul className="space-y-1.5">
                        <li>
                            <Link href="#" className="hover:text-gray-900 text-gray-600 transition-colors text-body">
                                Terms of Service
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-gray-900 text-gray-600 transition-colors text-body">
                                Politica de privacidade
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-gray-900 text-gray-600 transition-colors text-body">
                                GDPR Compliance
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-gray-900 font-semibold text-body mb-3">
                        Cidades
                    </h4>
                    <ul className="space-y-1.5">
                        {topCities.map((city) => (
                            <li key={city.slug}>
                                <PrefetchedLink
                                    href={`/solucoes/${city.slug}`}
                                    className="hover:text-gray-900 text-gray-600 transition-colors text-body"
                                >
                                    {city.name}
                                </PrefetchedLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
}
