import { LayoutGrid, ShieldCheck, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function Features() {
    const features = [
        {
            icon: LayoutGrid,
            title: "Utilização Simples",
            color: "info",
            items: ["Fácil de usar", "Interface intuitiva", "Funcionalidades essenciais"]
        },
        {
            icon: ShieldCheck,
            title: "Acesso Baseado em Funções",
            color: "success",
            items: ["Acesso administrador e residente", "Transparência total", "Atualização de dados em tempo real"]
        },
        {
            icon: FileText,
            title: "Quotas Automatizadas",
            color: "warning",
            items: ["Identificação automática de pagamentos", "Cálculo por permilagem", "Informações adicionais"]
        }
    ];

    return (
        <section id="features" className="py-8 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="mb-8">
                    <h2 className="text-heading font-semibold text-gray-900 inline-block px-3 py-1.5 bg-white border border-gray-200 rounded-sm">
                        Especificações do Sistema
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        const bgColor = feature.color === "success" ? "bg-success-light" :
                                       feature.color === "warning" ? "bg-warning-light" : "bg-info-light";
                        const iconColor = feature.color === "success" ? "text-success" :
                                         feature.color === "warning" ? "text-warning" : "text-info";

                        return (
                            <Card key={idx} variant="neutral">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 ${bgColor} border border-gray-200 flex items-center justify-center rounded-sm`}>
                                            <Icon className={`w-3 h-3 ${iconColor}`} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-body">
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <ul className="space-y-1.5 pl-2 border-l-2 border-gray-200">
                                        {feature.items.map((item, i) => (
                                            <li key={i} className="text-body text-gray-600">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
