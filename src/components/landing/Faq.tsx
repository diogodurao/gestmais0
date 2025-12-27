import { ChevronDown } from "lucide-react";

interface FaqProps {
    dict: {
        faq: {
            title: string;
            items: { question: string; answer: string }[];
        }
    };
}

export function Faq({ dict }: FaqProps) {
    return (
        <section id="faq" className="py-24 bg-white relative border-b border-slate-200">
            <div className="max-w-3xl mx-auto px-6 relative z-10">
                <div className="mb-12 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 inline-block px-4 py-1 border border-slate-300 shadow-sm bg-slate-50">
                        {dict.faq.title}
                    </h2>
                </div>

                <div className="space-y-4">
                    {dict.faq.items.map((item, i) => (
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
