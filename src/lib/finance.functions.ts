import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { EXPENSE_CATEGORIES, EXPENSE_METHODS, validateRange, summarizeFinance, type FinancePayment } from './finance';
import type { Database } from '@/integrations/supabase/types';
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInput = { id?: string; expense_date: string; category: string; amount: number; payment_method: string; vendor: string; description: string; receipt_path: string | null };
async function verify(context: { supabase: any }) {
  const { data, error } = await context.supabase.rpc('is_admin');
  if (error || !data) throw new Error('Admin access required');
}
export const listExpenses = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await verify(context); const rows: Expense[] = [];
  for (let offset=0;;offset+=500) {
    const {data,error}=await context.supabase.from('expenses').select('*').order('expense_date',{ascending:false}).order('id').range(offset,offset+499);
    if(error) throw new Error(error.message); rows.push(...(data ?? [])); if ((data?.length ?? 0)<500) break;
  }
  return rows;
});
export const saveExpense = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((i: ExpenseInput) => {
  validateRange({from:i.expense_date,to:i.expense_date});
  if (!(EXPENSE_CATEGORIES as readonly string[]).includes(i.category) || !(EXPENSE_METHODS as readonly string[]).includes(i.payment_method)) throw new Error('Choose a valid category and payment method');
  if (!Number.isFinite(i.amount) || i.amount <= 0 || i.amount > 9999999999.99) throw new Error('Enter a positive expense amount');
  if (i.receipt_path && !/^receipts\/[a-f0-9-]+\.(pdf|png|jpg|jpeg|webp)$/.test(i.receipt_path)) throw new Error('Invalid receipt');
  return { ...i, amount: Math.round(i.amount*100)/100, vendor: i.vendor.trim().slice(0,300), description: i.description.trim().slice(0,3000) };
}).handler(async ({data,context}) => {
  await verify(context); const {id,...fields}=data;
  const result = id ? await context.supabase.from('expenses').update(fields).eq('id',id).select('id').single() : await context.supabase.from('expenses').insert({...fields,created_by:context.userId}).select('id').single();
  if(result.error) throw new Error(result.error.message); return result.data;
});
export const deleteExpense = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((i:{id:string})=>i).handler(async({data,context})=> {
  await verify(context); const {error}=await context.supabase.from('expenses').delete().eq('id',data.id); if(error) throw new Error(error.message); return {ok:true};
});
export const getFinance = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).inputValidator(validateRange).handler(async({data,context})=> {
  await verify(context); const payments: FinancePayment[]=[]; const expenses: {expense_date:string;amount:number}[]=[];
  // Include earlier collections so duplicate payment rows cannot inflate later periods.
  for(let offset=0;;offset+=500) {
    const result=await context.supabase.from('payments').select('id,order_id,status,amount,paid_at,orders(status,total)').eq('status','paid').lte('paid_at',`${data.to}T23:59:59.999+05:30`).order('id').range(offset,offset+499);
    if(result.error) throw new Error(result.error.message); payments.push(...(result.data ?? []) as FinancePayment[]); if((result.data?.length ?? 0)<500) break;
  }
  for(let offset=0;;offset+=500) {
    const result=await context.supabase.from('expenses').select('expense_date,amount').gte('expense_date',data.from).lte('expense_date',data.to).order('id').range(offset,offset+499);
    if(result.error) throw new Error(result.error.message); expenses.push(...(result.data ?? [])); if((result.data?.length ?? 0)<500) break;
  }
  return summarizeFinance(data.from,data.to,payments,expenses);
});