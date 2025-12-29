import { vi, beforeAll } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'

// Mock crypto
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid-1234',
    },
})

// Mock Next.js headers/cookies
vi.mock('next/headers', () => ({
    headers: vi.fn(),
    cookies: vi.fn(),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
    notFound: vi.fn(),
    useRouter: vi.fn(),
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

// Mock server-only
vi.mock('server-only', () => ({}))

// Mock better-auth
vi.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn()
        }
    }
}))
