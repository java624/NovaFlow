-- ============================================================================
-- Migration: Add WayForPay columns to payments_history table
-- ============================================================================

ALTER TABLE payments_history 
ADD COLUMN IF NOT EXISTS order_reference TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS wayforpay_transaction_id TEXT;

-- Migrate existing stripe_session_id values into order_reference if null
UPDATE payments_history 
SET order_reference = stripe_session_id 
WHERE order_reference IS NULL AND stripe_session_id IS NOT NULL;

-- Index for order_reference lookups
CREATE INDEX IF NOT EXISTS idx_payments_order_reference ON payments_history(order_reference);
