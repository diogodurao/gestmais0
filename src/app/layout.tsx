import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { generateHomeMetadata } from "@/seo/utils/metadata";
import { WebVitalsReporter } from "@/components/performance/WebVitalsReporter";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://schema.org" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="antialiased font-sans bg-slate-50 text-slate-900">
        <WebVitalsReporter />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
