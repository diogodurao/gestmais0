# Stripe Integration Optimization Report

## 1. Verification of Current Flow

We implemented integration tests to verify the core Stripe and Auth flows:

*   **Checkout Creation**: Confirmed that `createCheckoutSession` correctly links the Stripe customer to the user and passes the `buildingId` in metadata.
*   **Webhook Handling**: Confirmed that `checkout.session.completed` activates the building's `subscriptionStatus`, and `customer.subscription.deleted` marks it as canceled.
*   **Auth Gating**: Confirmed that `joinBuilding` effectively blocks users from joining buildings with an `incomplete` subscription status.
*   **Synchronization**: Confirmed that `syncSubscriptionStatus` can manually poll Stripe to update the local database state if the webhook is delayed or missed.

## 2. Code Quality & Architecture Suggestions

### Scalability Improvements

1.  **Database Indexes**:
    *   The webhook handler frequently queries `building` by `stripeSubscriptionId`.
    *   The `user` table is queried by `stripeCustomerId` in some contexts (though mostly we use user ID).
    *   **Action**: Add an index to `building.stripeSubscriptionId` and `building.stripePriceId` in `src/db/schema.ts`.

2.  **Webhook Robustness**:
    *   Currently, the webhook handler runs synchronous database updates. If the database is slow, the webhook might timeout.
    *   **Suggestion**: For high scale, push webhook events to a queue (e.g., Redis/BullMQ or AWS SQS) and process them asynchronously.
    *   **Idempotency**: Stripe webhooks can be delivered multiple times. The current `update` operation is generally idempotent (setting status to 'active' twice is fine), but explicitly tracking processed Event IDs in a Redis set or database table prevents redundant processing logic.

3.  **Customer Management**:
    *   The `stripeCustomerId` is stored on the `user` table. This is good.
    *   However, if a user has multiple roles or contexts, we should ensure the customer ID is strictly tied to the paying entity (the Manager).

4.  **Error Handling**:
    *   The `createCheckoutSession` function handles `resource_missing` errors by recreating the customer. This is a good self-healing mechanism.

### Proposed Schema Changes

We recommend adding indexes to the `building` table for Stripe-related fields.

```typescript
// src/db/schema.ts
import { index } from 'drizzle-orm/pg-core';

export const building = pgTable('building', {
    // ... fields
}, (table) => {
  return {
    stripeSubIdx: index('stripe_sub_idx').on(table.stripeSubscriptionId),
  }
});
```

## 3. Implemented Fixes

*   Added verification tests to ensure the logic holds.
*   (Next Step) Will apply the schema index for `stripeSubscriptionId`.
