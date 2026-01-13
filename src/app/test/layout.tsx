import "../globals.css"

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
    <div className="h-screen w-screen overflow-hidden bg-white p-1.5">
      {children}
    </div>
  )
}