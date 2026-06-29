-- ============================================================================
-- Migration: Create payments_history table for tracking all purchases
-- This provides full audit trail, idempotency protection, and payment history
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe / Payment details
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  
  -- Purchase details
  plan_name TEXT NOT NULL,
  learning_language TEXT NOT NULL DEFAULT 'english',
  lessons_purchased INTEGER NOT NULL DEFAULT 0,
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'refunded', 'failed', 'cancelled')),
  
  -- User-friendly receipt
  receipt_number TEXT UNIQUE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  -- Index for fast lookups
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments_history(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments_history(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON payments_history(receipt_number);

-- Enable Row Level Security
ALTER TABLE payments_history ENABLE ROW LEVEL SECURITY;

-- RLS: Students can only see their own payments
CREATE POLICY "Students can view own payments"
  ON payments_history
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- RLS: Only service role can insert/update
CREATE POLICY "Service role can manage payments"
  ON payments_history
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  seq_part TEXT;
  receipt TEXT;
  attempts INTEGER := 0;
BEGIN
  date_part := to_char(NEW.created_at, 'YYYYMMDD');
  
  LOOP
    attempts := attempts + 1;
    seq_part := lpad(floor(random() * 999999)::text, 6, '0');
    receipt := 'NF-' || date_part || '-' || seq_part;
    
    -- Check uniqueness
    IF NOT EXISTS (SELECT 1 FROM payments_history WHERE receipt_number = receipt) THEN
      NEW.receipt_number := receipt;
      EXIT;
    END IF;
    
    -- Safety valve
    IF attempts > 10 THEN
      NEW.receipt_number := 'NF-' || date_part || '-' || gen_random_uuid()::text;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate receipt number on insert
CREATE TRIGGER trg_generate_receipt_number
  BEFORE INSERT ON payments_history
  FOR EACH ROW
  EXECUTE FUNCTION generate_receipt_number();