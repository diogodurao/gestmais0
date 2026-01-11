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
        <section id="faq" className="py-8 bg-white border-b border-gray-200">
            <div className="max-w-3xl mx-auto px-6">
                <div className="mb-8 text-center">
                    <h2 className="text-heading font-semibold text-gray-900 inline-block px-3 py-1.5 border border-gray-200 rounded-sm bg-pearl">
                        Perguntas Frequentes
                    </h2>
                </div>

                <div className="space-y-3">
                    {items.map((item, i) => (
                        <details
                            key={i}
                            className="group bg-white border border-gray-200 rounded-lg [&_summary::-webkit-details-marker]:hidden"
                        >
                            <summary className="flex cursor-pointer items-center justify-between gap-2 p-4 text-gray-900 font-semibold transition-colors group-hover:bg-gray-50 rounded-lg">
                                <h3 className="text-body">{item.question}</h3>
                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180 text-gray-400" />
                            </summary>
                            <div className="px-4 pb-4 text-body text-gray-600 border-t border-gray-100 pt-3">
                                <p>{item.answer}</p>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
