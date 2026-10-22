import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { errMsg, taka } from '../lib/format';
import { Card, Empty, ErrorBox, Spinner, Stat } from '../ui';
import TxRow from './TxRow';

export default function Expenses() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [cats, setCats] = useState<any>({});
  const [ps, setPs] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    (async () => {
      const [r, c, s] = await Promise.all([
        supabase.from('transaction_status').select('*').eq('transaction_type', 'expense').order('transaction_date', { ascending: false }),
        supabase.from('expense_categories').select('id,name'),
        supabase.rpc('project_summary'),
      ]);
      if (r.error || c.error || s.error) return setErr(errMsg(r.error || c.error || s.error));
      setRows(r.data); setPs(s.data[0]);
      setCats(Object.fromEntries(c.data.map((x: any) => [x.id, x.name])));
    })();
  }, []);
  if (err) return <ErrorBox text={err} />;
  if (!rows) return <Spinner />;
  return (
    <>
      <h1 className="text-2xl font-bold">প্রজেক্টের খরচ</h1>
      <Stat label="মোট খরচ" value={taka(ps.total_expenses)} tone="red" />
      <Card>
        <h2 className="text-lg font-bold">খরচের তালিকা</h2>
        {rows.length === 0 ? <Empty text="এখনো কোনো খরচ লেখা হয়নি।" /> : (
          <ul>{rows.map((t) => <TxRow key={t.id} t={t} kind="out" title={cats[t.expense_category_id] ?? 'খরচ'} />)}</ul>
        )}
      </Card>
    </>
  );
}
