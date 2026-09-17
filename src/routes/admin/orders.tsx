import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listOrders, updateOrderStatus } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/orders")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Orders | K ESSENCE" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const fetcher = useServerFn(listOrders);
  const query = useQuery({ queryKey: ["admin-orders"], queryFn: () => fetcher({}) });
  const updateFn = useServerFn(updateOrderStatus);

  const mutation = useMutation({ mutationFn: (vars: any) => updateFn({ data: vars }), onSuccess: () => query.refetch() });

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-serif">Orders</h1>
      <div className="rounded border border-border/60 bg-card/40 p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="p-2">Order #</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(query.data ?? []).map((o: any) => (
              <tr key={o.id} className="border-t">
                <td className="p-2">{o.order_number}</td>
                <td className="p-2">{o.customer_name ?? o.customer_email}</td>
                <td className="p-2">₹{Number(o.total ?? 0).toFixed(2)}</td>
                <td className="p-2">{o.status}</td>
                <td className="p-2">
                  <select
                    defaultValue={o.status}
                    onChange={(e) => mutation.mutate({ id: o.id, status: e.target.value })}
                    className="mr-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrders;
