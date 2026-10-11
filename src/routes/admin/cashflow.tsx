import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFinance } from '@/lib/finance.functions';
import { dateRange, money } from '@/lib/finance';
export const Route=createFileRoute('/admin/cashflow')({ssr:false,head:()=>({meta:[{title:'Cashflow & P&L | K ESSENCE Admin'},{name:'description',content:'Collected revenue, expenses and cash-basis profit for K ESSENCE.'},{property:'og:title',content:'Cashflow & P&L | K ESSENCE'},{property:'og:description',content:'Private cashflow and profit reporting.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Cashflow});
function Cashflow() {
 const [period,setPeriod]=useState('30'),[range,setRange]=useState(()=>dateRange(30)); const fetcher=useServerFn(getFinance);
 const valid=range.from&&range.to&&range.from<=range.to;
 const query=useQuery({queryKey:['admin-finance',range],queryFn:()=>fetcher({data:range}),enabled:Boolean(valid),refetchOnWindowFocus:true}); const d=query.data;
 return <div><AdminPageHeader title="Cashflow & P&L"/>
 <div className="mb-6 flex flex-wrap items-center gap-2">{[[1,'Today'],[7,'Last 7 Days'],[30,'Last 30 Days'],[60,'Last 60 Days'],[90,'Last 90 Days']].map(([days,label])=><Button size="sm" variant={period===String(days)?'default':'outline'} key={days} onClick={()=>{setPeriod(String(days));setRange(dateRange(Number(days)));}}>{label}</Button>)}<Button size="sm" variant={period==='custom'?'default':'outline'} onClick={()=>setPeriod('custom')}>Custom</Button></div>
 {period==='custom'&&<div className="mb-6 flex flex-wrap gap-4"><label className="text-sm">From<Input type="date" value={range.from} onChange={e=>setRange({...range,from:e.target.value})}/></label><label className="text-sm">To<Input type="date" value={range.to} onChange={e=>setRange({...range,to:e.target.value})}/></label></div>}
 <p className="mb-5 text-sm text-muted-foreground">{range.from} — {range.to} · India time · Cash basis</p>
 {!valid&&<p className="text-destructive">Choose a valid date range.</p>}{query.isError&&<p className="text-destructive">{query.error.message}</p>}
 <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{[{label:'Collected revenue',value:d?money(d.revenue):'—'},{label:'Total expenses',value:d?money(d.expenses):'—'},{label:'Net profit / loss',value:d?money(d.net):'—'},{label:'Profit margin',value:d?(d.margin===null?'N/A':`${d.margin.toFixed(2)}%`):'—'}].map(c=><div key={c.label} className="border-l-2 border-primary/50 pl-4"><p className="text-xs text-muted-foreground">{c.label}</p><p className="mt-2 break-words font-serif text-2xl">{c.value}</p></div>)}</div>
 <p className="mb-6 text-xs text-muted-foreground">Collected revenue counts paid payments on their collection date, capped at each order’s total. Unpaid COD and cancelled or returned orders are excluded. Order value is not cash collected.</p>
 <h2 className="mb-4 font-serif text-xl">Revenue vs expenses</h2><div className="h-80 w-full">{query.isLoading?<p>Loading cashflow…</p>:<ResponsiveContainer width="100%" height="100%"><BarChart data={d?.daily??[]}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3"/><XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11}/><YAxis stroke="var(--muted-foreground)" fontSize={11}/><Tooltip contentStyle={{background:'var(--card)',borderColor:'var(--border)',color:'var(--foreground)'}} formatter={(v:number)=>money(v)}/><Legend/><Bar dataKey="revenue" name="Collected revenue" fill="var(--primary)"/><Bar dataKey="expenses" name="Expenses" fill="var(--muted-foreground)"/></BarChart></ResponsiveContainer>}</div>
 <div className="mt-6 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="p-3">Date</th><th className="p-3">Revenue</th><th className="p-3">Expenses</th><th className="p-3">Net</th></tr></thead><tbody>{[...(d?.daily??[])].reverse().map(r=><tr key={r.day} className="border-t border-border"><td className="p-3">{r.day}</td><td className="p-3">{money(r.revenue)}</td><td className="p-3">{money(r.expenses)}</td><td className="p-3">{money(r.revenue-r.expenses)}</td></tr>)}</tbody></table></div>
 </div>;
}