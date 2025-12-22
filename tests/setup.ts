import { vi } from 'vitest'

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}))

// Mock next/navigation
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
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock server-only
vi.mock('server-only', () => ({}))

// Mock global crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
    getRandomValues: (arr: any) => arr,
  },
  writable: true,
})
