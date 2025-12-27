import { vi } from 'vitest';

// Mock Next.js modules
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    getAll: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('server-only', () => ({}));

// Mock global.crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
    subtle: {
      digest: vi.fn(),
    },
  },
});
