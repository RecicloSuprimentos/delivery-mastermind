CREATE OR REPLACE FUNCTION public.get_available_users()
RETURNS TABLE (email text)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT au.email::text
  FROM auth.users au
  LEFT JOIN public.system_users su ON au.email = su.email
  WHERE su.email IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Concede permissão para usuários autenticados chamarem esta função
GRANT EXECUTE ON FUNCTION public.get_available_users() TO authenticated;
