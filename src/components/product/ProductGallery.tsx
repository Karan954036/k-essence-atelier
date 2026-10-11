import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Product3DViewer } from "@/components/product/Product3DViewer";
import type { CatalogProduct } from "@/lib/catalog";

export function ProductGallery({ product }: { product: CatalogProduct }) {
  const [selected, setSelected] = useState(0);
  const [view3d, setView3d] = useState(false);
  const image = product.images[selected] ?? product.images[0];
  return <div>
    {image && !view3d ? <div className="aspect-4/5 bg-card/40"><img src={image.url} alt={image.alt || product.name} className="h-full w-full object-contain" /></div> :
      <Product3DViewer name={product.name} tint={product.tint} modelUrl={product.modelUrl} badge={product.badge} family={product.family} />}
    {product.images.length > 0 && <div className="mt-3 flex flex-wrap gap-2">
      {product.images.map((m, i) => <Button key={m.url} variant="outline" className="h-16 w-14 p-1" aria-label={`Photo ${i + 1} of ${product.name}`} aria-pressed={!view3d && selected === i} onClick={() => { setSelected(i); setView3d(false); }}><img src={m.url} alt="" className="h-full w-full object-contain" /></Button>)}
      {product.modelUrl && <Button variant="outline" onClick={() => setView3d(true)}>3D view</Button>}
    </div>}
  </div>;
}