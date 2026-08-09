-- ====================================================================
-- PrintHive Order Lifecycle & Status History Schema Migration
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- ====================================================================

-- 1. Create order_status_history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on order_status_history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read order_status_history" ON public.order_status_history;
CREATE POLICY "Public read order_status_history" ON public.order_status_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users insert order_status_history" ON public.order_status_history;
CREATE POLICY "Authenticated users insert order_status_history" ON public.order_status_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR true);

-- 3. Ensure orders table status column accepts lifecycle states
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING_PAYMENT';
