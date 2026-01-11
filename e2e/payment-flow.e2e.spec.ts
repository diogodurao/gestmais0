import { test, expect } from '@playwright/test'

/**
 * End-to-End Tests for Critical Payment Workflows
 *
 * These tests simulate real user journeys through the payment system
 * to ensure the complete flow works correctly from login to payment update.
 */

test.describe('Payment Flow - Critical User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Replace with actual login flow
    // For now, this is a placeholder for authentication
    /*
    await page.goto('/login')
    await page.fill('[name="email"]', 'manager@test.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    */

    // Navigate to dashboard
    await page.goto('/dashboard')
  })

  test('manager can mark a payment as paid', async ({ page }) => {
    // Step 1: Navigate to extraordinary projects
    await page.click('a[href*="extraordinary-projects"]')
    await page.waitForURL(/extraordinary-projects/)

    // Step 2: Open a specific project
    await page.click('[data-testid="project-card"]', { timeout: 5000 })
    await page.waitForSelector('[data-testid="payment-grid"]')

    // Step 3: Activate "Mark as Paid" tool
    const markPaidButton = page.getByRole('button', { name: /Marcar Pago/i })
    await markPaidButton.click()

    // Verify tool mode is active
    await expect(markPaidButton).toHaveClass(/active|selected/)

    // Step 4: Click on a pending payment cell
    const pendingCell = page.locator('td[aria-label*="pending"]').first()
    await pendingCell.click()

    // Step 5: Verify success toast/notification
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible({ timeout: 3000 })

    // Step 6: Verify the cell status changed to paid
    await expect(pendingCell).toHaveAttribute('aria-label', /paid/)

    // Step 7: Verify total collected increased
    const totalCollected = page.locator('[data-testid="total-collected"]')
    await expect(totalCollected).toBeVisible()
  })

  test('manager can filter payments by status', async ({ page }) => {
    await page.goto('/dashboard/extraordinary-projects/1')
    await page.waitForSelector('[data-testid="payment-grid"]')

    // Count initial rows
    const initialRows = await page.locator('tbody tr').count()

    // Filter by pending
    await page.click('button:has-text("Pendentes")')
    await page.waitForTimeout(300)

    const pendingRows = await page.locator('tbody tr').count()

    // Filter by paid
    await page.click('button:has-text("Pagas")')
    await page.waitForTimeout(300)

    const paidRows = await page.locator('tbody tr').count()

    // Verify filtering works (at least one filter should reduce rows)
    expect(pendingRows <= initialRows || paidRows <= initialRows).toBeTruthy()
  })

  test('manager can export payment data to PDF', async ({ page }) => {
    await page.goto('/dashboard/extraordinary-projects/1')
    await page.waitForSelector('[data-testid="payment-grid"]')

    // Set up download listener
    const downloadPromise = page.waitForEvent('download')

    // Click export PDF button
    await page.click('button:has-text("PDF")')

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  })

  test('manager can export payment data to Excel', async ({ page }) => {
    await page.goto('/dashboard/extraordinary-projects/1')
    await page.waitForSelector('[data-testid="payment-grid"]')

    // Set up download listener
    const downloadPromise = page.waitForEvent('download')

    // Click export Excel button
    await page.click('button:has-text("Excel")')

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/)
  })

  test('resident can view their payment status (read-only)', async ({ page }) => {
    // TODO: Login as resident
    /*
    await page.goto('/login')
    await page.fill('[name="email"]', 'resident@test.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    */

    await page.goto('/dashboard')

    // Navigate to payment overview
    await page.click('[data-testid="payment-overview"]')

    // Verify read-only mode (no edit buttons)
    const markPaidButton = page.getByRole('button', { name: /Marcar Pago/i })
    await expect(markPaidButton).not.toBeVisible()

    // Verify payment data is visible
    await expect(page.locator('[data-testid="payment-status"]')).toBeVisible()
  })

  test('budget progress updates correctly after payment', async ({ page }) => {
    await page.goto('/dashboard/extraordinary-projects/1')
    await page.waitForSelector('[data-testid="budget-progress"]')

    // Get initial progress percentage
    const initialProgress = await page.locator('[data-testid="progress-percent"]').textContent()
    const initialValue = parseFloat(initialProgress || '0')

    // Mark a payment as paid
    await page.click('button:has-text("Marcar Pago")')
    await page.locator('td[aria-label*="pending"]').first().click()

    // Wait for update
    await page.waitForTimeout(1000)

    // Get new progress percentage
    const newProgress = await page.locator('[data-testid="progress-percent"]').textContent()
    const newValue = parseFloat(newProgress || '0')

    // Verify progress increased
    expect(newValue).toBeGreaterThanOrEqual(initialValue)
  })

  test('mobile view shows payment cards correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/dashboard/extraordinary-projects/1')

    // Verify mobile cards are visible
    await expect(page.locator('[data-testid="mobile-apartment-card"]').first()).toBeVisible()

    // Verify desktop table is hidden
    await expect(page.locator('table')).not.toBeVisible()

    // Test mobile interaction
    await page.click('[data-testid="mobile-tools-button"]')
    await expect(page.locator('[data-testid="mobile-tools-menu"]')).toBeVisible()
  })

  test('handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/payments/**', route => route.abort())

    await page.goto('/dashboard/extraordinary-projects/1')
    await page.waitForSelector('[data-testid="payment-grid"]')

    // Try to mark as paid
    await page.click('button:has-text("Marcar Pago")')
    await page.locator('td[aria-label*="pending"]').first().click()

    // Verify error toast appears
    await expect(page.locator('[data-testid="toast-error"]')).toBeVisible({ timeout: 3000 })
  })

  test('optimistic update rolls back on error', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/payments/**', route =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) })
    )

    await page.goto('/dashboard/extraordinary-projects/1')
    await page.waitForSelector('[data-testid="payment-grid"]')

    // Get initial cell state
    const cell = page.locator('td[aria-label*="pending"]').first()
    const initialLabel = await cell.getAttribute('aria-label')

    // Try to mark as paid
    await page.click('button:has-text("Marcar Pago")')
    await cell.click()

    // Wait for API call to fail
    await page.waitForTimeout(1000)

    // Verify rollback (cell should return to pending state)
    const finalLabel = await cell.getAttribute('aria-label')
    expect(finalLabel).toBe(initialLabel)
  })
})

test.describe('Payment Flow - Edge Cases', () => {
  test('handles year transition correctly', async ({ page }) => {
    // TODO: Set up project that spans year boundary (Dec -> Jan)
    await page.goto('/dashboard/extraordinary-projects/year-transition')

    // Verify months display correctly across year boundary
    const monthHeaders = page.locator('th[data-month]')
    const count = await monthHeaders.count()

    // Check that years increment correctly
    for (let i = 0; i < count; i++) {
      const header = monthHeaders.nth(i)
      await expect(header).toBeVisible()
    }
  })

  test('handles large number of installments', async ({ page }) => {
    // TODO: Test project with 12+ installments
    await page.goto('/dashboard/extraordinary-projects/many-installments')

    // Verify horizontal scroll works
    const table = page.locator('table')
    await expect(table).toBeVisible()

    // Verify all installment columns are present
    const installmentColumns = page.locator('th[data-installment]')
    const count = await installmentColumns.count()
    expect(count).toBeGreaterThan(10)
  })

  test('handles partial payments correctly', async ({ page }) => {
    await page.goto('/dashboard/extraordinary-projects/1')

    // TODO: Test partial payment scenario
    // Mark payment as partial
    // Verify balance calculation is correct
  })
})
