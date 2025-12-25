import { vi } from 'vitest';

// Mock environment variables
process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/testdb';

// Mock Next.js headers and navigation
vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock server-only to allow importing server actions in tests
vi.mock('server-only', () => ({}));

// Mock global crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7),
  },
});
