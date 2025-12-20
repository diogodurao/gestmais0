import { vi } from 'vitest'

// Mock `next/headers`
vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}))

// Mock `next/navigation`
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(),
}))

// Mock `server-only` to do nothing during tests
vi.mock('server-only', () => ({}))
