-- ====================================================================
-- PrintHive Payment, Transactions & Escrow Payouts Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- ====================================================================

-- 1. Create public.transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL, -- 'captured', 'failed', 'refunded'
  printer_payout NUMERIC DEFAULT 0, -- 70%
  designer_royalty NUMERIC DEFAULT 0, -- 15%
  platform_fee NUMERIC DEFAULT 0, -- 15%
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create public.escrow_payouts table
CREATE TABLE IF NOT EXISTS public.escrow_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL, -- 'printer_owner', 'designer'
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'held', -- 'held', 'released', 'refunded'
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read transactions" ON public.transactions;
CREATE POLICY "Public read transactions" ON public.transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read escrow_payouts" ON public.escrow_payouts;
CREATE POLICY "Public read escrow_payouts" ON public.escrow_payouts FOR SELECT USING (true);
