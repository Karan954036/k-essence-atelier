import { describe, expect, it } from 'vitest';
import { summarizeFinance, validateRange, type FinancePayment } from './finance';
const payment = (overrides: Partial<FinancePayment> = {}): FinancePayment => ({id:'one',order_id:'order',status:'paid',amount:100,paid_at:'2026-10-10T20:00:00Z',orders:{status:'delivered',total:100},...overrides});
describe('cash-basis finance',()=>{
 it('uses India collection dates and deducts expenses',()=>{
   const r=summarizeFinance('2026-10-11','2026-10-11',[payment()],[{expense_date:'2026-10-11',amount:25}]);
   expect(r.revenue).toBe(100); expect(r.net).toBe(75); expect(r.margin).toBe(75);
 });
 it('excludes unpaid COD and returned/cancelled payments',()=>{
   const r=summarizeFinance('2026-10-11','2026-10-11',[payment({status:'pending'}),payment({id:'two',orders:{status:'return',total:100}}),payment({id:'three',orders:{status:'cancelled',total:100}})],[]);
   expect(r.revenue).toBe(0); expect(r.margin).toBeNull();
 });
 it('deduplicates IDs and caps repeated collection rows at the order total',()=>{
   const p=payment();const r=summarizeFinance('2026-10-11','2026-10-11',[p,p,payment({id:'two'})],[]);expect(r.revenue).toBe(100);
 });
 it('does not count earlier duplicated collections in a later period',()=>{
   const r=summarizeFinance('2026-10-11','2026-10-11',[payment({paid_at:'2026-10-09T10:00:00Z'}),payment({id:'two'})],[]);expect(r.revenue).toBe(0);
 });
 it('handles loss with zero revenue',()=>{const r=summarizeFinance('2026-10-11','2026-10-11',[],[{expense_date:'2026-10-11',amount:150.25}]);expect(r.net).toBe(-150.25);expect(r.margin).toBeNull();});
 it('rejects reversed or impossible dates',()=>{expect(()=>validateRange({from:'2026-10-12',to:'2026-10-11'})).toThrow();expect(()=>validateRange({from:'2026-02-30',to:'2026-03-01'})).toThrow();});
});