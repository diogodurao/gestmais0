import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Navbar() {
    return (
        <nav className="h-14 bg-white/95 backdrop-blur-sm border-b border-gray-200 fixed w-full top-0 z-50 flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="font-semibold text-gray-900 text-subtitle">GestMais</span>
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-6 text-body font-medium text-gray-600">
                <Link href="#features" className="hover:text-gray-900 transition-colors">
                    Módulos
                </Link>
                <Link href="#pricing" className="hover:text-gray-900 transition-colors">
                    Preços
                </Link>
                <Link href="#faq" className="hover:text-gray-900 transition-colors">
                    FAQ
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <Link href="/sign-in">
                    <Button variant="ghost" size="sm" className="text-body">
                        Entrar
                    </Button>
                </Link>
            </div>
        </nav>
    );
}
