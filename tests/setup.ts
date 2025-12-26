import { vi } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'

// Mock environment variables if needed
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

// Mock global crypto for UUID generation if not present in environment (JSDOM usually has it but just in case)
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-1234',
    getRandomValues: (arr: any) => arr,
  },
  writable: true,
})

// Mock nanoid
vi.mock('nanoid', () => ({
  customAlphabet: () => () => '123456',
  nanoid: () => '123456',
}))

// Mock database
// We will mock this per test file usually, but we can set up a global mock if we want
// But since the code imports `db` from `@/db`, we need to mock that module.

import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/db/schema'

// Create a deep mock for the db
const mockDb = mockDeep<PostgresJsDatabase<typeof schema>>()

// Mock the db module
vi.mock('@/db', () => ({
  db: mockDb,
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

beforeEach(() => {
  mockReset(mockDb)
  // Re-setup default implementations if needed

  // Important: for drizzle queries like db.select().from().where(), we need to ensure the chain works.
  // vitest-mock-extended `mockDeep` handles chaining automatically by returning recursive mocks,
  // but we might need to specific return values.

  // Mock transaction
  mockDb.transaction.mockImplementation((callback) => {
    return callback(mockDb as any)
  })
})

export { mockDb }
