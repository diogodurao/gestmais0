import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface HeroProps {
    cityName?: string;
}

export function Hero({ cityName }: HeroProps) {
    const titleLine1 = cityName ? `Gestão em ${cityName}.` : "Gestão de Condomínio.";
    const subtitle = cityName
        ? `Abandone o caos. O GestMais é o sistema operacional para condomínios em ${cityName}, desenhado para transparência e velocidade.`
        : "Abandone o caos de grupos de WhatsApp e recibos em papel. Software de gestão desenhado para redução de trabalho a 90%.";

    return (
        <header className="pt-24 pb-8 px-6 bg-pearl min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center text-center">
            <div className="max-w-2xl mt-8 mb-4">
                <h1 className="text-display-sm md:text-display font-semibold text-gray-900 mb-4 leading-tight">
                    {titleLine1}
                    <br />
                    <span className="text-gray-500">Engenharia de Precisão.</span>
                </h1>

                <p className="text-base text-gray-600 mb-6 max-w-lg mx-auto">
                    {subtitle}
                </p>

                <Link href="/sign-in">
                    <Button size="md" className="h-8">
                        Iniciar Sistema
                    </Button>
                </Link>
            </div>

            {/* DASHBOARD PREVIEW */}
            <div className="mt-8 w-full max-w-4xl bg-white border border-gray-200 rounded-md overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="h-7 bg-gray-50 border-b border-gray-200 flex items-center px-3 justify-between">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    </div>
                    <div className="text-label text-gray-400">
                        admin@gestmais.com
                    </div>
                    <div className="w-8"></div>
                </div>

                <div className="bg-gray-100 grid grid-cols-[160px_1fr] h-[320px] text-left">
                    <div className="bg-pearl p-3 space-y-1 hidden md:block border-r border-gray-200">
                        <div className="h-3 w-16 bg-gray-200 rounded-sm mb-4"></div>
                        <div className="h-7 w-full bg-white border-l-2 border-primary"></div>
                        <div className="h-7 w-full"></div>
                        <div className="h-7 w-full"></div>
                    </div>
                    <div className="bg-white p-4 relative overflow-hidden w-full">
                        <div className="flex justify-between mb-6">
                            <div className="h-6 w-32 bg-gray-100 rounded-sm"></div>
                            <div className="h-6 w-16 bg-gray-800 rounded-sm"></div>
                        </div>
                        <div className="border border-gray-200 rounded-sm overflow-hidden">
                            <div className="h-7 bg-gray-50 border-b border-gray-200"></div>
                            <div className="h-8 border-b border-gray-100 flex items-center px-3 justify-between">
                                <div className="w-1/3 h-2 bg-gray-100 rounded-sm"></div>
                                <div className="px-2 py-0.5 bg-success-light text-success text-label font-medium rounded-sm">
                                    PAGO
                                </div>
                            </div>
                            <div className="h-8 border-b border-gray-100 flex items-center px-3 justify-between">
                                <div className="w-1/4 h-2 bg-gray-100 rounded-sm"></div>
                                <div className="px-2 py-0.5 bg-success-light text-success text-label font-medium rounded-sm">
                                    PAGO
                                </div>
                            </div>
                            <div className="h-8 border-b border-gray-100 flex items-center px-3 justify-between">
                                <div className="w-1/3 h-2 bg-gray-100 rounded-sm"></div>
                                <div className="px-2 py-0.5 bg-error-light text-error text-label font-medium rounded-sm">
                                    ATRASO
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
