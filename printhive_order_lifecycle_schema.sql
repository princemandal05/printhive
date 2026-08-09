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

-- 3. Secure RLS Policies (Order Participant Scoped)
DROP POLICY IF EXISTS "Public read order_status_history" ON public.order_status_history;
DROP POLICY IF EXISTS "Participants read order_status_history" ON public.order_status_history;
CREATE POLICY "Participants read order_status_history" ON public.order_status_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_status_history.order_id
    AND (
      o.buyer_id = auth.uid() OR
      o.designer_id = auth.uid() OR
      o.printer_owner_id = auth.uid() OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);

DROP POLICY IF EXISTS "Authenticated users insert order_status_history" ON public.order_status_history;
CREATE POLICY "Authenticated users insert order_status_history" ON public.order_status_history FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- 4. Ensure orders table status column accepts lifecycle states
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING_PAYMENT';
