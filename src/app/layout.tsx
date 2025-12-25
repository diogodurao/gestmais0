import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GestMais - gestão de condominios inteligente",
  description: "GestMais - gestão de condominios inteligente.",
};

import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="antialiased font-sans bg-slate-50 text-slate-900">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
