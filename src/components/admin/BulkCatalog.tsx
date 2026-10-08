import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { bulkImportProducts, validateProductInput } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

type Option = { id: string; name: string; slug?: string };

const COLUMNS = [
  "sku", "name", "kind", "category", "collection", "brand", "gender", "occasions", "family",
  "concentration", "top_notes", "heart_notes", "base_notes", "short_description", "description",
  "variant_label", "mrp", "price", "stock", "weight_grams", "status", "image_urls",
];

const SAMPLE = [
  ["KE-SAMPLE-01", "Sample Oud", "perfume", "", "", "K ESSENCE", "Unisex", "Evening|Festive", "Woody", "Eau de Parfum", "Saffron|Bergamot", "Oud|Rose", "Amber|Musk", "Short line", "Full description", "50ml", "2499", "1999", "10", "350", "draft", ""],
  ["KE-SAMPLE-01", "Sample Oud", "perfume", "", "", "", "", "", "", "", "", "", "", "", "", "100ml", "3999", "3299", "5", "", "", ""],
];

function csvEscape(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Minimal RFC-4180 parser (quoted fields, escaped quotes, CRLF). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

type Parsed = { key: string; line: string; data?: any; error?: string };

export function BulkCatalog({ categories, collections, onDone }: { categories: Option[]; collections: Option[]; onDone: () => void }) {
  const importFn = useServerFn(bulkImportProducts);
  const [parsed, setParsed] = useState<Parsed[]>([]);
  const [results, setResults] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);

  function downloadTemplate() {
    const csv = [COLUMNS, ...SAMPLE].map((r) => r.map(csvEscape).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "k-essence-product-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const findId = (list: Option[], v: string) => {
    const s = v.trim().toLowerCase();
    if (!s) return { id: null as string | null };
    const hit = list.find((o) => o.name.toLowerCase() === s || o.slug?.toLowerCase() === s);
    return hit ? { id: hit.id } : { error: `Unknown "${v}"` };
  };

  async function onFile(file: File | undefined) {
    if (!file) return;
    setResults(null);
    const rows = parseCsv(await file.text());
    const header = (rows.shift() ?? []).map((h) => h.trim().toLowerCase());
    const missing = ["sku", "name", "variant_label", "price"].filter((c) => !header.includes(c));
    if (missing.length) {
      toast.error(`CSV is missing columns: ${missing.join(", ")}`);
      setParsed([]);
      return;
    }
    // Group rows by SKU: one product, one row per size.
    const groups = new Map<string, { lines: number[]; rows: Record<string, string>[] }>();
    rows.forEach((r, i) => {
      const obj: Record<string, string> = {};
      header.forEach((h, j) => (obj[h] = (r[j] ?? "").trim()));
      const key = obj["sku"] || `__row${i}`;
      const g = groups.get(key) ?? { lines: [], rows: [] };
      g.lines.push(i + 2);
      g.rows.push(obj);
      groups.set(key, g);
    });
    const out: Parsed[] = [];
    for (const [key, g] of groups) {
      const h = g.rows[0]!;
      const line = g.lines.join(", ");
      try {
        if (!h["sku"]) throw new Error("SKU is required");
        const cat = findId(categories, h["category"] ?? "");
        if ("error" in cat) throw new Error(`Category: ${cat.error}`);
        const col = findId(collections, h["collection"] ?? "");
        if ("error" in col) throw new Error(`Collection: ${col.error}`);
        const status = (h["status"] || "draft").toLowerCase().replace(/\s+/g, "_");
        const data = validateProductInput({
          sku: h["sku"], name: h["name"], kind: (h["kind"] || "perfume").toLowerCase(),
          category_id: cat.id, collection_id: col.id, brand: h["brand"], gender: h["gender"] || "Unisex",
          occasions: h["occasions"], family: h["family"], concentration: h["concentration"],
          short_description: h["short_description"], description: h["description"],
          weight_grams: h["weight_grams"], status,
          notes: { top: h["top_notes"], heart: h["heart_notes"], base: h["base_notes"] },
          variants: g.rows.map((r) => ({ label: r["variant_label"], price: r["price"], mrp: r["mrp"] || r["price"], stock: r["stock"] || 0 })),
          media: g.rows.flatMap((r) => (r["image_urls"] ?? "").split("|")).map((u) => u.trim()).filter(Boolean).map((url) => {
            if (!/^https:\/\//i.test(url)) throw new Error(`Image URL must start with https://: ${url}`);
            return { url };
          }),
        });
        out.push({ key, line, data });
      } catch (e) {
        out.push({ key, line, error: (e as Error).message });
      }
    }
    // Duplicate SKUs inside the file itself are already merged; flag duplicate slugs.
    const slugs = new Set<string>();
    for (const p of out) {
      if (!p.data) continue;
      if (slugs.has(p.data.slug)) { p.error = "Another row in this file has the same product name/slug"; delete p.data; }
      else slugs.add(p.data.slug);
    }
    setParsed(out);
  }

  const valid = parsed.filter((p) => p.data);

  async function runImport() {
    setBusy(true);
    try {
      const res = await importFn({ data: { products: valid.map((p) => p.data) } });
      setResults(res.results);
      const created = res.results.filter((r: any) => r.status === "created").length;
      toast.success(`${created} product${created === 1 ? "" : "s"} imported`);
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border/60 bg-card/40 p-5">
        <h3 className="font-serif text-lg text-primary">Bulk catalog upload</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Download the template. Use one row per size; rows with the same SKU become one product.</li>
          <li>Separate multiple notes, occasions or image links with "|". Images must be https links.</li>
          <li>Status can be draft, active or out_of_stock. Category/collection must match an existing name.</li>
          <li>Products whose SKU already exists are skipped, never duplicated.</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" onClick={downloadTemplate}><Download className="mr-2 h-4 w-4" />Download CSV template</Button>
          <label className="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
            <Upload className="mr-2 h-4 w-4" />Upload completed CSV
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
      </section>

      {parsed.length > 0 && (
        <section className="rounded-lg border border-border/60 bg-card/40 p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="text-primary">{valid.length} ready</span> ·{" "}
              <span className="text-destructive">{parsed.length - valid.length} with errors</span>
            </p>
            <Button disabled={!valid.length || busy} onClick={runImport}>{busy ? "Importing…" : `Import ${valid.length} products`}</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-2">CSV line</th><th className="p-2">SKU</th><th className="p-2">Name</th><th className="p-2">Sizes</th><th className="p-2">Status</th><th className="p-2">Result</th>
              </tr></thead>
              <tbody>
                {parsed.map((p) => {
                  const r = results?.find((x) => x.sku.toLowerCase() === (p.data?.sku ?? "").toLowerCase());
                  return (
                    <tr key={p.key} className="border-t border-border/60">
                      <td className="p-2 text-muted-foreground">{p.line}</td>
                      <td className="p-2 font-mono text-xs">{p.data?.sku ?? (p.key.startsWith("__") ? "—" : p.key)}</td>
                      <td className="p-2">{p.data?.name ?? ""}</td>
                      <td className="p-2">{p.data?.variants.map((v: any) => `${v.label} ₹${v.price}`).join(", ")}</td>
                      <td className="p-2">{p.data?.status ?? ""}</td>
                      <td className="p-2">
                        {p.error ? <span className="text-destructive">{p.error}</span>
                          : r ? <span className={r.status === "created" ? "text-primary" : r.status === "skipped" ? "text-muted-foreground" : "text-destructive"}>
                              {r.status === "created" ? "Imported" : r.status === "skipped" ? `Skipped — ${r.message}` : r.message}
                            </span>
                          : <span className="text-muted-foreground">Ready</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
