import { ReactNode } from "react"
import Link from "next/link"

export const metadata = {
    title: "UI Preview | Design System",
    description: "Preview and test UI components",
}

const navLinks = [
    { href: "/ui-preview", label: "Overview" },
    { href: "/ui-preview/design-system", label: "Design System" },
    { href: "/ui-preview/typography", label: "Typography" },
    { href: "/ui-preview/buttons", label: "Buttons" },
    { href: "/ui-preview/forms", label: "Forms" },
    { href: "/ui-preview/cards", label: "Cards" },
    { href: "/ui-preview/badges", label: "Badges" },
    { href: "/ui-preview/tables", label: "Tables" },
    { href: "/ui-preview/modals", label: "Modals" },
]

export default function UIPreviewLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-300 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/ui-preview" className="font-bold text-heading text-slate-900 uppercase tracking-tight">
                                UI Preview
                            </Link>
                            <span className="bg-amber-100 text-amber-700 text-micro font-bold px-1.5 py-0.5 uppercase border border-amber-200 rounded-sm">
                                Dev Only
                            </span>
                        </div>
                        <Link
                            href="/dashboard"
                            className="text-body text-slate-500 hover:text-slate-700 font-medium"
                        >
                            ← Back to App
                        </Link>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto py-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-3 py-1.5 text-body font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 rounded-sm whitespace-nowrap transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    )
}
