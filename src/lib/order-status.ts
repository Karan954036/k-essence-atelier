/** Shared order status vocabulary for K ESSENCE orders (customer + admin). */

export const ORDER_FLOW = [
  "received",
  "accepted",
  "ready_for_ship",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export const ORDER_EXCEPTIONS = ["cancelled", "returned", "rto"] as const;

export type OrderFlowStatus = (typeof ORDER_FLOW)[number];
export type OrderExceptionStatus = (typeof ORDER_EXCEPTIONS)[number];
export type OrderStatus = OrderFlowStatus | OrderExceptionStatus;

export const ALL_ORDER_STATUSES: readonly OrderStatus[] = [...ORDER_FLOW, ...ORDER_EXCEPTIONS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order Received",
  accepted: "Accepted",
  ready_for_ship: "Ready for Ship",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  rto: "Return to Origin",
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ALL_ORDER_STATUSES as readonly string[]).includes(value);
}

export function statusLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return isOrderStatus(value) ? ORDER_STATUS_LABELS[value] : value;
}

export function isException(value: string | null | undefined): boolean {
  return typeof value === "string" && (ORDER_EXCEPTIONS as readonly string[]).includes(value);
}

/** Index in the happy-path flow, or -1 for exception/unknown statuses. */
export function flowIndex(value: string | null | undefined): number {
  return (ORDER_FLOW as readonly string[]).indexOf(String(value ?? ""));
}

/** The next status an admin can move a non-exception order to, if any. */
export function nextStatus(current: string | null | undefined): OrderFlowStatus | null {
  const i = flowIndex(current);
  if (i < 0 || i >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[i + 1]!;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  upi: "UPI",
  card: "Card",
};

export function paymentMethodLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return PAYMENT_METHOD_LABELS[value] ?? value;
}
