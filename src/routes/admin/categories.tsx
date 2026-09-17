import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listCategories, upsertCategory, deleteCategory } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/categories")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Categories | K ESSENCE" }] }),
  component: AdminCategories,
});

function AdminCategories() {
  const fetcher = useServerFn(listCategories);
  const query = useQuery({ queryKey: ["admin-categories"], queryFn: () => fetcher({}) });
  const upsert = useServerFn(upsertCategory);
  const del = useServerFn(deleteCategory);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const create = useMutation({ mutationFn: () => upsert({ data: { name, slug } }), onSuccess: () => query.refetch() });
  const remove = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => query.refetch() });

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-serif">Categories</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="mb-4 grid gap-2 w-full max-w-md"
      >
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <Button type="submit">Create / Update</Button>
      </form>

      <div className="rounded border border-border/60 bg-card/40 p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="p-2">Name</th>
              <th className="p-2">Slug</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(query.data ?? []).map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.slug}</td>
                <td className="p-2">
                  <Button variant="ghost" onClick={() => remove.mutate(c.id)}>
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

export default AdminCategories;
