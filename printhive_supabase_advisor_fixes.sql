-- ==============================================================================
-- 1. FIX: Revoke EXECUTE on is_admin() so PostgREST RPC is disabled
-- ==============================================================================
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
