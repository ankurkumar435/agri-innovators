
-- Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated/public
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Hide tables from GraphQL schema (app uses PostgREST only)
COMMENT ON TABLE public.profiles IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.farmer_activities IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.farmer_fields IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.user_locations IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.yields IS e'@graphql({"visible": false})';
