# Testing Guide

This project uses a modern, multi-layered testing approach to ensure code quality and prevent regressions.

## Testing Stack

- **Vitest** - Fast unit and integration testing
- **React Testing Library** - Component testing utilities
- **Playwright** - E2E and visual regression testing
- **fast-check** - Property-based testing
- **MSW (Mock Service Worker)** - API mocking

## Test Commands

```bash
# Unit tests (default)
npm test                  # Run in watch mode
npm run test:unit         # Run once
npm run test:watch        # Run in watch mode
npm run test:ui           # Open Vitest UI

# E2E tests
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Open Playwright UI
npm run test:e2e:headed   # Run with visible browser

# Visual regression tests
npm run test:visual               # Run visual tests
npm run test:visual:update        # Update snapshots

# Run all tests
npm run test:all          # Unit + E2E
```

## Testing Pyramid

```
         /\
        /E2E\     10% - Critical user flows
       /------\
      /Visual \   15% - Visual regression
     /Regression\
    /------------\
   / Integration \ 25% - Components + real hooks
  /---------------\
 / Unit + Property\ 50% - Business logic + edge cases
/------------------\
```

## Test Types

### 1. Unit Tests (Vitest + React Testing Library)

**Purpose**: Test individual functions and components in isolation

**Location**: `src/**/__tests__/*.test.{ts,tsx}`

**Example**:
```typescript
// src/lib/__tests__/format.test.ts
import { formatCurrency } from '../format'

test('formats cents to euros', () => {
  expect(formatCurrency(12345)).toBe('123,45 €')
})
```

**When to use**:
- Pure utility functions
- Component rendering logic
- User interactions
- State management

### 2. Property-Based Tests (fast-check)

**Purpose**: Test mathematical properties that should ALWAYS hold true

**Location**: `src/**/__tests__/*.property.test.ts`

**Example**:
```typescript
// src/lib/__tests__/format.property.test.ts
import fc from 'fast-check'

test('format and parse round-trip', () => {
  fc.assert(
    fc.property(fc.integer(), (cents) => {
      const formatted = formatCurrency(cents)
      const parsed = parseCurrency(formatted)
      return parsed === cents
    })
  )
})
```

**When to use**:
- Payment calculations
- Date/time logic
- Currency formatting
- Data transformations

### 3. Integration Tests (MSW)

**Purpose**: Test components with real API interactions

**Location**: `src/**/__tests__/*.msw.test.tsx`

**Example**:
```typescript
// src/features/__tests__/ExtraPaymentGrid.msw.test.tsx
import { http, HttpResponse } from 'msw'

server.use(
  http.post('/api/payments', () => {
    return HttpResponse.json({ success: true })
  })
)

test('updates payment via API', async () => {
  render(<ExtraPaymentGrid />)
  // Interact with component
  // MSW intercepts API call
  // Verify response handling
})
```

**When to use**:
- Testing API integration
- Optimistic updates
- Error handling
- Real state management

### 4. Visual Regression Tests (Playwright)

**Purpose**: Catch unintended visual changes

**Location**: `e2e/*.visual.spec.ts`

**Example**:
```typescript
// e2e/extra-payment-grid.visual.spec.ts
test('payment grid renders correctly', async ({ page }) => {
  await page.goto('/projects/1')
  await expect(page.locator('[data-testid="payment-grid"]'))
    .toHaveScreenshot('payment-grid.png')
})
```

**When to use**:
- Complex UI components
- Responsive layouts
- Cross-browser testing
- Design system validation

**First run**: `npm run test:visual:update` (creates baseline)
**Subsequent runs**: `npm run test:visual` (compares to baseline)

### 5. E2E Tests (Playwright)

**Purpose**: Test complete user journeys

**Location**: `e2e/*.e2e.spec.ts`

**Example**:
```typescript
// e2e/payment-flow.e2e.spec.ts
test('manager can mark payment as paid', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('a[href*="projects"]')
  await page.click('[data-testid="mark-paid"]')
  await page.click('td[aria-label*="pending"]')
  await expect(page.locator('[data-testid="toast"]'))
    .toHaveText('Payment updated')
})
```

**When to use**:
- Critical user flows
- Authentication
- Multi-step workflows
- Integration with backend

## Test Organization

```
src/
├── lib/
│   ├── format.ts
│   └── __tests__/
│       ├── format.test.ts           # Unit tests
│       └── format.property.test.ts  # Property-based tests
├── features/
│   └── dashboard/
│       └── extraordinary-projects/
│           ├── ExtraPaymentGrid.tsx
│           └── __tests__/
│               ├── ExtraPaymentGrid.test.tsx      # Original tests
│               └── ExtraPaymentGrid.msw.test.tsx  # MSW-based tests
└── test/
    ├── setup.ts           # Global test setup
    └── mocks/
        ├── handlers.ts    # MSW request handlers
        └── server.ts      # MSW server config

e2e/
├── payment-flow.e2e.spec.ts        # E2E tests
└── extra-payment-grid.visual.spec.ts  # Visual regression tests
```

## Writing Good Tests

### DO ✅

- Test behavior, not implementation
- Use meaningful test descriptions
- Keep tests simple and focused
- Use data-testid for test-specific selectors
- Test edge cases and error handling
- Use MSW for API mocking (not hooks)
- Run tests before committing

### DON'T ❌

- Mock everything (use MSW for APIs)
- Test internal state directly
- Write brittle tests (tight coupling)
- Skip error cases
- Commit without running tests
- Use timeouts instead of waitFor

## Best Practices

### Component Tests

```typescript
// ✅ Good - Tests behavior
test('filters payments by status', () => {
  render(<PaymentGrid payments={mockData} />)
  fireEvent.click(screen.getByText('Pending'))
  expect(screen.getByText('Jane')).toBeInTheDocument()
  expect(screen.queryByText('John')).not.toBeInTheDocument()
})

// ❌ Bad - Tests implementation
test('sets filterStatus state to pending', () => {
  const wrapper = render(<PaymentGrid />)
  wrapper.instance().setState({ filterStatus: 'pending' })
  expect(wrapper.state('filterStatus')).toBe('pending')
})
```

### API Tests

```typescript
// ✅ Good - Uses MSW
server.use(
  http.post('/api/payments', () => {
    return HttpResponse.json({ success: true })
  })
)

test('updates payment', async () => {
  render(<PaymentGrid />)
  fireEvent.click(screen.getByText('Mark Paid'))
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})

// ❌ Bad - Mocks hooks
vi.mock('@/hooks/useAsyncAction', () => ({
  useAsyncAction: () => ({ execute: vi.fn() })
}))
```

## Coverage

Run coverage reports:

```bash
vitest --coverage
```

Target coverage:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

## CI/CD Integration

Tests run automatically on:
- Pull request creation
- Push to main branch
- Pre-commit hook (optional)

## Debugging Tests

### Vitest

```bash
# Run specific test file
npm test format.test.ts

# Run tests matching pattern
npm test -- payment

# Debug in VS Code
# Use Vitest extension and set breakpoints
```

### Playwright

```bash
# Run with browser visible
npm run test:e2e:headed

# Open interactive UI
npm run test:e2e:ui

# Debug specific test
npx playwright test --debug payment-flow

# Generate code from browser
npx playwright codegen http://localhost:3000
```

## Common Issues

### Issue: MSW not intercepting requests
**Solution**: Ensure `setupFiles` is configured in `vitest.config.ts`

### Issue: Visual tests failing unexpectedly
**Solution**: Fonts or system differences - update snapshots with `--update-snapshots`

### Issue: E2E tests timing out
**Solution**: Increase timeout or check if dev server is running

### Issue: Property tests failing randomly
**Solution**: Check for edge cases in your logic, not the test

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [fast-check Guide](https://github.com/dubzzz/fast-check)
- [MSW Documentation](https://mswjs.io/)

## Examples

See these files for complete examples:
- Unit tests: [src/lib/__tests__/format.test.ts](src/lib/__tests__/format.test.ts)
- Property tests: [src/lib/__tests__/format.property.test.ts](src/lib/__tests__/format.property.test.ts)
- MSW integration: [src/features/dashboard/extraordinary-projects/__tests__/ExtraPaymentGrid.msw.test.tsx](src/features/dashboard/extraordinary-projects/__tests__/ExtraPaymentGrid.msw.test.tsx)
- E2E tests: [e2e/payment-flow.e2e.spec.ts](e2e/payment-flow.e2e.spec.ts)
- Visual tests: [e2e/extra-payment-grid.visual.spec.ts](e2e/extra-payment-grid.visual.spec.ts)
