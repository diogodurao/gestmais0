export default function TypographyPage() {
    return (
        <div className="space-y-8">
            <div className="bg-white tech-border p-6">
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                    Typography
                </h1>
                <p className="text-content text-slate-600 mt-2">
                    Typography scale and text utilities used across the application.
                </p>
            </div>

            {/* Typography Scale */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Typography Scale
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-[120px_1fr_100px] gap-4 items-center border-b border-slate-100 pb-3">
                        <code className="text-label bg-slate-100 px-2 py-1 font-mono">.text-micro</code>
                        <span className="text-micro text-slate-700">The quick brown fox jumps over the lazy dog (9px)</span>
                        <span className="text-label text-slate-400">9px</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr_100px] gap-4 items-center border-b border-slate-100 pb-3">
                        <code className="text-label bg-slate-100 px-2 py-1 font-mono">.text-label</code>
                        <span className="text-label text-slate-700">The quick brown fox jumps over the lazy dog (10px)</span>
                        <span className="text-label text-slate-400">10px</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr_100px] gap-4 items-center border-b border-slate-100 pb-3">
                        <code className="text-label bg-slate-100 px-2 py-1 font-mono">.text-body</code>
                        <span className="text-body text-slate-700">The quick brown fox jumps over the lazy dog (11px)</span>
                        <span className="text-label text-slate-400">11px</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr_100px] gap-4 items-center border-b border-slate-100 pb-3">
                        <code className="text-label bg-slate-100 px-2 py-1 font-mono">.text-content</code>
                        <span className="text-content text-slate-700">The quick brown fox jumps over the lazy dog (13px)</span>
                        <span className="text-label text-slate-400">13px</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr_100px] gap-4 items-center">
                        <code className="text-label bg-slate-100 px-2 py-1 font-mono">.text-heading</code>
                        <span className="text-heading text-slate-700">The quick brown fox jumps over the lazy dog (15px)</span>
                        <span className="text-label text-slate-400">15px</span>
                    </div>
                </div>
            </div>

            {/* Font Weights */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Font Weights
                    </h2>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-4">
                        <code className="text-label bg-slate-100 px-2 py-1 font-mono w-28">font-normal</code>
                        <span className="text-content font-normal text-slate-700">Normal weight text (400)</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <code className="text-label bg-slate-100 px-2 py-1 font-mono w-28">font-medium</code>
                        <span className="text-content font-medium text-slate-700">Medium weight text (500)</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <code className="text-label bg-slate-100 px-2 py-1 font-mono w-28">font-semibold</code>
                        <span className="text-content font-semibold text-slate-700">Semibold weight text (600)</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <code className="text-label bg-slate-100 px-2 py-1 font-mono w-28">font-bold</code>
                        <span className="text-content font-bold text-slate-700">Bold weight text (700)</span>
                    </div>
                </div>
            </div>

            {/* Text Colors */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Text Colors
                    </h2>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h3 className="text-label font-bold text-slate-500 uppercase">Slate Scale</h3>
                        <div className="space-y-1">
                            <p className="text-content text-slate-900">text-slate-900 - Primary text</p>
                            <p className="text-content text-slate-700">text-slate-700 - Secondary text</p>
                            <p className="text-content text-slate-600">text-slate-600 - Body text</p>
                            <p className="text-content text-slate-500">text-slate-500 - Muted text</p>
                            <p className="text-content text-slate-400">text-slate-400 - Disabled text</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-label font-bold text-slate-500 uppercase">Semantic Colors</h3>
                        <div className="space-y-1">
                            <p className="text-content text-emerald-700">text-emerald-700 - Success</p>
                            <p className="text-content text-amber-700">text-amber-700 - Warning</p>
                            <p className="text-content text-rose-700">text-rose-700 - Danger/Error</p>
                            <p className="text-content text-blue-700">text-blue-700 - Info</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Label Styles */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Common Label Patterns
                    </h2>
                </div>
                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <p className="text-label font-bold uppercase tracking-wider text-slate-500">
                            Form Label Style
                        </p>
                        <code className="text-micro bg-slate-100 px-2 py-1 font-mono block">
                            text-label font-bold uppercase tracking-wider text-slate-500
                        </code>
                    </div>
                    <div className="space-y-2">
                        <p className="text-body font-bold uppercase tracking-wider text-slate-700">
                            Card Title Style
                        </p>
                        <code className="text-micro bg-slate-100 px-2 py-1 font-mono block">
                            text-body font-bold uppercase tracking-wider text-slate-700
                        </code>
                    </div>
                    <div className="space-y-2">
                        <p className="text-micro font-bold uppercase tracking-wider text-slate-400">
                            Table Header Style
                        </p>
                        <code className="text-micro bg-slate-100 px-2 py-1 font-mono block">
                            text-micro font-bold uppercase tracking-wider text-slate-400/500
                        </code>
                    </div>
                </div>
            </div>

            {/* Spacing Reference */}
            <div className="bg-white tech-border overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-300 px-4 py-2">
                    <h2 className="text-body font-bold text-slate-700 uppercase tracking-wider">
                        Spacing Scale
                    </h2>
                </div>
                <div className="p-4">
                    <div className="space-y-2">
                        {[0.5, 1, 1.5, 2, 3, 4, 6, 8].map((space) => (
                            <div key={space} className="flex items-center gap-4">
                                <code className="text-label bg-slate-100 px-2 py-1 font-mono w-16">{space}</code>
                                <div
                                    className="bg-blue-500 h-4"
                                    style={{ width: `${space * 4 * 4}px` }}
                                />
                                <span className="text-label text-slate-500">{space * 4}px</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
