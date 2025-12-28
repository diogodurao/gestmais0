import { vi, beforeAll } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

// Mock Next.js headers/navigation/cache/server-only
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
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

vi.mock('server-only', () => ({}));

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: () => '123456',
  customAlphabet: () => () => '123456',
}));

// Mock global crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
  },
});
