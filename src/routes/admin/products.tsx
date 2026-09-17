import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listProducts, upsertProduct, deleteProduct } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/products")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Products | K ESSENCE" }] }),
  component: AdminProducts,
});

function AdminProducts() {
  const fetcher = useServerFn(listProducts);
  const query = useQuery({ queryKey: ["admin-products"], queryFn: () => fetcher({}) });
  const upsert = useServerFn(upsertProduct);
  const del = useServerFn(deleteProduct);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const createMutation = useMutation({
    mutationFn: () => upsert({ data: { name, slug } }),
    onSuccess: () => query.refetch(),
  });

  const deleteMutation = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => query.refetch() });

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-serif">Products</h1>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Close" : "New product"}</Button>
      </div>

      {showForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="mb-4 grid gap-2"
        >
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Slug (unique)" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Button type="submit" disabled={createMutation.isPending}>Create</Button>
        </form>
      ) : null}

      <div className="rounded border border-border/60 bg-card/40 p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="p-2">Name</th>
              <th className="p-2">Slug</th>
              <th className="p-2">Variants</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(query.data ?? []).map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.slug}</td>
                <td className="p-2 text-sm">{(p.product_variants ?? []).length}</td>
                <td className="p-2">
                  <Button variant="ghost" onClick={() => deleteMutation.mutate(p.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProducts;
