import Link from "next/link";

export function Navbar() {
    return (
        <nav className="h-14 bg-white/90 backdrop-blur-sm border-b border-slate-300 fixed w-full top-0 z-50 flex items-center justify-between px-6 lg:px-12">
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <span className="font-bold text-slate-800 tracking-tight">GestMais</span>
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                <Link href="#features" className="hover:text-slate-900">
                    Módulos
                </Link>
                <Link href="#pricing" className="hover:text-slate-900">
                    Preços
                </Link>
                <Link href="#" className="hover:text-slate-900">
                    Documentação
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href="/sign-in"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3"
                >
                    Entrar
                </Link>

            </div>
        </nav>
    );
}
