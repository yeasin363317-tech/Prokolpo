import { useEffect, useMemo, useState } from 'react';
import { Wallet, ListChecks, AlertCircle, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { dt, errMsg, taka } from '../lib/format';
import { Card, Empty, ErrorBox, inputCls, PageHeader, Spinner, Stat } from '../ui';
import { ReceiptLink } from './TxRow';

export default function MyDeposits({ me }: any) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [total, setTotal] = useState<any>(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    (async () => {
      const [r, s] = await Promise.all([
        supabase.from('transaction_status').select('*').eq('transaction_type', 'contribution').eq('member_id', me.profile.id).order('transaction_date', { ascending: false }),
        supabase.rpc('member_summary'),
      ]);
      if (r.error || s.error) return setErr(errMsg(r.error || s.error));
      setRows(r.data); setTotal(s.data[0]);
    })();
  }, []);

  const list = useMemo(() => (rows ?? []).filter((t) =>
    (!from || t.transaction_date >= from) && (!to || t.transaction_date <= to) &&
    (!q.trim() || [t.description, t.period_label, t.payment_method, t.receipt_ref].join(' ').toLowerCase().includes(q.trim().toLowerCase()))
  ), [rows, q, from, to]);

  if (err) return <ErrorBox text={err} />;
  if (!rows) return <Spinner />;
  const valid = rows.filter((t) => !t.is_reversed).length;

  return (
    <>
      <PageHeader title="আমার জমা" sub="আপনার জমা দেওয়া টাকার সম্পূর্ণ হিসাব এখানে দেখুন।" />
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="মোট জমা" value={taka(total.total_contributions)} tone="green" icon={Wallet} />
        <Stat label="মোট লেনদেন" value={new Intl.NumberFormat('bn-BD').format(valid) + ' টি'} tone="blue" icon={ListChecks} />
        {total.outstanding !== null && <Stat label="বাকি" value={taka(total.outstanding)} tone="red" icon={AlertCircle} />}
      </div>

      <Card className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <label><span className="block text-sm text-slate-600 mb-1">শুরুর তারিখ</span><input className={inputCls} type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label><span className="block text-sm text-slate-600 mb-1">শেষ তারিখ</span><input className={inputCls} type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          <label className="relative block"><span className="block text-sm text-slate-600 mb-1">খুঁজুন</span>
            <Search className="absolute left-3.5 bottom-3.5 text-slate-400" size={20} />
            <input className={inputCls + ' pl-11'} placeholder="বিবরণ দিয়ে খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
        <h2 className="text-lg font-bold">জমার ইতিহাস</h2>
        {list.length === 0 ? <Empty text={rows.length === 0 ? 'এখনো কোনো জমা লেখা হয়নি।' : 'এই শর্তে কোনো জমা পাওয়া যায়নি।'} /> : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b-2 border-slate-200 text-slate-600"><th className="py-2 pr-3">তারিখ</th><th className="pr-3">সময়কাল</th><th className="pr-3">পরিমাণ</th><th className="pr-3">পদ্ধতি</th><th>বিবরণ</th></tr></thead>
                <tbody>
                  {list.map((t) => (
                    <tr key={t.id} className={`border-b border-slate-100 ${t.is_reversed ? 'opacity-60' : ''}`}>
                      <td className="py-3 pr-3 whitespace-nowrap">{dt(t.transaction_date)}</td>
                      <td className="pr-3">{t.period_label ?? '—'}</td>
                      <td className={`pr-3 font-bold nums whitespace-nowrap text-emerald-700 ${t.is_reversed ? 'line-through' : ''}`}>{taka(t.amount)}</td>
                      <td className="pr-3">{t.payment_method ?? '—'}</td>
                      <td>{t.description ?? ''}{t.receipt_ref ? ` (রসিদ: ${t.receipt_ref})` : ''}{t.is_reversed && <span className="ml-2 text-orange-700 font-semibold">✖ বাতিল</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <ul className="md:hidden space-y-3">
              {list.map((t) => (
                <li key={t.id} className={`rounded-2xl bg-white/70 border border-white p-3 ${t.is_reversed ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-600">{dt(t.transaction_date)}</span>
                    <span className={`font-bold nums text-emerald-700 ${t.is_reversed ? 'line-through' : ''}`}>{taka(t.amount)}</span>
                  </div>
                  {t.period_label && <div className="text-sm">সময়কাল: {t.period_label}</div>}
                  {t.payment_method && <div className="text-sm">পদ্ধতি: {t.payment_method}</div>}
                  {t.description && <div className="text-sm text-slate-700">{t.description}</div>}
                  {t.receipt_ref && <div className="text-sm text-slate-600">রসিদ নং: {t.receipt_ref}</div>}
                  {t.is_reversed && <div className="text-sm font-semibold text-orange-700">✖ বাতিল করা হয়েছে</div>}
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </>
  );
}
