import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { Plus, Pencil, Trash2, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { listExpenses, saveExpense, deleteExpense, type Expense, type ExpenseInput } from '@/lib/finance.functions';
import { EXPENSE_CATEGORIES, EXPENSE_METHODS, indiaDay, money } from '@/lib/finance';
export const Route = createFileRoute('/admin/expenses')({ ssr:false, head:()=>({meta:[{title:'Expense Tracker | K ESSENCE Admin'},{name:'description',content:'K ESSENCE business expense records and category totals.'},{property:'og:title',content:'Expense Tracker | K ESSENCE'},{property:'og:description',content:'Private business expense records.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}), component:Expenses });
const blank = (): ExpenseInput => ({expense_date:indiaDay(),category:'Other',amount:0,payment_method:'cash',vendor:'',description:'',receipt_path:null});
const selectClass='h-9 rounded-md border border-input bg-background px-3 text-sm';
function Expenses() {
  const fetcher=useServerFn(listExpenses), save=useServerFn(saveExpense), remove=useServerFn(deleteExpense); const cache=useQueryClient();
  const query=useQuery({queryKey:['admin-expenses'],queryFn:()=>fetcher()}); const rows=query.data ?? [];
  const [form,setForm]=useState<ExpenseInput|null>(null), [file,setFile]=useState<File|null>(null), [busy,setBusy]=useState(false), [deleting,setDeleting]=useState<Expense|null>(null);
  const [category,setCategory]=useState('all'); const visible=rows.filter(r=>category==='all'||r.category===category);
  const refresh=async()=>{await cache.invalidateQueries({queryKey:['admin-expenses']}); await cache.invalidateQueries({queryKey:['admin-finance']});};
  async function submit(e:React.FormEvent) {
    e.preventDefault(); if(!form) return; setBusy(true); let uploaded:string|null=null;
    try {
      let path=form.receipt_path;
      if(file) {
        const extensions:Record<string,string>={'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
        const ext=extensions[file.type]; if(!ext || file.size>8*1024*1024) throw new Error('Choose a PDF, JPG, PNG or WebP receipt under 8 MB');
        path=`receipts/${crypto.randomUUID()}.${ext}`;
        const {error}=await supabase.storage.from('expense-receipts').upload(path,file,{contentType:file.type}); if(error) throw error; uploaded=path;
      }
      await save({data:{...form,receipt_path:path}}); await refresh(); setForm(null); setFile(null); toast.success('Expense saved');
    } catch(e) { if(uploaded) await supabase.storage.from('expense-receipts').remove([uploaded]); toast.error(e instanceof Error?e.message:'Could not save expense'); } finally { setBusy(false); }
  }
  async function receipt(path:string) {
    const {data,error}=await supabase.storage.from('expense-receipts').createSignedUrl(path,300); if(error) toast.error(error.message); else if(data) window.open(data.signedUrl,'_blank','noopener,noreferrer');
  }
  async function confirmDelete() { if(!deleting)return; setBusy(true); try { await remove({data:{id:deleting.id}}); await refresh(); setDeleting(null); toast.success('Expense deleted'); } catch(e) {toast.error(e instanceof Error?e.message:'Could not delete');} finally {setBusy(false);} }
  return <div>
    <AdminPageHeader title="Expense Tracker" action={<Button onClick={()=>{setForm(blank());setFile(null);}}><Plus/>Add expense</Button>}/>
    <div className="mb-6 border-b border-border pb-5"><p className="text-sm text-muted-foreground">Total expenses · All dates</p><p className="mt-2 font-serif text-3xl">{money(rows.reduce((s,r)=>s+Number(r.amount),0))}</p></div>
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">{EXPENSE_CATEGORIES.map(c=><div className="border-l-2 border-primary/40 pl-3" key={c}><p className="text-xs text-muted-foreground">{c}</p><p>{money(rows.filter(r=>r.category===c).reduce((s,r)=>s+Number(r.amount),0))}</p></div>)}</div>
    <label className="mb-4 flex items-center gap-3 text-sm">Category<select className={selectClass} value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
    {query.isError && <p className="text-destructive">{query.error.message}</p>}
    {query.isLoading ? <p>Loading expenses…</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-muted-foreground"><tr>{['Date','Category','Amount','Payment','Vendor','Description','Actions'].map(h=><th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{visible.map(r=><tr key={r.id} className="border-t border-border"><td className="whitespace-nowrap p-3">{r.expense_date}</td><td className="p-3">{r.category}</td><td className="whitespace-nowrap p-3">{money(Number(r.amount))}</td><td className="p-3 capitalize">{r.payment_method.replace('_',' ')}</td><td className="p-3">{r.vendor||'—'}</td><td className="max-w-64 break-words p-3">{r.description||'—'}</td><td className="p-3"><div className="flex gap-1">{r.receipt_path&&<Button variant="ghost" size="icon" title="View receipt" aria-label="View receipt" onClick={()=>receipt(r.receipt_path ?? '')}><FileText/></Button>}<Button variant="ghost" size="icon" title="Edit expense" aria-label="Edit expense" onClick={()=>{setForm({...r,amount:Number(r.amount)});setFile(null);}}><Pencil/></Button><Button variant="ghost" size="icon" title="Delete expense" aria-label="Delete expense" onClick={()=>setDeleting(r)}><Trash2/></Button></div></td></tr>)}</tbody></table>{!visible.length&&<p className="py-8 text-center text-muted-foreground">No expenses recorded.</p>}</div>}
    <Dialog open={Boolean(form)} onOpenChange={open=>{if(!open&&!busy)setForm(null);}}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{form?.id?'Edit expense':'Add expense'}</DialogTitle></DialogHeader>{form&&<form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4"><label className="space-y-1 text-sm">Date<Input type="date" required value={form.expense_date} onChange={e=>setForm({...form,expense_date:e.target.value})}/></label><label className="space-y-1 text-sm">Amount (INR)<Input type="number" min="0.01" step="0.01" required value={form.amount||''} onChange={e=>setForm({...form,amount:Number(e.target.value)})}/></label></div>
      <div className="grid grid-cols-2 gap-4"><label className="flex flex-col gap-1 text-sm">Category<select className={selectClass} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label><label className="flex flex-col gap-1 text-sm">Payment method<select className={selectClass} value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}>{EXPENSE_METHODS.map(m=><option value={m} key={m}>{m.replace('_',' ')}</option>)}</select></label></div>
      <label className="block space-y-1 text-sm">Vendor<Input value={form.vendor} maxLength={300} onChange={e=>setForm({...form,vendor:e.target.value})}/></label><label className="block space-y-1 text-sm">Description<textarea className="min-h-20 w-full rounded-md border border-input bg-background p-3" maxLength={3000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      <label className="block space-y-1 text-sm">Receipt (optional)<Input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e=>setFile(e.target.files?.[0]??null)}/></label>{form.receipt_path&&<div className="flex items-center gap-2 text-sm">Receipt attached<Button type="button" variant="ghost" size="icon" aria-label="Remove receipt" onClick={()=>setForm({...form,receipt_path:null})}><X/></Button></div>}
      <Button disabled={busy} type="submit" className="w-full">{busy?'Saving…':'Save expense'}</Button>
    </form>}</DialogContent></Dialog>
    <Dialog open={Boolean(deleting)} onOpenChange={open=>{if(!open&&!busy)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle>Delete expense?</DialogTitle></DialogHeader><p>{deleting?.category} · {money(Number(deleting?.amount??0))}</p><div className="flex justify-end gap-2"><Button variant="outline" disabled={busy} onClick={()=>setDeleting(null)}>Cancel</Button><Button variant="destructive" disabled={busy} onClick={confirmDelete}>Delete expense</Button></div></DialogContent></Dialog>
  </div>;
}