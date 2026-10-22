import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { errMsg, taka } from '../lib/format';
import { Card, Empty, ErrorBox, Spinner, Stat } from '../ui';
import TxRow from './TxRow';

export default function MyDeposits({ me }: any) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [total, setTotal] = useState<any>(null);
  const [err, setErr] = useState('');
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
  if (err) return <ErrorBox text={err} />;
  if (!rows) return <Spinner />;
  return (
    <>
      <h1 className="text-2xl font-bold">আমার জমা</h1>
      <Stat label="মোট জমা" value={taka(total.total_contributions)} tone="green" />
      {total.outstanding !== null && <Stat label="বকেয়া" value={taka(total.outstanding)} tone="red" />}
      <Card>
        <h2 className="text-lg font-bold">জমার ইতিহাস</h2>
        {rows.length === 0 ? <Empty text="এখনো কোনো জমা লেখা হয়নি।" /> : (
          <ul>{rows.map((t) => <TxRow key={t.id} t={t} kind="in" title="জমা" />)}</ul>
        )}
      </Card>
    </>
  );
}
