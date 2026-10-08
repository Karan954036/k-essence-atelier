import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Plus, Trash2, Upload } from "lucide-react";
import {
  listProducts,
  deleteProduct,
  setProductActive,
  listCategories,
  listCollectionsAdmin,
  getProductForEdit,
} from "@/lib/admin.functions";
import { resolveMediaUrls } from "@/lib/product-media";
import { inr } from "@/lib/catalog";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { BulkCatalog } from "@/components/admin/BulkCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/products")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Products | K ESSENCE" }] }),
  component: AdminProducts,
});

const PAGE = 20;
const select =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none [&>option]:bg-background";

function statusOf(p: any): "draft" | "active" | "out_of_stock" {
  if (!p.is_active) return "draft";
  return p.in_stock ? "active" : "out_of_stock";
}
const STATUS_LABEL = { draft: "Draft", active: "Active", out_of_stock: "Out of Stock" };

function AdminProducts() {
  const qc = useQueryClient();
  const fetchProducts = useServerFn(listProducts);
  const fetchCats = useServerFn(listCategories);
  const fetchCols = useServerFn(listCollectionsAdmin);
  const fetchOne = useServerFn(getProductForEdit);
  const del = useServerFn(deleteProduct);
  const toggle = useServerFn(setProductActive);

  const products = useQuery({ queryKey: ["admin-products"], queryFn: () => fetchProducts() });
  const cats = useQuery({ queryKey: ["admin-categories"], queryFn: () => fetchCats() });
  const cols = useQuery({ queryKey: ["admin-collections"], queryFn: () => fetchCols() });
  const categories = (cats.data ?? []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }));
  const collections = (cols.data ?? []).map((c: any) => ({ id: c.id, name: c.title, slug: c.slug }));
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  const [mode, setMode] = useState<"list" | "form" | "bulk">("list");
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["catalog"] });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (products.data ?? []).filter((p: any) => {
      if (q && !`${p.name} ${p.sku ?? ""} ${p.slug}`.toLowerCase().includes(q)) return false;
      if (cat && p.category_id !== cat) return false;
      if (status && statusOf(p) !== status) return false;
      return true;
    });
  }, [products.data, search, cat, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE);

  useEffect(() => {
    const refs = rows
      .map((p: any) => [...(p.product_media ?? [])].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url)
      .filter((u: string | undefined): u is string => Boolean(u) && !thumbs[u!]);
    if (refs.length) resolveMediaUrls(refs).then((m) => setThumbs((t) => ({ ...t, ...m })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.map((r: any) => r.id).join()]);

  const toggleM = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => toggle({ data: v }),
    onSuccess: () => { toast.success("Updated"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Product deleted"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function openEdit(id: string) {
    try {
      setEditing(await fetchOne({ data: { id } }));
      setMode("form");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  const close = () => { setMode("list"); setEditing(null); refresh(); };

  const tab = (m: typeof mode, label: string, Icon: any) => (
    <Button variant={mode === m ? "default" : "outline"} onClick={() => { setEditing(null); setMode(m); }}>
      <Icon className="mr-2 h-4 w-4" />{label}
    </Button>
  );

  return (
    <div>
      <AdminPageHeader
        title={mode === "form" ? (editing ? `Edit — ${editing.name}` : "Add product") : mode === "bulk" ? "Bulk catalog" : "Products"}
        description="Active products appear on the customer shop immediately."
        action={
          <div className="flex flex-wrap gap-2">
            {mode !== "list" && <Button variant="ghost" onClick={close}>All products</Button>}
            {tab("form", "Add Product", Plus)}
            {tab("bulk", "Bulk Catalog", Upload)}
          </div>
        }
      />

      {mode === "form" ? (
        <ProductForm key={editing?.id ?? "new"} initial={editing} categories={categories} collections={collections} onDone={close} />
      ) : mode === "bulk" ? (
        <BulkCatalog categories={categories} collections={collections} onDone={refresh} />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <Input aria-label="Search products" placeholder="Search name or SKU…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="max-w-xs" />
            <select aria-label="Category filter" className={select} value={cat} onChange={(e) => { setCat(e.target.value); setPage(0); }}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select aria-label="Status filter" className={select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded border border-border/60 bg-card/40">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-3">Image</th><th className="p-3">Product</th><th className="p-3">SKU</th>
                  <th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th>
                  <th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.isLoading ? (
                  <tr><td colSpan={8} className="p-4 text-muted-foreground">Loading products…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={8} className="p-4 text-muted-foreground">No products match.</td></tr>
                ) : rows.map((p: any) => {
                  const variants = p.product_variants ?? [];
                  const prices = variants.map((v: any) => Number(v.price));
                  const stock = variants.reduce((s: number, v: any) => s + Number(v.stock ?? 0), 0);
                  const first = [...(p.product_media ?? [])].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
                  const st = statusOf(p);
                  return (
                    <tr key={p.id} className="border-t border-border/60">
                      <td className="p-3">
                        <div className="h-12 w-12 overflow-hidden rounded border border-border/60 bg-background">
                          {first && thumbs[first.url] ? <img src={thumbs[first.url]} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.slug}{p.is_demo ? " · demo" : ""}</p>
                      </td>
                      <td className="p-3 font-mono text-xs">{p.sku ?? "—"}</td>
                      <td className="p-3">{catName.get(p.category_id) ?? "—"}</td>
                      <td className="p-3">{prices.length ? inr(Math.min(...prices)) : inr(Number(p.price ?? 0))}</td>
                      <td className={`p-3 ${stock <= 5 ? "text-destructive" : ""}`}>{stock}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${st === "active" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {STATUS_LABEL[st]}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" aria-label={`Edit ${p.name}`} onClick={() => openEdit(p.id)}><Pencil className="h-4 w-4" /></Button>
                          <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer" aria-label={`View ${p.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted/40"><Eye className="h-4 w-4" /></a>
                          <Button variant="outline" size="sm" disabled={toggleM.isPending}
                            onClick={() => toggleM.mutate({ id: p.id, active: !p.is_active })}>
                            {p.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button variant="ghost" size="icon" aria-label={`Delete ${p.name}`}
                            onClick={() => { if (confirm(`Delete ${p.name}? This cannot be undone.`)) delM.mutate(p.id); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="mt-3 flex items-center justify-end gap-2 text-sm">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-muted-foreground">Page {page + 1} of {pages}</span>
              <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminProducts;
