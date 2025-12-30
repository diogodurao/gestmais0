import { vi } from 'vitest'

// Mock environment variables
process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/gestmais0'

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock server-only
vi.mock('server-only', () => ({}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

// Mock nanoid
vi.mock('nanoid', () => ({
  customAlphabet: () => () => 'fixed_id_12345',
}))

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'uuid-1234-5678',
  },
})
