import Link from "next/link";

interface FooterProps {
    dict: any;
}

export function Footer({ dict }: FooterProps) {
    return (
        <footer className="pt-20 pb-12 bg-grid text-xs font-mono text-slate-600 relative">

            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 tracking-tight mb-4">
                        <div className="w-4 h-4 bg-slate-900 text-white rounded-sm flex items-center justify-center text-[10px]">
                            G
                        </div>
                        GestMais
                    </div>
                    <p className="max-w-xs leading-relaxed text-slate-500">
                        {dict.footer.designedIn}
                        <br />
                        {dict.footer.rights}
                    </p>
                </div>

                <div>
                    <h4 className="text-slate-900 font-bold uppercase mb-4">
                        {dict.footer.sitemap}
                    </h4>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/" className="hover:text-slate-900 text-slate-500 transition-colors">
                                /home
                            </Link>
                        </li>
                        <li>
                            <Link href="/#features" className="hover:text-slate-900 text-slate-500 transition-colors">
                                /features
                            </Link>
                        </li>
                        <li>
                            <Link href="/#pricing" className="hover:text-slate-900 text-slate-500 transition-colors">
                                /pricing
                            </Link>
                        </li>
                        <li>
                            <Link href="/sign-in" className="hover:text-slate-900 text-slate-500 transition-colors">
                                /login
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-slate-900 font-bold uppercase mb-4">
                        {dict.footer.legal}
                    </h4>
                    <ul className="space-y-2">
                        <li>
                            <Link href="#" className="hover:text-slate-900 text-slate-500 transition-colors">
                                Terms_of_Service.pdf
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-slate-900 text-slate-500 transition-colors">
                                Privacy_Policy.pdf
                            </Link>
                        </li>
                        <li>
                            <Link href="#" className="hover:text-slate-900 text-slate-500 transition-colors">
                                GDPR_Compliance
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
