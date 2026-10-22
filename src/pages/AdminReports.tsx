import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { dt, downloadCsv, errMsg, monthKey, monthLabel, taka, today } from '../lib/format';
import { catStyle } from '../lib/cat';
import TxActions from './TxActions';
import { Btn, Card, Empty, ErrorBox, Field, inputCls, Msg, Spinner, Stat, useAction } from '../ui';
import { Wallet, TrendingDown, Scale } from 'lucide-react';

const VIEWS = [
  ['monthly', 'মাসিক জমা'], ['member', 'সদস্যভিত্তিক জমা'], ['expenses', 'খরচের তালিকা'],
  ['monthlyexp', 'মাসিক খরচ'], ['dues', 'বকেয়া'], ['all', 'সব লেনদেন'],
];

function Table({ head, rows, total }: { head: string[]; rows: any[][]; total?: any[] }) {
  if (rows.length === 0) return <Empty text="এই সময়ে কোনো তথ্য নেই।" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[420px]">
        <thead><tr className="border-b-2 border-slate-200">{head.map((h) => <th key={h} className="py-2 pr-3">{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => <tr key={i} className="border-b border-slate-100">{r.map((c, j) => <td key={j} className="py-2 pr-3">{c}</td>)}</tr>)}
        </tbody>
        {total && <tfoot><tr className="border-t-2 border-slate-300 font-bold">{total.map((c, j) => <td key={j} className="py-2 pr-3">{c}</td>)}</tr></tfoot>}
      </table>
    </div>
  );
}

export default function Reports({ members }: any) {
  const [view, setView] = useState('monthly');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState(today());
  const [tx, setTx] = useState<any[] | null>(null);
  const [cats, setCats] = useState<any>({});
  const [obl, setObl] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const act = useAction();

  const load = async () => {
    const [t, c, o] = await Promise.all([
      supabase.from('transaction_status').select('*').order('transaction_date', { ascending: false }).limit(5000),
      supabase.from('expense_categories').select('id,name'),
      supabase.from('payment_obligations').select('*').order('due_date', { ascending: false }),
    ]);
    if (t.error || c.error || o.error) return setErr(errMsg(t.error || c.error || o.error));
    setTx(t.data); setObl(o.data); setCats(Object.fromEntries(c.data.map((x: any) => [x.id, x.name])));
  };
  useEffect(() => { load(); }, []);

  const name = useMemo(() => Object.fromEntries(members.map((m: any) => [m.user_id, `${m.full_name} (${m.member_code})`])), [members]);
  const inRange = (d: string) => (!from || d >= from) && (!to || d <= to);

  const data = useMemo(() => {
    if (!tx) return null;
    const valid = tx.filter((t) => t.transaction_type !== 'reversal' && !t.is_reversed && inRange(t.transaction_date));
    const dep = valid.filter((t) => t.transaction_type === 'contribution');
    const exp = valid.filter((t) => t.transaction_type === 'expense');
    const group = (rows: any[], keyFn: (t: any) => string) => {
      const m: any = {};
      rows.forEach((t) => { const k = keyFn(t); m[k] = (m[k] || 0) + Number(t.amount); });
      return Object.entries(m);
    };
    const sum = (rows: any[]) => rows.reduce((s, t) => s + Number(t.amount), 0);
    // dues: obligations due up to today minus ALL valid contributions of the member
    const allDep: any = {};
    tx.filter((t) => t.transaction_type === 'contribution' && !t.is_reversed).forEach((t) => { allDep[t.member_id] = (allDep[t.member_id] || 0) + Number(t.amount); });
    const due: any = {};
    obl.filter((o) => o.due_date <= today()).forEach((o) => { due[o.member_id] = (due[o.member_id] || 0) + Number(o.amount_due); });
    const dues = Object.keys(due).map((id) => [id, due[id], allDep[id] || 0, Math.max(due[id] - (allDep[id] || 0), 0)]);
    return { valid, dep, exp, group, sum, dues };
  }, [tx, obl, from, to]);

  if (err) return <ErrorBox text={err} />;
  if (!tx || !data) return <Spinner />;

  let head: string[] = [], rows: any[][] = [], csv: any[][] = [], total: any[] | undefined, file = 'report';
  const { dep, exp, group, sum, dues } = data;
  if (view === 'monthly') {
    head = ['মাস', 'জমা']; file = 'monthly-contributions';
    const g = group(dep, (t) => monthKey(t.transaction_date)).sort().reverse();
    csv = g.map(([k, v]: any) => [monthLabel(k), v]); rows = g.map(([k, v]: any) => [monthLabel(k), taka(v)]); total = ['মোট', taka(sum(dep))];
  } else if (view === 'member') {
    head = ['সদস্য', 'জমা']; file = 'member-contributions';
    const g = group(dep, (t) => t.member_id).sort((a: any, b: any) => b[1] - a[1]);
    csv = g.map(([k, v]: any) => [name[k] ?? k, v]); rows = g.map(([k, v]: any) => [name[k] ?? 'অজানা', taka(v)]); total = ['মোট', taka(sum(dep))];
  } else if (view === 'expenses') {
    head = ['তারিখ', 'খাত', 'টাকা', 'বিবরণ', 'রসিদ নং']; file = 'expenses';
    csv = exp.map((t) => [t.transaction_date, cats[t.expense_category_id], t.amount, t.description, t.receipt_ref]);
    rows = exp.map((t) => [dt(t.transaction_date), cats[t.expense_category_id], taka(t.amount), t.description ?? '', t.receipt_ref ?? '']); total = ['', 'মোট', taka(sum(exp)), '', ''];
  } else if (view === 'monthlyexp') {
    head = ['মাস', 'খরচ']; file = 'monthly-expenses';
    const g = group(exp, (t) => monthKey(t.transaction_date)).sort().reverse();
    csv = g.map(([k, v]: any) => [monthLabel(k), v]); rows = g.map(([k, v]: any) => [monthLabel(k), taka(v)]); total = ['মোট', taka(sum(exp))];
  } else if (view === 'dues') {
    head = ['সদস্য', 'নির্ধারিত বকেয়া', 'মোট জমা', 'এখনো বাকি']; file = 'dues';
    csv = dues.map((d: any) => [name[d[0]] ?? d[0], d[1], d[2], d[3]]); rows = dues.map((d: any) => [name[d[0]] ?? 'অজানা', taka(d[1]), taka(d[2]), taka(d[3])]);
  } else {
    head = ['তারিখ', 'ধরন', 'টাকা', 'বিবরণ', 'কাজ']; file = 'all-transactions';
    const L: any = { contribution: 'জমা', expense: 'খরচ', other_income: 'অন্যান্য আয়', reversal: 'বাতিল এন্ট্রি' };
    const list = tx.filter((t) => inRange(t.transaction_date));
    csv = list.map((t) => [t.transaction_date, L[t.transaction_type], t.amount, t.description, t.is_reversed ? 'বাতিল' : '']);
    rows = list.map((t) => [dt(t.transaction_date), `${L[t.transaction_type]}${t.member_id ? ' – ' + (name[t.member_id] ?? '') : ''}${t.expense_category_id ? ' – ' + cats[t.expense_category_id] : ''}`,
      <span className={t.is_reversed ? 'line-through' : ''}>{taka(t.amount)}</span>, t.description ?? '',
      <TxActions t={t} members={members} onChanged={load} />]);
  }

  return (
    <>
      <Card className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="শুরুর তারিখ"><input className={inputCls} type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="শেষের তারিখ"><input className={inputCls} type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {VIEWS.map(([id, label]) => (
            <button key={id} onClick={() => setView(id)} aria-pressed={view === id}
              className={`min-h-[48px] rounded-2xl border font-semibold transition ${view === id ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-blue-600' : 'bg-white/80 text-blue-800 border-blue-200'}`}>{label}</button>
          ))}
        </div>
      </Card>
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="এই সময়ে জমা" value={taka(sum(dep))} tone="green" icon={Wallet} />
        <Stat label="এই সময়ে খরচ" value={taka(sum(exp))} tone="red" icon={TrendingDown} />
        <Stat label="জমা − খরচ" value={taka(sum(dep) - sum(exp))} tone="blue" icon={Scale} />
      </div>
      {view === 'expenses' || view === 'monthlyexp' ? (
        <Card className="space-y-3">
          <h2 className="text-lg font-bold">খাত অনুযায়ী খরচ</h2>
          {(() => {
            const g: any[] = group(exp, (t) => t.expense_category_id).sort((a: any, b: any) => b[1] - a[1]);
            const mx = g.length ? g[0][1] : 1;
            return g.length === 0 ? <Empty text="এই সময়ে কোনো খরচ নেই।" /> : g.map(([id, v]: any, i: number) => (
              <div key={id}>
                <div className="flex justify-between gap-2"><span className="font-medium">{cats[id]}</span><span className="font-semibold nums">{taka(v)}</span></div>
                <div className="h-2.5 rounded-full bg-slate-200/70 mt-1 overflow-hidden"><div className={`h-full rounded-full ${catStyle(cats[id], i).bar}`} style={{ width: `${Math.max(4, (v / mx) * 100)}%` }} /></div>
              </div>
            ));
          })()}
        </Card>
      ) : null}
      <Msg m={act.msg} />
      <Card>
        <Table head={head} rows={rows} total={total} />
        {rows.length > 0 && (
          <Btn variant="ghost" className="w-full mt-3" onClick={() => downloadCsv(`${file}.csv`, [head, ...csv])}>
            <Download size={20} /> CSV ডাউনলোড
          </Btn>
        )}
      </Card>
      {view === 'dues' && <DueForm members={members} onSaved={load} />}
      {view === 'dues' && <p className="text-sm text-slate-500">বকেয়া শুধু তখনই দেখানো হয় যখন অ্যাডমিন সেই সদস্যের জন্য বকেয়া নির্ধারণ করেছেন। হিসাব: নির্ধারিত বকেয়া − সদস্যের মোট জমা।</p>}
    </>
  );
}

function DueForm({ members, onSaved }: any) {
  const [f, setF] = useState({ member: '', amount: '', date: today(), description: '' });
  const a = useAction();
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = (e: any) => {
    e.preventDefault();
    if (!f.member || !(Number(f.amount) > 0)) return a.setMsg({ ok: false, t: 'সদস্য ও সঠিক টাকার পরিমাণ দিন।' });
    a.run(async () => {
      const { data: p } = await supabase.from('projects').select('id').limit(1).single();
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from('payment_obligations').insert({
        project_id: p!.id, member_id: f.member, due_date: f.date, amount_due: Number(f.amount),
        description: f.description || null, created_by: u.user!.id,
      });
      if (error) throw error;
      setF({ ...f, amount: '', description: '' }); onSaved();
      return 'বকেয়া নির্ধারণ করা হয়েছে।';
    });
  };
  return (
    <Card>
      <form onSubmit={submit} className="space-y-3">
        <h2 className="text-lg font-bold">বকেয়া নির্ধারণ করুন</h2>
        <Field label="সদস্য">
          <select className={inputCls} value={f.member} onChange={set('member')}>
            <option value="">— সদস্য বেছে নিন —</option>
            {members.filter((m: any) => m.membership_status === 'active').map((m: any) => <option key={m.user_id} value={m.user_id}>{m.full_name} ({m.member_code})</option>)}
          </select>
        </Field>
        <Field label="টাকার পরিমাণ (৳)"><input className={inputCls} inputMode="decimal" value={f.amount} onChange={set('amount')} /></Field>
        <Field label="কত তারিখের মধ্যে দেওয়ার কথা"><input className={inputCls} type="date" value={f.date} onChange={set('date')} /></Field>
        <Field label="বিবরণ (ঐচ্ছিক)"><input className={inputCls} value={f.description} onChange={set('description')} /></Field>
        <Msg m={a.msg} />
        <Btn type="submit" disabled={a.busy} className="w-full">সংরক্ষণ করুন</Btn>
      </form>
    </Card>
  );
}
