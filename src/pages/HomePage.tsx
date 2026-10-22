import { useEffect, useState } from 'react';
import { Wallet, TrendingDown, Scale, Users, PiggyBank, AlertCircle, ArrowRight, Receipt, Plus, FileBarChart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { errMsg, greeting, taka } from '../lib/format';
import { BuildingArt } from '../Logo';
import { Card, Empty, ErrorBox, Spinner, Stat } from '../ui';
import TxRow from './TxRow';

export default function HomePage({ me, go, isAdmin }: any) {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const [ps, ms, dep, exp, cats] = await Promise.all([
          supabase.rpc('project_summary'),
          supabase.rpc('member_summary'),
          supabase.from('transaction_status').select('*').eq('transaction_type', 'contribution').eq('member_id', me.profile.id).order('transaction_date', { ascending: false }).limit(5),
          supabase.from('transaction_status').select('*').eq('transaction_type', 'expense').order('transaction_date', { ascending: false }).limit(5),
          supabase.from('expense_categories').select('id,name'),
        ]);
        const bad = [ps, ms, dep, exp, cats].find((x: any) => x.error);
        if (bad) throw bad.error;
        setD({ ps: ps.data[0], ms: ms.data[0], dep: dep.data, exp: exp.data, cats: Object.fromEntries(cats.data.map((c: any) => [c.id, c.name])) });
      } catch (e) { setErr(errMsg(e)); }
    })();
  }, []);
  if (err) return <ErrorBox text={err} />;
  if (!d) return <Spinner />;

  const tiles: any[] = [
    { t: 'আমার জমা দেখুন', icon: Wallet, tone: 'bg-emerald-100 text-emerald-700', on: () => go('deposits') },
    { t: 'প্রজেক্টের খরচ দেখুন', icon: Receipt, tone: 'bg-rose-100 text-rose-700', on: () => go('expenses') },
    ...(isAdmin
      ? [
          { t: 'নতুন জমা যোগ করুন', icon: Plus, tone: 'bg-blue-100 text-blue-700', on: () => go('admin', 'deposit') },
          { t: 'রিপোর্ট দেখুন', icon: FileBarChart, tone: 'bg-violet-100 text-violet-700', on: () => go('admin', 'reports') },
        ]
      : []),
  ];

  return (
    <>
      <div className="glass rounded-3xl p-5 sm:p-7 relative overflow-hidden">
        <BuildingArt className="absolute -right-6 -bottom-8 h-[130%] opacity-40 sm:opacity-60 pointer-events-none" />
        <div className="relative max-w-[75%] sm:max-w-[60%]">
          <div className="text-slate-600">{greeting()}</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-950">{me.profile.full_name}</h1>
          <p className="text-slate-600 mt-1">সদস্য কোড: {me.profile.member_code}</p>
          <p className="mt-3 text-slate-700">প্রকল্পের জমা ও খরচের হিসাব এক নজরে দেখুন।</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Stat label="আমার মোট জমা" value={taka(d.ms.total_contributions)} tone="green" icon={PiggyBank} />
        {d.ms.outstanding !== null && <Stat label="আমার বাকি" value={taka(d.ms.outstanding)} tone="red" icon={AlertCircle} />}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-blue-950">প্রজেক্টের সার্বিক হিসাব</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="মোট জমা" value={taka(d.ps.total_contributions)} tone="green" icon={Wallet} />
          <Stat label="মোট খরচ" value={taka(d.ps.total_expenses)} tone="red" icon={TrendingDown} />
          <Stat label="হিসাব অনুযায়ী অবশিষ্ট" value={taka(d.ps.recorded_balance)} tone="blue" icon={Scale} />
          <Stat label="মোট সদস্য" value={new Intl.NumberFormat('bn-BD').format(d.ps.member_count)} tone="violet" icon={Users} />
        </div>
        {Number(d.ps.other_income) > 0 && <p className="text-sm text-slate-600">অন্যান্য আয় (হিসাবে যুক্ত): {taka(d.ps.other_income)}</p>}
        <p className="text-sm text-slate-500">এটি খাতায় লেখা জমা ও খরচের হিসাব। ব্যাংক বা হাতে থাকা প্রকৃত টাকার সঙ্গে নাও মিলতে পারে।</p>
      </section>

      <div className={`grid grid-cols-2 ${tiles.length > 2 ? 'lg:grid-cols-4' : ''} gap-3`}>
        {tiles.map((x) => {
          const Icon = x.icon;
          return (
            <button key={x.t} onClick={x.on} className="glass card-hover rounded-3xl p-4 text-left flex flex-col gap-3 min-h-[120px]">
              <span className={`w-11 h-11 rounded-2xl grid place-items-center ${x.tone}`}><Icon size={22} /></span>
              <span className="font-semibold flex items-center justify-between gap-2">{x.t} <ArrowRight size={18} className="shrink-0 text-slate-400" /></span>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-lg font-bold mb-1">আমার সর্বশেষ জমা</h2>
          {d.dep.length === 0 ? <Empty text="এখনো কোনো জমা লেখা হয়নি।" /> : <ul>{d.dep.map((t: any) => <TxRow key={t.id} t={t} kind="in" title="জমা পেয়েছি" />)}</ul>}
        </Card>
        <Card>
          <h2 className="text-lg font-bold mb-1">সর্বশেষ খরচ</h2>
          {d.exp.length === 0 ? <Empty text="এখনো কোনো খরচ লেখা হয়নি।" /> : <ul>{d.exp.map((t: any) => <TxRow key={t.id} t={t} kind="out" title={d.cats[t.expense_category_id] ?? 'খরচ'} />)}</ul>}
        </Card>
      </div>
    </>
  );
}
