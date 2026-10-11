CREATE TABLE public.expenses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 expense_date date NOT NULL DEFAULT CURRENT_DATE,
 category text NOT NULL DEFAULT 'Other' CHECK (category IN ('Manufacturing','Raw Materials','Packaging','Utilities','Salaries','Shipping','Marketing','Rent','Other')),
 amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount > 0),
 payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash','upi','card','bank_transfer','other')),
 vendor text NOT NULL DEFAULT '',
 description text NOT NULL DEFAULT '',
 receipt_path text,
 created_by uuid NOT NULL DEFAULT auth.uid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage expenses" ON public.expenses FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE INDEX expenses_date_idx ON public.expenses(expense_date);
CREATE TRIGGER expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();