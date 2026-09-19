import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FREE_SHIPPING_THRESHOLD = 1499;
const SHIPPING_FEE = 99;

export type PlaceOrderLine = { productSlug: string; variantLabel: string; quantity: number };

export type PlaceOrderInput = {
  items: PlaceOrderLine[];
  contact: { fullName: string; mobile: string; email?: string | undefined };
  address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    country?: string | undefined;
  };
  saveAddress?: boolean | undefined;
  idempotencyKey: string;
};

function req(value: unknown, label: string, min = 2): string {
  const v = String(value ?? "").trim();
  if (v.length < min) throw new Error(`Please enter a valid ${label}`);
  return v;
}

function validate(input: PlaceOrderInput): PlaceOrderInput {
  const items = (input?.items ?? [])
    .map((i) => ({
      productSlug: String(i?.productSlug ?? "").trim(),
      variantLabel: String(i?.variantLabel ?? "").trim(),
      quantity: Math.max(1, Math.min(20, Math.floor(Number(i?.quantity ?? 1)))),
    }))
    .filter((i) => i.productSlug && i.variantLabel);
  if (items.length === 0) throw new Error("Your bag is empty");

  const mobile = String(input?.contact?.mobile ?? "").replace(/\D/g, "");
  if (mobile.length < 10) throw new Error("Please enter a valid 10-digit mobile number");

  const pincode = String(input?.address?.pincode ?? "").replace(/\D/g, "");
  if (pincode.length !== 6) throw new Error("Please enter a valid 6-digit pincode");

  return {
    items,
    contact: {
      fullName: req(input?.contact?.fullName, "full name"),
      mobile,
      email: String(input?.contact?.email ?? "").trim() || undefined,
    },
    address: {
      address: req(input?.address?.address, "address", 6),
      city: req(input?.address?.city, "city"),
      state: req(input?.address?.state, "state"),
      pincode,
      country: String(input?.address?.country ?? "India").trim() || "India",
    },
    saveAddress: Boolean(input?.saveAddress),
    idempotencyKey: req(input?.idempotencyKey, "request key", 8),
  };
}

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

function suffix() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

/** Places a real Cash-on-Delivery order. Prices and stock come from the database, never the browser. */
export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // Idempotency: a retry/double-click returns the original order.
    const { data: existing } = await supabaseAdmin
      .from("orders")
      .select("order_number")
      .eq("user_id", userId)
      .eq("idempotency_key", data.idempotencyKey)
      .maybeSingle();
    if (existing) return { orderNumber: existing.order_number, duplicate: true };

    const slugs = [...new Set(data.items.map((i) => i.productSlug))];
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, slug, name, is_active, product_variants(id, label, price, mrp, stock)")
      .in("slug", slugs);
    if (pErr) throw new Error(pErr.message);

    type Line = {
      productId: string;
      variantId: string;
      productName: string;
      variantLabel: string;
      unitPrice: number;
      mrp: number;
      quantity: number;
      stock: number;
    };

    const lines: Line[] = data.items.map((item) => {
      const product = (products ?? []).find((p) => p.slug === item.productSlug);
      if (!product || !product.is_active) throw new Error(`"${item.productSlug}" is no longer available`);
      const variant = (product.product_variants ?? []).find((v) => v.label === item.variantLabel);
      if (!variant) throw new Error(`${product.name} (${item.variantLabel}) is no longer available`);
      if (Number(variant.stock) < item.quantity) {
        throw new Error(`Only ${variant.stock} left of ${product.name} (${variant.label})`);
      }
      return {
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantLabel: variant.label,
        unitPrice: Number(variant.price),
        mrp: Number(variant.mrp),
        quantity: item.quantity,
        stock: Number(variant.stock),
      };
    });

    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const mrpTotal = lines.reduce((s, l) => s + l.mrp * l.quantity, 0);
    const discount = Math.max(0, mrpTotal - subtotal);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;

    const shipAddress = `${data.address.address}, ${data.address.city}, ${data.address.state} ${data.address.pincode}, ${data.address.country}`;

    let order: { id: string; order_number: string; invoice_number: string | null } | null = null;
    let lastError = "Could not place the order";
    for (let attempt = 0; attempt < 5 && !order; attempt++) {
      const orderNumber = `KE-${stamp()}-${suffix()}`;
      const invoiceNumber = `KE-INV-${stamp()}-${suffix()}`;
      const { data: created, error } = await supabaseAdmin
        .from("orders")
        .insert({
          order_number: orderNumber,
          invoice_number: invoiceNumber,
          user_id: userId,
          status: "received",
          payment_status: "unpaid",
          payment_method: "cod",
          subtotal,
          discount,
          shipping_fee: shippingFee,
          total,
          customer_name: data.contact.fullName,
          customer_email: data.contact.email ?? null,
          customer_phone: data.contact.mobile,
          shipping_address: shipAddress,
          ship_full_name: data.contact.fullName,
          ship_mobile: data.contact.mobile,
          ship_address: data.address.address,
          ship_city: data.address.city,
          ship_state: data.address.state,
          ship_pincode: data.address.pincode,
          ship_country: data.address.country ?? "India",
          idempotency_key: data.idempotencyKey,
        })
        .select("id, order_number, invoice_number")
        .single();
      if (error) {
        lastError = error.message;
        continue;
      }
      order = created;
    }
    if (!order) throw new Error(lastError);

    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(
      lines.map((l) => ({
        order_id: order!.id,
        product_id: l.productId,
        variant_id: l.variantId,
        product_name: l.productName,
        variant_label: l.variantLabel,
        unit_price: l.unitPrice,
        quantity: l.quantity,
      })),
    );
    if (itemsErr) throw new Error(itemsErr.message);

    const { data: invoice, error: invErr } = await supabaseAdmin
      .from("invoices")
      .insert({
        order_id: order.id,
        invoice_number: order.invoice_number ?? `KE-INV-${stamp()}-${suffix()}`,
        subtotal,
        discount,
        shipping_fee: shippingFee,
        total,
        bill_to_name: data.contact.fullName,
        bill_to_mobile: data.contact.mobile,
        bill_to_email: data.contact.email ?? null,
        bill_to_address: shipAddress,
      })
      .select("id")
      .single();
    if (invErr) throw new Error(invErr.message);

    const { error: invItemsErr } = await supabaseAdmin.from("invoice_items").insert(
      lines.map((l) => ({
        invoice_id: invoice.id,
        description: l.productName,
        variant_label: l.variantLabel,
        unit_price: l.unitPrice,
        quantity: l.quantity,
        line_total: l.unitPrice * l.quantity,
      })),
    );
    if (invItemsErr) throw new Error(invItemsErr.message);

    await supabaseAdmin.from("payments").insert({
      order_id: order.id,
      method: "cod",
      status: "pending",
      amount: total,
    });

    await supabaseAdmin.from("order_status_history").insert({
      order_id: order.id,
      from_status: null,
      to_status: "received",
      note: "Order placed (Cash on Delivery)",
      changed_by: userId,
    });

    // Reduce stock and log every movement.
    for (const l of lines) {
      const resulting = Math.max(0, l.stock - l.quantity);
      await supabaseAdmin
        .from("product_variants")
        .update({ stock: resulting })
        .eq("id", l.variantId);
      await supabaseAdmin.from("stock_movements").insert({
        variant_id: l.variantId,
        change: -l.quantity,
        resulting_stock: resulting,
        reason: `Order ${order.order_number}`,
        created_by: userId,
      });
    }

    if (data.saveAddress) {
      await supabaseAdmin.from("addresses").insert({
        user_id: userId,
        full_name: data.contact.fullName,
        mobile: data.contact.mobile,
        address: data.address.address,
        city: data.address.city,
        state: data.address.state,
        pincode: data.address.pincode,
        country: data.address.country ?? "India",
      });
    }

    return { orderNumber: order.order_number, duplicate: false };
  });

/** The signed-in customer's own saved addresses. */
export const listMyAddresses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("addresses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** The signed-in customer's own orders. */
export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** One of the signed-in customer's own orders, with items, invoice and timeline. */
export const getMyOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderNumber: string }) => ({
    orderNumber: String(input?.orderNumber ?? "").trim(),
  }))
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*), payments(*), invoices(*, invoice_items(*))")
      .eq("order_number", data.orderNumber)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");

    const { data: history, error: hErr } = await context.supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });
    if (hErr) throw new Error(hErr.message);

    return { order, history: history ?? [] };
  });
