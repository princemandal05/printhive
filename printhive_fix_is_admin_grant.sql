-- ==============================================================================
-- PrintHive: Fix "permission denied for function is_admin"
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Ensure the is_admin function exists with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. Grant EXECUTE permissions to all Supabase roles so RLS policies can evaluate is_admin()
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
