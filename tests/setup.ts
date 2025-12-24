import { vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-1234',
  },
})

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: () => ({
    get: vi.fn(),
  }),
  cookies: () => ({
    get: vi.fn(),
  }),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock server-only
vi.mock('server-only', () => ({}))

// Mock Better Auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

// Mock DB
vi.mock('@/db', () => {
    // Create a mock db object
    const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        // Add a then method to allow awaiting the chain
        then: function(resolve: any) {
             // Default behavior: resolve with empty array if select, or specific mock return
             resolve([]);
        }
    };
    return { db: mockDb };
});

// Mock nanoid
vi.mock('nanoid', () => ({
  customAlphabet: () => () => 'test-code-123',
}))
