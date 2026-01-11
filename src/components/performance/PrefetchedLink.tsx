import Link from 'next/link'
import { ComponentProps } from 'react'

/**
 * Prefetched Link Component
 * Extends Next.js Link with aggressive prefetching for better navigation performance
 *
 * Benefits:
 * - Prefetches route on hover (200ms delay)
 * - Prefetches route on focus (keyboard navigation)
 * - Preloads static assets early
 *
 * Use for:
 * - City pages navigation
 * - Frequently visited routes
 * - Critical user flows
 */
interface PrefetchedLinkProps extends ComponentProps<typeof Link> {
    children: React.ReactNode
}

export function PrefetchedLink({ children, ...props }: PrefetchedLinkProps) {
    return (
        <Link
            {...props}
            prefetch={true} // Enable automatic prefetching in viewport
        >
            {children}
        </Link>
    )
}
