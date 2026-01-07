import { Badge } from "@/components/ui/Badge"
import { Check, AlertCircle, X, Info, Clock, Star, Zap } from "lucide-react"

export default function BadgesPage() {
    return (
        <div className="space-y-8">
            <div className="bg-white tech-border p-6">
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                    Badges
                </h1>
                <p className="text-content text-slate-600 mt-2">
                    Badge component with semantic variants, sizes, and icons.
                </p>
            </div>

            {/* Semantic Variants */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Semantic Variants
                    </h2>
                </div>
                <div className="p-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="space-y-2 text-center">
                            <Badge variant="success">Success</Badge>
                            <p className="text-micro text-slate-500">success</p>
                        </div>
                        <div className="space-y-2 text-center">
                            <Badge variant="warning">Warning</Badge>
                            <p className="text-micro text-slate-500">warning</p>
                        </div>
                        <div className="space-y-2 text-center">
                            <Badge variant="danger">Danger</Badge>
                            <p className="text-micro text-slate-500">danger</p>
                        </div>
                        <div className="space-y-2 text-center">
                            <Badge variant="info">Info</Badge>
                            <p className="text-micro text-slate-500">info</p>
                        </div>
                        <div className="space-y-2 text-center">
                            <Badge variant="neutral">Neutral</Badge>
                            <p className="text-micro text-slate-500">neutral</p>
                        </div>
                        <div className="space-y-2 text-center">
                            <Badge variant="outline">Outline</Badge>
                            <p className="text-micro text-slate-500">outline</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sizes */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Sizes
                    </h2>
                </div>
                <div className="p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-2 text-center">
                            <Badge size="xs">Extra Small</Badge>
                            <p className="text-micro text-slate-500">xs (h-4)</p>
                        </div>
                        <div className="space-y-2 text-center">
                            <Badge size="sm">Small</Badge>
                            <p className="text-micro text-slate-500">sm (h-5)</p>
                        </div>
                        <div className="space-y-2 text-center">
                            <Badge size="md">Medium</Badge>
                            <p className="text-micro text-slate-500">md (h-6)</p>
                        </div>
                        <div className="space-y-2 text-center">
                            <Badge size="lg">Large</Badge>
                            <p className="text-micro text-slate-500">lg (h-7)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* With Dot */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        With Status Dot
                    </h2>
                </div>
                <div className="p-4">
                    <div className="flex flex-wrap gap-3">
                        <Badge variant="success" dot>Active</Badge>
                        <Badge variant="warning" dot>Pending</Badge>
                        <Badge variant="danger" dot>Offline</Badge>
                        <Badge variant="info" dot>Processing</Badge>
                        <Badge variant="neutral" dot>Inactive</Badge>
                        <Badge variant="outline" dot>Draft</Badge>
                    </div>
                </div>
            </div>

            {/* With Icons */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        With Icons
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <p className="text-label font-bold text-slate-500 uppercase mb-3">Custom Icons</p>
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="success" icon={Check}>Approved</Badge>
                            <Badge variant="warning" icon={Clock}>Pending</Badge>
                            <Badge variant="danger" icon={X}>Rejected</Badge>
                            <Badge variant="info" icon={Info}>Information</Badge>
                            <Badge variant="neutral" icon={Star}>Featured</Badge>
                            <Badge variant="outline" icon={Zap}>New</Badge>
                        </div>
                    </div>

                    <div>
                        <p className="text-label font-bold text-slate-500 uppercase mb-3">Auto Icons (based on variant)</p>
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="success" icon="auto">Success</Badge>
                            <Badge variant="warning" icon="auto">Warning</Badge>
                            <Badge variant="danger" icon="auto">Error</Badge>
                            <Badge variant="info" icon="auto">Info</Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Size × Variant Matrix */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Size × Variant Matrix
                    </h2>
                </div>
                <div className="p-4 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left text-micro font-bold text-slate-500 uppercase p-2">Size</th>
                                <th className="text-left text-micro font-bold text-slate-500 uppercase p-2">Success</th>
                                <th className="text-left text-micro font-bold text-slate-500 uppercase p-2">Warning</th>
                                <th className="text-left text-micro font-bold text-slate-500 uppercase p-2">Danger</th>
                                <th className="text-left text-micro font-bold text-slate-500 uppercase p-2">Info</th>
                                <th className="text-left text-micro font-bold text-slate-500 uppercase p-2">Neutral</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(["xs", "sm", "md", "lg"] as const).map((size) => (
                                <tr key={size} className="border-b border-slate-100">
                                    <td className="p-2 text-label font-mono">{size}</td>
                                    <td className="p-2"><Badge size={size} variant="success" dot>Active</Badge></td>
                                    <td className="p-2"><Badge size={size} variant="warning" dot>Pending</Badge></td>
                                    <td className="p-2"><Badge size={size} variant="danger" dot>Error</Badge></td>
                                    <td className="p-2"><Badge size={size} variant="info" dot>Info</Badge></td>
                                    <td className="p-2"><Badge size={size} variant="neutral" dot>Inactive</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CSS Status Classes */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        CSS Status Classes (globals.css)
                    </h2>
                </div>
                <div className="p-4">
                    <p className="text-body text-slate-600 mb-4">
                        These are the legacy CSS classes defined in globals.css. Consider using the Badge component instead.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <div className="space-y-2">
                            <span className="status-badge status-active">Active</span>
                            <p className="text-micro text-slate-500">.status-active</p>
                        </div>
                        <div className="space-y-2">
                            <span className="status-badge status-pending">Pending</span>
                            <p className="text-micro text-slate-500">.status-pending</p>
                        </div>
                        <div className="space-y-2">
                            <span className="status-badge status-alert">Alert</span>
                            <p className="text-micro text-slate-500">.status-alert</p>
                        </div>
                        <div className="space-y-2">
                            <span className="status-badge status-neutral">Neutral</span>
                            <p className="text-micro text-slate-500">.status-neutral</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Examples */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Common Usage Patterns
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    {/* In a list item */}
                    <div className="space-y-2">
                        <p className="text-label font-bold text-slate-500 uppercase">In List Items</p>
                        <div className="space-y-2">
                            {[
                                { name: "John Doe", status: "success", label: "Active" },
                                { name: "Jane Smith", status: "warning", label: "Pending" },
                                { name: "Bob Wilson", status: "danger", label: "Inactive" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-2 border border-slate-200 bg-white">
                                    <span className="text-content text-slate-700">{item.name}</span>
                                    <Badge variant={item.status as "success" | "warning" | "danger"} size="sm" dot>
                                        {item.label}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* In a header */}
                    <div className="space-y-2">
                        <p className="text-label font-bold text-slate-500 uppercase">In Headers</p>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200">
                            <span className="text-heading font-bold text-slate-900">Dashboard</span>
                            <Badge variant="info" size="xs">Beta</Badge>
                        </div>
                    </div>

                    {/* Tag-like usage */}
                    <div className="space-y-2">
                        <p className="text-label font-bold text-slate-500 uppercase">As Tags</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" size="sm">React</Badge>
                            <Badge variant="outline" size="sm">TypeScript</Badge>
                            <Badge variant="outline" size="sm">Next.js</Badge>
                            <Badge variant="outline" size="sm">Tailwind</Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
