import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { ArrowRight, Palette, Type, MousePointer, LayoutGrid, Table2, MessageSquare } from "lucide-react"

const sections = [
    {
        title: "Typography",
        description: "Text sizes, weights, and spacing",
        href: "/ui-preview/typography",
        icon: Type,
    },
    {
        title: "Buttons",
        description: "All button variants and sizes",
        href: "/ui-preview/buttons",
        icon: MousePointer,
    },
    {
        title: "Forms",
        description: "Input, Select, Textarea components",
        href: "/ui-preview/forms",
        icon: LayoutGrid,
    },
    {
        title: "Cards",
        description: "Card layouts and compositions",
        href: "/ui-preview/cards",
        icon: LayoutGrid,
    },
    {
        title: "Badges",
        description: "Status badges and semantic colors",
        href: "/ui-preview/badges",
        icon: Palette,
    },
    {
        title: "Tables",
        description: "Data tables and cells",
        href: "/ui-preview/tables",
        icon: Table2,
    },
    {
        title: "Modals",
        description: "Dialogs and confirmations",
        href: "/ui-preview/modals",
        icon: MessageSquare,
    },
]

export default function UIPreviewPage() {
    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="bg-white tech-border p-6">
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                    Design System Preview
                </h1>
                <p className="text-content text-slate-600 mt-2">
                    Test and visualize UI components to ensure consistency across the application.
                </p>
            </div>

            {/* Quick Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Buttons Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Buttons</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button size="sm">Primary</Button>
                        <Button size="sm" variant="secondary">Secondary</Button>
                        <Button size="sm" variant="outline">Outline</Button>
                        <Button size="sm" variant="danger">Danger</Button>
                    </CardContent>
                </Card>

                {/* Badges Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Badges</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Badge variant="success" dot>Active</Badge>
                        <Badge variant="warning" dot>Pending</Badge>
                        <Badge variant="danger" dot>Error</Badge>
                        <Badge variant="info" dot>Info</Badge>
                        <Badge variant="neutral" dot>Neutral</Badge>
                    </CardContent>
                </Card>

                {/* Form Elements Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Form Elements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Input placeholder="Text input..." />
                        <ProgressBar value={65} max={100} size="sm" variant="auto" />
                    </CardContent>
                </Card>
            </div>

            {/* Navigation Cards */}
            <div>
                <h2 className="text-body font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Component Pages
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {sections.map((section) => (
                        <Link key={section.href} href={section.href}>
                            <div className="bg-white tech-border p-4 hover:shadow-md transition-all group cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <section.icon className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                                <h3 className="font-bold text-content text-slate-800 mt-3 uppercase tracking-tight">
                                    {section.title}
                                </h3>
                                <p className="text-body text-slate-500 mt-1">
                                    {section.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Design Tokens Reference */}
            <div className="bg-white tech-border p-4">
                <h2 className="text-body font-bold text-slate-500 uppercase tracking-wider mb-4">
                    Design Tokens Quick Reference
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Typography */}
                    <div>
                        <h3 className="text-label font-bold text-slate-700 uppercase mb-2">Typography Scale</h3>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <code className="text-micro bg-slate-100 px-1">.text-micro</code>
                                <span className="text-micro text-slate-600">9px</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-micro bg-slate-100 px-1">.text-label</code>
                                <span className="text-label text-slate-600">10px</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-micro bg-slate-100 px-1">.text-body</code>
                                <span className="text-body text-slate-600">11px</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-micro bg-slate-100 px-1">.text-content</code>
                                <span className="text-content text-slate-600">13px</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-micro bg-slate-100 px-1">.text-heading</code>
                                <span className="text-heading text-slate-600">15px</span>
                            </div>
                        </div>
                    </div>

                    {/* Semantic Colors */}
                    <div>
                        <h3 className="text-label font-bold text-slate-700 uppercase mb-2">Semantic Colors</h3>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
                                <span className="text-body text-slate-600">success (emerald)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-amber-500 rounded-sm"></div>
                                <span className="text-body text-slate-600">warning (amber)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-rose-500 rounded-sm"></div>
                                <span className="text-body text-slate-600">danger (rose)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                                <span className="text-body text-slate-600">info (blue)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-slate-500 rounded-sm"></div>
                                <span className="text-body text-slate-600">neutral (slate)</span>
                            </div>
                        </div>
                    </div>

                    {/* Sizes */}
                    <div>
                        <h3 className="text-label font-bold text-slate-700 uppercase mb-2">Component Sizes</h3>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <code className="text-micro bg-slate-100 px-1">xs</code>
                                <span className="text-body text-slate-600">Extra small</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-micro bg-slate-100 px-1">sm</code>
                                <span className="text-body text-slate-600">Small</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-micro bg-slate-100 px-1">md</code>
                                <span className="text-body text-slate-600">Medium (default)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-micro bg-slate-100 px-1">lg</code>
                                <span className="text-body text-slate-600">Large</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
