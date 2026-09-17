import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardData } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Dashboard | K ESSENCE" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetcher = useServerFn(getDashboardData);
  const query = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => fetcher({}) });

  if (query.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading dashboard…</div>;
  }

  const data: any = query.data ?? {};

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-serif">Dashboard</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded border border-border/60 bg-card/40 p-4">
          <div className="text-sm text-muted-foreground">Today's orders</div>
          <div className="mt-2 text-2xl font-semibold">{data?.todaysOrders ?? 0}</div>
        </div>
        <div className="rounded border border-border/60 bg-card/40 p-4">
          <div className="text-sm text-muted-foreground">Today's revenue</div>
          <div className="mt-2 text-2xl font-semibold">₹{Number(data?.todaysRevenue ?? 0).toFixed(2)}</div>
        </div>
        <div className="rounded border border-border/60 bg-card/40 p-4">
          <div className="text-sm text-muted-foreground">Pending orders</div>
          <div className="mt-2 text-2xl font-semibold">{data?.pendingOrders ?? 0}</div>
        </div>
        <div className="rounded border border-border/60 bg-card/40 p-4">
          <div className="text-sm text-muted-foreground">Low stock variants</div>
          <div className="mt-2 text-2xl font-semibold">{data?.lowStock ?? 0}</div>
        </div>
      </div>

      <div className="rounded border border-border/60 bg-card/40 p-4">
        <h2 className="mb-3 text-lg">Recent orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-muted-foreground">
                <th className="p-2">Order #</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Total</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders ?? []).map((o: any) => (
                <tr key={o.id} className="border-t">
                  <td className="p-2 text-sm">{o.order_number}</td>
                  <td className="p-2 text-sm">{o.customer_name ?? o.customer_email ?? "—"}</td>
                  <td className="p-2 text-sm">₹{Number(o.total ?? 0).toFixed(2)}</td>
                  <td className="p-2 text-sm">{o.status}</td>
                  <td className="p-2 text-sm">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
