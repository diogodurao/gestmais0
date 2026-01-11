'use client'

import { useReportWebVitals } from 'next/web-vitals'

/**
 * Web Vitals Reporter
 * Monitors Core Web Vitals and reports metrics for performance tracking
 *
 * Metrics tracked:
 * - LCP (Largest Contentful Paint): Measures loading performance
 * - FID (First Input Delay): Measures interactivity (deprecated, use INP)
 * - CLS (Cumulative Layout Shift): Measures visual stability
 * - INP (Interaction to Next Paint): Measures responsiveness
 * - TTFB (Time to First Byte): Measures server response time
 * - FCP (First Contentful Paint): Measures initial render
 */
export function WebVitalsReporter() {
    useReportWebVitals((metric) => {
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('[Web Vitals]', {
                name: metric.name,
                value: metric.value,
                rating: metric.rating,
                delta: metric.delta,
                id: metric.id,
            })
        }

        // In production, send to analytics service
        // Examples:

        // Google Analytics 4
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', metric.name, {
                value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                event_category: 'Web Vitals',
                event_label: metric.id,
                non_interaction: true,
            })
        }

        // Vercel Analytics (automatically enabled on Vercel)
        // No additional code needed - Next.js handles it

        // Custom analytics endpoint
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     body: JSON.stringify(metric),
        //     headers: { 'Content-Type': 'application/json' },
        // })
    })

    return null
}
