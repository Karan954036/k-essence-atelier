import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";

/** Uploads one image to the private product-images bucket and returns its storage path. */
export async function uploadProductImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image`);
  if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name} is larger than 8 MB`);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return path;
}

const isExternal = (u: string) => /^https?:\/\//i.test(u);

/** Turns stored media references (storage paths or full URLs) into displayable URLs. */
export async function resolveMediaUrls(refs: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const paths = refs.filter((r) => r && !isExternal(r));
  for (const r of refs) if (isExternal(r)) out[r] = r;
  if (paths.length) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
    for (const d of data ?? []) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  }
  return out;
}
