import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type SetupInput = { email: string; password: string; fullName?: string | undefined };

function validateCredentials(input: SetupInput): SetupInput {
  const email = String(input?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(input?.password ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  return { email, password, fullName: input?.fullName?.trim() || undefined };
}

async function countAdmins() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_admin", true);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Public: tells the setup page whether the one-time bootstrap is still available. */
export const getAdminSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { needsSetup: (await countAdmins()) === 0 };
});

/** Public but permanently self-closing: only works while zero admins exist. */
export const createFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator(validateCredentials)
  .handler(async ({ data }) => {
    if ((await countAdmins()) > 0) {
      throw new Error("Admin setup is already complete.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: data.fullName ? { full_name: data.fullName } : {},
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the admin account");

    // Race guard: if another admin appeared in the meantime, undo and refuse.
    if ((await countAdmins()) > 0) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error("Admin setup is already complete.");
    }

    const { error: promoteError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: created.user.id, full_name: data.fullName ?? null, is_admin: true });
    if (promoteError) throw new Error(promoteError.message);

    return { ok: true };
  });

async function assertCallerIsAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", context.userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.is_admin) throw new Error("Forbidden: admin access required");
}

/** Admin-only: create a new admin account, or promote an existing account. */
export const addAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateCredentials)
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: data.fullName ? { full_name: data.fullName } : {},
    });

    let userId = created?.user?.id;

    if (error) {
      const message = error.message.toLowerCase();
      if (!message.includes("already")) throw new Error(error.message);
      // Existing account: promote it instead of creating a duplicate.
      const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (listError) throw new Error(listError.message);
      userId = list.users.find((u) => u.email?.toLowerCase() === data.email)?.id;
      if (!userId) throw new Error("That email already exists but could not be found.");
    }

    if (!userId) throw new Error("Could not create the admin account");

    const { error: promoteError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, is_admin: true });
    if (promoteError) throw new Error(promoteError.message);

    return { ok: true, promotedExisting: Boolean(error) };
  });

/** Admin-only: list admin accounts with their email addresses. */
export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: admins, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("is_admin", true)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const emails = new Map((list?.users ?? []).map((u) => [u.id, u.email ?? ""]));

    return (admins ?? []).map((a) => ({
      id: a.id,
      fullName: a.full_name,
      createdAt: a.created_at,
      email: emails.get(a.id) ?? "",
    }));
  });
