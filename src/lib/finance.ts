export const EXPENSE_CATEGORIES = ['Manufacturing', 'Raw Materials', 'Packaging', 'Utilities', 'Salaries', 'Shipping', 'Marketing', 'Rent', 'Other'] as const;
export const EXPENSE_METHODS = ['cash', 'upi', 'card', 'bank_transfer', 'other'] as const;
export const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
export function indiaDay(value = new Date().toISOString()) { return new Date(value).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); }
export function dateRange(days: number) {
  const to = indiaDay(); const start = new Date(`${to}T00:00:00Z`); start.setUTCDate(start.getUTCDate() - days + 1);
  return { from: start.toISOString().slice(0,10), to };
}
export function validateRange(input: { from: string; to: string }) {
  for (const value of [input.from, input.to]) if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value) throw new Error('Choose valid dates');
  const days = (Date.parse(input.to) - Date.parse(input.from)) / 86400000;
  if (days < 0 || days > 730) throw new Error('Choose a date range of up to two years');
  return input;
}
export type FinancePayment = { id: string; order_id: string; status: string; amount: number | string; paid_at: string | null; orders: { status: string; total: number | string } | null };
export function summarizeFinance(from: string, to: string, payments: FinancePayment[], expenses: { expense_date: string; amount: number | string }[]) {
  validateRange({from,to});
  const daily: { day: string; revenue: number; expenses: number }[] = [];
  for (let t = Date.parse(from); t <= Date.parse(to); t += 86400000) daily.push({ day: new Date(t).toISOString().slice(0,10), revenue: 0, expenses: 0 });
  const byDay = new Map(daily.map(d => [d.day,d])); const seen = new Set<string>(); const collected = new Map<string,number>();
  for (const p of [...payments].sort((a,b) => (a.paid_at ?? '').localeCompare(b.paid_at ?? ''))) {
    if (seen.has(p.id) || p.status !== 'paid' || !p.paid_at || !p.orders || ['return','returned','rto','cancelled'].includes(p.orders.status)) continue;
    seen.add(p.id);
    const amount = Math.max(0, Math.min(Number(p.amount), Number(p.orders.total) - (collected.get(p.order_id) ?? 0)));
    collected.set(p.order_id, (collected.get(p.order_id) ?? 0) + amount);
    const row = byDay.get(indiaDay(p.paid_at)); if (row) row.revenue += amount;
  }
  for (const e of expenses) { const row = byDay.get(e.expense_date); if (row) row.expenses += Number(e.amount); }
  const revenue = daily.reduce((s,d)=>s+d.revenue,0); const totalExpenses = daily.reduce((s,d)=>s+d.expenses,0);
  return { daily, revenue, expenses: totalExpenses, net: revenue-totalExpenses, margin: revenue === 0 ? null : (revenue-totalExpenses)/revenue*100 };
}