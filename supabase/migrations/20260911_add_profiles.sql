-- Migration: add minimal profiles table with RLS and create trigger to populate from auth.users
-- Idempotent where possible

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reference auth.users if possible (best-effort, may require privileges in Supabase)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public' AND tc.table_name = 'profiles' AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    BEGIN
      ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_auth_users_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;
    EXCEPTION WHEN undefined_table THEN
      -- auth.users may not be available in some environments; skip if so
      RAISE NOTICE 'auth.users table not found; skipping foreign key creation';
    END;
  END IF;
END$$;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can SELECT/UPDATE/INSERT their own profile
CREATE POLICY IF NOT EXISTS "Profiles: select/update their own" ON public.profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger function to ensure a profile row exists when a user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Insert profile if not exists, pull full_name from user_metadata if present
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (NEW.id, (NEW.user_metadata->>'full_name')::text, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to call the handler after insert if auth schema exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname = 'auth') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid WHERE t.tgname = 'auth_user_created_trigger'
    ) THEN
      CREATE TRIGGER auth_user_created_trigger
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
  ELSE
    RAISE NOTICE 'auth schema not found; skipping auth.users trigger creation';
  END IF;
END$$;

-- Update 'updated_at' on changes
CREATE OR REPLACE FUNCTION public.profiles_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_update_timestamp ON public.profiles;
CREATE TRIGGER profiles_update_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profiles_updated_at();
