export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <main className="w-full max-w-5xl">
                {children}
            </main>
        </div>
    )
}
