-- ====================================================================
-- PRINTHIVE — PRODUCTION SECURITY & DATA INTEGRITY MIGRATION SCRIPT
-- Run this once in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. Remove fake 4.9 default ratings for new printers and design bids
ALTER TABLE IF EXISTS public.printers 
  ALTER COLUMN rating SET DEFAULT 0.0;

ALTER TABLE IF EXISTS public.design_request_bids 
  ALTER COLUMN rating SET DEFAULT 0.0;

-- 2. Add is_verified column to profiles if not already present
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 3. Add status column to products for admin moderation
ALTER TABLE IF EXISTS public.products 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';

-- 4. Secure design_request_bids RLS policies
ALTER TABLE IF EXISTS public.design_request_bids ENABLE ROW LEVEL SECURITY;

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

-- 5. Helper function for admin verification
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- 6. Prevent client-side profile role privilege escalation
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Privilege Escalation Blocked: Non-admin users cannot alter account role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 7. Ensure real-time publication includes public.notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
