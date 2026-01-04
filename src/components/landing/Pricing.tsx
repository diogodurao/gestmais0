import Link from "next/link";

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-grid relative">
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 bg-white inline-block px-4 py-1 border border-slate-300 shadow-sm">
                        Estrutura de Custos
                    </h2>
                    <br />
                    <p className="text-slate-500 mt-4 bg-white/80 backdrop-blur-sm inline-block px-3 py-1 text-sm border border-slate-200">
                        Preços transparentes.
                    </p>
                </div>

                <div className="max-w-sm mx-auto tech-card p-8 hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#e2e8f0] transition-all duration-300 bg-white">
                    <div className="mb-6">
                        <span className="text-5xl font-bold text-slate-900 tracking-tight">3€</span>
                        <span className="text-sm text-slate-500 font-bold font-mono block mt-2 uppercase tracking-wide">/ por fração</span>
                    </div>

                    <div className="h-px bg-slate-200 w-full mb-6"></div>

                    <ul className="space-y-4 mb-8 text-left">
                        <li className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                            <div className="w-5 h-5 bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center rounded-sm">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            Frações Ilimitadas
                        </li>
                        <li className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                            <div className="w-5 h-5 bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center rounded-sm">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            Automatização integrada
                        </li>
                        <li className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                            <div className="w-5 h-5 bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center rounded-sm">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            Gestão de Quotas Extraordinárias
                        </li>
                    </ul>

                    <Link
                        href="/sign-in"
                        className="btn-primary w-full py-3 justify-center text-sm"
                    >
                        Começar Agora
                    </Link>
                </div>
            </div>
        </section>
    );
}
