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

-- 2. Create composite index for efficient lifecycle query execution
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id, created_at);

-- 3. Enable RLS on order_status_history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- 4. Secure RLS Policies (Order Participant Scoped)
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
      public.is_admin()
    )
  )
);

DROP POLICY IF EXISTS "Authenticated users insert order_status_history" ON public.order_status_history;

-- 5. Ensure orders table status column accepts lifecycle states
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING_PAYMENT';

-- 6. Create public.design_request_bids table with CHECK constraints
CREATE TABLE IF NOT EXISTS public.design_request_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.design_requests(id) ON DELETE CASCADE,
  designer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  designer_name TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  days INTEGER NOT NULL CHECK (days >= 1),
  note TEXT,
  rating NUMERIC DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist on tables created prior to this schema
ALTER TABLE public.design_request_bids ADD COLUMN IF NOT EXISTS days INTEGER DEFAULT 2;
ALTER TABLE public.design_request_bids ADD COLUMN IF NOT EXISTS designer_name TEXT;
ALTER TABLE public.design_request_bids ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE public.design_request_bids ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0.0;

ALTER TABLE public.design_request_bids ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read design_request_bids" ON public.design_request_bids;
DROP POLICY IF EXISTS "Designers or request owners read bids" ON public.design_request_bids;
CREATE POLICY "Designers or request owners read bids" ON public.design_request_bids 
FOR SELECT USING (
  auth.uid() = designer_id 
  OR auth.uid() IN (SELECT user_id FROM public.design_requests WHERE id = request_id)
  OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

DROP POLICY IF EXISTS "Authenticated users insert design_request_bids" ON public.design_request_bids;
DROP POLICY IF EXISTS "Designers insert design_request_bids" ON public.design_request_bids;
CREATE POLICY "Designers insert design_request_bids" ON public.design_request_bids 
FOR INSERT WITH CHECK (
  auth.uid() = designer_id
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('designer', 'admin'))
);
