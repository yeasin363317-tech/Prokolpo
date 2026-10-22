import { useEffect, useMemo, useState } from 'react';
import { TrendingDown, LayoutGrid, Plus, Search, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { dt, errMsg, taka } from '../lib/format';
import { catStyle } from '../lib/cat';
import { Btn, Card, Empty, ErrorBox, inputCls, Modal, PageHeader, Spinner, Stat } from '../ui';
import { ReceiptLink } from './TxRow';
import TxActions from './TxActions';

export default function Expenses({ isAdmin, go }: any) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [cats, setCats] = useState<any[]>([]);
  const [ps, setPs] = useState<any>(null);
  const [err, setErr] = useState('');
  const [cat, setCat] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sel, setSel] = useState<any>(null);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    (async () => {
      const [r, c, s] = await Promise.all([
        supabase.from('transaction_status').select('*').eq('transaction_type', 'expense').order('transaction_date', { ascending: false }),
        supabase.from('expense_categories').select('id,name').order('created_at'),
        supabase.rpc('project_summary'),
      ]);
      if (r.error || c.error || s.error) return setErr(errMsg(r.error || c.error || s.error));
      setRows(r.data); setCats(c.data); setPs(s.data[0]);
    })();
  }, [tick]);

  const idx = useMemo(() => Object.fromEntries(cats.map((c, i) => [c.id, i])), [cats]);
  const name = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c.name])), [cats]);

  const breakdown = useMemo(() => {
    const m: any = {};
    (rows ?? []).filter((t) => !t.is_reversed).forEach((t) => { m[t.expense_category_id] = (m[t.expense_category_id] || 0) + Number(t.amount); });
    return Object.entries(m).sort((a: any, b: any) => b[1] - a[1]);
  }, [rows]);

  const list = useMemo(() => (rows ?? []).filter((t) =>
    (!cat || t.expense_category_id === cat) && (!from || t.transaction_date >= from) && (!to || t.transaction_date <= to) &&
    (!q.trim() || [t.description, t.payee, name[t.expense_category_id]].join(' ').toLowerCase().includes(q.trim().toLowerCase()))
  ), [rows, cat, from, to, q, name]);

  if (err) return <ErrorBox text={err} />;
  if (!rows) return <Spinner />;
  const maxVal = breakdown.length ? Number((breakdown[0] as any)[1]) : 1;

  return (
    <>
      <PageHeader title="প্রজেক্টের খরচ" sub="সবার জমা করা টাকা থেকে কোথায় কত খরচ হয়েছে।"
        action={isAdmin && <Btn onClick={() => go('admin', 'expense')}><Plus size={20} /> নতুন খরচ যোগ করুন</Btn>} />

      <div className="grid sm:grid-cols-2 gap-3">
        <Stat label="মোট খরচ" value={taka(ps.total_expenses)} tone="red" icon={TrendingDown} />
        <Stat label="খরচের খাত" value={new Intl.NumberFormat('bn-BD').format(breakdown.length) + ' টি'} tone="blue" icon={LayoutGrid} />
      </div>

      {breakdown.length > 0 && (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold">কোন খাতে কত খরচ</h2>
          {breakdown.map(([id, v]: any) => {
            const s = catStyle(name[id], idx[id] ?? 0);
            return (
              <div key={id}>
                <div className="flex justify-between gap-2 text-[15px]"><span className="font-medium">{name[id]}</span><span className="font-semibold nums">{taka(v)}</span></div>
                <div className="h-2.5 rounded-full bg-slate-200/70 mt-1 overflow-hidden"><div className={`h-full rounded-full ${s.bar}`} style={{ width: `${Math.max(4, (v / maxVal) * 100)}%` }} /></div>
              </div>
            );
          })}
        </Card>
      )}

      <Card className="space-y-4">
        <div className="grid sm:grid-cols-4 gap-3">
          <label><span className="block text-sm text-slate-600 mb-1">খাত</span>
            <select className={inputCls} value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">সব খাত</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></label>
          <label><span className="block text-sm text-slate-600 mb-1">শুরুর তারিখ</span><input className={inputCls} type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label><span className="block text-sm text-slate-600 mb-1">শেষ তারিখ</span><input className={inputCls} type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          <label className="relative block"><span className="block text-sm text-slate-600 mb-1">খুঁজুন</span>
            <Search className="absolute left-3.5 bottom-3.5 text-slate-400" size={20} />
            <input className={inputCls + ' pl-11'} placeholder="বিবরণ দিয়ে খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        </div>
        <h2 className="text-lg font-bold">খরচের বিবরণ</h2>
        {list.length === 0 ? <Empty text={rows.length === 0 ? 'এখনো কোনো খরচ লেখা হয়নি।' : 'এই শর্তে কোনো খরচ পাওয়া যায়নি।'} /> : (
          <ul className="space-y-2.5">
            {list.map((t) => {
              const s = catStyle(name[t.expense_category_id], idx[t.expense_category_id] ?? 0); const Icon = s.Icon;
              return (
                <li key={t.id}>
                  <button onClick={() => setSel(t)} className={`w-full text-left card-hover flex items-center gap-3 rounded-2xl bg-white/75 border border-white p-3 ${t.is_reversed ? 'opacity-60' : ''}`}>
                    <span className={`shrink-0 w-12 h-12 rounded-2xl grid place-items-center ${s.bg} ${s.fg}`}><Icon size={24} /></span>
                    <span className="min-w-0 flex-1">
                      <span className={`block font-semibold ${t.is_reversed ? 'line-through' : ''}`}>{name[t.expense_category_id] ?? 'খরচ'}</span>
                      <span className="block text-sm text-slate-600">{dt(t.transaction_date)}</span>
                      {t.description && <span className="block text-sm text-slate-700 truncate">{t.description}</span>}
                    </span>
                    <span className="text-right shrink-0">
                      <span className={`block font-bold nums text-rose-700 ${t.is_reversed ? 'line-through' : ''}`}>{taka(t.amount)}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${t.is_reversed ? 'text-orange-700' : 'text-emerald-700'}`}>
                        <CheckCircle2 size={14} /> {t.is_reversed ? 'বাতিল' : 'পরিশোধিত'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal open={!!sel} onClose={() => setSel(null)} title="খরচের বিস্তারিত">
        {sel && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-rose-50 p-4">
              <div className="font-semibold">{name[sel.expense_category_id]}</div>
              <div className="text-3xl font-bold text-rose-700 nums">{taka(sel.amount)}</div>
            </div>
            {[
              ['তারিখ', dt(sel.transaction_date)], ['প্রাপকের নাম', sel.payee], ['বিবরণ', sel.description], ['রসিদ/বিল নম্বর', sel.receipt_ref],
              ['অবস্থা', sel.is_reversed ? 'বাতিল করা হয়েছে' : 'পরিশোধিত (খাতায় লেখা)'], ['খাতায় যোগের সময়', dt(sel.created_at.slice(0, 10))],
            ].filter((r) => r[1]).map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-4 border-b border-slate-100 pb-2"><span className="text-slate-600">{k}</span><span className="font-semibold text-right">{v}</span></div>
            ))}
            {sel.receipt_path && <ReceiptLink path={sel.receipt_path} />}
            {isAdmin && <TxActions t={sel} onChanged={() => { setSel(null); setTick((n) => n + 1); }} />}
          </div>
        )}
      </Modal>
    </>
  );
}
