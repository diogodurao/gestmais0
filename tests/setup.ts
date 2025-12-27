import { vi } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'

// Mock environment variables
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db'

// Mock Next.js headers and navigation
vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('server-only', () => ({}))

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn().mockReturnValue('mock-uuid'),
  },
})

// Mock Database
// We need to properly mock the drizzle-orm db object.
// The db object has methods like select, insert, update, delete, transaction, etc.
// These methods return query builders which are chainable.

// We will use vitest-mock-extended to create a deep mock, but we might need to customize it.
// Since src/db/index.ts exports `db` directly, we can mock that module.

// Define a type for the db mock to ensure type safety if possible, or use any.
const dbMock = mockDeep<any>()

// Mock chainable methods
dbMock.select.mockReturnThis()
dbMock.from.mockReturnThis()
dbMock.where.mockReturnThis()
dbMock.limit.mockReturnThis()
dbMock.offset.mockReturnThis()
dbMock.orderBy.mockReturnThis()
dbMock.leftJoin.mockReturnThis()
dbMock.rightJoin.mockReturnThis()
dbMock.innerJoin.mockReturnThis()
dbMock.insert.mockReturnThis()
dbMock.values.mockReturnThis()
dbMock.returning.mockReturnThis()
dbMock.update.mockReturnThis()
dbMock.set.mockReturnThis()
dbMock.delete.mockReturnThis()

// Mock execution methods
// In Drizzle, queries are promises.
// We'll mock the `then` method to make it awaitable.
// This is a simplified approach; usually we mock the final result based on test setup.
// But since we are mocking the module, we can control the return value in the test.

vi.mock('@/db', () => ({
  db: dbMock,
}))

beforeEach(() => {
  mockReset(dbMock)
  // Re-apply basic chainable mocks after reset
  dbMock.select.mockReturnThis()
  dbMock.from.mockReturnThis()
  dbMock.where.mockReturnThis()
  dbMock.limit.mockReturnThis()
  dbMock.offset.mockReturnThis()
  dbMock.orderBy.mockReturnThis()
  dbMock.leftJoin.mockReturnThis()
  dbMock.rightJoin.mockReturnThis()
  dbMock.innerJoin.mockReturnThis()
  dbMock.insert.mockReturnThis()
  dbMock.values.mockReturnThis()
  dbMock.returning.mockReturnThis()
  dbMock.update.mockReturnThis()
  dbMock.set.mockReturnThis()
  dbMock.delete.mockReturnThis()
})

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))
