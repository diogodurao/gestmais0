import { vi } from 'vitest'

// Mock Crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => '1234-5678-90ab-cdef'),
  },
})

// Mock Next.js headers and navigation
vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('server-only', () => ({}))
