import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { listOrders, updateOrderStatus, acceptAllReceivedOrders } from "@/lib/admin.functions";
import { ALL_ORDER_STATUSES, ORDER_STATUS_LABELS, paymentMethodLabel } from "@/lib/order-status";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/orders")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Orders | K ESSENCE" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const queryClient = useQueryClient();
  const fetcher = useServerFn(listOrders);
  const query = useQuery({ queryKey: ["admin-orders"], queryFn: () => fetcher() });
  const updateFn = useServerFn(updateOrderStatus);
  const acceptAllFn = useServerFn(acceptAllReceivedOrders);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: string }) => updateFn({ data: vars }),
    onSuccess: () => {
      toast.success("Order status updated");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const acceptAll = useMutation({
    mutationFn: () => acceptAllFn(),
    onSuccess: (res) => {
      toast.success(`${res.accepted} order${res.accepted === 1 ? "" : "s"} accepted`);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const orders: any[] = query.data ?? [];
  const receivedCount = orders.filter((o) => o.status === "received").length;

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Every order placed on the store, newest first."
        action={
          <Button
            disabled={receivedCount === 0 || acceptAll.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            {acceptAll.isPending ? "Accepting…" : `Accept All New Orders (${receivedCount})`}
          </Button>
        }
      />

      <div className="overflow-x-auto rounded border border-border/60 bg-card/40">
        <table className="w-full min-w-[900px] table-auto text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Order #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading ? (
              <tr>
                <td colSpan={7} className="p-4 text-muted-foreground">Loading orders…</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-muted-foreground">No orders yet.</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t border-border/60">
                  <td className="p-3 font-mono text-xs">{o.order_number}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(o.placed_at ?? o.created_at).toLocaleString("en-IN")}
                  </td>
                  <td className="p-3">{o.customer_name ?? o.customer_email ?? "—"}</td>
                  <td className="p-3">₹{Number(o.total ?? 0).toFixed(2)}</td>
                  <td className="p-3">
                    {paymentMethodLabel(o.payment_method)}
                    <span className="block text-xs text-muted-foreground">{o.payment_status}</span>
                  </td>
                  <td className="p-3">
                    <select
                      aria-label={`Status for ${o.order_number}`}
                      value={o.status}
                      disabled={statusMutation.isPending}
                      onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                      className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-background [&>option]:text-foreground [&>option:checked]:bg-primary [&>option:checked]:text-primary-foreground"
                    >
                      {!ALL_ORDER_STATUSES.includes(o.status) ? (
                        <option value={o.status}>{o.status}</option>
                      ) : null}
                      {ALL_ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    {o.invoice_number ? (
                      <a
                        href={`/account/orders/${encodeURIComponent(o.order_number)}/invoice`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                        title="Open invoice to print or save as PDF"
                      >
                        <FileDown className="h-4 w-4" />
                        <span className="font-mono text-xs">{o.invoice_number}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">No invoice</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept {receivedCount} new orders?</AlertDialogTitle>
            <AlertDialogDescription>
              Only orders still marked "Order Received" will move to "Accepted". Orders at any
              other stage are not touched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => acceptAll.mutate()}>Accept all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
