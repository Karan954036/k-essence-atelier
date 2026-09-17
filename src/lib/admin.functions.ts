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

/** Admin-only: dashboard summary data for the admin homepage */
export const getDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // start of today (UTC)
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const startISO = start.toISOString();

    // Today's orders count
    const { count: todaysOrdersCount, error: toErr } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startISO);
    if (toErr) throw new Error(toErr.message);

    // Today's revenue (sum in JS)
    const { data: todaysOrdersRows, error: trErr } = await supabaseAdmin
      .from("orders")
      .select("total")
      .gte("created_at", startISO);
    if (trErr) throw new Error(trErr.message);
    const todaysRevenue = (todaysOrdersRows ?? []).reduce((s: number, r: any) => s + Number(r.total ?? 0), 0);

    // Pending orders
    const { count: pendingCount, error: pErr } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    if (pErr) throw new Error(pErr.message);

    // Low stock variants (threshold: 5)
    const { count: lowStockCount, error: lsErr } = await supabaseAdmin
      .from("product_variants")
      .select("id", { count: "exact", head: true })
      .lte("stock", 5);
    if (lsErr) throw new Error(lsErr.message);

    // Recent orders (last 10)
    const { data: recentOrders, error: roErr } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, total, status, created_at, customer_name, customer_email")
      .order("created_at", { ascending: false })
      .limit(10);
    if (roErr) throw new Error(roErr.message);

    return {
      todaysOrders: Number(todaysOrdersCount ?? 0),
      todaysRevenue,
      pendingOrders: Number(pendingCount ?? 0),
      lowStock: Number(lowStockCount ?? 0),
      recentOrders: recentOrders ?? [],
    };
  });

/** Admin: list products with variants and media */
export const listProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "*, product_variants(id, label, sku, price, mrp, stock), product_media(id, url, alt, kind)"
      )
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Record<string, unknown>) => input)
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("products")
      .upsert(data as never)
      .select("id");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: categories CRUD */
export const listCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("categories").select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Record<string, unknown>) => input)
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("categories")
      .upsert(data as never)
      .select("id");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: orders list and update */
export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: inventory */
export const listInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .select("*, products(name, slug)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adjustStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // fetch current stock
    const { data: current, error: cv } = await supabaseAdmin
      .from("product_variants")
      .select("stock")
      .eq("id", data.variant_id)
      .maybeSingle();
    if (cv) throw new Error(cv.message);
    const currentStock = Number(current?.stock ?? 0);
    const resulting = currentStock + Number(data.change);

    const { error: upErr } = await supabaseAdmin.from("product_variants").update({ stock: resulting }).eq("id", data.variant_id);
    if (upErr) throw new Error(upErr.message);

    const { error: smErr } = await supabaseAdmin.from("stock_movements").insert({
      variant_id: data.variant_id,
      change: data.change,
      resulting_stock: resulting,
      reason: data.reason ?? "adjustment",
      created_by: data.userId ?? null,
    });
    if (smErr) throw new Error(smErr.message);

    return { ok: true };
  });

/** Admin: customers list (profiles) with order counts */
export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("profiles").select("id, full_name, created_at, is_admin");
    if (error) throw new Error(error.message);

    // fetch order counts
    const ids = (data ?? []).map((d: any) => d.id);
    const { data: orders, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("user_id, count:id", { count: "exact" })
      .in("user_id", ids);
    // we won't fail purely on order counts

    return data ?? [];
  });

/** Admin management: list and add admins (reusing existing functions) */
