CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  kind text NOT NULL DEFAULT 'perfume',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly viewable" ON public.categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  tagline text,
  tint text NOT NULL DEFAULT '#3a2416',
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collections are publicly viewable" ON public.collections FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'perfume',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
  family text,
  badge text,
  description text,
  tint text NOT NULL DEFAULT '#3a2416',
  model_url text,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  mrp numeric(10,2) NOT NULL DEFAULT 0,
  price numeric(10,2) NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_demo boolean NOT NULL DEFAULT false,
  longevity int NOT NULL DEFAULT 0,
  sillage int NOT NULL DEFAULT 0,
  projection int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products are publicly viewable" ON public.products FOR SELECT TO anon, authenticated USING (is_active);

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label text NOT NULL,
  sku text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  mrp numeric(10,2) NOT NULL DEFAULT 0,
  stock int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Variants of active products are publicly viewable" ON public.product_variants FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active));

CREATE TABLE public.product_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  layer text NOT NULL,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.product_notes TO anon, authenticated;
GRANT ALL ON public.product_notes TO service_role;
ALTER TABLE public.product_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notes of active products are publicly viewable" ON public.product_notes FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active));

CREATE TABLE public.product_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  kind text NOT NULL DEFAULT 'image',
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.product_media TO anon, authenticated;
GRANT ALL ON public.product_media TO service_role;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media of active products are publicly viewable" ON public.product_media FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active));

INSERT INTO public.collections (slug, title, tagline, tint, is_featured, sort_order) VALUES
  ('royal-collection', 'Royal Collection', 'Regal oud, saffron and rose', '#3a2416', true, 1),
  ('signature-attars', 'Signature Attars', 'Alcohol-free, traditionally blended', '#5d4630', true, 2),
  ('oud-collection', 'The Oud Collection', 'Deep, resinous, unmistakable', '#2b1a10', true, 3),
  ('luxury-perfumes', 'Luxury Perfumes', 'Modern eau de parfum, long lasting', '#4a2c12', true, 4);

INSERT INTO public.categories (slug, name, kind, sort_order) VALUES
  ('luxury-attar', 'Luxury Attar', 'attar', 1),
  ('traditional-attar', 'Traditional Attar', 'attar', 2),
  ('premium-attar', 'Premium Attar', 'attar', 3),
  ('oud-collection', 'Oud Collection', 'attar', 4),
  ('signature-perfume', 'Signature Perfume', 'perfume', 5),
  ('floral-perfume', 'Floral Perfume', 'perfume', 6),
  ('everyday-perfume', 'Everyday Perfume', 'perfume', 7),
  ('luxury-perfume', 'Luxury Perfume', 'perfume', 8);

INSERT INTO public.products (slug, name, kind, category_id, collection_id, family, badge, description, tint, rating, review_count, mrp, price, in_stock, is_demo, longevity, sillage, projection, sort_order) VALUES
  ('royal-oud', 'Royal Oud', 'attar', (SELECT id FROM public.categories WHERE slug='luxury-attar'), (SELECT id FROM public.collections WHERE slug='royal-collection'), 'Woody', 'BEST SELLER', 'Demo placeholder product. A regal woody attar built around oud, saffron and rose.', '#3a2416', 4.8, 124, 1699, 1299, true, true, 9, 8, 8, 1),
  ('amber-noir', 'Amber Noir', 'perfume', (SELECT id FROM public.categories WHERE slug='signature-perfume'), (SELECT id FROM public.collections WHERE slug='luxury-perfumes'), 'Amber', 'TRENDING', 'Demo placeholder product. Warm amber and vanilla over cedar.', '#4a2c12', 4.7, 96, 2499, 1899, true, true, 8, 8, 7, 2),
  ('sandal-musk', 'Sandal Musk', 'attar', (SELECT id FROM public.categories WHERE slug='traditional-attar'), (SELECT id FROM public.collections WHERE slug='signature-attars'), 'Musky', 'NEW', 'Demo placeholder product. Soft sandalwood and white musk.', '#5d4630', 4.6, 61, 1299, 999, true, true, 8, 6, 6, 3),
  ('oud-royale', 'Oud Royale', 'attar', (SELECT id FROM public.categories WHERE slug='premium-attar'), (SELECT id FROM public.collections WHERE slug='oud-collection'), 'Oriental', 'EXCLUSIVE', 'Demo placeholder product. Deep oud with saffron and sandalwood.', '#2b1a10', 4.9, 152, 3899, 2999, true, true, 10, 9, 9, 4),
  ('royal-rose', 'Royal Rose', 'perfume', (SELECT id FROM public.categories WHERE slug='floral-perfume'), (SELECT id FROM public.collections WHERE slug='royal-collection'), 'Floral', 'BEST SELLER', 'Demo placeholder product. Damask rose and peony on musk.', '#5a2231', 4.7, 88, 2199, 1699, true, true, 7, 7, 7, 5),
  ('musk-noir', 'Musk Noir', 'perfume', (SELECT id FROM public.categories WHERE slug='everyday-perfume'), (SELECT id FROM public.collections WHERE slug='luxury-perfumes'), 'Musky', 'SALE', 'Demo placeholder product. Crisp musk for daily wear.', '#232326', 4.5, 74, 1799, 1199, true, true, 7, 6, 6, 6),
  ('saffron-oud', 'Saffron Oud', 'attar', (SELECT id FROM public.categories WHERE slug='oud-collection'), (SELECT id FROM public.collections WHERE slug='oud-collection'), 'Spicy', 'LIMITED', 'Demo placeholder product. Saffron, leather and oud.', '#6b3a12', 4.8, 43, 3299, 2599, false, true, 9, 9, 8, 7),
  ('velvet-amber', 'Velvet Amber', 'perfume', (SELECT id FROM public.categories WHERE slug='luxury-perfume'), (SELECT id FROM public.collections WHERE slug='luxury-perfumes'), 'Gourmand', 'NEW', 'Demo placeholder product. Tonka, amber and vanilla orchid.', '#4d3418', 4.6, 37, 2899, 2299, true, true, 8, 7, 7, 8);

INSERT INTO public.product_variants (product_id, label, price, mrp, stock, sort_order)
SELECT p.id, v.label, v.price, v.mrp, v.stock, v.sort_order FROM public.products p
JOIN (VALUES
  ('royal-oud','10ml',1299,1699,25,1),('royal-oud','20ml',2199,2899,18,2),
  ('amber-noir','50ml',1899,2499,20,1),('amber-noir','100ml',2999,3899,12,2),
  ('sandal-musk','10ml',999,1299,30,1),('sandal-musk','20ml',1699,2199,16,2),
  ('oud-royale','10ml',2999,3899,10,1),('oud-royale','20ml',4999,6499,6,2),
  ('royal-rose','50ml',1699,2199,22,1),('royal-rose','100ml',2699,3499,14,2),
  ('musk-noir','50ml',1199,1799,26,1),('musk-noir','100ml',1999,2799,15,2),
  ('saffron-oud','10ml',2599,3299,0,1),('saffron-oud','20ml',4299,5499,0,2),
  ('velvet-amber','50ml',2299,2899,19,1),('velvet-amber','100ml',3599,4499,9,2)
) AS v(slug,label,price,mrp,stock,sort_order) ON v.slug = p.slug;

INSERT INTO public.product_notes (product_id, layer, name, sort_order)
SELECT p.id, n.layer, n.name, n.sort_order FROM public.products p
JOIN (VALUES
  ('royal-oud','top','Bergamot',1),('royal-oud','top','Saffron',2),('royal-oud','heart','Rose',1),('royal-oud','heart','Oud',2),('royal-oud','base','Musk',1),('royal-oud','base','Amber',2),
  ('amber-noir','top','Cardamom',1),('amber-noir','top','Bergamot',2),('amber-noir','heart','Amber',1),('amber-noir','heart','Jasmine',2),('amber-noir','base','Vanilla',1),('amber-noir','base','Cedar',2),
  ('sandal-musk','top','Sandalwood',1),('sandal-musk','heart','White Musk',1),('sandal-musk','base','Patchouli',1),('sandal-musk','base','Amber',2),
  ('oud-royale','top','Saffron',1),('oud-royale','top','Nutmeg',2),('oud-royale','heart','Oud',1),('oud-royale','heart','Rose',2),('oud-royale','base','Sandalwood',1),('oud-royale','base','Musk',2),
  ('royal-rose','top','Litchi',1),('royal-rose','top','Bergamot',2),('royal-rose','heart','Damask Rose',1),('royal-rose','heart','Peony',2),('royal-rose','base','Musk',1),('royal-rose','base','Cedar',2),
  ('musk-noir','top','Green Apple',1),('musk-noir','heart','White Musk',1),('musk-noir','heart','Iris',2),('musk-noir','base','Vetiver',1),('musk-noir','base','Amber',2),
  ('saffron-oud','top','Saffron',1),('saffron-oud','top','Pink Pepper',2),('saffron-oud','heart','Oud',1),('saffron-oud','heart','Leather',2),('saffron-oud','base','Amber',1),('saffron-oud','base','Musk',2),
  ('velvet-amber','top','Tonka',1),('velvet-amber','top','Bergamot',2),('velvet-amber','heart','Amber',1),('velvet-amber','heart','Vanilla Orchid',2),('velvet-amber','base','Benzoin',1),('velvet-amber','base','Sandalwood',2)
) AS n(slug,layer,name,sort_order) ON n.slug = p.slug;