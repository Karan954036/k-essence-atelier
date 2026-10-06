import { useEffect, type ReactNode } from "react";
import { inr } from "@/lib/catalog";
import { paymentMethodLabel } from "@/lib/order-status";
import { Printer, ShieldCheck } from "lucide-react";

/** The one invoice view shared by customers and admins; renders persisted order/invoice rows only. */
export function InvoiceDocument({
  order,
  nav,
  autoPrint = false,
}: {
  order: any;
  nav?: ReactNode;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) return;
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, [autoPrint]);

  const invoice = Array.isArray(order.invoices) ? order.invoices[0] : order.invoices;
  const invoiceNumber = invoice?.invoice_number ?? order.invoice_number ?? `INV-${order.order_number}`;
  const issueDate = invoice?.issued_at ?? order.placed_at ?? order.created_at;

  const formattedDate = new Date(issueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Prefer invoice_items if present, fallback to order_items
  const rawItems = (invoice?.invoice_items && invoice.invoice_items.length > 0)
    ? invoice.invoice_items
    : (order.order_items ?? []);

  const items = rawItems.map((item: any) => ({
    id: item.id,
    name: item.description ?? item.product_name ?? "Fragrance Item",
    variant: item.variant_label ?? "",
    unitPrice: Number(item.unit_price ?? 0),
    quantity: Number(item.quantity ?? 1),
    total: Number(item.line_total ?? (Number(item.unit_price ?? 0) * Number(item.quantity ?? 1))),
  }));

  const subtotal = Number(invoice?.subtotal ?? order.subtotal ?? 0);
  const discount = Number(invoice?.discount ?? order.discount ?? 0);
  const shippingFee = Number(invoice?.shipping_fee ?? order.shipping_fee ?? 0);
  const grandTotal = Number(invoice?.total ?? order.total ?? 0);

  return (
    <div className="min-h-screen bg-neutral-900/40 py-8 text-neutral-100 print:min-h-0 print:bg-white print:p-0 print:text-black">
      {/* Top Action Bar — Hidden when printed */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between px-4 print:hidden">
        <div className="flex items-center gap-4">{nav}</div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded bg-amber-500/10 px-4 py-2 text-xs font-medium tracking-widest text-amber-300 uppercase transition hover:bg-amber-500/20 active:scale-95"
        >
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>

      {/* Invoice Document Card */}
      <div className="mx-auto max-w-3xl rounded-sm border border-neutral-800 bg-neutral-950 p-8 shadow-2xl print:border-none print:bg-white print:p-0 print:shadow-none sm:p-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-neutral-800 pb-8 sm:flex-row sm:items-start print:border-neutral-200">
          <div>
            <span className="font-serif text-2xl font-bold tracking-widest text-white print:text-black">
              K ESSENCE
            </span>
            <p className="text-[0.7rem] tracking-[0.25em] text-neutral-400 uppercase print:text-neutral-600">
              Atelier de Parfum
            </p>
            <p className="mt-3 text-xs leading-relaxed text-neutral-400 print:text-neutral-700">
              K ESSENCE Luxury Fragrances Pvt. Ltd.
              <br />
              Artisanal Blends & Signature Attars
              <br />
              India
            </p>
          </div>

          <div className="sm:text-right">
            <h1 className="font-serif text-xl font-medium tracking-wide text-white print:text-black">
              TAX INVOICE
            </h1>
            <p className="mt-1 font-mono text-sm font-semibold text-amber-400 print:text-black">
              {invoiceNumber}
            </p>
            <div className="mt-3 space-y-1 text-xs text-neutral-400 print:text-neutral-700">
              <p>
                <span className="text-neutral-500 print:text-neutral-500">Date:</span> {formattedDate}
              </p>
              <p>
                <span className="text-neutral-500 print:text-neutral-500">Order ID:</span>{" "}
                <span className="font-mono text-white print:text-black">{order.order_number}</span>
              </p>
              <p>
                <span className="text-neutral-500 print:text-neutral-500">Payment:</span>{" "}
                {paymentMethodLabel(order.payment_method)} ({order.payment_status})
              </p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid gap-6 border-b border-neutral-800 py-6 sm:grid-cols-2 print:border-neutral-200">
          <div>
            <p className="text-[0.7rem] font-semibold tracking-wider text-neutral-400 uppercase print:text-neutral-600">
              Billed To
            </p>
            <p className="mt-2 text-sm font-medium text-white print:text-black">
              {invoice?.bill_to_name ?? order.ship_full_name ?? order.customer_name ?? "Customer"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400 print:text-neutral-700">
              {invoice?.bill_to_mobile ?? order.ship_mobile ?? order.customer_phone}
              {invoice?.bill_to_email || order.customer_email ? (
                <>
                  <br />
                  {invoice?.bill_to_email ?? order.customer_email}
                </>
              ) : null}
            </p>
          </div>

          <div>
            <p className="text-[0.7rem] font-semibold tracking-wider text-neutral-400 uppercase print:text-neutral-600">
              Shipped To
            </p>
            <p className="mt-2 text-sm font-medium text-white print:text-black">
              {order.ship_full_name ?? order.customer_name ?? "Recipient"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400 print:text-neutral-700">
              {order.ship_address || invoice?.bill_to_address}
              <br />
              {order.ship_city}, {order.ship_state} {order.ship_pincode}
              <br />
              {order.ship_country ?? "India"}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 print:border-neutral-200 print:text-neutral-600">
                <th className="py-2.5 font-medium tracking-wider uppercase">#</th>
                <th className="py-2.5 font-medium tracking-wider uppercase">Item Description</th>
                <th className="py-2.5 font-medium tracking-wider uppercase">Variant</th>
                <th className="py-2.5 text-right font-medium tracking-wider uppercase">Unit Price</th>
                <th className="py-2.5 text-center font-medium tracking-wider uppercase">Qty</th>
                <th className="py-2.5 text-right font-medium tracking-wider uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 print:divide-neutral-100">
              {items.map((it: any, index: number) => (
                <tr key={it.id || index} className="text-neutral-200 print:text-black">
                  <td className="py-3 text-neutral-500 print:text-neutral-600">{index + 1}</td>
                  <td className="py-3 font-medium text-white print:text-black">{it.name}</td>
                  <td className="py-3 text-neutral-400 print:text-neutral-600">{it.variant || "—"}</td>
                  <td className="py-3 text-right">{inr(it.unitPrice)}</td>
                  <td className="py-3 text-center">{it.quantity}</td>
                  <td className="py-3 text-right font-medium">{inr(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col justify-between gap-6 border-t border-neutral-800 pt-6 sm:flex-row print:border-neutral-200">
          <div className="max-w-xs space-y-2 text-xs text-neutral-500 print:text-neutral-600">
            <div className="flex items-center gap-1.5 text-neutral-400 print:text-neutral-700">
              <ShieldCheck className="h-4 w-4 text-amber-400 print:text-black" />
              <span>Authentic Artisanal Fragrance Guarantee</span>
            </div>
            <p>
              Thank you for ordering with K ESSENCE. This invoice acts as your official proof of
              purchase.
            </p>
          </div>

          <div className="w-full space-y-2 sm:w-64">
            <div className="flex justify-between text-xs text-neutral-400 print:text-neutral-700">
              <span>Subtotal</span>
              <span className="text-white print:text-black">{inr(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-amber-400 print:text-black">
                <span>Discount / Savings</span>
                <span>-{inr(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-neutral-400 print:text-neutral-700">
              <span>Shipping & Handling</span>
              <span className="text-white print:text-black">
                {shippingFee === 0 ? "FREE" : inr(shippingFee)}
              </span>
            </div>
            <div className="border-t border-neutral-800 pt-2 print:border-neutral-200">
              <div className="flex justify-between font-serif text-base font-bold text-white print:text-black">
                <span>Total Amount</span>
                <span className="text-amber-400 print:text-black">{inr(grandTotal)}</span>
              </div>
              <p className="mt-1 text-right text-[0.7rem] text-neutral-500 print:text-neutral-600">
                Payment: {paymentMethodLabel(order.payment_method)} ({order.payment_status.toUpperCase()})
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 border-t border-neutral-900 pt-6 text-center text-[0.7rem] text-neutral-500 print:border-neutral-200 print:text-neutral-600">
          <p>K ESSENCE Atelier • support@kessence.in • All prices inclusive of applicable taxes</p>
        </div>
      </div>
    </div>
  );
}
