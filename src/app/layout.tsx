import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { generateHomeMetadata } from "@/seo/utils/metadata";

export const metadata: Metadata = generateHomeMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        {/* Resource hints for better performance */}
        <link rel="dns-prefetch" href="https://schema.org" />
      </head>
      <body className="antialiased font-sans bg-slate-50 text-slate-900">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
