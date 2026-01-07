import { Button } from "@/components/ui/Button"
import { Plus, Save, Trash2, Download, Settings, ChevronRight } from "lucide-react"

export default function ButtonsPage() {
    return (
        <div className="space-y-8">
            <div className="bg-white tech-border p-6">
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                    Buttons
                </h1>
                <p className="text-content text-slate-600 mt-2">
                    Button variants, sizes, and states.
                </p>
            </div>

            {/* Variants */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Variants
                    </h2>
                </div>
                <div className="p-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="space-y-2">
                            <Button variant="primary">Primary</Button>
                            <p className="text-micro text-slate-500">variant=&quot;primary&quot;</p>
                        </div>
                        <div className="space-y-2">
                            <Button variant="secondary">Secondary</Button>
                            <p className="text-micro text-slate-500">variant=&quot;secondary&quot;</p>
                        </div>
                        <div className="space-y-2">
                            <Button variant="outline">Outline</Button>
                            <p className="text-micro text-slate-500">variant=&quot;outline&quot;</p>
                        </div>
                        <div className="space-y-2">
                            <Button variant="ghost">Ghost</Button>
                            <p className="text-micro text-slate-500">variant=&quot;ghost&quot;</p>
                        </div>
                        <div className="space-y-2">
                            <Button variant="danger">Danger</Button>
                            <p className="text-micro text-slate-500">variant=&quot;danger&quot;</p>
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
                        <div className="space-y-2">
                            <Button size="xs">Extra Small</Button>
                            <p className="text-micro text-slate-500">size=&quot;xs&quot; (h-6)</p>
                        </div>
                        <div className="space-y-2">
                            <Button size="sm">Small</Button>
                            <p className="text-micro text-slate-500">size=&quot;sm&quot; (h-7)</p>
                        </div>
                        <div className="space-y-2">
                            <Button size="md">Medium</Button>
                            <p className="text-micro text-slate-500">size=&quot;md&quot; (h-9)</p>
                        </div>
                        <div className="space-y-2">
                            <Button size="lg">Large</Button>
                            <p className="text-micro text-slate-500">size=&quot;lg&quot; (h-11)</p>
                        </div>
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
                <div className="p-4">
                    <div className="flex flex-wrap gap-3">
                        <Button>
                            <Plus className="w-4 h-4" />
                            Add Item
                        </Button>
                        <Button variant="secondary">
                            <Save className="w-4 h-4" />
                            Save
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                        <Button variant="danger">
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                        <Button variant="ghost">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
                        <Button variant="outline">
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* States */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        States
                    </h2>
                </div>
                <div className="p-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="space-y-2">
                            <Button>Normal</Button>
                            <p className="text-micro text-slate-500">Default state</p>
                        </div>
                        <div className="space-y-2">
                            <Button disabled>Disabled</Button>
                            <p className="text-micro text-slate-500">disabled</p>
                        </div>
                        <div className="space-y-2">
                            <Button isLoading>Loading</Button>
                            <p className="text-micro text-slate-500">isLoading</p>
                        </div>
                        <div className="space-y-2">
                            <Button isLoading variant="secondary">Saving...</Button>
                            <p className="text-micro text-slate-500">isLoading + secondary</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Full Width
                    </h2>
                </div>
                <div className="p-4 space-y-3">
                    <Button fullWidth>Full Width Primary</Button>
                    <Button fullWidth variant="outline">Full Width Outline</Button>
                </div>
            </div>

            {/* Button Groups */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Button Groups Pattern
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <p className="text-label font-bold text-slate-500 uppercase mb-2">Horizontal Group</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">Cancel</Button>
                            <Button size="sm">Confirm</Button>
                        </div>
                    </div>
                    <div>
                        <p className="text-label font-bold text-slate-500 uppercase mb-2">Action Bar</p>
                        <div className="flex items-center gap-2 bg-slate-50 p-2 border border-slate-200">
                            <Button variant="ghost" size="xs">
                                <Trash2 className="w-3 h-3" />
                            </Button>
                            <div className="h-4 w-px bg-slate-300" />
                            <Button variant="outline" size="xs">Edit</Button>
                            <Button size="xs">Save</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Size Comparison Grid */}
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
                                <th className="text-left text-micro font-bold text-slate-500 uppercase p-2">Primary</th>
                                <th className="text-left text-micro font-bold text-slate-500 uppercase p-2">Secondary</th>
                                <th className="text-left text-micro font-bold text-slate-500 uppercase p-2">Outline</th>
                                <th className="text-left text-micro font-bold text-slate-500 uppercase p-2">Ghost</th>
                                <th className="text-left text-micro font-bold text-slate-500 uppercase p-2">Danger</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(["xs", "sm", "md", "lg"] as const).map((size) => (
                                <tr key={size} className="border-b border-slate-100">
                                    <td className="p-2 text-label font-mono">{size}</td>
                                    <td className="p-2"><Button size={size} variant="primary">Button</Button></td>
                                    <td className="p-2"><Button size={size} variant="secondary">Button</Button></td>
                                    <td className="p-2"><Button size={size} variant="outline">Button</Button></td>
                                    <td className="p-2"><Button size={size} variant="ghost">Button</Button></td>
                                    <td className="p-2"><Button size={size} variant="danger">Button</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
