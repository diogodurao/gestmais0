# Phase 2: Payment Allocation Engine

## Overview

Automatic allocation of bank transactions to quotas (normal + extraordinary) based on IBAN matching and priority rules.

---

## Spec Reference

This plan implements all requirements from `docs/openBankingAPI.md`:

| Requirement | Solution |
|-------------|----------|
| Priority rules (normal first vs oldest first) | `allocation_settings.priority_rule` |
| IBAN matching + multiple IBANs per resident | Phase 1 ✅ (`residentIbans` table) |
| Duplicate detection by transaction ID | Phase 1 ✅ (`tinkTransactionId` unique) |
| Ignore transaction description | Phase 1 ✅ (not used for matching) |
| Unmatched IBAN → alert manager | Phase 1 ✅ (`matchStatus = 'unmatched'`) |
| Cash payments manual recording | Already implemented in other services ✅ |
| Fixed quota exact match → auto-pay | `findAllocationStrategy()` exact match |
| Permillage quota exact match → auto-pay | `findAllocationStrategy()` exact match |
| Exact extra quota match (e.g., €34.45) | Check ALL quotas for exact match BEFORE priority |
| Partial payment (€35 for €25 quota) | Auto-allocate: 1 paid + 1 partial (Example 11) |
| Tiny partial (can't pay any quota) | `flagForReview('partial_payment')` |
| Advance payments / Credit balance | `resident_credits` table |
| Transaction date vs due date | `isLate` flag based on building settings |

---

## Database Changes

### 1. New Table: `allocation_settings`

Global settings for allocation behavior.

```sql
CREATE TABLE allocation_settings (
  id SERIAL PRIMARY KEY,
  priority_rule TEXT NOT NULL DEFAULT 'normal_first',
  -- 'normal_first': pay all normal quotas before extra quotas
  -- 'oldest_first': chronological order regardless of type
  -- 'proportional': split payment proportionally (future)
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by TEXT REFERENCES "user"(id)
);

-- Insert default setting
INSERT INTO allocation_settings (priority_rule) VALUES ('normal_first');
```

### 2. New Table: `payment_allocations`

Tracks how each transaction was allocated to quotas.

```sql
CREATE TABLE payment_allocations (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES bank_transactions(id) ON DELETE CASCADE,

  -- One of these will be set (normal OR extraordinary)
  payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
  extraordinary_payment_id INTEGER REFERENCES extraordinary_payments(id) ON DELETE SET NULL,

  amount INTEGER NOT NULL, -- cents allocated to this quota

  allocated_by TEXT NOT NULL DEFAULT 'auto', -- 'auto' | 'manager' | 'resident'
  allocated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT one_quota_type CHECK (
    (payment_id IS NOT NULL AND extraordinary_payment_id IS NULL) OR
    (payment_id IS NULL AND extraordinary_payment_id IS NOT NULL)
  )
);

CREATE INDEX idx_allocations_transaction ON payment_allocations(transaction_id);
CREATE INDEX idx_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX idx_allocations_extraordinary ON payment_allocations(extraordinary_payment_id);
```

### 3. Modify `building` Table

Add payment timing settings.

```sql
ALTER TABLE building
  ADD COLUMN payment_due_day INTEGER DEFAULT 8,  -- Day of month quotas are due (1-28)
  ADD COLUMN late_payment_grace_days INTEGER DEFAULT 0;  -- Days after due date before marked late
```

### 4. Modify `bank_transactions`

Add allocation tracking fields.

```sql
ALTER TABLE bank_transactions
  ADD COLUMN allocation_status TEXT DEFAULT 'pending',
  ADD COLUMN review_reason TEXT,
  ADD COLUMN remaining_amount INTEGER DEFAULT 0;

-- allocation_status: 'pending' | 'allocated' | 'partial' | 'review_needed' | 'overpayment'
-- review_reason: 'partial_payment' | 'no_pending_quotas' | 'ambiguous' | 'overpayment_no_account'
-- remaining_amount: unallocated cents (for overpayments)

CREATE INDEX idx_bank_tx_allocation_status ON bank_transactions(allocation_status);
```

### 5. New Table: `resident_credits` (Optional - for special cases)

**Note:** Most overpayments are handled via `bank_transactions.remaining_amount` + immediate allocation. This table is for **edge cases only**:

- Manager manually adds credit (not from bank transaction)
- Money received outside the banking system
- Corrections/adjustments

```sql
CREATE TABLE resident_credits (
  id SERIAL PRIMARY KEY,
  apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  building_id TEXT NOT NULL REFERENCES building(id),
  amount INTEGER NOT NULL,  -- cents (always positive)

  source TEXT NOT NULL,  -- 'manual_adjustment' | 'correction' | 'other'
  description TEXT,  -- e.g., "Cash received at office"

  status TEXT DEFAULT 'pending',  -- 'pending' | 'allocated'

  -- Allocation tracking (when status = 'allocated')
  allocated_to_payment_id INTEGER REFERENCES payments(id),
  allocated_to_extraordinary_id INTEGER REFERENCES extraordinary_payments(id),
  allocated_at TIMESTAMP,
  allocated_by TEXT,  -- user ID who allocated

  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT REFERENCES "user"(id)
);

CREATE INDEX idx_resident_credits_apartment ON resident_credits(apartment_id);
CREATE INDEX idx_resident_credits_status ON resident_credits(status);
```

**Main overpayment flow uses:**
- `bank_transactions.remaining_amount` - stores unallocated amount
- `bank_transactions.allocation_status = 'pending_allocation'` - flags for action
- `payment_allocations` - records allocations to future quotas

---

## New Service: `PaymentAllocationService`

**File:** `src/services/payment-allocation.service.ts`

### Dependencies

```typescript
interface PaymentAllocationDependencies {
  db: typeof db
  logger: Logger
}
```

### Core Methods

#### 1. `allocateTransaction(transactionId: number)`

Main entry point. Orchestrates the allocation flow.

```typescript
async allocateTransaction(transactionId: number): Promise<ActionResult<AllocationResult>>
```

**Returns:**
```typescript
interface AllocationResult {
  status: 'allocated' | 'partial' | 'review_needed' | 'overpayment'
  allocations: Array<{
    quotaType: 'normal' | 'extraordinary'
    quotaId: number
    amount: number
  }>
  remainingAmount: number
  reviewReason?: string
}
```

#### 2. `getPendingQuotas(apartmentId: number, buildingId: string)`

Get all unpaid quotas for an apartment, ordered by priority rule.

```typescript
async getPendingQuotas(apartmentId: number, buildingId: string): Promise<PendingQuota[]>
```

**Returns:**
```typescript
interface PendingQuota {
  type: 'normal' | 'extraordinary'
  id: number  // payment.id or extraordinaryPayment.id

  // Amount tracking (supports partial payments)
  expectedAmount: number  // full quota amount in cents
  paidAmount: number      // already paid (0 for unpaid, >0 for partial)
  remainingAmount: number // expectedAmount - paidAmount (what's still owed)

  dueDate: Date  // month/year for normal, calculated for extra
  isLate: boolean  // true if past building's payment due date
  status: 'pending' | 'partial'  // partial if paidAmount > 0

  projectName?: string  // for extraordinary only
  installment?: number  // for extraordinary only
}
```

**Logic:**
1. Fetch pending/partial `payments` for apartment (status IN ['pending', 'partial'])
2. Fetch pending/partial `extraordinaryPayments` for apartment
3. Calculate `remainingAmount = expectedAmount - paidAmount` for each
4. Calculate `isLate` based on building's payment settings:
   - Get `building.paymentDueDay` (e.g., day 8 of each month)
   - Compare quota's due date with current date
   - Mark `isLate = true` if past due
5. Apply priority rule ordering
6. Return unified list

**Key:** Partial quotas are included so that subsequent payments can complete them.

**Note:** The `isLate` flag is informational for the UI (showing which payments are overdue). The allocation logic itself doesn't treat late payments differently - they're still allocated in priority order.

#### 3. `applyPriorityRule(quotas: PendingQuota[])`

Sort quotas based on global priority setting.

```typescript
private applyPriorityRule(quotas: PendingQuota[]): PendingQuota[]
```

**Priority Rules:**

| Rule | Behavior |
|------|----------|
| `normal_first` | All normal quotas (oldest first), then all extra quotas (oldest first) |
| `oldest_first` | All quotas by due date regardless of type |

#### 4. `findAllocationStrategy(amount: number, quotas: PendingQuota[])`

Determine how to allocate the transaction amount.

```typescript
private findAllocationStrategy(
  amount: number,
  quotas: PendingQuota[]
): AllocationStrategy
```

**Returns:**
```typescript
interface AllocationStrategy {
  type: 'exact_match' | 'multi_quota' | 'partial' | 'overpayment' | 'no_match'
  allocations: Array<{ quota: PendingQuota; amount: number }>
  remainder: number
}
```

**Logic (ORDER MATTERS):**
```
1. EXACT MATCH CHECK (ANY quota, regardless of type/priority)
   - Search ALL quotas for amount === quota.remainingAmount
   - Works for BOTH fresh quotas AND partial completions
   - If found → return exact_match to that single quota
   - Examples:
     - €34.45 paid, extra quota remaining €34.45 → match ✅
     - €3.90 paid, extra quota remaining €3.90 (partial) → match ✅

2. MULTI-QUOTA EXACT MATCH
   - Check if amount === sum of first N quotas' remainingAmounts (in priority order)
   - Example: €50 paid, quotas remaining €25 + €25 → match both

3. PRIORITY ALLOCATION (when no exact match)
   - Apply priority rule ordering (normal_first or oldest_first)
   - Allocate to quotas in order until amount exhausted
   - For each quota: allocate min(remainingAmount, availableFunds)
   - Track remainder

4. HANDLE REMAINDER
   - If remainder > 0 and quotas remain → partial payment on next quota
   - If remainder > 0 and no quotas remain → overpayment (resident/manager allocates)
   - If remainder = 0 → fully allocated
```

**Key Insights:**
- Step 1 uses `remainingAmount`, so €3.90 can complete a partial quota
- Step 1 ensures exact matches bypass priority (€34.45 → extra quota directly)
- Partial quotas are treated like any other quota, just with smaller remainingAmount

#### 5. `executeAllocation(transactionId: number, strategy: AllocationStrategy)`

Execute the allocation - create records and update statuses.

```typescript
private async executeAllocation(
  transactionId: number,
  strategy: AllocationStrategy,
  allocatedBy: 'auto' | 'manager' | 'resident'
): Promise<void>
```

**Logic (in DB transaction):**
1. Create `payment_allocations` records
2. Update quota statuses (`payments.status`, `extraordinaryPayments.status`)
3. Update `bank_transactions.allocation_status`
4. If partial: update `paidAmount` on extraordinary payments

#### 6. `flagForReview(transactionId: number, reason: string)`

Mark transaction for manual review.

```typescript
async flagForReview(transactionId: number, reason: ReviewReason): Promise<void>
```

**Review Reasons:**
- `partial_payment` - Amount less than smallest quota
- `no_pending_quotas` - All quotas paid, has remainder
- `ambiguous` - Multiple valid allocation paths
- `overpayment_no_account` - Overpayment + resident has no account

#### 7. `manualAllocate(transactionId: number, allocations: ManualAllocation[], userId: string)`

Manager/resident manually allocates a transaction.

```typescript
async manualAllocate(
  transactionId: number,
  allocations: Array<{
    quotaType: 'normal' | 'extraordinary'
    quotaId: number
    amount: number
  }>,
  userId: string
): Promise<ActionResult<void>>
```

#### 8. `getTransactionsForReview(buildingId: string)`

Get all transactions needing manual review.

```typescript
async getTransactionsForReview(buildingId: string): Promise<ReviewableTransaction[]>
```

#### 9. `getPriorityRule()` / `setPriorityRule(rule: string, userId: string)`

Get/set the global priority rule.

```typescript
async getPriorityRule(): Promise<PriorityRule>
async setPriorityRule(rule: PriorityRule, userId: string): Promise<void>
```

---

## Credit Balance Service Methods

Additional methods for managing resident credit balances.

#### 10. `createCredit(apartmentId: number, amount: number, source: string, transactionId?: number)`

Create a credit balance entry (called when overpayment detected).

```typescript
async createCredit(
  apartmentId: number,
  buildingId: string,
  amount: number,
  source: 'bank_overpayment' | 'manual_adjustment',
  transactionId?: number
): Promise<ActionResult<{ creditId: number }>>
```

---

## Overpayment Handling (Has Account vs No Account)

When a transaction has a **remainder after allocating to all pending quotas**, the resident has already fulfilled their current obligations. This remainder must be **allocated immediately** - not stored as passive credit.

**Check:** `apartments.residentId IS NOT NULL` → has account

### Key Principle

> The resident already paid. The money is theirs. They decide (immediately) where it goes.
> If no account, manager acts on their behalf.

### When Overpayment Detected:

```typescript
// After allocation, if remainder > 0 and no more pending quotas:
const apartment = await db.query.apartments.findFirst({
  where: eq(apartments.id, apartmentId)
})

const hasAccount = apartment.residentId !== null

// Store the pending amount for immediate allocation
await updateTransaction(transactionId, {
  allocation_status: 'pending_allocation',  // NOT fully allocated yet
  remaining_amount: remainder
})

if (hasAccount) {
  // Resident must allocate NOW - trigger notification/UI prompt
  // The resident dashboard will show an IMMEDIATE action required
  await createNotification(apartment.residentId, {
    type: 'overpayment_allocation_required',
    transactionId,
    amount: remainder,
    message: `You paid €${(remainder/100).toFixed(2)} more than owed. Please allocate to future quotas.`
  })
} else {
  // No account - manager must allocate
  await updateTransaction(transactionId, {
    review_reason: 'overpayment_no_account'
  })
  // Shows in manager's "Pending Actions" dashboard
}
```

### Allocation Options for Overpayment

When allocating the remainder, the person (resident or manager) can:

1. **Allocate to future normal quotas** (e.g., pay March quota in advance)
2. **Allocate to future extra quota installments**
3. **Split across multiple future quotas**

### Dashboard Behavior

| Scenario | What Happens | UI Behavior |
|----------|--------------|-------------|
| Resident HAS account | Immediate prompt to allocate | Modal/banner: "You have €25 to allocate. Choose which future quotas to pay." |
| Resident NO account | Manager sees pending action | Manager dashboard: "Apt 3A: €25 pending allocation (resident has no account)" |

### UI Flow - Resident WITH Account:

1. Resident pays €100 when only €75 is owed
2. System auto-allocates €75 to current quotas ✅
3. €25 remainder detected
4. **IMMEDIATELY**: Resident sees notification/modal:
   ```
   "You paid €25 more than your current balance.
   Please allocate this amount to future quotas:"

   [ ] March 2024 quota - €25
   [ ] April 2024 quota - €25
   [ ] Extra Project Installment #3 - €34.45

   [Allocate Selected]
   ```
5. Resident selects and confirms
6. Transaction is now fully allocated ✅

### UI Flow - Resident WITHOUT Account:

1. Resident pays €100 when only €75 is owed
2. System auto-allocates €75 to current quotas ✅
3. €25 remainder detected
4. Manager sees in dashboard:
   ```
   ⚠️ Pending Allocations (1)

   Apt 3A - €25.00 unallocated
   Transaction: #12345 from 2024-01-15
   Resident: No account

   [Allocate Now]
   ```
5. Manager clicks "Allocate Now" → same allocation modal
6. Manager allocates to future quotas on resident's behalf
7. Transaction is now fully allocated ✅

### What if Resident/Manager Doesn't Allocate?

The transaction stays in `pending_allocation` status. The dashboard will continue showing the pending action until resolved. This ensures nothing is forgotten.

#### 11. `getAvailableCredits(apartmentId: number)`

Get all available (unallocated) credits for an apartment.

```typescript
async getAvailableCredits(apartmentId: number): Promise<ResidentCredit[]>
```

**Returns:**
```typescript
interface ResidentCredit {
  id: number
  amount: number
  source: string
  createdAt: Date
  transactionId?: number
}
```

#### 12. `allocateCredit(creditId: number, quotaType: string, quotaId: number, userId: string)`

Allocate a credit to a specific quota (resident or manager action).

```typescript
async allocateCredit(
  creditId: number,
  quotaType: 'normal' | 'extraordinary',
  quotaId: number,
  userId: string
): Promise<ActionResult<void>>
```

#### 13. `getTotalCreditBalance(apartmentId: number)`

Get total available credit for an apartment.

```typescript
async getTotalCreditBalance(apartmentId: number): Promise<number>  // cents
```

---

## Integration with Existing Code

### Modify `TinkService.batchSyncAccountTransactions()`

After syncing transactions, trigger auto-allocation for matched transactions.

```typescript
// After batch insert
for (const tx of insertedTransactions) {
  if (tx.matchStatus === 'matched' && tx.type === 'credit') {
    await paymentAllocationService.allocateTransaction(tx.id)
  }
}
```

### Modify `TinkService.matchTransactionsByIban()`

After IBAN matching, trigger allocation.

```typescript
// After matching
if (match) {
  // ... existing update
  await paymentAllocationService.allocateTransaction(tx.id)
}
```

---

## Server Actions

**File:** `src/lib/actions/payment-allocation.ts`

```typescript
// Get allocation settings
export async function getAllocationSettings(buildingId: string)

// Update priority rule
export async function updatePriorityRule(rule: PriorityRule)

// Get transactions needing review
export async function getTransactionsForReview(buildingId: string)

// Manual allocation by manager
export async function manuallyAllocateTransaction(
  transactionId: number,
  allocations: AllocationInput[],
  buildingId: string
)

// Resident self-allocation (for overpayments)
export async function residentAllocateOverpayment(
  transactionId: number,
  allocations: AllocationInput[]
)

// Get allocation history for a transaction
export async function getTransactionAllocations(transactionId: number)

// Undo allocation (manager only)
export async function undoAllocation(transactionId: number, buildingId: string)

// === Credit Balance Actions ===

// Get available credits for an apartment
export async function getApartmentCredits(apartmentId: number)

// Allocate credit to a quota (resident or manager)
export async function allocateCreditToQuota(
  creditId: number,
  quotaType: 'normal' | 'extraordinary',
  quotaId: number
)

// Manual credit adjustment (manager only)
export async function adjustCredit(
  apartmentId: number,
  amount: number,  // positive to add, negative to remove
  notes: string,
  buildingId: string
)

// Get credit history for an apartment
export async function getCreditHistory(apartmentId: number)
```

---

## Allocation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   TRANSACTION SYNCED                        │
│              (matched to apartment by IBAN)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              GET PENDING QUOTAS FOR APARTMENT               │
│         (normal payments + extraordinary payments)          │
│              Apply priority rule ordering                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │ Any pending    │
                   │ quotas?        │
                   └────────────────┘
                     NO │      │ YES
                        ▼      ▼
        ┌──────────────────┐  ┌────────────────────────────────┐
        │ OVERPAYMENT      │  │ FIND ALLOCATION STRATEGY       │
        │ Flag for review  │  └────────────────────────────────┘
        │ or resident      │              │
        │ allocation       │              ▼
        └──────────────────┘     ┌────────────────┐
                                 │ Exact match?   │
                                 └────────────────┘
                                  YES │      │ NO
                                      ▼      ▼
                        ┌──────────────┐  ┌────────────────────────────────┐
                        │ ALLOCATE     │  │ Amount covers N quotas exactly?│
                        │ 100% to      │  └────────────────────────────────┘
                        │ single quota │     YES │      │ NO
                        └──────────────┘         ▼      ▼
                                    ┌──────────────┐  ┌─────────────────────┐
                                    │ ALLOCATE     │  │ Allocate in order   │
                                    │ to N quotas  │  │ until amount used   │
                                    └──────────────┘  └─────────────────────┘
                                                              │
                                                              ▼
                                                    ┌────────────────┐
                                                    │ Remainder?     │
                                                    └────────────────┘
                                                     YES │      │ NO
                                                         ▼      ▼
                                           ┌─────────────────┐  ┌───────┐
                                           │ Amount < quota? │  │ DONE  │
                                           └─────────────────┘  └───────┘
                                            YES │      │ NO
                                                ▼      ▼
                              ┌──────────────────┐  ┌─────────────────────┐
                              │ PARTIAL PAYMENT  │  │ OVERPAYMENT         │
                              │ Allocate what    │  │ All quotas paid     │
                              │ fits, flag rest  │  │ Check has account?  │
                              └──────────────────┘  └─────────────────────┘
                                                        YES │      │ NO
                                                            ▼      ▼
                                              ┌──────────────┐  ┌──────────────┐
                                              │ RESIDENT     │  │ MANAGER      │
                                              │ allocates    │  │ allocates    │
                                              │ (dashboard)  │  │ (dashboard)  │
                                              └──────────────┘  └──────────────┘
```

---

## UI Components Needed

### Manager Dashboard

1. **Transactions for Review** - List of transactions needing manual allocation
2. **Allocation Modal** - Select quotas to allocate amounts to
3. **Priority Rule Setting** - Dropdown to change global rule
4. **Allocation History** - View how past transactions were allocated

### Resident Dashboard (if has account)

1. **Pending Overpayments** - Transactions with remainder to allocate
2. **Self-Allocation Modal** - Choose which future quotas to pay

---

## Implementation Order

1. **Database Migration** - Add tables and columns
2. **PaymentAllocationService** - Core service with all methods
3. **Server Actions** - API layer
4. **Integration** - Hook into TinkService
5. **Manager UI** - Review and manual allocation
6. **Resident UI** - Self-allocation for overpayments

---

## Real-World Examples with Math

### Setup for Examples

**Building Configuration:**
- Monthly quota (normal): €25.00 (fixed)
- Extra quota project: 3 installments of €34.45 each

**Apartment 3A - Pending Quotas:**
| Type | Month/Installment | Amount | Due Date |
|------|-------------------|--------|----------|
| Normal | January | €25.00 | Jan 8 |
| Normal | February | €25.00 | Feb 8 |
| Normal | March | €25.00 | Mar 8 |
| Extra | Installment #1 | €34.45 | Jan 15 |
| Extra | Installment #2 | €34.45 | Feb 15 |

**Priority Rule:** `normal_first`

---

### Example 1: Exact Match - Single Normal Quota

**Payment:** €25.00

```
Step 1: Exact match check
  - €25 === €25 (Jan normal)? ✅ YES

Result: EXACT_MATCH
  → Allocate €25 to January normal quota
  → January marked as PAID
  → Transaction fully allocated ✅
```

---

### Example 2: Exact Match - Extra Quota (Bypasses Priority!)

**Payment:** €34.45

```
Step 1: Exact match check
  - €34.45 === €25 (Jan normal)? ❌
  - €34.45 === €25 (Feb normal)? ❌
  - €34.45 === €34.45 (Extra #1)? ✅ YES

Result: EXACT_MATCH
  → Allocate €34.45 to Extra Installment #1
  → Extra #1 marked as PAID
  → Transaction fully allocated ✅

⚠️ KEY: Extra quota matched DIRECTLY, even though normal quotas
   were pending. This is the "smart detection" for exact amounts.
```

---

### Example 3: Multi-Quota - Pays 2 Months

**Payment:** €50.00

```
Step 1: Exact match check
  - €50 === any single quota? ❌ NO

Step 2: Multi-quota exact match (priority order)
  - €25 (Jan) = €25... need more
  - €25 + €25 (Jan+Feb) = €50 === €50? ✅ YES

Result: MULTI_QUOTA_EXACT
  → Allocate €25 to January
  → Allocate €25 to February
  → Both marked as PAID
  → Transaction fully allocated ✅
```

---

### Example 4: Multi-Quota - Pays Everything

**Payment:** €84.45

```
Step 1: Exact match check
  - €84.45 === any single quota? ❌ NO

Step 2: Multi-quota exact match (priority order: normal_first)
  - €25 (Jan) = €25
  - €25 + €25 (Jan+Feb) = €50
  - €25 + €25 + €25 (Jan+Feb+Mar) = €75
  - €25 + €25 + €34.45 (Jan+Feb+Extra#1) = €84.45 ✅ YES

Result: MULTI_QUOTA_EXACT
  → Allocate €25 to January ✅
  → Allocate €25 to February ✅
  → Allocate €34.45 to Extra #1 ✅
  → All marked as PAID
  → Transaction fully allocated ✅

Math: €25 + €25 + €34.45 = €84.45 (no remainder)
```

---

### Example 5: Tiny Payment (Can't Pay Any Full Quota)

**Payment:** €15.00

```
Step 1: Exact match check
  - €15 === any quota? ❌ NO

Step 2: Multi-quota exact match
  - No combination equals €15 ❌

Step 3: Priority allocation
  - First quota (Jan normal): €25
  - €15 < €25 → Cannot fully pay even the first quota
  - No full quotas can be marked as PAID

Result: FLAG_FOR_REVIEW
  → reason: "partial_payment"
  → remaining_amount = €15
  → Manager decides: apply as partial OR investigate

Note: Unlike Example 11 (€35 = €25 + €10 partial), this €15
      can't fully pay ANY quota. We flag because:
      - Could be an error (wrong amount)
      - Could be intentional partial payment
      - Manager should decide the intent
```

---

### Example 6: Overpayment - More Than Owed

**Payment:** €100.00

**Pending quotas:** Only Jan (€25) and Feb (€25) = €50 total

```
Step 1: Exact match check
  - €100 === any quota? ❌ NO

Step 2: Multi-quota exact match
  - €25 + €25 = €50 ≠ €100 ❌

Step 3: Priority allocation
  - Allocate €25 to January ✅
  - Allocate €25 to February ✅
  - Remaining: €100 - €50 = €50

Step 4: Handle remainder
  - All pending quotas exhausted
  - remainder = €50
  - Check if resident has account

Result: OVERPAYMENT
  → January PAID, February PAID
  → remaining_amount = €50
  → If has account → Resident prompted to allocate €50 to future quotas
  → If no account → Manager allocates

Resident might allocate:
  - €25 to March quota (advance)
  - €25 to Extra #1 (advance)
```

---

### Example 7: Odd Amount - Priority Allocation

**Payment:** €60.00

```
Step 1: Exact match check
  - €60 === any single quota? ❌ NO

Step 2: Multi-quota exact match
  - €25 = €25
  - €25 + €25 = €50
  - €25 + €25 + €25 = €75
  - €25 + €34.45 = €59.45
  - No combination = €60 ❌

Step 3: Priority allocation (normal_first)
  - Allocate €25 to January ✅ (remaining: €35)
  - Allocate €25 to February ✅ (remaining: €10)
  - Next: March €25, but only €10 left
  - Remaining: €10

Result: PARTIAL + OVERPAYMENT
  → January PAID, February PAID
  → remaining_amount = €10
  → €10 cannot pay next quota (€25)
  → Flag for allocation: resident/manager decides

Options for the €10:
  - Apply as partial to March (€10 of €25 paid)
  - Keep as credit for later
  - Apply to Extra quota (partial)
```

---

### Example 8: Permillage Building

**Building:** Permillage-based quotas
- Apt 3A permillage: 45‰
- Building monthly budget: €1,000
- Apt 3A monthly quota: €1,000 × 0.045 = €45.00

**Payment:** €45.00

```
Step 1: Exact match check
  - €45 === €45 (Jan quota for this apt)? ✅ YES

Result: EXACT_MATCH
  → Allocate €45 to January
  → Transaction fully allocated ✅

Note: Even though other apartments have different quotas,
      this apartment's quota is €45, so exact match works.
```

---

### Example 9: Two Transactions Same Day

**Transaction 1:** €25.00 at 10:00
**Transaction 2:** €34.45 at 14:00

```
Transaction 1 processed:
  - Exact match €25 → January ✅

Transaction 2 processed (4 hours later):
  - January is now PAID
  - Pending: Feb (€25), Mar (€25), Extra#1 (€34.45)
  - Exact match €34.45 → Extra #1 ✅

Result: Both transactions allocated independently
  → January PAID (from tx 1)
  → Extra #1 PAID (from tx 2)
```

---

### Example 10: Complex Real Scenario

**Resident owes:**
- Jan €25 (LATE)
- Feb €25 (LATE)
- Mar €25 (current)
- Extra #1 €34.45 (LATE)
- Extra #2 €34.45 (current)

**Total owed:** €143.90

**Payment:** €143.90

```
Step 1: Exact match check
  - €143.90 === any single quota? ❌ NO

Step 2: Multi-quota exact match
  - Priority order (normal_first):
    €25 + €25 + €25 + €34.45 + €34.45 = €143.90 ✅ YES!

Result: MULTI_QUOTA_EXACT (Full Settlement)
  → All 5 quotas marked as PAID
  → Transaction fully allocated ✅
  → Resident is now debt-free!
```

---

### Example 11: Partial Payment with Auto-Allocation (Spec Example)

**Payment:** €35.00

**Pending quotas:** Jan €25, Feb €25, Mar €25

```
Step 1: Exact match check
  - €35 === any single quota? ❌ NO

Step 2: Multi-quota exact match
  - €25 = €25
  - €25 + €25 = €50 ≠ €35
  - No combination = €35 ❌

Step 3: Priority allocation (normal_first)
  - Allocate €25 to January ✅ (remaining: €10)
  - Next quota: February €25
  - €10 < €25 → Can only partially pay

Step 4: Auto-allocate partial
  - Allocate €10 to February as PARTIAL
  - February: paidAmount = €10, remainingAmount = €15
  - February status: 'partial'

Result: ALLOCATED (with partial)
  → January PAID (€25)
  → February PARTIAL (€10/€25 paid, €15 remaining)
  → Transaction fully allocated ✅ (no remainder)

⚠️ KEY: This matches the spec example:
   "monthly quota is €25 → user pays €35 →
    assumes 1 quota paid + 1 monthly quota partially paid"
```

---

### Example 12: Completing a Partial Payment

**Setup:** February already has €10 paid (from Example 11)
- February remainingAmount = €15

**Payment:** €15.00

```
Step 1: Exact match check
  - €15 === €15 (Feb remaining)? ✅ YES

Result: EXACT_MATCH (partial completion)
  → Allocate €15 to February
  → February: paidAmount = €25, remainingAmount = €0
  → February status: 'paid'
  → Transaction fully allocated ✅

⚠️ KEY: Exact match works on remainingAmount, not expectedAmount.
   This is how partial payments get completed.
```

---

## Edge Cases Handled

| Case | Handling |
|------|----------|
| Exact match single quota | Auto-allocate, mark paid |
| Exact match extra quota (€34.45) | Direct allocation (checked BEFORE priority rule) |
| Pays 2 months at once (€50 for €25 quota) | Auto-allocate to 2 oldest quotas |
| Pays everything (€143.90) | Smart multi-quota detection, all marked paid |
| Partial payment (€35 for €25 quota) | Auto-allocate: 1 paid + €10 partial (Example 11) |
| Tiny payment (€15, can't pay any quota) | Flag for review (Example 5) |
| Completing a partial quota (€15 remaining) | Exact match on remainingAmount (Example 12) |
| Overpayment with pending extra quota | Apply priority rule |
| All quotas paid + new payment | Resident/manager allocates to future |
| Resident has no account + overpayment | Manager allocates |
| Resident has account + overpayment | Resident allocates immediately |
| Same IBAN pays twice same day | Each transaction processed independently |
| Late payment (past due date) | `isLate` flag for UI, still allocated normally |
| Permillage building | Uses apartment-specific calculated amount |
| Odd amount (€60) | Priority allocation + remainder handling |
