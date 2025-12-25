"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"
import { Globe, Check } from "lucide-react"

export function LanguageSelectorModal() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Check if the user has already selected a language
        const storedLocale = Cookies.get("gestmais-locale")
        if (!storedLocale) {
            // Add a small delay for smoother entrance
            const timer = setTimeout(() => setIsOpen(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleSelect = (locale: "pt" | "en") => {
        // 1. Save preference
        Cookies.set("gestmais-locale", locale, { expires: 365, path: '/' })

        // 2. Redirect logic
        setIsOpen(false)

        // If selecting English, go to /en
        if (locale === "en") {
            if (!pathname.startsWith("/en")) {
                router.push("/en")
            }
        }
        // If selecting Portuguese, go to / (canonical for PT)
        else {
            if (pathname.startsWith("/en")) {
                router.push("/pt") // Checks middleware redirect to /
            }
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="bg-white p-0 rounded-sm shadow-xl shadow-slate-200/50 max-w-[320px] w-full mx-4 border border-slate-300 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Select_Region
                    </div>
                </div>

                {/* Content */}
                <div className="p-1 bg-slate-100 flex flex-col gap-px">
                    <button
                        onClick={() => handleSelect("pt")}
                        className="group flex items-center justify-between px-6 py-4 bg-white hover:bg-blue-50 transition-colors text-left"
                    >
                        <div>
                            <div className="font-bold text-slate-800 text-sm group-hover:text-blue-700">Portugal <span className="text-slate-300 font-normal mx-1">/</span> PT</div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    </button>

                    <button
                        onClick={() => handleSelect("en")}
                        className="group flex items-center justify-between px-6 py-4 bg-white hover:bg-blue-50 transition-colors text-left"
                    >
                        <div>
                            <div className="font-bold text-slate-800 text-sm group-hover:text-blue-700">International <span className="text-slate-300 font-normal mx-1">/</span> EN</div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    </button>
                </div>
            </div>
        </div>
    )
}
