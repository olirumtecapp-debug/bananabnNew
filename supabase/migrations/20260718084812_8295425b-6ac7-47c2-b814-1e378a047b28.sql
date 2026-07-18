DROP POLICY IF EXISTS "read any room" ON public.rooms;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.rooms FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.rooms FROM authenticated;
GRANT ALL ON public.rooms TO service_role;