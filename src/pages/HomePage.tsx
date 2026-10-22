import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { errMsg, taka } from '../lib/format';
import { Btn, Card, Empty, ErrorBox, Spinner, Stat } from '../ui';
import TxRow from './TxRow';

export default function HomePage({ me, go }: any) {
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
        setD({
          ps: ps.data[0], ms: ms.data[0], dep: dep.data, exp: exp.data,
          cats: Object.fromEntries(cats.data.map((c: any) => [c.id, c.name])),
        });
      } catch (e) { setErr(errMsg(e)); }
    })();
  }, []);
  if (err) return <ErrorBox text={err} />;
  if (!d) return <Spinner />;
  return (
    <>
      <Card className="space-y-2">
        <div className="text-slate-600">স্বাগতম</div>
        <div className="text-2xl font-bold">{me.profile.full_name}</div>
        <div className="text-slate-600">সদস্য কোড: {me.profile.member_code}</div>
        <Stat label="আমার মোট জমা" value={taka(d.ms.total_contributions)} tone="green" />
        {d.ms.outstanding !== null && (
          <Stat label="আমার বকেয়া" value={taka(d.ms.outstanding)} tone="red" />
        )}
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">প্রজেক্টের সারসংক্ষেপ</h2>
        <Stat label="সবার মোট জমা" value={taka(d.ps.total_contributions)} tone="green" />
        {Number(d.ps.other_income) > 0 && <Stat label="অন্যান্য আয়" value={taka(d.ps.other_income)} tone="green" />}
        <Stat label="মোট খরচ" value={taka(d.ps.total_expenses)} tone="red" />
        <Stat label="হিসাব অনুযায়ী অবশিষ্ট" value={taka(d.ps.recorded_balance)} tone="blue" />
        <p className="text-sm text-slate-500">
          এটি খাতায় লেখা জমা ও খরচের হিসাব। ব্যাংক বা হাতে থাকা প্রকৃত টাকার সঙ্গে নাও মিলতে পারে।
        </p>
      </section>

      <Card>
        <h2 className="text-lg font-bold mb-1">আমার সাম্প্রতিক জমা</h2>
        {d.dep.length === 0 ? <Empty text="এখনো কোনো জমা লেখা হয়নি।" /> : (
          <ul>{d.dep.map((t: any) => <TxRow key={t.id} t={t} kind="in" title="জমা" />)}</ul>
        )}
        <Btn variant="ghost" className="w-full mt-2" onClick={() => go('deposits')}>আমার জমা</Btn>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-1">সাম্প্রতিক খরচ</h2>
        {d.exp.length === 0 ? <Empty text="এখনো কোনো খরচ লেখা হয়নি।" /> : (
          <ul>{d.exp.map((t: any) => <TxRow key={t.id} t={t} kind="out" title={d.cats[t.expense_category_id] ?? 'খরচ'} />)}</ul>
        )}
        <Btn variant="ghost" className="w-full mt-2" onClick={() => go('expenses')}>প্রজেক্টের খরচ</Btn>
      </Card>
    </>
  );
}
