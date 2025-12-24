import { vi } from 'vitest'

// Mocking Next.js headers
vi.mock('next/headers', () => ({
    headers: vi.fn(),
    cookies: vi.fn(),
}));

// Mocking Next.js navigation
vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
    notFound: vi.fn(),
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '',
    useSearchParams: () => new URLSearchParams(),
}));

// Mocking Next.js cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// Mocking server-only
vi.mock('server-only', () => ({}));

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid',
    },
});

// Mock console to reduce noise if needed
// global.console = {
//   ...console,
//   // log: vi.fn(),
//   // error: vi.fn(),
// }
