import Link from "next/link";
import { Terminal } from "lucide-react";

interface HeroProps {
    cityName?: string;
}

export function Hero({ cityName }: HeroProps) {
    const titleLine1 = cityName ? `Gestão em ${cityName}.` : "Gestão de Condomínio.";
    const subtitle = cityName
        ? `Abandone o caos. O GestMais é o sistema operacional para condomínios em ${cityName}, desenhado para transparência e velocidade.`
        : "Abandone o caos de grupos de WhatsApp e recibos em papel. Software de gestão desenhado para redução de trabalho a 90%.";

    return (
        <header className="pt-32 pb-20 px-6 lg:px-12 bg-grid min-h-screen flex flex-col items-center justify-center text-center relative">
            <div className="max-w-3xl z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-300 rounded-full text-xs font-mono text-slate-600 mb-6">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    ESTADO DO SISTEMA: OPERACIONAL
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
                    {titleLine1}
                    <br />
                    <span className="text-slate-400">Engenharia de Precisão.</span>
                </h1>

                <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
                    {subtitle}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/sign-in" className="btn-primary cursor-pointer">
                        <Terminal className="w-4 h-4" />
                        Iniciar Sistema
                    </Link>
                </div>
            </div>

            {/* DASHBOARD PREVIEW */}
            <div className="mt-16 w-full max-w-5xl bg-white border border-slate-300 shadow-2xl shadow-slate-300/50 rounded-sm overflow-hidden z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="h-8 bg-slate-100 border-b border-slate-300 flex items-center px-3 justify-between">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                        admin@gestmais.com — /dashboard/overview
                    </div>
                    <div className="w-10"></div>
                </div>

                <div className="p-1 bg-slate-200 grid grid-cols-[200px_1fr] gap-px h-[400px] text-left">
                    <div className="bg-slate-50 p-4 space-y-2 hidden md:block">
                        <div className="h-4 w-24 bg-slate-200 rounded-sm mb-6"></div>
                        <div className="h-8 w-full bg-white border-l-2 border-blue-600 shadow-sm"></div>
                        <div className="h-8 w-full bg-transparent"></div>
                        <div className="h-8 w-full bg-transparent"></div>
                    </div>
                    <div className="bg-white p-6 relative overflow-hidden w-full">
                        <div className="flex justify-between mb-8">
                            <div className="h-8 w-48 bg-slate-100 rounded-sm"></div>
                            <div className="h-8 w-24 bg-slate-900 rounded-sm"></div>
                        </div>
                        <div className="border border-slate-200">
                            <div className="h-8 bg-slate-50 border-b border-slate-200"></div>
                            <div className="h-10 border-b border-slate-100 flex items-center px-4 justify-between">
                                <div className="w-1/3 h-3 bg-slate-100 rounded-sm"></div>
                                <div className="w-16 h-5 bg-emerald-50 text-emerald-700 text-[10px] flex items-center justify-center font-bold">
                                    PAGO
                                </div>
                            </div>
                            <div className="h-10 border-b border-slate-100 flex items-center px-4 justify-between">
                                <div className="w-1/4 h-3 bg-slate-100 rounded-sm"></div>
                                <div className="w-16 h-5 bg-emerald-50 text-emerald-700 text-[10px] flex items-center justify-center font-bold">
                                    PAGO
                                </div>
                            </div>
                            <div className="h-10 border-b border-slate-100 flex items-center px-4 justify-between">
                                <div className="w-1/3 h-3 bg-slate-100 rounded-sm"></div>
                                <div className="w-16 h-5 bg-rose-50 text-rose-700 text-[10px] flex items-center justify-center font-bold">
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
