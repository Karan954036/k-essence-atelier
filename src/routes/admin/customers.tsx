import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCustomers, listOrders } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/customers")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Customers | K ESSENCE" }] }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const fetcher = useServerFn(listCustomers);
  const query = useQuery({ queryKey: ["admin-customers"], queryFn: () => fetcher({}) });
  const ordersFetcher = useServerFn(listOrders);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-serif">Customers</h1>
      <div className="rounded border border-border/60 bg-card/40 p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="p-2">Name</th>
              <th className="p-2">Created</th>
              <th className="p-2">Recent orders</th>
            </tr>
          </thead>
          <tbody>
            {(query.data ?? []).map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.full_name ?? c.id}</td>
                <td className="p-2">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="p-2 text-sm">
                  <CustomerOrders userId={c.id} fetchOrders={ordersFetcher} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerOrders({ userId, fetchOrders }: { userId: string; fetchOrders: any }) {
  const q = useQuery({ queryKey: ["customer-orders", userId], queryFn: () => fetchOrders({}).then((d: any[]) => d.filter((o: any) => o.user_id === userId)) });
  if (q.isLoading) return <span>Loading…</span>;
  return <span>{(q.data ?? []).slice(0, 3).map((o: any) => o.order_number).join(", ") || "—"}</span>;
}

export default AdminCustomers;
