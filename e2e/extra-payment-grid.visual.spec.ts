import { test, expect } from '@playwright/test'

/**
 * Visual Regression Tests for ExtraPaymentGrid
 *
 * These tests capture screenshots and compare them to baseline images
 * to detect unintended visual changes in the payment grid UI.
 *
 * First run: npx playwright test --update-snapshots (to create baseline)
 * Subsequent runs: npx playwright test (to compare against baseline)
 */

test.describe('ExtraPaymentGrid - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Replace with actual login flow
    // For now, assume auth is handled via mock or test user
    await page.goto('/dashboard/extraordinary-projects/1')

    // Wait for the grid to be fully loaded
    await page.waitForSelector('[data-testid="payment-grid"]', { state: 'visible' })
  })

  test('default state renders correctly', async ({ page }) => {
    // Take screenshot of the entire payment grid
    const grid = page.locator('[data-testid="payment-grid"]')
    await expect(grid).toHaveScreenshot('payment-grid-default.png')
  })

  test('desktop table view renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    const table = page.locator('table')
    await expect(table).toBeVisible()
    await expect(table).toHaveScreenshot('payment-grid-desktop.png')
  })

  test('mobile card view renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const mobileCards = page.locator('[data-testid="mobile-apartment-card"]').first()
    await expect(mobileCards).toBeVisible()
    await expect(page.locator('body')).toHaveScreenshot('payment-grid-mobile.png', {
      fullPage: true,
    })
  })

  test('filtered by pending payments', async ({ page }) => {
    const pendingButton = page.getByRole('button', { name: /Pendentes/i })
    await pendingButton.click()

    await page.waitForTimeout(300) // Wait for filter animation

    const grid = page.locator('[data-testid="payment-grid"]')
    await expect(grid).toHaveScreenshot('payment-grid-filtered-pending.png')
  })

  test('filtered by paid payments', async ({ page }) => {
    const paidButton = page.getByRole('button', { name: /Pagas/i })
    await paidButton.click()

    await page.waitForTimeout(300) // Wait for filter animation

    const grid = page.locator('[data-testid="payment-grid"]')
    await expect(grid).toHaveScreenshot('payment-grid-filtered-paid.png')
  })

  test('mark as paid tool mode active state', async ({ page }) => {
    const markPaidButton = page.getByRole('button', { name: /Marcar Pago/i })
    await markPaidButton.click()

    // Tool mode should be visually indicated
    await expect(markPaidButton).toHaveScreenshot('tool-button-active.png')
  })

  test('budget progress bar visual state', async ({ page }) => {
    const progressBar = page.locator('[data-testid="budget-progress"]')
    await expect(progressBar).toBeVisible()
    await expect(progressBar).toHaveScreenshot('budget-progress.png')
  })

  test('payment status badges render correctly', async ({ page }) => {
    const statusBadges = page.locator('[data-testid="status-badge"]')
    const count = await statusBadges.count()

    if (count > 0) {
      await expect(statusBadges.first()).toHaveScreenshot('status-badge.png')
    }
  })

  test('toolbar with export buttons', async ({ page }) => {
    const toolbar = page.locator('[data-testid="payment-grid-toolbar"]')
    await expect(toolbar).toBeVisible()
    await expect(toolbar).toHaveScreenshot('payment-grid-toolbar.png')
  })

  test('hover state on payment cell (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    const firstCell = page.locator('td[aria-label*="Estado"]').first()
    await firstCell.hover()

    await expect(firstCell).toHaveScreenshot('payment-cell-hover.png')
  })

  test('footer totals row', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    const footerRow = page.locator('tfoot tr')
    await expect(footerRow).toBeVisible()
    await expect(footerRow).toHaveScreenshot('payment-grid-footer.png')
  })

  test('empty state (no payments)', async ({ page }) => {
    // TODO: Navigate to a project with no payments
    // await page.goto('/dashboard/extraordinary-projects/empty')
    // const emptyState = page.locator('[data-testid="empty-state"]')
    // await expect(emptyState).toHaveScreenshot('payment-grid-empty.png')
  })
})

test.describe('ExtraPaymentGrid - Responsive Breakpoints', () => {
  const viewports = [
    { name: 'mobile-small', width: 320, height: 568 },
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'desktop-large', width: 1920, height: 1080 },
  ]

  for (const viewport of viewports) {
    test(`renders correctly at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/dashboard/extraordinary-projects/1')

      await page.waitForSelector('[data-testid="payment-grid"]', { state: 'visible' })

      await expect(page.locator('body')).toHaveScreenshot(`payment-grid-${viewport.name}.png`, {
        fullPage: true,
      })
    })
  }
})
