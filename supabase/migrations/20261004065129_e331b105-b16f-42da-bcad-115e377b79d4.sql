CREATE OR REPLACE FUNCTION public.admin_accept_all_received()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Forbidden: admin access required'; END IF;
  WITH upd AS (
    UPDATE public.orders SET status = 'accepted' WHERE status = 'received' RETURNING id
  ), hist AS (
    INSERT INTO public.order_status_history (order_id, from_status, to_status, note, changed_by)
    SELECT id, 'received', 'accepted', 'Bulk accept', auth.uid() FROM upd RETURNING 1
  )
  SELECT count(*) INTO n FROM hist;
  RETURN n;
END $$;

CREATE OR REPLACE FUNCTION public.admin_sales_daily(_from date, _to date)
RETURNS TABLE(day date, orders bigint, revenue numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Forbidden: admin access required'; END IF;
  RETURN QUERY
  SELECT d::date, count(o.id), coalesce(sum(o.total), 0)
  FROM generate_series(_from, _to, interval '1 day') d
  LEFT JOIN public.orders o
    ON (o.placed_at AT TIME ZONE 'Asia/Kolkata')::date = d::date
   AND o.status NOT IN ('cancelled', 'returned', 'rto')
  GROUP BY d ORDER BY d;
END $$;

REVOKE ALL ON FUNCTION public.admin_accept_all_received() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_sales_daily(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_accept_all_received() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_sales_daily(date, date) TO authenticated;