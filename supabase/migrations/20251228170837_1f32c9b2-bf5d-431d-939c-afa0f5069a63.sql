-- Lock down bootstrap_admin so random authenticated users cannot self-promote to admin
-- This prevents privilege escalation when there are temporarily no admins.
REVOKE EXECUTE ON FUNCTION public.bootstrap_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bootstrap_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.bootstrap_admin() FROM authenticated;

-- (Optional hardening) Also revoke has_role from anon; keep it callable only by authenticated users.
-- Note: your client calls it with a user JWT, so authenticated is sufficient.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;