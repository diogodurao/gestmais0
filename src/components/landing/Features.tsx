import { Terminal, LayoutGrid, ShieldCheck, Zap, FileText } from "lucide-react";

export function Features() {
    return (
        <section id="features" className="py-24 bg-grid relative">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 bg-white inline-block px-4 py-1 border border-slate-300 shadow-sm">
                        Especificações do Sistema
                    </h2>
                </div>

                <div className="p-8 bg-white border border-slate-300 shadow-[4px_4px_0px_#cbd5e1]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* FINANCE */}
                        <div className="group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-blue-50 border border-blue-200 flex items-center justify-center">
                                    <LayoutGrid className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 uppercase tracking-tighter text-sm">
                                    Utilização simples
                                </h3>
                            </div>
                            <ul className="space-y-3 pl-2 border-l border-slate-200">
                                {["Fácil de usar", "Interface intuitiva", "Funcionalidades essenciais"].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs font-mono text-slate-600">
                                        <span>- {item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 uppercase tracking-tighter text-sm">
                                    Acesso Baseado em Funções
                                </h3>
                            </div>
                            <ul className="space-y-3 pl-2 border-l border-slate-200">
                                {["Acesso administrador e residente", "Transparência total", "Atualização de dados em tempo real "].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs font-mono text-slate-600">
                                        <span>- {item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-amber-50 border border-amber-200 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-amber-600" />
                                </div>
                                <h3 className="font-bold text-slate-900 uppercase tracking-tighter text-sm">
                                    Quotas Automatizadas
                                </h3>
                            </div>
                            <ul className="space-y-3 pl-2 border-l border-slate-200">
                                {["Identificação automática de pagamentos", "Cálculo por permilagem", "Informações adicionais"].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs font-mono text-slate-600">
                                        <span>- {item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
