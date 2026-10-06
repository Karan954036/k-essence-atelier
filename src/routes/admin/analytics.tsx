import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { getSalesAnalytics } from "@/lib/admin.functions";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/analytics")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Business Dashboard | K ESSENCE" }] }),
  component: BusinessDashboard,
});

const RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
] as const;

const inr = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function BusinessDashboard() {
  const [range, setRange] = useState<string>("30d");
  const fetcher = useServerFn(getSalesAnalytics);
  const query = useQuery({
    queryKey: ["admin-analytics", range],
    queryFn: () => fetcher({ data: { range } }),
  });
  const d = query.data;

  const cards = [
    { label: "Total Orders", value: d ? String(d.totalOrders) : "—" },
    { label: "Sales Revenue", value: d ? inr(d.totalRevenue) : "—" },
    { label: "Average Order Value", value: d ? inr(d.averageOrderValue) : "—" },
    { label: "Today's Orders", value: d ? String(d.todaysOrders) : "—" },
    { label: "Today's Revenue", value: d ? inr(d.todaysRevenue) : "—" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Business Dashboard"
        description="Real order totals by day (India time). Returned orders are excluded."
        action={
          <div className="flex flex-wrap gap-1 rounded-md border border-border/60 bg-card/40 p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`rounded px-3 py-1.5 text-xs transition-colors ${
                  range === r.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {query.isError ? (
        <p className="text-sm text-destructive">{(query.error as Error).message}</p>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded border border-border/60 bg-card/40 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
            <div className="mt-2 font-serif text-2xl text-foreground">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded border border-border/60 bg-card/40 p-4">
        <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
          Orders & revenue per day
        </h2>
        <div className="h-72">
          {query.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={d?.daily ?? []}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis yAxisId="o" allowDecimals={false} stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis yAxisId="r" orientation="right" stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <Legend />
                <Bar yAxisId="o" dataKey="orders" name="Orders" fill="var(--muted-foreground)" />
                <Line yAxisId="r" dataKey="revenue" name="Revenue (₹)" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-border/60 bg-card/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Date</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {[...(d?.daily ?? [])].reverse().map((r) => (
              <tr key={r.day} className="border-t border-border/60">
                <td className="p-3">{r.day}</td>
                <td className="p-3">{r.orders}</td>
                <td className="p-3">{inr(r.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
