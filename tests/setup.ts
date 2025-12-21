import { vi } from 'vitest';

// Mock Next.js headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
  headers: () => ({
    get: vi.fn(),
  }),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// Mock crypto.randomUUID if not available (jsdom might not have it)
if (!global.crypto) {
    Object.defineProperty(global, 'crypto', {
        value: {
            randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7)
        }
    });
} else if (!global.crypto.randomUUID) {
    Object.defineProperty(global.crypto, 'randomUUID', {
        value: () => 'test-uuid-' + Math.random().toString(36).substring(7)
    });
}
