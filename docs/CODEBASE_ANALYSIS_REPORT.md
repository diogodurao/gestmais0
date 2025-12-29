# GestMais Codebase Analysis Report

**Date:** December 25, 2025
**Branch Analyzed:** `antigravity`
**Application:** Condominium Management System (Next.js 16 + React 19 + Drizzle ORM)

---

## Executive Summary

| Category | Status | Count |
|----------|--------|-------|
| **Build Status** | FAILING | 4 TypeScript errors |
| **Tests** | PASSING | 9 tests (3 files) |
| **Critical Issues** | HIGH | 15+ |
| **Security Vulnerabilities** | MODERATE | 5 npm vulnerabilities |
| **Code Quality Issues** | MEDIUM | 50+ |
| **Orphaned Files** | LOW | 14 files |

---

## 1. CRITICAL BUILD-BREAKING ISSUES

### 1.1 Case Sensitivity Mismatch (BLOCKING)

The build fails due to import path case mismatch between directory name and imports:

```
Directory: src/features/dashboard/ExtraordinaryProjects/  (PascalCase)
Imports:   @/features/dashboard/extraordinaryProjects/    (camelCase)
```

**Files with incorrect imports:**
| File | Line |
|------|------|
| `src/app/dashboard/extraordinary/page.tsx` | 11 |
| `src/app/dashboard/extraordinary/new/page.tsx` | 7 |
| `src/app/dashboard/extraordinary/[id]/page.tsx` | 9 |
| `src/features/dashboard/ExtraordinaryProjects/ExtraProjectDetail.tsx` | 28 |

**Fix Required:** Rename folder to `extraordinaryProjects` or update all imports to `ExtraordinaryProjects`.

### 1.2 Dependency Conflicts

```
Conflicting peer dependency: drizzle-orm@0.45.1 vs drizzle-orm@0.41.0 (required by better-auth)
```

Must use `npm install --legacy-peer-deps` to install.

---

## 2. TEST RESULTS

### 2.1 Test Summary

```
Test Files:  3 passed (3)
Tests:       9 passed (9)
Duration:    4.34s
```

**Test Files:**
- `src/services/__tests__/payment.service.test.ts` (3 tests)
- `src/services/__tests__/extraordinary.service.test.ts` (3 tests)
- `src/services/__tests__/stripe.service.test.ts` (3 tests)

### 2.2 Missing Test Coverage

| Area | Test Coverage |
|------|---------------|
| Server Actions | 0% (7 files, 0 tests) |
| Building Service | ~20% (few methods tested) |
| Authentication Flows | 0% |
| UI Components | 0% |
| API Routes | 0% |
| Webhook Security | 0% |

---

## 3. SECURITY ISSUES

### 3.1 Missing Authorization (CRITICAL)

Most server actions lack proper authorization checks. Any authenticated user can access/modify data from any building.

**Vulnerable Files:**

| File | Issue |
|------|-------|
| `src/app/actions/building.ts` | 15+ functions with no auth checks |
| `src/app/actions/payments.ts` | Payment data accessible without building validation |
| `src/app/actions/extraordinary.ts` | No building ownership verification |
| `src/app/actions/user.ts` | No validation on profile updates |

**Example - Any user can view any building's payments:**
```typescript
// src/app/actions/payments.ts:17
export async function getPaymentMap(buildingId: string, year: number) {
    return paymentService.getPaymentMap(buildingId, year) // No auth check!
}
```

### 3.2 Hardcoded Test Origin

**File:** `src/lib/auth.ts:11-13`
```typescript
trustedOrigins: [
    "http://localhost:3000",
    "http://172.20.10.3:3000" // Mobile testing - SHOULD NOT BE IN PRODUCTION
]
```

### 3.3 No Input Validation

Server actions accept parameters without Zod or other validation:
- No type checking for enums
- No sanitization of user inputs
- No boundary checking for numeric values

### 3.4 npm Vulnerabilities

```
5 moderate severity vulnerabilities (esbuild chain via drizzle-kit)
```

---

## 4. CODE QUALITY ISSUES

### 4.1 Inconsistent Naming Conventions

**Directory Structure:**
```
src/features/dashboard/
├── ExtraordinaryProjects/  (PascalCase)
├── paymentsQuotas/         (camelCase)
├── cards/                  (lowercase)
├── onboarding/             (lowercase)
├── residents/              (lowercase)
├── settings/               (lowercase)
└── subscription/           (lowercase)
```

**File Naming:**
- `Formfield.tsx` should be `FormField.tsx` (component exports `FormField`)

### 4.2 Conflicting Type Definitions

`PaymentStatus` defined in 5 different locations with different values:

| File | Definition |
|------|------------|
| `src/lib/types.ts:1` | `"paid" \| "late" \| "pending"` |
| `src/services/payment.service.ts:6` | `"paid" \| "pending" \| "late"` |
| `src/services/extraordinary.service.ts:38` | `"paid" \| "pending" \| "overdue" \| "partial"` |
| `src/components/ui/StatusBadge.tsx:8` | `"paid" \| "pending" \| "overdue" \| "partial"` |
| `src/app/actions/extraordinary.ts:105` | `"paid" \| "pending"` |

### 4.3 Excessive `any` Types

**Count:** 23 instances across the codebase

**Notable Locations:**
- `src/app/dashboard/settings/page.tsx:65-66` - `any[]` arrays
- `src/features/dashboard/onboarding/ResidentOnboardingFlow.tsx` - 5 instances
- `src/components/landing/*.tsx` - 6 files with `dict: any`
- `src/lib/document-export.ts:13,36` - `data: any[]`

### 4.4 Console Statements in Production Code

**Count:** 49 `console.log/error` statements

**Files with most occurrences:**
- `src/services/extraordinary.service.ts` - 10 instances
- `src/app/api/webhooks/stripe/route.ts` - 6 instances
- `src/features/auth/LoginForm.tsx` - 3 instances

### 4.5 Missing Error Handling in Server Actions

**Issue:** All 7 server action files have 0 try-catch blocks. Errors bubble up unhandled.

```typescript
// Example: src/app/actions/building.ts
export async function createNewBuilding(userId: string, name: string, nif: string) {
    return buildingService.createBuilding(userId, name, nif) // Can throw!
}
```

### 4.6 Hardcoded Values

**Paths:**
- `/dashboard`, `/dashboard/settings`, `/dashboard/payments` used in multiple files

**Status Strings:**
- `'active'`, `'incomplete'`, `'canceled'` hardcoded in multiple locations

**Error Messages:**
- Portuguese messages hardcoded instead of using i18n

---

## 5. ORPHANED/UNUSED FILES

### 5.1 Prototype Files (Can be deleted)

Location: `src/prototypes/` (12 files, ~133KB)

| File | Size |
|------|------|
| auth.html | 96 lines |
| examplePaymentgrid.html | 216 lines |
| extra-payment.html | 122 lines |
| landingPage.html | 301 lines |
| managerdashboard.html | 284 lines |
| ocurrences.html | 116 lines |
| paymentgrid.html | 289 lines |
| residentdashboard.html | 280 lines |
| sttings.html | 138 lines |
| surveyPerformance.html | 106 lines |
| uiElements.html | 177 lines |
| voting.html | 128 lines |

### 5.2 Unused TypeScript Files

| File | Description |
|------|-------------|
| `src/proxy.ts` | i18n proxy middleware - not imported |
| `src/lib/tokens.ts` | Design tokens - not imported |

---

## 6. DEPRECATED CODE

| Location | Description |
|----------|-------------|
| `src/lib/auth-helpers.ts:66-73` | `requireManager` and `requireResident` deprecated |
| `src/lib/types.ts:18-22` | `PaymentGridData` type deprecated |
| `src/components/ui/Button.tsx:39` | TODO: Remove `cn` re-export |

---

## 7. MISSING FEATURES & IMPROVEMENTS

### 7.1 Security Improvements Needed
- [ ] Add authorization checks to all server actions
- [ ] Implement Zod input validation
- [ ] Remove hardcoded test origins
- [ ] Add rate limiting to auth endpoints
- [ ] Add idempotency checks to Stripe webhooks

### 7.2 Testing Improvements Needed
- [ ] Add tests for server actions (0% coverage)
- [ ] Add tests for auth flows
- [ ] Add tests for UI components
- [ ] Add integration tests for critical paths

### 7.3 Code Quality Improvements
- [ ] Standardize directory naming (all lowercase)
- [ ] Consolidate PaymentStatus type to single source
- [ ] Replace `any` types with proper definitions
- [ ] Remove console statements (use proper logging)
- [ ] Add try-catch to server actions
- [ ] Create constants for hardcoded values

### 7.4 i18n Improvements
- [ ] Move Portuguese error messages to dictionaries
- [ ] Complete translation coverage
- [ ] Use translation in all UI components

### 7.5 Performance Improvements
- [ ] Split large components (4 files > 480 lines each)
- [ ] Optimize N+1 queries in payment service
- [ ] Add caching for frequently accessed data

### 7.6 Accessibility Improvements
- [ ] Add ARIA labels to interactive elements
- [ ] Add alt text to images
- [ ] Ensure proper heading hierarchy
- [ ] Add keyboard navigation support

---

## 8. RECOMMENDED FIXES (Priority Order)

### P0 - Build Blockers
1. Fix case sensitivity in extraordinary imports
2. Resolve peer dependency conflicts

### P1 - Critical Security
3. Add authorization checks to server actions
4. Remove hardcoded test origin from auth
5. Implement input validation

### P2 - High Priority
6. Add comprehensive test coverage
7. Fix TypeScript errors
8. Consolidate type definitions

### P3 - Medium Priority
9. Remove orphaned files
10. Standardize naming conventions
11. Remove console statements
12. Add error handling to actions

### P4 - Low Priority
13. Split large components
14. Complete i18n implementation
15. Add accessibility improvements

---

## 9. FILE STRUCTURE OVERVIEW

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── [lang]/            # i18n landing pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── actions/           # Server actions (7 files)
├── components/            # UI components
│   ├── landing/          # Landing page components
│   ├── layout/           # Layout components
│   ├── seo/              # SEO components
│   └── ui/               # Reusable UI (18 files)
├── features/              # Feature components
│   ├── auth/             # Auth forms
│   └── dashboard/        # Dashboard features
├── services/              # Business logic (4 files)
├── lib/                   # Utilities (12 files)
├── db/                    # Database (2 files)
├── hooks/                 # React hooks (2 files)
├── dictionaries/          # i18n (2 files)
└── prototypes/            # Unused HTML prototypes
```

---

## 10. CONCLUSION

The `antigravity` branch introduces significant new features (extraordinary projects, enhanced onboarding, subscription management) but has critical issues that prevent production deployment:

1. **The build is broken** due to case-sensitivity issues
2. **Security is compromised** by missing authorization checks
3. **Test coverage is minimal** at only 9 tests
4. **Code quality varies** with inconsistent patterns

Before merging to production:
1. Fix the 4 TypeScript errors blocking build
2. Implement authorization checks on all server actions
3. Add comprehensive test coverage for critical paths
4. Clean up orphaned files and deprecated code

---

*Report generated by automated analysis on December 25, 2025*
