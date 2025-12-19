import { vi } from 'vitest'

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock'
process.env.STRIPE_PRICE_ID = 'price_mock'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockReturnValue({
    get: vi.fn().mockImplementation((key) => {
      if (key === 'Stripe-Signature') return 'mock_signature'
      return null
    }),
  }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  redirect: vi.fn(),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock auth helpers
vi.mock('@/lib/auth-helpers', () => ({
  requireSession: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      stripeCustomerId: 'cus_test',
      role: 'manager'
    }
  }),
  requireBuildingAccess: vi.fn().mockResolvedValue({
    session: {
      user: {
        id: 'test-user-id'
      }
    }
  })
}))

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          url: 'http://stripe.com/checkout/test',
          payment_status: 'unpaid'
        }),
        list: vi.fn().mockResolvedValue({ data: [] })
      }
    },
    customers: {
      create: vi.fn().mockResolvedValue({
        id: 'cus_new_test'
      })
    },
    subscriptions: {
      retrieve: vi.fn().mockResolvedValue({
        status: 'active'
      }),
      list: vi.fn().mockResolvedValue({ data: [] })
    },
    webhooks: {
      constructEvent: vi.fn().mockImplementation((body) => {
        return JSON.parse(body)
      })
    }
  }
}))
