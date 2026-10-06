ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS occasions text[],
  ADD COLUMN IF NOT EXISTS concentration text,
  ADD COLUMN IF NOT EXISTS weight_grams integer,
  ADD COLUMN IF NOT EXISTS length_cm numeric,
  ADD COLUMN IF NOT EXISTS width_cm numeric,
  ADD COLUMN IF NOT EXISTS height_cm numeric;
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_key ON public.products (lower(sku)) WHERE sku IS NOT NULL;

ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending';

CREATE OR REPLACE FUNCTION public.admin_accept_all_received(_admin uuid)
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE n integer;
BEGIN
  IF NOT public.is_admin(_admin) THEN RAISE EXCEPTION 'Forbidden: admin access required'; END IF;
  WITH upd AS (
    UPDATE public.orders o SET status = 'accepted'
    FROM (SELECT id, status AS old_status FROM public.orders WHERE status IN ('pending','received') FOR UPDATE) prev
    WHERE o.id = prev.id
    RETURNING o.id, prev.old_status
  ), hist AS (
    INSERT INTO public.order_status_history (order_id, from_status, to_status, note, changed_by)
    SELECT id, old_status, 'accepted', 'Bulk accept', _admin FROM upd RETURNING 1
  )
  SELECT count(*) INTO n FROM hist;
  RETURN n;
END $function$;

CREATE OR REPLACE FUNCTION public.admin_sales_daily(_from date, _to date)
 RETURNS TABLE(day date, orders bigint, revenue numeric) LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  SELECT d::date, count(o.id), coalesce(sum(o.total), 0)
  FROM generate_series(_from, _to, interval '1 day') d
  LEFT JOIN public.orders o
    ON (o.placed_at AT TIME ZONE 'Asia/Kolkata')::date = d::date
   AND o.status NOT IN ('cancelled', 'returned', 'rto', 'return')
  GROUP BY d ORDER BY d;
$function$;
REVOKE EXECUTE ON FUNCTION public.admin_accept_all_received(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_sales_daily(date, date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_accept_all_received(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_sales_daily(date, date) TO service_role;