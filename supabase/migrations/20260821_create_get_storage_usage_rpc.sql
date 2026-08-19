-- RPC Function to calculate storage usage across Supabase Storage objects
CREATE OR REPLACE FUNCTION public.get_storage_usage()
RETURNS TABLE (
  total_bytes BIGINT,
  file_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM((metadata->>'size')::bigint), 0)::BIGINT AS total_bytes,
    COUNT(*)::BIGINT AS file_count
  FROM storage.objects;
END;
$$;

-- Grant execution permissions to authenticated users and anon
GRANT EXECUTE ON FUNCTION public.get_storage_usage() TO authenticated, anon;
