REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_trainer_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.next_grievance_id() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_trainer_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.next_grievance_id() TO service_role;