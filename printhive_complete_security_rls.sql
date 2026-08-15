-- =========================================================
-- PrintHive Production Row-Level Security (RLS) & Hardening
-- =========================================================

-- 1. Enable RLS on all financial and core tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.escrow_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.printers ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 2. Profiles Table RLS, Public View & Privilege Protection
-- =========================================================

-- Helper Function to check Admin Role without RLS Recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Secure View for Public Profile Information (Excludes private email address)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, full_name, avatar_url, role, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Restrict direct SELECT on profiles: Users read their own full row, or Admin reads all
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile or admin" ON public.profiles;
CREATE POLICY "Users read own profile or admin" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Database Trigger to Block Role Privilege Escalation via Client API
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If account role is being modified, require caller to be an existing admin
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Privilege Escalation Blocked: Non-admin users cannot alter account role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS tr_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER tr_prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- =========================================================
-- 3. Support Complaints Table RLS Policies
-- =========================================================
DROP POLICY IF EXISTS "Users can read own complaints" ON public.complaints;
CREATE POLICY "Users can read own complaints" ON public.complaints FOR SELECT USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  public.is_admin()
);

DROP POLICY IF EXISTS "Users can insert complaints" ON public.complaints;
CREATE POLICY "Users can insert complaints" ON public.complaints
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Users or admins update complaints" ON public.complaints;
CREATE POLICY "Users or admins update complaints" ON public.complaints FOR UPDATE USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  public.is_admin()
) WITH CHECK (
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  public.is_admin()
);

-- =========================================================
-- 4. Orders Table RLS Policies & Financial/Status Tampering Protection
-- =========================================================
DROP POLICY IF EXISTS "Public orders read access" ON public.orders;
DROP POLICY IF EXISTS "Buyers/Sellers read own orders" ON public.orders;
DROP POLICY IF EXISTS "Authorized participants read own orders" ON public.orders;
CREATE POLICY "Authorized participants read own orders" ON public.orders FOR SELECT USING (
  buyer_id = auth.uid() OR
  designer_id = auth.uid() OR
  printer_owner_id = auth.uid() OR
  public.is_admin()
);

DROP POLICY IF EXISTS "Buyers insert own orders" ON public.orders;
CREATE POLICY "Buyers insert own orders" ON public.orders FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (buyer_id = auth.uid() OR buyer_id IS NULL)
);

DROP POLICY IF EXISTS "Participants update own orders" ON public.orders;
CREATE POLICY "Participants update own orders" ON public.orders FOR UPDATE USING (
  buyer_id = auth.uid() OR
  printer_owner_id = auth.uid() OR
  public.is_admin()
) WITH CHECK (
  buyer_id = auth.uid() OR
  printer_owner_id = auth.uid() OR
  public.is_admin()
);

-- Combined INSERT & UPDATE Trigger to Block Financial, Status & Ownership Tampering on Orders
CREATE OR REPLACE FUNCTION public.prevent_order_financial_tampering()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Trust Admin users OR trusted server-side API execution (service_role)
  IF (auth.role() = 'service_role') OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- 2. Protection on INSERT (Initial Client Order Creation)
  IF TG_OP = 'INSERT' THEN
    -- Force buyer_id to match authenticated caller
    NEW.buyer_id := auth.uid();

    -- Force initial status to PENDING_PAYMENT or pending (cannot self-assign paid or completed state)
    NEW.status := 'PENDING_PAYMENT';
    NEW.payment_status := 'pending';

    -- Reset payment verification IDs on client creation (must be assigned server-side)
    NEW.razorpay_order_id := NULL;
    NEW.razorpay_payment_id := NULL;

    -- Reset financial total fields on client creation (must be calculated & established server-side)
    NEW.total_amount := 0;
    NEW.total_price := 0;
    NEW.total := 0;
    NEW.price := 0;
    NEW.amount := 0;

    -- Reset calculated payout shares to 0 (must be calculated server-side upon payment creation/verification)
    NEW.printer_payout := 0;
    NEW.printer_share := 0;
    NEW.designer_royalty := 0;
    NEW.designer_share := 0;
    NEW.platform_fee := 0;
    NEW.platform_share := 0;

    RETURN NEW;
  END IF;

  -- 3. Protection on UPDATE (Existing Order Modification)
  IF TG_OP = 'UPDATE' THEN
    -- Non-admin clients CANNOT alter financial totals, status, payment IDs, or ownership assignments
    IF NEW.total_amount IS DISTINCT FROM OLD.total_amount OR
       NEW.total_price IS DISTINCT FROM OLD.total_price OR
       NEW.total IS DISTINCT FROM OLD.total OR
       NEW.price IS DISTINCT FROM OLD.price OR
       NEW.amount IS DISTINCT FROM OLD.amount OR
       NEW.status IS DISTINCT FROM OLD.status OR
       NEW.payment_status IS DISTINCT FROM OLD.payment_status OR
       NEW.buyer_id IS DISTINCT FROM OLD.buyer_id OR
       NEW.designer_id IS DISTINCT FROM OLD.designer_id OR
       NEW.printer_owner_id IS DISTINCT FROM OLD.printer_owner_id OR
       NEW.seller_id IS DISTINCT FROM OLD.seller_id OR
       NEW.razorpay_order_id IS DISTINCT FROM OLD.razorpay_order_id OR
       NEW.razorpay_payment_id IS DISTINCT FROM OLD.razorpay_payment_id OR
       NEW.printer_payout IS DISTINCT FROM OLD.printer_payout OR
       NEW.printer_share IS DISTINCT FROM OLD.printer_share OR
       NEW.designer_royalty IS DISTINCT FROM OLD.designer_royalty OR
       NEW.designer_share IS DISTINCT FROM OLD.designer_share OR
       NEW.platform_fee IS DISTINCT FROM OLD.platform_fee OR
       NEW.platform_share IS DISTINCT FROM OLD.platform_share THEN
      RAISE EXCEPTION 'Unauthorized: Non-admin users cannot alter financial, assignment, payment, or status fields directly.';
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS tr_prevent_order_financial_tampering ON public.orders;
CREATE TRIGGER tr_prevent_order_financial_tampering
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_order_financial_tampering();

-- =========================================================
-- 5. Transactions Table RLS Policies (Read-Only for Participants/Admin)
-- =========================================================
DROP POLICY IF EXISTS "Public read transactions" ON public.transactions;
DROP POLICY IF EXISTS "Owner/Admin read transactions" ON public.transactions;
CREATE POLICY "Owner/Admin read transactions" ON public.transactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = transactions.order_id
    AND (
      o.buyer_id = auth.uid() OR
      o.designer_id = auth.uid() OR
      o.printer_owner_id = auth.uid() OR
      public.is_admin()
    )
  )
);
-- Explicitly NO INSERT/UPDATE/DELETE policies for clients. Writes restricted to server endpoints.

-- =========================================================
-- 6. Escrow Payouts Table RLS Policies (Read-Only for Recipient/Owner/Admin)
-- =========================================================
DROP POLICY IF EXISTS "Public read escrow_payouts" ON public.escrow_payouts;
DROP POLICY IF EXISTS "Recipient/Owner/Admin read escrow_payouts" ON public.escrow_payouts;
CREATE POLICY "Recipient/Owner/Admin read escrow_payouts" ON public.escrow_payouts FOR SELECT USING (
  recipient_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = escrow_payouts.order_id
    AND (
      o.buyer_id = auth.uid() OR
      o.designer_id = auth.uid() OR
      o.printer_owner_id = auth.uid() OR
      public.is_admin()
    )
  )
);
-- Explicitly NO INSERT/UPDATE/DELETE policies for clients. Writes restricted to server endpoints.

-- =========================================================
-- 7. Order Status History Table RLS Policies (Read-Only for Participants; Admin Insert)
-- =========================================================
DROP POLICY IF EXISTS "Public read order_status_history" ON public.order_status_history;
DROP POLICY IF EXISTS "Authenticated users insert order_status_history" ON public.order_status_history;
DROP POLICY IF EXISTS "Participants read order_status_history" ON public.order_status_history;
DROP POLICY IF EXISTS "Participants insert order_status_history" ON public.order_status_history;
DROP POLICY IF EXISTS "Admins insert order_status_history" ON public.order_status_history;

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

-- Allow Admins and Order Participants (buyers, designers, printer owners) to insert into order_status_history
CREATE POLICY "Participants insert order_status_history" ON public.order_status_history FOR INSERT WITH CHECK (
  public.is_admin() OR
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_status_history.order_id
    AND (
      o.buyer_id = auth.uid() OR
      o.designer_id = auth.uid() OR
      o.printer_owner_id = auth.uid()
    )
  )
);

-- =========================================================
-- 8. Hardened SECURITY DEFINER handle_new_user() Function
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Safely assign requested role from metadata, preventing self-assignment of 'admin'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'buyer');
  IF user_role NOT IN ('buyer', 'seller', 'designer', 'printer_owner') THEN
    user_role := 'buyer';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
