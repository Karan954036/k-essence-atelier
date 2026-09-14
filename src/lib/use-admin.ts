import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

/** Returns whether the signed-in user is an admin (read through RLS on profiles). */
export function useAdmin() {
  const { user, isLoading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["admin-flag", user?.id ?? null],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin, full_name")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return {
    user,
    isAdmin: Boolean(query.data?.is_admin),
    fullName: query.data?.full_name ?? null,
    isLoading: authLoading || (Boolean(user?.id) && query.isLoading),
  };
}
