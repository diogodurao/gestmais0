import { vi } from "vitest"
import { mockDeep } from "vitest-mock-extended"

// Mock server-only to allow importing server files in tests
vi.mock("server-only", () => {
  return {}
})

// Mock next/headers
vi.mock("next/headers", () => {
  return {
    headers: vi.fn(),
    cookies: vi.fn(),
  }
})

// Mock next/navigation
vi.mock("next/navigation", () => {
  return {
    redirect: vi.fn(),
    notFound: vi.fn(),
    useRouter: vi.fn(),
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
  }
})

// Mock next/cache
vi.mock("next/cache", () => {
  return {
    revalidatePath: vi.fn(),
  }
})

// Mock global crypto for randomUUID
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: vi.fn(() => "test-uuid"),
  },
})

// Mock Better Auth if needed, or just specific auth calls in tests
// For now, we will mock imports in test files as needed
