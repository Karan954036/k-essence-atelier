import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  try {
    const ts = Date.now().toString();
    console.log('Running admin DB smoke tests...');

    // Category
    const cat = { name: 'Test Cat ' + ts, slug: 'test-cat-' + ts };
    const { data: catRes, error: catErr } = await supabase.from('categories').insert(cat).select('*').single();
    if (catErr) throw catErr;
    console.log('Inserted category id=', catRes.id);

    // Product
    const prod = { name: 'Test Product ' + ts, slug: 'test-product-' + ts, category_id: catRes.id, price: 99.99, mrp: 129.99 };
    const { data: prodRes, error: prodErr } = await supabase.from('products').insert(prod).select('*').single();
    if (prodErr) throw prodErr;
    console.log('Inserted product id=', prodRes.id);

    // Variant
    const variant = { product_id: prodRes.id, label: 'Default', price: 99.99, mrp: 129.99, stock: 10 };
    const { data: varRes, error: varErr } = await supabase.from('product_variants').insert(variant).select('*').single();
    if (varErr) throw varErr;
    console.log('Inserted variant id=', varRes.id, 'stock=', varRes.stock);

    // List products
    const { data: listProds, error: listProdsErr } = await supabase.from('products').select('id, name, slug');
    if (listProdsErr) throw listProdsErr;
    console.log('Products count=', listProds.length);

    // Update product
    const { error: updErr } = await supabase.from('products').update({ name: prod.name + ' (updated)' }).eq('id', prodRes.id);
    if (updErr) throw updErr;
    console.log('Updated product name');

    // Delete product
    const { error: delErr } = await supabase.from('products').delete().eq('id', prodRes.id);
    if (delErr) throw delErr;
    console.log('Deleted product id=', prodRes.id);

    // Recreate product and variant for order test
    const { data: prodRes2 } = await supabase.from('products').insert(prod).select('*').single();
    const { data: varRes2 } = await supabase.from('product_variants').insert({ product_id: prodRes2.id, label: 'Default', price: 99.99, mrp: 129.99, stock: 5 }).select('*').single();

    // Create order
    const order = {
      order_number: 'TEST-' + ts,
      user_id: null,
      status: 'pending',
      payment_status: 'unpaid',
      total: 99.99,
      customer_name: 'Test Customer',
      customer_email: 'test+' + ts + '@example.com',
      customer_phone: '0000000000',
      shipping_address: 'Test Address',
    };
    const { data: orderRes, error: orderErr } = await supabase.from('orders').insert(order).select('*').single();
    if (orderErr) throw orderErr;
    console.log('Inserted order id=', orderRes.id);

    // Create order item
    const item = { order_id: orderRes.id, product_id: prodRes2.id, variant_id: varRes2.id, product_name: prodRes2.name, variant_label: varRes2.label, unit_price: varRes2.price, quantity: 1 };
    const { data: itemRes, error: itemErr } = await supabase.from('order_items').insert(item).select('*').single();
    if (itemErr) throw itemErr;
    console.log('Inserted order item id=', itemRes.id);

    // Reduce stock properly and log stock movement
    const { data: curVar, error: curErr } = await supabase.from('product_variants').select('stock').eq('id', varRes2.id).maybeSingle();
    if (curErr) throw curErr;
    const currentStock = Number(curVar.stock ?? 0);
    const resulting = currentStock - 1;
    const { error: updateStockErr } = await supabase.from('product_variants').update({ stock: resulting }).eq('id', varRes2.id);
    if (updateStockErr) throw updateStockErr;
    const { error: smErr } = await supabase.from('stock_movements').insert({ variant_id: varRes2.id, change: -1, resulting_stock: resulting, reason: 'sale', created_by: null });
    if (smErr) throw smErr;
    console.log('Stock reduced to', resulting);

    // Fetch orders to confirm
    const { data: ordersList, error: ordersErr } = await supabase.from('orders').select('id, order_number, total, status');
    if (ordersErr) throw ordersErr;
    console.log('Orders count after insert=', ordersList.length);

    console.log('All tests completed successfully.');
  } catch (e) {
    console.error('Test failed:', e.message || e);
    process.exit(1);
  }
}

run();
