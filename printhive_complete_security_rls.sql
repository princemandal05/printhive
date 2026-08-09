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

-- 2. Profiles Table RLS Policies
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Support Complaints Table RLS Policies
DROP POLICY IF EXISTS "Users can read own complaints" ON public.complaints;
CREATE POLICY "Users can read own complaints" ON public.complaints FOR SELECT USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can insert complaints" ON public.complaints;
CREATE POLICY "Users can insert complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users or admins update complaints" ON public.complaints;
CREATE POLICY "Users or admins update complaints" ON public.complaints FOR UPDATE USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Orders Table RLS Policies (Buyer, Designer, Assigned Printer Owner, Admin)
DROP POLICY IF EXISTS "Public orders read access" ON public.orders;
DROP POLICY IF EXISTS "Buyers/Sellers read own orders" ON public.orders;
DROP POLICY IF EXISTS "Authorized participants read own orders" ON public.orders;
CREATE POLICY "Authorized participants read own orders" ON public.orders FOR SELECT USING (
  buyer_id = auth.uid() OR
  designer_id = auth.uid() OR
  printer_owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Buyers insert own orders" ON public.orders;
CREATE POLICY "Buyers insert own orders" ON public.orders FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (buyer_id = auth.uid() OR buyer_id IS NULL)
);

DROP POLICY IF EXISTS "Participants update own orders" ON public.orders;
CREATE POLICY "Participants update own orders" ON public.orders FOR UPDATE USING (
  buyer_id = auth.uid() OR
  printer_owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Transactions Table RLS Policies (Order-Scoped)
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
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);

-- 6. Escrow Payouts Table RLS Policies (Recipient/Order-Scoped)
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
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);

-- 7. Order Status History Table RLS Policies (Order-Scoped)
DROP POLICY IF EXISTS "Public read order_status_history" ON public.order_status_history;
DROP POLICY IF EXISTS "Authenticated users insert order_status_history" ON public.order_status_history;
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

CREATE POLICY "Authenticated users insert order_status_history" ON public.order_status_history FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- 8. Automatic Profile Provisioning Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    'buyer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
