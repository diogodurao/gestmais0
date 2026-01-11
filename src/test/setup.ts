import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

/**
 * Global test setup for Vitest
 * Configures MSW to intercept API calls during testing
 */

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

// Reset handlers after each test to prevent test pollution
afterEach(() => {
  server.resetHandlers()
})

// Clean up after all tests are done
afterAll(() => {
  server.close()
})
