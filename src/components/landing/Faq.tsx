import { ChevronDown } from "lucide-react";

export function Faq() {
    const items = [
        {
            question: "O que é a GestMais?",
            answer: "A GestMais é um software de gestão de condomínios que visa reduzir o trabalho administrativo a 90% e proporcionar transparência e velocidade na gestão de condomínios."
        },
        {
            question: "Como funciona?",
            answer: "O administrador do condominio cria o ecossitema do prédio com todos os dados necessários, e o residente terá acesso via um identifcador único ao prédio."
        }
    ];

    return (
        <section id="faq" className="py-24 bg-white relative border-b border-slate-200">
            <div className="max-w-3xl mx-auto px-6 relative z-10">
                <div className="mb-12 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 inline-block px-4 py-1 border border-slate-300 shadow-sm bg-slate-50">
                        Perguntas Frequentes
                    </h2>
                </div>

                <div className="space-y-4">
                    {items.map((item, i) => (
                        <details
                            key={i}
                            className="group tech-card bg-white [&_summary::-webkit-details-marker]:hidden"
                        >
                            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 font-bold transition-colors group-hover:bg-slate-50">
                                <h3 className="text-base">{item.question}</h3>
                                <ChevronDown className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180 text-slate-400" />
                            </summary>
                            <div className="px-6 pb-6 leading-relaxed text-slate-600 border-t border-slate-100 pt-4">
                                <p>{item.answer}</p>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
