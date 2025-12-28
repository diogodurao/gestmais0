import Link from "next/link";

export function Footer() {
    return (
        <footer className="pt-20 pb-12 bg-grid text-xs font-mono text-slate-600 relative">

            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                <div className="col-span-1 md:col-span-2">
                    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                        <div className="flex items-center gap-2 font-bold text-slate-900 tracking-tight mb-4">
                            <div className="w-4 h-4 bg-slate-900 text-white rounded-sm flex items-center justify-center text-[10px]">
                                G
                            </div>
                            GestMais
                        </div>
                    </Link>
                    <p className="max-w-xs leading-relaxed text-slate-500">
                        Desenvolvido em Portugal.
                        <br />
                        © 2026 GestMais. Todos os direitos reservados.
                    </p>
                </div>

                <div>
                    <h4 className="text-slate-900 font-bold uppercase mb-4">
                        Mapa do Site
                    </h4>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/" className="hover:text-slate-900 text-slate-500 transition-colors">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/#features" className="hover:text-slate-900 text-slate-500 transition-colors">
                                Features
                            </Link>
                        </li>
                        <li>
                            <Link href="/#pricing" className="hover:text-slate-900 text-slate-500 transition-colors">
                                Pricing
                            </Link>
                        </li>
                        <li>
                            <Link href="/sign-in" className="hover:text-slate-900 text-slate-500 transition-colors">
                                Login
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-slate-900 font-bold uppercase mb-4">
                        Jurídico
                    </h4>
                    <ul className="space-y-2">
                        <li>
                            <Link href="#" className="hover:text-slate-900 text-slate-500 transition-colors">
                                Terms of Service
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-slate-900 text-slate-500 transition-colors">
                                Politica de privacidade
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-slate-900 text-slate-500 transition-colors">
                                GDPR Compliance
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
