import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listInventory, adjustStock } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/inventory")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Inventory | K ESSENCE" }] }),
  component: AdminInventory,
});

function AdminInventory() {
  const fetcher = useServerFn(listInventory);
  const query = useQuery({ queryKey: ["admin-inventory"], queryFn: () => fetcher({}) });
  const adjustFn = useServerFn(adjustStock);
  const mutation = useMutation({ mutationFn: (v: any) => adjustFn({ data: v }), onSuccess: () => query.refetch() });
  const [change, setChange] = useState(0);
  const [reason, setReason] = useState("manual");

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-serif">Inventory</h1>
      <div className="rounded border border-border/60 bg-card/40 p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="p-2">Product</th>
              <th className="p-2">Variant</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {(query.data ?? []).map((v: any) => (
              <tr key={v.id} className="border-t">
                <td className="p-2">{v.products?.name ?? "—"}</td>
                <td className="p-2">{v.label}</td>
                <td className="p-2">{v.stock}</td>
                <td className="p-2">
                  <Input type="number" value={String(change)} onChange={(e) => setChange(Number(e.target.value))} className="w-24" />
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className="mx-2">
                    <option value="manual">Manual</option>
                    <option value="correction">Correction</option>
                    <option value="received">Received</option>
                  </select>
                  <Button onClick={() => mutation.mutate({ variant_id: v.id, change, reason })}>Apply</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminInventory;
