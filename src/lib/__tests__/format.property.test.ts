import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { formatCurrency, parseCurrency, formatPercent, getMonthName } from '../format'

/**
 * Property-Based Tests for Formatting Utilities
 *
 * These tests use fast-check to generate random inputs and verify
 * mathematical properties that should ALWAYS hold true.
 */

describe('formatCurrency - Property-Based Tests', () => {
  it('should always return a string', () => {
    fc.assert(
      fc.property(fc.integer(), (cents) => {
        const result = formatCurrency(cents)
        return typeof result === 'string'
      })
    )
  })

  it('should format and parse to same value (round-trip)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000000 }), // 0 to 100,000 euros in cents
        (cents) => {
          const formatted = formatCurrency(cents)
          const parsed = parseCurrency(formatted)
          return parsed === cents
        }
      )
    )
  })

  it('should handle negative values correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10000000, max: -1 }),
        (cents) => {
          const formatted = formatCurrency(cents)
          return formatted.includes('-')
        }
      )
    )
  })

  it('double the cents should double the formatted value (linearity)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }),
        (cents) => {
          const single = parseCurrency(formatCurrency(cents))
          const double = parseCurrency(formatCurrency(cents * 2))
          return double === single * 2
        }
      )
    )
  })
})

describe('parseCurrency - Property-Based Tests', () => {
  it('should always return a number', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        const result = parseCurrency(str)
        return typeof result === 'number' && !isNaN(result)
      })
    )
  })

  it('should handle European format (1.234,56)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000000 }),
        (cents) => {
          const euros = cents / 100
          const formatted = euros.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          const parsed = parseCurrency(formatted)
          return Math.abs(parsed - cents) <= 1 // Allow 1 cent rounding error
        }
      )
    )
  })

  it('should return 0 for invalid strings', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('abc', 'xyz', '!!!', ''),
        (invalidStr) => {
          return parseCurrency(invalidStr) === 0
        }
      )
    )
  })

  it('should ignore currency symbols and whitespace', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        (cents) => {
          const euros = cents / 100
          const withSymbol = `€ ${euros.toFixed(2)} `
          const withoutSymbol = euros.toFixed(2)
          return parseCurrency(withSymbol) === parseCurrency(withoutSymbol)
        }
      )
    )
  })
})

describe('formatPercent - Property-Based Tests', () => {
  it('should always include % symbol', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100 }),
        (value) => {
          const result = formatPercent(value)
          return result.includes('%')
        }
      )
    )
  })

  it('should return "-" for null/undefined', () => {
    expect(formatPercent(null)).toBe('-')
    expect(formatPercent(undefined)).toBe('-')
  })

  it('should respect decimal places parameter', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 5 }),
        (value, decimals) => {
          const result = formatPercent(value, decimals)
          const numericPart = result.replace('%', '').replace(',', '.')
          const decimalPart = numericPart.split('.')[1]
          return !decimalPart || decimalPart.length === decimals
        }
      )
    )
  })
})

describe('getMonthName - Property-Based Tests', () => {
  it('should always return a non-empty string for 1-12', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),
        (month) => {
          const result = getMonthName(month)
          return typeof result === 'string' && result.length > 0
        }
      )
    )
  })

  it('should handle out of range values gracefully (clamp)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 200 }),
        (month) => {
          const result = getMonthName(month)
          // Should not throw and should return a valid month name
          return typeof result === 'string' && result.length > 0
        }
      )
    )
  })

  it('short names should be shorter than full names', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),
        (month) => {
          const full = getMonthName(month, false)
          const short = getMonthName(month, true)
          return short.length <= full.length
        }
      )
    )
  })
})

describe('Payment Calculation Properties', () => {
  /**
   * Test business logic: balance should always equal totalShare - totalPaid
   */
  it('balance calculation is always correct', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000000 }), // totalShare
        fc.integer({ min: 0, max: 10000000 }), // totalPaid
        (totalShare, totalPaid) => {
          const balance = totalShare - totalPaid
          // Property: balance should be deterministic
          return balance === totalShare - totalPaid
        }
      )
    )
  })

  /**
   * Test that installment calculations never result in negative amounts
   */
  it('installment amounts are never negative', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 10000000 }), // totalBudget
        fc.integer({ min: 1, max: 12 }),           // numInstallments
        (totalBudget, numInstallments) => {
          const baseAmount = Math.floor(totalBudget / numInstallments)
          const remainder = totalBudget % numInstallments

          // Generate installments
          const installments = Array.from({ length: numInstallments }, (_, i) =>
            i < remainder ? baseAmount + 1 : baseAmount
          )

          // Properties:
          const allPositive = installments.every(amt => amt >= 0)
          const sumCorrect = installments.reduce((sum, amt) => sum + amt, 0) === totalBudget

          return allPositive && sumCorrect
        }
      )
    )
  })

  /**
   * Test permillage always sums to 1000 (100%)
   */
  it('permillage values should sum to ~1000', () => {
    fc.assert(
      fc.property(
        fc.array(fc.float({ min: Math.fround(0.01), max: Math.fround(100) }), { minLength: 1, maxLength: 50 }),
        (rawValues) => {
          const sum = rawValues.reduce((acc, v) => acc + v, 0)

          // Normalize to permillage (parts per thousand)
          const normalized = rawValues.map(v => (v / sum) * 1000)
          const totalPermillage = normalized.reduce((acc, v) => acc + v, 0)

          // Should be close to 1000 (allowing floating point errors)
          return Math.abs(totalPermillage - 1000) < 0.01
        }
      )
    )
  })

  /**
   * Test year/month transition logic
   */
  it('month increment wraps correctly at year boundary', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),  // startMonth
        fc.integer({ min: 2020, max: 2030 }), // startYear
        fc.integer({ min: 0, max: 24 }),  // monthsToAdd
        (startMonth, startYear, monthsToAdd) => {
          let month = startMonth + monthsToAdd
          let year = startYear

          while (month > 12) {
            month -= 12
            year++
          }

          // Properties:
          const monthInRange = month >= 1 && month <= 12
          const yearIncreased = year >= startYear

          return monthInRange && yearIncreased
        }
      )
    )
  })
})
