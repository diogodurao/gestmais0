import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function Pricing() {
    const features = [
        "Frações Ilimitadas",
        "Automatização integrada",
        "Gestão de Quotas Extraordinárias"
    ];

    return (
        <section id="pricing" className="py-8 bg-pearl">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <div className="mb-8">
                    <h2 className="text-heading font-semibold text-gray-900 inline-block px-3 py-1.5 bg-white border border-gray-200 rounded-sm">
                        Estrutura de Custos
                    </h2>
                    <p className="text-body text-gray-600 mt-3 inline-block px-2 py-1">
                        Preços transparentes.
                    </p>
                </div>

                <div className="max-w-xs mx-auto">
                    <Card variant="neutral" className="transition-shadow" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <CardContent className="p-6">
                            <div className="mb-4">
                                <span className="text-2xl font-semibold text-gray-900">3€</span>
                                <span className="text-body text-gray-600 block mt-1">/ por fração</span>
                            </div>

                            <div className="h-px bg-gray-200 w-full mb-4"></div>

                            <ul className="space-y-2 mb-6 text-left">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-body text-gray-700">
                                        <div className="w-4 h-4 bg-success-light text-success border border-gray-200 flex items-center justify-center rounded-sm flex-shrink-0">
                                            <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/sign-in" className="block">
                                <Button variant="primary" size="md" className="w-full h-8">
                                    Começar Agora
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
