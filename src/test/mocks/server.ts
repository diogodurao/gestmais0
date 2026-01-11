import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW Server for Node.js tests (Vitest)
 * This intercepts HTTP requests during test execution
 */
export const server = setupServer(...handlers)
