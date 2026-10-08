import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { saveProduct, slugify, type ProductStatus } from "@/lib/admin.functions";
import { uploadProductImage, resolveMediaUrls } from "@/lib/product-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Option = { id: string; name: string };
type VariantRow = { id?: string; label: string; sku: string; price: string; mrp: string; stock: string };
type MediaRow = { url: string; preview: string };

const field =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-background";

const KINDS = [
  { v: "perfume", l: "Perfume" },
  { v: "attar", l: "Attar" },
  { v: "gift-set", l: "Gift Set" },
  { v: "other", l: "Other" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border/60 bg-card/40 p-5">
      <h3 className="mb-4 font-serif text-lg text-primary">{title}</h3>
      {children}
    </section>
  );
}

function L({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function ProductForm({
  initial,
  categories,
  collections,
  onDone,
}: {
  initial?: any;
  categories: Option[];
  collections: Option[];
  onDone: () => void;
}) {
  const save = useServerFn(saveProduct);
  const notesOf = (layer: string) =>
    (initial?.product_notes ?? [])
      .filter((n: any) => n.layer === layer)
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((n: any) => n.name)
      .join(", ");

  const [f, setF] = useState(() => ({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    sku: initial?.sku ?? "",
    brand: initial?.brand ?? "K ESSENCE",
    kind: initial?.kind ?? "perfume",
    category_id: initial?.category_id ?? "",
    collection_id: initial?.collection_id ?? "",
    gender: initial?.gender ?? "Unisex",
    occasions: (initial?.occasions ?? []).join(", "),
    family: initial?.family ?? "",
    concentration: initial?.concentration ?? "",
    top: notesOf("top"),
    heart: notesOf("heart"),
    base: notesOf("base"),
    short_description: initial?.short_description ?? "",
    description: initial?.description ?? "",
    weight_grams: initial?.weight_grams?.toString() ?? "",
    length_cm: initial?.length_cm?.toString() ?? "",
    width_cm: initial?.width_cm?.toString() ?? "",
    height_cm: initial?.height_cm?.toString() ?? "",
    status: (initial
      ? !initial.is_active
        ? "draft"
        : initial.in_stock
          ? "active"
          : "out_of_stock"
      : "draft") as ProductStatus,
  }));
  const [variants, setVariants] = useState<VariantRow[]>(() =>
    initial?.product_variants?.length
      ? [...initial.product_variants]
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((v: any) => ({
            id: v.id,
            label: v.label,
            sku: v.sku ?? "",
            price: String(v.price),
            mrp: String(v.mrp),
            stock: String(v.stock),
          }))
      : [{ label: "50ml", sku: "", price: "", mrp: "", stock: "0" }],
  );
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));

  useEffect(() => {
    const rows = [...(initial?.product_media ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
    if (!rows.length) return;
    resolveMediaUrls(rows.map((m: any) => m.url)).then((map) =>
      setMedia(rows.map((m: any) => ({ url: m.url, preview: map[m.url] ?? "" }))),
    );
  }, [initial]);

  const set = (k: keyof typeof f, v: string) =>
    setF((p) => ({ ...p, [k]: v, ...(k === "name" && !slugTouched ? { slug: slugify(v) } : {}) }));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = await uploadProductImage(file);
        setMedia((m) => [...m, { url: path, preview: URL.createObjectURL(file) }]);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const move = (i: number, d: -1 | 1) =>
    setMedia((m) => {
      const n = [...m];
      const j = i + d;
      if (j < 0 || j >= n.length) return m;
      [n[i], n[j]] = [n[j]!, n[i]!];
      return n;
    });

  async function submit(status: ProductStatus) {
    setSaving(true);
    try {
      await save({
        data: {
          id: initial?.id,
          name: f.name,
          slug: f.slug,
          sku: f.sku,
          brand: f.brand,
          kind: f.kind,
          category_id: f.category_id || null,
          collection_id: f.collection_id || null,
          gender: f.gender,
          occasions: f.occasions,
          family: f.family,
          concentration: f.concentration,
          short_description: f.short_description,
          description: f.description,
          weight_grams: f.weight_grams,
          length_cm: f.length_cm,
          width_cm: f.width_cm,
          height_cm: f.height_cm,
          status,
          notes: { top: f.top, heart: f.heart, base: f.base },
          variants: variants.map((v) => ({ ...v, price: Number(v.price), mrp: Number(v.mrp || v.price), stock: Number(v.stock) })),
          media: media.map((m) => ({ url: m.url })),
        } as any,
      });
      toast.success(status === "draft" ? "Saved as draft" : "Product published to the shop");
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const discount = (v: VariantRow) => {
    const p = Number(v.price), m = Number(v.mrp);
    return m > 0 && p > 0 && m > p ? `${Math.round(((m - p) / m) * 100)}%` : "—";
  };

  return (
    <div className="space-y-5">
      <Section title="Basic information">
        <div className="grid gap-4 md:grid-cols-2">
          <L label="Product name *"><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></L>
          <L label="URL slug *">
            <Input value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} />
          </L>
          <L label="SKU"><Input value={f.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. KE-OUD-01" /></L>
          <L label="Brand"><Input value={f.brand} onChange={(e) => set("brand", e.target.value)} /></L>
          <L label="Product type">
            <select className={field} value={f.kind} onChange={(e) => set("kind", e.target.value)}>
              {KINDS.map((k) => <option key={k.v} value={k.v}>{k.l}</option>)}
            </select>
          </L>
          <L label="Category">
            <select className={field} value={f.category_id} onChange={(e) => set("category_id", e.target.value)}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </L>
          <L label="Collection">
            <select className={field} value={f.collection_id} onChange={(e) => set("collection_id", e.target.value)}>
              <option value="">— None —</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </L>
          <L label="Gender">
            <select className={field} value={f.gender} onChange={(e) => set("gender", e.target.value)}>
              {["Unisex", "Men", "Women"].map((g) => <option key={g}>{g}</option>)}
            </select>
          </L>
          <L label="Short description" className="md:col-span-2">
            <Input value={f.short_description} onChange={(e) => set("short_description", e.target.value)} />
          </L>
          <L label="Full description" className="md:col-span-2">
            <textarea rows={4} className={field} value={f.description} onChange={(e) => set("description", e.target.value)} />
          </L>
        </div>
      </Section>

      <Section title="Product images">
        <p className="mb-3 text-xs text-muted-foreground">The first image is the main product image. Use the arrows to reorder.</p>
        <div className="flex flex-wrap gap-3">
          {media.map((m, i) => (
            <div key={m.url} className="relative h-28 w-28 overflow-hidden rounded-md border border-border/60 bg-background">
              {m.preview ? <img src={m.preview} alt="" className="h-full w-full object-cover" /> : null}
              {i === 0 && <span className="absolute left-1 top-1 rounded bg-primary px-1.5 text-[0.6rem] text-primary-foreground">MAIN</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-background/80 p-1">
                <button type="button" aria-label="Move left" onClick={() => move(i, -1)}><ArrowUp className="h-3.5 w-3.5 -rotate-90" /></button>
                <button type="button" aria-label="Remove image" onClick={() => setMedia((x) => x.filter((_, j) => j !== i))}><X className="h-3.5 w-3.5 text-destructive" /></button>
                <button type="button" aria-label="Move right" onClick={() => move(i, 1)}><ArrowDown className="h-3.5 w-3.5 -rotate-90" /></button>
              </div>
            </div>
          ))}
          <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-primary/50 text-xs text-primary hover:bg-primary/10">
            <ImagePlus className="h-5 w-5" />
            {uploading ? "Uploading…" : "Add images"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
      </Section>

      <Section title="Fragrance details">
        <div className="grid gap-4 md:grid-cols-2">
          <L label="Fragrance family"><Input value={f.family} onChange={(e) => set("family", e.target.value)} placeholder="Woody, Oriental…" /></L>
          <L label="Concentration"><Input value={f.concentration} onChange={(e) => set("concentration", e.target.value)} placeholder="Eau de Parfum, Attar Oil…" /></L>
          <L label="Occasion (comma separated)" className="md:col-span-2"><Input value={f.occasions} onChange={(e) => set("occasions", e.target.value)} /></L>
          <L label="Top notes"><Input value={f.top} onChange={(e) => set("top", e.target.value)} placeholder="Bergamot, Saffron" /></L>
          <L label="Heart notes"><Input value={f.heart} onChange={(e) => set("heart", e.target.value)} /></L>
          <L label="Base notes" className="md:col-span-2"><Input value={f.base} onChange={(e) => set("base", e.target.value)} /></L>
        </div>
      </Section>

      <Section title="Sizes & pricing">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-2">Size / volume *</th><th className="p-2">SKU</th><th className="p-2">MRP ₹</th>
                <th className="p-2">Selling ₹ *</th><th className="p-2">Discount</th><th className="p-2">Stock</th><th />
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => {
                const up = (k: keyof VariantRow, val: string) => setVariants((rows) => rows.map((r, j) => (j === i ? { ...r, [k]: val } : r)));
                return (
                  <tr key={i}>
                    <td className="p-1"><Input value={v.label} onChange={(e) => up("label", e.target.value)} /></td>
                    <td className="p-1"><Input value={v.sku} onChange={(e) => up("sku", e.target.value)} /></td>
                    <td className="p-1"><Input type="number" min={0} value={v.mrp} onChange={(e) => up("mrp", e.target.value)} /></td>
                    <td className="p-1"><Input type="number" min={0} value={v.price} onChange={(e) => up("price", e.target.value)} /></td>
                    <td className="p-2 text-primary">{discount(v)}</td>
                    <td className="p-1"><Input type="number" min={0} value={v.stock} onChange={(e) => up("stock", e.target.value)} /></td>
                    <td className="p-1">
                      <Button type="button" variant="ghost" size="icon" aria-label="Remove size" disabled={variants.length === 1}
                        onClick={() => setVariants((rows) => rows.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-3"
          onClick={() => setVariants((r) => [...r, { label: "", sku: "", price: "", mrp: "", stock: "0" }])}>
          <Plus className="mr-1 h-4 w-4" /> Add size
        </Button>
      </Section>

      <Section title="Shipping">
        <div className="grid gap-4 sm:grid-cols-4">
          <L label="Weight (g)"><Input type="number" min={0} value={f.weight_grams} onChange={(e) => set("weight_grams", e.target.value)} /></L>
          <L label="Length (cm)"><Input type="number" min={0} value={f.length_cm} onChange={(e) => set("length_cm", e.target.value)} /></L>
          <L label="Width (cm)"><Input type="number" min={0} value={f.width_cm} onChange={(e) => set("width_cm", e.target.value)} /></L>
          <L label="Height (cm)"><Input type="number" min={0} value={f.height_cm} onChange={(e) => set("height_cm", e.target.value)} /></L>
        </div>
      </Section>

      <Section title="Status">
        <div className="flex flex-wrap items-center gap-3">
          <select aria-label="Publish status" className={`${field} w-auto`} value={f.status} onChange={(e) => set("status", e.target.value)}>
            <option value="draft">Draft (hidden from shop)</option>
            <option value="active">Active</option>
            <option value="out_of_stock">Out of Stock (visible, can't be bought)</option>
          </select>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={onDone} disabled={saving}>Cancel</Button>
            <Button variant="outline" onClick={() => submit("draft")} disabled={saving || uploading}>Save Draft</Button>
            <Button onClick={() => submit(f.status === "draft" ? "active" : f.status)} disabled={saving || uploading}>
              {saving ? "Saving…" : "Publish Product"}
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
