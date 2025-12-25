import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const defaultLocale = "pt";
const locales = ["pt", "en"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the pathname refers to a file in the public folder (e.g., images, robots.txt)
    // or is an API route. If so, do nothing.
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/static") ||
        pathname.includes(".") // file extensions like .svg, .png, etc.
    ) {
        return NextResponse.next();
    }

    // Check if the pathname is the root
    if (pathname === "/") {
        // Rewrite to default locale (PT) content, but keep URL as "/"
        return NextResponse.rewrite(new URL(`/${defaultLocale}`, request.url));
    }

    // Check if the pathname is missing a locale
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // If the pathname is missing a locale, we treat it as a PT request (default)
    // But wait, if it's NOT root, and NOT a locale... it might be a sub-route like /auth or /dashboard?
    // Our strategy:
    // Root (/) -> Rewrites to /pt
    // /en -> content of /en
    // /pt -> redirects to / (canonical)
    // /dashboard -> stays /dashboard (Dashboard is monoliangual English for now, per user request?)
    // Actually, user said "Dashboard can wait". But if we move page.tsx to [lang], what happens to Dashboard?
    // Dashboard is separate in `src/app/dashboard`. It is NOT inside `[lang]`.
    // So we should only interfere if it matches our "Landing Page" routes.
    // BUT the Landing Page is `src/app/page.tsx` which is root.

    // Revised Strategy for existing non-i18n routes:
    // We only want to rewrite/redirect for the Landing Page and its sub-pages if they exist.
    // The dashboard is at /dashboard. Auth is at /auth.
    // If we move `src/app/page.tsx` to `src/app/[lang]/page.tsx`, we need to make sure
    // requests to `/` hit `[lang]`.

    if (pathnameIsMissingLocale) {
        // If it is a known specific app route, let it pass through
        // For now, let's assume anything not starting with /pt or /en is a legacy/app route
        // EXCEPT / itself, which we handled above.

        // HOWEVER, if we want /subscribe or such to also be localized, we need to think about it.
        // For now, let's just rewrite root to /pt.

        return NextResponse.next();
    }

    // Logic for /pt -> Redirect to / for canonical URL
    if (pathname.startsWith(`/${defaultLocale}`)) {
        // If user goes to /pt, redirect to /
        const newPath = pathname.replace(`/${defaultLocale}`, "") || "/";
        return NextResponse.redirect(new URL(newPath, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        "/((?!_next|favicon.ico).*)",
    ],
};
