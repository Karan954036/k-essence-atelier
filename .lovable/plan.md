# Real customer order workflow (checkout → order → invoice → admin)

Goal: make the shopping bag lead to a working checkout that creates a real order in the
database, gives the customer an order number and a permanent invoice, and lets the admin
move that same order through delivery stages — with the customer seeing every update.

Nothing in the current look, cart drawer, login, account pages, or admin design changes.

## What the customer gets

1. **Checkout page** (`/checkout`, sign-in required)
   - Contact details (name, mobile, email) prefilled from the account.
   - Shipping address: full name, mobile, address, city, state, pincode, country.
   - Order summary: each product with its size, quantity, price, savings, shipping
     (free above the existing 1499 threshold, otherwise 99), and total.
   - Payment: **Cash on Delivery** works. UPI / Card shown as "Coming soon" and disabled —
     no payment gateway is connected, so no payment is ever faked.
   - "Place Order" is locked while submitting and uses a one-time key so a double-click or
     retry cannot create two orders.
2. **Order confirmation** (`/order/{orderNumber}`) — order number, invoice number, items,
   total, payment method, address, and the tracking timeline.
3. **My Orders** (`/account/orders`) — only the signed-in customer's own orders: order
   number, date, products, total, payment method, invoice number, current status, plus
   "View order" and "View / print invoice".
4. **Invoice view** (`/account/orders/{orderNumber}/invoice`) — clean printable page using
   only the brand name and the address the customer entered. No tax numbers, GSTIN, or
   company details are invented; those stay blank until you provide them.
5. **Tracking timeline**: Order Received → Accepted → Ready for Ship → Packed → Shipped →
   Out for Delivery → Delivered, with Cancelled / Returned / RTO shown when they apply.

## What the admin gets

Existing admin panel, Orders section completed:
- Today's orders count and revenue, plus the full order list: customer, order number, date,
  products, total, payment method, payment status, invoice number, status.
- Opening an order shows items, address, invoice number, and the full change history.
- Buttons to advance the order: Accept → Ready for Ship → Packed → Shipped → Out for
  Delivery → Delivered, plus Cancel / Returned / RTO, and a payment-received toggle for COD.
- Every change is recorded with a timestamp and who made it. The customer sees the new
  status immediately in My Orders.

## Data and security (technical)

New / extended tables, all UUID keys with timestamps and row-level security:
- `orders` (exists) — add `invoice_number` (unique), `payment_method`, `subtotal`,
  `discount`, `shipping_fee`, shipping-address snapshot columns, `idempotency_key` (unique
  per user), `placed_at`. Status values extended to the timeline above.
- `order_items` (exists) — reused as the purchased-price snapshot.
- `order_status_history` (new) — order, from/to status, note, changed_by, changed_at.
- `addresses` (new) — customer's saved shipping addresses.
- `invoices` + `invoice_items` (new) — one persistent invoice per order, generated once.
- `payments` (new) — one row per order recording method (`cod`) and payment state.

RLS: customers may read only their own orders, items, history, invoices, addresses, and
payments; they may insert addresses only. Order creation, order numbers, invoice numbers,
totals and status changes all happen server-side, so a customer cannot alter a total,
invoice number, or status. Admin-only writes go through the existing admin check. The
service-role key stays server-side and is never exposed.

Server functions (`src/lib/orders.functions.ts`): `placeOrder` (validates the address,
re-reads live prices from the catalog rather than trusting the browser, generates
`KE-…` order number and `KE-INV-…` invoice number, writes order + items + invoice +
invoice items + payment + first history row in one pass, dedupes on the idempotency key),
`listMyOrders`, `getMyOrder`. Admin functions extended in `src/lib/admin.functions.ts`:
`listOrders` (with invoice + payment), `getOrder`, `updateOrderStatus` (writes history),
`markPaymentReceived`.

Cart is cleared only after the order comes back successfully.

## Files touched

New: `src/routes/checkout.tsx`, `src/routes/order.$orderNumber.tsx`,
`src/routes/account.orders.tsx`, `src/routes/account.orders.$orderNumber.invoice.tsx`,
`src/lib/orders.functions.ts`, `src/lib/order-status.ts`,
`src/components/orders/OrderTimeline.tsx`.
Edited: `src/components/cart/CartDrawer.tsx` (checkout button navigates instead of showing a
toast), `src/routes/admin/orders.tsx` (full list + detail + status actions),
`src/lib/admin.functions.ts` (order functions), `src/routes/account.tsx` (link to My Orders).

## Verification

TypeScript check and production build, then an end-to-end run in a real browser: sign in,
add to bag, place a COD order, confirm the order and invoice appear in My Orders, then
confirm the admin sees the same order number and invoice and that advancing the status
shows up on the customer side.

## Not included

No card/UPI payment (no gateway connected), no tax or GST fields, no shipping-carrier
integration, no email notifications.
