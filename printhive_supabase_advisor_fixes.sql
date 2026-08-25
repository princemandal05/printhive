-- ==============================================================================
-- PrintHive Supabase Advisor Security Remediation Migration
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/ncbmjhqmlxapismaeqdk/sql
-- ==============================================================================

-- ==============================================================================
-- 1. FIX: Permissive RLS Policies on public.complaints
-- ==============================================================================
DROP POLICY IF EXISTS "Allow public insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Anyone can submit complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow public update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users or admins update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can read own complaints" ON public.complaints;

-- Allow authenticated users to submit complaints matching their auth email
CREATE POLICY "Users can insert complaints" ON public.complaints
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR user_id = auth.uid())
);

-- Allow reading complaints (only ticket creator or admin)
CREATE POLICY "Users can read own complaints" ON public.complaints
FOR SELECT USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  user_id = auth.uid() OR
  public.is_admin()
);

-- Allow updating complaints (only ticket creator or admin)
CREATE POLICY "Users or admins update complaints" ON public.complaints
FOR UPDATE USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  user_id = auth.uid() OR
  public.is_admin()
) WITH CHECK (
  email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  user_id = auth.uid() OR
  public.is_admin()
);

-- ==============================================================================
-- 2. FIX: Permissive RLS Policy on public.profiles (INSERT self only)
-- ==============================================================================
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "profiles_insert_self" ON public.profiles
FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- ==============================================================================
-- 3. FIX: Revoke Public & Anonymous Execution on SECURITY DEFINER Trigger Functions
-- ==============================================================================
-- Trigger functions must NOT be callable via PostgREST RPC (/rest/v1/rpc/...)

-- Revoke all direct execution on handle_new_user
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Revoke all direct execution on prevent_order_financial_tampering
REVOKE EXECUTE ON FUNCTION public.prevent_order_financial_tampering() FROM PUBLIC, anon, authenticated;

-- Revoke all direct execution on prevent_profile_role_escalation
REVOKE EXECUTE ON FUNCTION public.prevent_profile_role_escalation() FROM PUBLIC, anon, authenticated;

-- Restrict is_admin() to authenticated users only (revoke from anon/public)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
