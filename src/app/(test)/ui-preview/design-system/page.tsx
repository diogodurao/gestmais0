import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Check, AlertCircle, Info, Loader2 } from "lucide-react"

export default function DesignSystemPage() {
    return (
        <div className="space-y-8">
            <div className="bg-white tech-border p-6">
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                    Design System Principles
                </h1>
                <p className="text-content text-slate-600 mt-2">
                    Guidelines for maintaining consistent, accessible, and reusable UI across the application.
                </p>
            </div>

            {/* UI Elements */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        UI Elements
                    </h2>
                </div>
                <div className="p-4 space-y-6">
                    {/* Buttons */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Buttons
                        </h3>
                        <p className="text-body text-slate-500">
                            Labels, primary and secondary styles, consistent corner radius, shadows.
                        </p>
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200">
                            <Button size="sm">Primary Action</Button>
                            <Button size="sm" variant="secondary">Secondary</Button>
                            <Button size="sm" variant="outline">Outline</Button>
                            <Button size="sm" variant="ghost">Ghost</Button>
                        </div>
                        <div className="text-micro text-slate-400 space-y-1">
                            <p>• Use <code className="bg-slate-100 px-1">primary</code> for main actions (Save, Submit, Create)</p>
                            <p>• Use <code className="bg-slate-100 px-1">secondary</code> or <code className="bg-slate-100 px-1">outline</code> for secondary actions (Cancel, Back)</p>
                            <p>• Consistent <code className="bg-slate-100 px-1">rounded-sm</code> corner radius across all buttons</p>
                        </div>
                    </div>

                    {/* Form Inputs */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Form Inputs
                        </h3>
                        <p className="text-body text-slate-500">
                            Text fields, dropdowns, toggles, checkboxes share spacing, typography, and error styles.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200">
                            <div className="space-y-1">
                                <label className="text-label font-bold text-slate-500 uppercase">Default</label>
                                <Input placeholder="Text input..." />
                            </div>
                            <div className="space-y-1">
                                <label className="text-label font-bold text-slate-500 uppercase">Focus</label>
                                <Input placeholder="Focused..." className="ring-1 ring-slate-400 border-slate-400" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-label font-bold text-rose-600 uppercase">Error</label>
                                <Input placeholder="Invalid..." aria-invalid={true} />
                            </div>
                        </div>
                        <div className="text-micro text-slate-400 space-y-1">
                            <p>• Shared <code className="bg-slate-100 px-1">border-slate-300</code> default border</p>
                            <p>• Consistent <code className="bg-slate-100 px-1">focus:ring-1</code> focus indicator</p>
                            <p>• Error state uses <code className="bg-slate-100 px-1">border-rose-500</code></p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Navigation
                        </h3>
                        <p className="text-body text-slate-500">
                            Top bars, sidebars, tabs, menus, breadcrumbs - make current location obvious, keep primary actions easy to reach.
                        </p>
                        <div className="text-micro text-slate-400 space-y-1">
                            <p>• Sidebar for primary navigation (dashboard sections)</p>
                            <p>• Header for global actions (user menu, notifications)</p>
                            <p>• Use active states to show current location</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Design Basics */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Visual Design Basics
                    </h2>
                </div>
                <div className="p-4 space-y-6">
                    {/* Spacing System */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Layout - 4px Spacing System
                        </h3>
                        <p className="text-body text-slate-500">
                            Keep paddings, margins, and gaps consistent using multiples of 4px.
                        </p>
                        <div className="flex items-end gap-2 p-3 bg-slate-50 border border-slate-200">
                            {[1, 2, 3, 4, 6, 8].map((n) => (
                                <div key={n} className="text-center">
                                    <div
                                        className="bg-blue-500 mx-auto"
                                        style={{ width: `${n * 4}px`, height: `${n * 4}px` }}
                                    />
                                    <span className="text-micro text-slate-500 mt-1 block">{n * 4}px</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-micro text-slate-400">
                            <p>Common values: <code className="bg-slate-100 px-1">p-1</code> (4px), <code className="bg-slate-100 px-1">p-2</code> (8px), <code className="bg-slate-100 px-1">p-3</code> (12px), <code className="bg-slate-100 px-1">p-4</code> (16px)</p>
                        </div>
                    </div>

                    {/* Color */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Color Palette
                        </h3>
                        <p className="text-body text-slate-500">
                            1-2 accent colors, neutral scale (backgrounds, borders), clear semantic colors.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="space-y-2">
                                <p className="text-micro font-bold text-slate-500 uppercase">Primary</p>
                                <div className="flex gap-1">
                                    <div className="w-8 h-8 bg-slate-900 border" title="slate-900"></div>
                                    <div className="w-8 h-8 bg-slate-800 border" title="slate-800"></div>
                                    <div className="w-8 h-8 bg-slate-700 border" title="slate-700"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-micro font-bold text-slate-500 uppercase">Neutral</p>
                                <div className="flex gap-1">
                                    <div className="w-8 h-8 bg-slate-100 border" title="slate-100"></div>
                                    <div className="w-8 h-8 bg-slate-200 border" title="slate-200"></div>
                                    <div className="w-8 h-8 bg-slate-300 border" title="slate-300"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-micro font-bold text-slate-500 uppercase">Success</p>
                                <div className="flex gap-1">
                                    <div className="w-8 h-8 bg-emerald-50 border" title="emerald-50"></div>
                                    <div className="w-8 h-8 bg-emerald-500 border" title="emerald-500"></div>
                                    <div className="w-8 h-8 bg-emerald-700 border" title="emerald-700"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-micro font-bold text-slate-500 uppercase">Danger</p>
                                <div className="flex gap-1">
                                    <div className="w-8 h-8 bg-rose-50 border" title="rose-50"></div>
                                    <div className="w-8 h-8 bg-rose-500 border" title="rose-500"></div>
                                    <div className="w-8 h-8 bg-rose-700 border" title="rose-700"></div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div className="space-y-2">
                                <p className="text-micro font-bold text-slate-500 uppercase">Warning</p>
                                <div className="flex gap-1">
                                    <div className="w-8 h-8 bg-amber-50 border" title="amber-50"></div>
                                    <div className="w-8 h-8 bg-amber-500 border" title="amber-500"></div>
                                    <div className="w-8 h-8 bg-amber-700 border" title="amber-700"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-micro font-bold text-slate-500 uppercase">Info</p>
                                <div className="flex gap-1">
                                    <div className="w-8 h-8 bg-blue-50 border" title="blue-50"></div>
                                    <div className="w-8 h-8 bg-blue-500 border" title="blue-500"></div>
                                    <div className="w-8 h-8 bg-blue-700 border" title="blue-700"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Typography */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Typography Scale
                        </h3>
                        <p className="text-body text-slate-500">
                            Small type scale (label, body, subtitle, heading) - reuse across elements for cleaner hierarchy.
                        </p>
                        <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                            <p className="text-micro text-slate-600"><code className="bg-slate-200 px-1 mr-2">text-micro</code>9px - Tiny labels, table headers</p>
                            <p className="text-label text-slate-600"><code className="bg-slate-200 px-1 mr-2">text-label</code>10px - Form labels, badges</p>
                            <p className="text-body text-slate-600"><code className="bg-slate-200 px-1 mr-2">text-body</code>11px - Card titles, buttons</p>
                            <p className="text-content text-slate-600"><code className="bg-slate-200 px-1 mr-2">text-content</code>13px - Body text, inputs</p>
                            <p className="text-heading text-slate-600"><code className="bg-slate-200 px-1 mr-2">text-heading</code>15px - Page headings</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Design Patterns */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Design Patterns
                    </h2>
                </div>
                <div className="p-4 space-y-6">
                    {/* Cards */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Cards
                        </h3>
                        <p className="text-body text-slate-500">
                            Group related info (name, status, key stats, actions) with subtle borders or shadows.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Object Name</CardTitle>
                                    <Badge variant="success" size="xs" dot>Active</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-2 text-body">
                                        <div><span className="text-slate-500">Stat 1:</span> <span className="font-bold">123</span></div>
                                        <div><span className="text-slate-500">Stat 2:</span> <span className="font-bold">€456</span></div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Button size="xs" variant="outline">Edit</Button>
                                        <Button size="xs">View</Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="p-3 bg-slate-50 border border-slate-200 text-micro text-slate-500 space-y-1">
                                <p>✓ Subtle <code className="bg-slate-100 px-1">tech-border</code> (1px slate-300)</p>
                                <p>✓ Light <code className="bg-slate-100 px-1">shadow-sm</code></p>
                                <p>✓ Consistent header/content structure</p>
                                <p>✗ Avoid heavy outlines or deep shadows</p>
                            </div>
                        </div>
                    </div>

                    {/* Surfaces */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Surfaces
                        </h3>
                        <p className="text-body text-slate-500">
                            Prefer flat or very soft shadows; avoid mixing many different radii and shadow depths.
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 bg-white border border-slate-300 text-center">
                                <p className="text-micro text-slate-500">Flat</p>
                                <code className="text-micro bg-slate-100 px-1">border only</code>
                            </div>
                            <div className="p-4 bg-white border border-slate-300 shadow-sm text-center">
                                <p className="text-micro text-slate-500">Soft Shadow</p>
                                <code className="text-micro bg-slate-100 px-1">shadow-sm</code>
                            </div>
                            <div className="p-4 bg-white border border-slate-300 shadow-md text-center">
                                <p className="text-micro text-slate-500">Elevated</p>
                                <code className="text-micro bg-slate-100 px-1">shadow-md</code>
                            </div>
                        </div>
                        <p className="text-micro text-amber-600">⚠ Use consistent corner radius: <code className="bg-amber-100 px-1">rounded-sm</code> throughout</p>
                    </div>

                    {/* States */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Interactive States
                        </h3>
                        <p className="text-body text-slate-500">
                            Design hover, focus, active, disabled, loading, error states to communicate what can happen next.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                            <div className="text-center space-y-2">
                                <Button size="sm">Default</Button>
                                <p className="text-micro text-slate-500">Idle</p>
                            </div>
                            <div className="text-center space-y-2">
                                <Button size="sm" className="bg-slate-800">Hover</Button>
                                <p className="text-micro text-slate-500">:hover</p>
                            </div>
                            <div className="text-center space-y-2">
                                <Button size="sm" className="ring-1 ring-slate-400">Focus</Button>
                                <p className="text-micro text-slate-500">:focus</p>
                            </div>
                            <div className="text-center space-y-2">
                                <Button size="sm" className="bg-slate-950">Active</Button>
                                <p className="text-micro text-slate-500">:active</p>
                            </div>
                            <div className="text-center space-y-2">
                                <Button size="sm" disabled>Disabled</Button>
                                <p className="text-micro text-slate-500">:disabled</p>
                            </div>
                            <div className="text-center space-y-2">
                                <Button size="sm" isLoading>Loading</Button>
                                <p className="text-micro text-slate-500">loading</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout & Context Blocks */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Layout & Context Blocks
                    </h2>
                </div>
                <div className="p-4 space-y-6">
                    {/* Containers */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Containers
                        </h3>
                        <p className="text-body text-slate-500">
                            Cards, modals, sheets, drawers to group related content and actions.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                            <div className="p-3 bg-slate-100 border border-slate-200">
                                <p className="text-body font-bold text-slate-700">Card</p>
                                <p className="text-micro text-slate-500">Inline content</p>
                            </div>
                            <div className="p-3 bg-slate-100 border border-slate-200">
                                <p className="text-body font-bold text-slate-700">Modal</p>
                                <p className="text-micro text-slate-500">Focused tasks</p>
                            </div>
                            <div className="p-3 bg-slate-100 border border-slate-200">
                                <p className="text-body font-bold text-slate-700">Sheet</p>
                                <p className="text-micro text-slate-500">Side panels</p>
                            </div>
                            <div className="p-3 bg-slate-100 border border-slate-200">
                                <p className="text-body font-bold text-slate-700">Drawer</p>
                                <p className="text-micro text-slate-500">Navigation</p>
                            </div>
                        </div>
                    </div>

                    {/* Data Display */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Data Display
                        </h3>
                        <p className="text-body text-slate-500">
                            Lists, tables, grids for dense information (data, items, settings).
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-3 bg-slate-100 border border-slate-200">
                                <p className="text-body font-bold text-slate-700">Table</p>
                                <p className="text-micro text-slate-500">Structured data</p>
                            </div>
                            <div className="p-3 bg-slate-100 border border-slate-200">
                                <p className="text-body font-bold text-slate-700">List</p>
                                <p className="text-micro text-slate-500">Sequential items</p>
                            </div>
                            <div className="p-3 bg-slate-100 border border-slate-200">
                                <p className="text-body font-bold text-slate-700">Grid</p>
                                <p className="text-micro text-slate-500">Visual cards</p>
                            </div>
                        </div>
                    </div>

                    {/* Structure */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Page Structure
                        </h3>
                        <p className="text-body text-slate-500">
                            Headers, footers, section dividers create hierarchy and visual rhythm.
                        </p>
                        <div className="border border-slate-300 overflow-hidden">
                            <div className="bg-slate-800 text-white p-2 text-body font-bold">Header</div>
                            <div className="p-3 bg-white">
                                <div className="bg-slate-50 border-b border-slate-200 px-2 py-1 text-micro font-bold text-slate-500 uppercase">Section Title</div>
                                <div className="p-2 text-body text-slate-600">Content area...</div>
                            </div>
                            <div className="bg-slate-50 border-t border-slate-300 p-2 text-micro text-slate-500">Footer</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback & State */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Feedback & State
                    </h2>
                </div>
                <div className="p-4 space-y-6">
                    {/* Status Indicators */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Badges, Chips, Tags
                        </h3>
                        <p className="text-body text-slate-500">
                            Indicate status, categories, or metadata in a compact way.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="success" dot>Active</Badge>
                            <Badge variant="warning" dot>Pending</Badge>
                            <Badge variant="danger" dot>Error</Badge>
                            <Badge variant="info" dot>Processing</Badge>
                            <Badge variant="neutral" dot>Draft</Badge>
                            <Badge variant="outline">Tag</Badge>
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Toasts, Banners, Alerts
                        </h3>
                        <p className="text-body text-slate-500">
                            Success, error, and warning messages.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700">
                                <Check className="w-4 h-4" />
                                <span className="text-body font-medium">Success: Operation completed successfully.</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-body font-medium">Warning: Please review before continuing.</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-body font-medium">Error: Something went wrong. Please try again.</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-700">
                                <Info className="w-4 h-4" />
                                <span className="text-body font-medium">Info: New features are available.</span>
                            </div>
                        </div>
                    </div>

                    {/* Loading & Empty */}
                    <div className="space-y-3">
                        <h3 className="text-label font-bold text-slate-600 uppercase tracking-wider">
                            Loading & Empty States
                        </h3>
                        <p className="text-body text-slate-500">
                            Spinners, skeletons, and empty states clarify what is happening or what to do next.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-4 bg-slate-50 border border-slate-200 text-center">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                                <p className="text-micro text-slate-500 mt-2">Spinner</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
                                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
                                <p className="text-micro text-slate-500 mt-2 text-center">Skeleton</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 text-center">
                                <div className="text-slate-300 text-2xl mb-1">∅</div>
                                <p className="text-body font-bold text-slate-500">No data</p>
                                <p className="text-micro text-slate-400">Empty state</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Design Principles */}
            <div className="bg-slate-900 text-white tech-border overflow-hidden">
                <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
                    <h2 className="text-body font-bold uppercase tracking-wider">
                        Design Principles to Follow
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-sm flex items-center justify-center text-body font-bold shrink-0">1</div>
                        <div>
                            <p className="text-body font-bold">Consistent Tokens</p>
                            <p className="text-body text-slate-400">Use the same spacing, typography, and color tokens across all elements.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-sm flex items-center justify-center text-body font-bold shrink-0">2</div>
                        <div>
                            <p className="text-body font-bold">Clear Affordance</p>
                            <p className="text-body text-slate-400">Clickable components should look interactive through contrast, hover, and focus styles.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-sm flex items-center justify-center text-body font-bold shrink-0">3</div>
                        <div>
                            <p className="text-body font-bold">Accessibility</p>
                            <p className="text-body text-slate-400">Sufficient contrast, visible focus outlines, logical keyboard navigation, clear labels.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Reference */}
            <div className="bg-blue-50 border border-blue-200 p-4">
                <h3 className="text-body font-bold text-blue-800 uppercase mb-2">Quick Reference</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-micro text-blue-700">
                    <div>
                        <p className="font-bold">Spacing</p>
                        <p>4px base unit (p-1, p-2, p-3, p-4)</p>
                    </div>
                    <div>
                        <p className="font-bold">Border Radius</p>
                        <p>rounded-sm (2px) everywhere</p>
                    </div>
                    <div>
                        <p className="font-bold">Shadows</p>
                        <p>shadow-sm for cards, shadow-md for modals</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
