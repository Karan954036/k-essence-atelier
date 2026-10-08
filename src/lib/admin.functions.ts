import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isOrderStatus, normalizeStatus } from "@/lib/order-status";

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
      .in("status", ["pending", "received"]);
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
    const { count } = await supabaseAdmin
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", data.id);
    if ((count ?? 0) > 0) throw new Error("This product has orders, so it can't be deleted. Deactivate it instead.");
    await supabaseAdmin.from("product_notes").delete().eq("product_id", data.id);
    await supabaseAdmin.from("product_media").delete().eq("product_id", data.id);
    await supabaseAdmin.from("product_variants").delete().eq("product_id", data.id);
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: publish or hide a product on the storefront. */
export const setProductActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; active: boolean }) => ({ id: String(input?.id ?? ""), active: Boolean(input?.active) }))
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("products").update({ is_active: data.active }).eq("id", data.id);
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
      .select("*, order_items(*), payments(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Admin: one order with items, payment, invoice and status history */
export const getOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input?.id ?? "") }))
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*), payments(*), invoices(*, invoice_items(*))")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");

    const { data: history, error: hErr } = await supabaseAdmin
      .from("order_status_history")
      .select("*")
      .eq("order_id", data.id)
      .order("created_at", { ascending: true });
    if (hErr) throw new Error(hErr.message);

    return { order, history: history ?? [] };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string; note?: string }) => {
    const status = String(input?.status ?? "");
    if (!isOrderStatus(status)) throw new Error("Unknown order status");
    return { id: String(input?.id ?? ""), status, note: input?.note?.trim() || null };
  })
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing, error: exErr } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("id", data.id)
      .maybeSingle();
    if (exErr) throw new Error(exErr.message);
    if (!existing) throw new Error("Order not found");
    if (normalizeStatus(existing.status) === data.status) return { ok: true, unchanged: true };

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    const { error: hErr } = await supabaseAdmin.from("order_status_history").insert({
      order_id: data.id,
      from_status: existing.status,
      to_status: data.status,
      note: data.note,
      changed_by: context.userId,
    });
    if (hErr) throw new Error(hErr.message);

    // Delivered COD orders are settled on delivery.
    if (data.status === "delivered") {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", data.id)
        .eq("payment_method", "cod");
      await supabaseAdmin
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("order_id", data.id)
        .in("status", ["pending", "received"]);
    }

    return { ok: true };
  });

/** Admin: record that a COD payment has been collected */
export const markPaymentReceived = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; reference?: string }) => ({
    id: String(input?.id ?? ""),
    reference: input?.reference?.trim() || null,
  }))
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    const { error: pErr } = await supabaseAdmin
      .from("payments")
      .update({ status: "paid", paid_at: now, reference: data.reference })
      .eq("order_id", data.id);
    if (pErr) throw new Error(pErr.message);

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
  .inputValidator((input: { variant_id: string; change: number; reason?: string }) => ({
    variant_id: String(input?.variant_id ?? ""),
    change: Number(input?.change ?? 0),
    reason: input?.reason?.trim() || "adjustment",
  }))
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
    const resulting = Math.max(0, currentStock + data.change);

    const { error: upErr } = await supabaseAdmin
      .from("product_variants")
      .update({ stock: resulting })
      .eq("id", data.variant_id);
    if (upErr) throw new Error(upErr.message);

    const { error: smErr } = await supabaseAdmin.from("stock_movements").insert({
      variant_id: data.variant_id,
      change: data.change,
      resulting_stock: resulting,
      reason: data.reason,
      created_by: context.userId,
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

/** Admin: accept every order still in "received" in one database operation. */
export const acceptAllReceivedOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await (supabaseAdmin as any).rpc("admin_accept_all_received", {
      _admin: context.userId,
    });
    if (error) throw new Error(error.message);
    return { accepted: Number(data ?? 0) };
  });

const ANALYTICS_RANGES = { today: 1, "7d": 7, "30d": 30, "3m": 91, "6m": 182 } as const;
export type AnalyticsRange = keyof typeof ANALYTICS_RANGES;

/** Admin: daily orders/revenue aggregated in the database (IST days; excludes cancelled/returned/RTO). */
export const getSalesAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { range: string }) => {
    const range = String(input?.range ?? "30d");
    if (!(range in ANALYTICS_RANGES)) throw new Error("Unknown range");
    return { range: range as AnalyticsRange };
  })
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const istToday = new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
    const days = ANALYTICS_RANGES[data.range];
    const from = new Date(`${istToday}T00:00:00Z`);
    from.setUTCDate(from.getUTCDate() - (days - 1));
    const { data: rows, error } = await (supabaseAdmin as any).rpc("admin_sales_daily", {
      _from: from.toISOString().slice(0, 10),
      _to: istToday,
    });
    if (error) throw new Error(error.message);
    const daily = ((rows ?? []) as any[]).map((r) => ({
      day: String(r.day),
      orders: Number(r.orders ?? 0),
      revenue: Number(r.revenue ?? 0),
    }));
    const totalOrders = daily.reduce((s, r) => s + r.orders, 0);
    const totalRevenue = daily.reduce((s, r) => s + r.revenue, 0);
    const today = daily.find((r) => r.day === istToday) ?? { orders: 0, revenue: 0 };
    return {
      daily,
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
      todaysOrders: today.orders,
      todaysRevenue: today.revenue,
    };
  });

/* ---------------- Product listing (single + bulk) ---------------- */

export const PRODUCT_KINDS = ["perfume", "attar", "gift-set", "other"] as const;
export type ProductStatus = "draft" | "active" | "out_of_stock";

export type ProductVariantInput = {
  id?: string | undefined;
  label: string;
  sku?: string | null | undefined;
  price: number;
  mrp: number;
  stock: number;
};

export type ProductInput = {
  id?: string | undefined;
  name: string;
  slug: string;
  sku?: string | null | undefined;
  kind: string;
  category_id?: string | null | undefined;
  collection_id?: string | null | undefined;
  brand?: string | null | undefined;
  short_description?: string | null | undefined;
  description?: string | null | undefined;
  family?: string | null | undefined;
  gender?: string | null | undefined;
  occasions?: string[] | undefined;
  concentration?: string | null | undefined;
  weight_grams?: number | null | undefined;
  length_cm?: number | null | undefined;
  width_cm?: number | null | undefined;
  height_cm?: number | null | undefined;
  status: ProductStatus;
  notes: { top: string[]; heart: string[]; base: string[] };
  variants: ProductVariantInput[];
  media?: { url: string; alt?: string | null | undefined }[] | undefined;
};

export function slugify(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const optText = (v: unknown) => {
  const s = String(v ?? "").trim();
  return s ? s : null;
};
const optNum = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function validateProductInput(input: any): ProductInput {
  const name = String(input?.name ?? "").trim();
  if (!name) throw new Error("Product name is required");
  const slug = slugify(String(input?.slug || name));
  if (!slug) throw new Error("Slug is required");
  const kind = String(input?.kind ?? "perfume");
  if (!(PRODUCT_KINDS as readonly string[]).includes(kind)) throw new Error("Invalid product type");
  const status = String(input?.status ?? "draft") as ProductStatus;
  if (!["draft", "active", "out_of_stock"].includes(status)) throw new Error("Invalid status");
  const variants: ProductVariantInput[] = (Array.isArray(input?.variants) ? input.variants : []).map(
    (v: any, i: number) => {
      const label = String(v?.label ?? "").trim();
      const price = Number(v?.price);
      const mrp = Number(v?.mrp || v?.price);
      const stock = Math.floor(Number(v?.stock ?? 0));
      if (!label) throw new Error(`Variant ${i + 1}: size/volume is required`);
      if (!Number.isFinite(price) || price <= 0) throw new Error(`Variant ${label}: selling price must be above 0`);
      if (!Number.isFinite(mrp) || mrp < price) throw new Error(`Variant ${label}: MRP must be at least the selling price`);
      if (!Number.isFinite(stock) || stock < 0) throw new Error(`Variant ${label}: stock cannot be negative`);
      return { id: v?.id || undefined, label, sku: optText(v?.sku), price, mrp, stock };
    },
  );
  if (variants.length === 0) throw new Error("Add at least one size/variant");
  const list = (x: unknown) =>
    (Array.isArray(x) ? x : String(x ?? "").split(/[|,]/)).map((s) => String(s).trim()).filter(Boolean);
  return {
    id: input?.id || undefined,
    name,
    slug,
    sku: optText(input?.sku),
    kind,
    category_id: optText(input?.category_id),
    collection_id: optText(input?.collection_id),
    brand: optText(input?.brand),
    short_description: optText(input?.short_description),
    description: optText(input?.description),
    family: optText(input?.family),
    gender: optText(input?.gender),
    occasions: list(input?.occasions),
    concentration: optText(input?.concentration),
    weight_grams: optNum(input?.weight_grams),
    length_cm: optNum(input?.length_cm),
    width_cm: optNum(input?.width_cm),
    height_cm: optNum(input?.height_cm),
    status,
    notes: { top: list(input?.notes?.top), heart: list(input?.notes?.heart), base: list(input?.notes?.base) },
    variants,
    media: Array.isArray(input?.media)
      ? input.media.map((m: any) => ({ url: String(m?.url ?? ""), alt: optText(m?.alt) })).filter((m: any) => m.url)
      : undefined,
  };
}

async function writeProduct(supabaseAdmin: any, p: ProductInput) {
  const first = p.variants[0]!;
  const row = {
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    kind: p.kind,
    category_id: p.category_id,
    collection_id: p.collection_id,
    brand: p.brand,
    short_description: p.short_description,
    description: p.description,
    family: p.family,
    gender: p.gender,
    occasions: p.occasions && p.occasions.length ? p.occasions : null,
    concentration: p.concentration,
    weight_grams: p.weight_grams,
    length_cm: p.length_cm,
    width_cm: p.width_cm,
    height_cm: p.height_cm,
    is_active: p.status !== "draft",
    in_stock: p.status === "active" && p.variants.some((v) => v.stock > 0),
    price: first.price,
    mrp: first.mrp,
  };

  let productId = p.id;
  if (productId) {
    const { error } = await supabaseAdmin.from("products").update(row).eq("id", productId);
    if (error) throw new Error(friendlyDbError(error.message));
  } else {
    const { data, error } = await supabaseAdmin.from("products").insert(row).select("id").single();
    if (error) throw new Error(friendlyDbError(error.message));
    productId = data.id as string;
  }

  // Variants: update existing, insert new, remove those dropped from the form.
  const { data: existing } = await supabaseAdmin.from("product_variants").select("id").eq("product_id", productId);
  const keep = new Set(p.variants.map((v) => v.id).filter(Boolean));
  for (const old of existing ?? []) {
    if (!keep.has(old.id)) {
      const { error } = await supabaseAdmin.from("product_variants").delete().eq("id", old.id);
      if (error) throw new Error("A removed size has existing orders and cannot be deleted — set its stock to 0 instead.");
    }
  }
  for (const [i, v] of p.variants.entries()) {
    const vrow = { product_id: productId, label: v.label, sku: v.sku, price: v.price, mrp: v.mrp, stock: v.stock, sort_order: i };
    const { error } = v.id
      ? await supabaseAdmin.from("product_variants").update(vrow).eq("id", v.id).eq("product_id", productId)
      : await supabaseAdmin.from("product_variants").insert(vrow);
    if (error) throw new Error(error.message);
  }

  await supabaseAdmin.from("product_notes").delete().eq("product_id", productId);
  const noteRows = (["top", "heart", "base"] as const).flatMap((layer) =>
    p.notes[layer].map((name, i) => ({ product_id: productId, layer, name, sort_order: i })),
  );
  if (noteRows.length) {
    const { error } = await supabaseAdmin.from("product_notes").insert(noteRows);
    if (error) throw new Error(error.message);
  }

  if (p.media) {
    await supabaseAdmin.from("product_media").delete().eq("product_id", productId);
    if (p.media.length) {
      const { error } = await supabaseAdmin.from("product_media").insert(
        p.media.map((m, i) => ({ product_id: productId, url: m.url, alt: m.alt ?? p.name, kind: "image", sort_order: i })),
      );
      if (error) throw new Error(error.message);
    }
  }
  return productId!;
}

function friendlyDbError(msg: string) {
  if (msg.includes("products_slug_key")) return "Another product already uses this slug";
  if (msg.includes("products_sku_key")) return "Another product already uses this SKU";
  return msg;
}

/** Admin: one product with variants, notes and media for the edit form. */
export const getProductForEdit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input?.id ?? "") }))
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*), product_notes(*), product_media(*)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!product) throw new Error("Product not found");
    return product;
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateProductInput)
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const id = await writeProduct(supabaseAdmin, data);
    return { ok: true, id };
  });

export const listCollectionsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("collections").select("id, slug, title").order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Admin: bulk create products. Rows whose SKU or slug already exists are skipped, never duplicated. */
export const bulkImportProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { products: unknown[] }) => {
    const list = Array.isArray(input?.products) ? input.products : [];
    if (list.length === 0) throw new Error("Nothing to import");
    if (list.length > 200) throw new Error("Import at most 200 products at a time");
    return { products: list };
  })
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const results: { sku: string; name: string; status: "created" | "skipped" | "error"; message?: string; id?: string }[] = [];
    for (const raw of data.products) {
      const label = { sku: String((raw as any)?.sku ?? ""), name: String((raw as any)?.name ?? "") };
      try {
        const p = validateProductInput({ ...(raw as any), id: undefined });
        if (!p.sku) throw new Error("SKU is required for bulk import");
        const { data: dup } = await supabaseAdmin
          .from("products")
          .select("id, sku, slug")
          .or(`sku.ilike.${p.sku.replace(/[,()]/g, "")},slug.eq.${p.slug}`)
          .limit(1);
        if (dup && dup.length) {
          results.push({ ...label, status: "skipped", message: "SKU or slug already exists" });
          continue;
        }
        const id = await writeProduct(supabaseAdmin, p);
        results.push({ ...label, status: "created", id });
      } catch (e) {
        results.push({ ...label, status: "error", message: (e as Error).message });
      }
    }
    return { results };
  });

/** Admin: attach already-uploaded storage images to a product (appended after existing ones). */
export const addProductMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productId: string; urls: string[] }) => ({
    productId: String(input?.productId ?? ""),
    urls: (Array.isArray(input?.urls) ? input.urls : []).map(String).filter(Boolean),
  }))
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("product_media")
      .select("id", { count: "exact", head: true })
      .eq("product_id", data.productId);
    if (!data.urls.length) return { ok: true };
    const { error } = await supabaseAdmin.from("product_media").insert(
      data.urls.map((url, i) => ({ product_id: data.productId, url, kind: "image", sort_order: (count ?? 0) + i })),
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
