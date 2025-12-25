import Link from "next/link";

interface NavbarProps {
    dict: any; // Using any for now, ideally we define the Dictionary type
    lang: string;
}

export function Navbar({ dict, lang }: NavbarProps) {
    return (
        <nav className="h-14 bg-white/90 backdrop-blur-sm border-b border-slate-300 fixed w-full top-0 z-50 flex items-center justify-between px-6 lg:px-12">
            <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 tracking-tight">GestMais</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                <Link href="#features" className="hover:text-slate-900">
                    {dict.nav.modules}
                </Link>
                <Link href="#pricing" className="hover:text-slate-900">
                    {dict.nav.pricing}
                </Link>
                <Link href="#" className="hover:text-slate-900">
                    {dict.nav.docs}
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href="/sign-in"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3"
                >
                    {dict.nav.login}
                </Link>

            </div>
        </nav>
    );
}
