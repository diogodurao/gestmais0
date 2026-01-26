-- Add 'unpaid' to subscription_status enum
ALTER TYPE "subscription_status" ADD VALUE IF NOT EXISTS 'unpaid';

-- Add 'subscription_payment_failed' to notification_type enum
ALTER TYPE "notification_type" ADD VALUE IF NOT EXISTS 'subscription_payment_failed';

-- Add subscription grace period tracking columns
ALTER TABLE "building" ADD COLUMN "subscription_current_period_end" timestamp;
ALTER TABLE "building" ADD COLUMN "subscription_past_due_at" timestamp;
