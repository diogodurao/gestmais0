import "./globals.css"

export const metadata = {
  title: "Design System Test",
  description: "UI Components showcase",
}

export default function TestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <span className="text-subtitle">Design System</span>
          <nav className="flex gap-4">
            <a href="/test" className="text-body hover:text-gray-900">Components</a>
            <a href="/test/patterns" className="text-body hover:text-gray-900">Patterns</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <p className="text-label text-center">Design System v1.0</p>
        </div>
      </footer>
    </div>
  )
}
