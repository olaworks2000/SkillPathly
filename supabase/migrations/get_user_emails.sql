-- Run once in Supabase Dashboard → SQL Editor to enable user email lookup in InsightsPage

CREATE OR REPLACE FUNCTION get_user_emails()
RETURNS TABLE (id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1000;
$$;

REVOKE ALL ON FUNCTION get_user_emails() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_emails() TO authenticated;
