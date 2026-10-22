import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { errMsg, taka, dt } from '../lib/format';
import { Users, Wallet, TrendingDown, Scale } from 'lucide-react';
import { Btn, Card, Empty, ErrorBox, Field, inputCls, Msg, PageHeader, Spinner, Stat, useAction } from '../ui';
import { DepositForm, ExpenseForm } from './AdminForms';
import Reports from './AdminReports';
import TxRow from './TxRow';
import TxActions from './TxActions';

const SECTIONS = [
  ['members', 'সদস্য'], ['deposit', 'নতুন জমা'], ['expense', 'নতুন খরচ'], ['reports', 'রিপোর্ট'],
];

export default function Admin({ initial = 'members' }: any) {
  const [sec, setSec] = useState(initial);
  useEffect(() => setSec(initial), [initial]);
  const [members, setMembers] = useState<any[] | null>(null);
  const [ps, setPs] = useState<any>(null);
  const [err, setErr] = useState('');

  const load = async () => {
    const [m, s] = await Promise.all([supabase.rpc('admin_member_totals'), supabase.rpc('project_summary')]);
    if (m.error || s.error) return setErr(errMsg(m.error || s.error));
    setMembers(m.data); setPs(s.data[0]);
  };
  useEffect(() => { load(); }, []);

  if (err) return <ErrorBox text={err} />;
  if (!members) return <Spinner />;
  const active = members.filter((m) => m.membership_status === 'active');

  return (
    <>
      <PageHeader title="ব্যবস্থাপনা" sub="সদস্য, জমা, খরচ ও রিপোর্ট এখান থেকে সামলান।" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="মোট সদস্য" value={String(ps.member_count)} tone="violet" icon={Users} />
        <Stat label="মোট জমা" value={taka(ps.total_contributions)} tone="green" icon={Wallet} />
        <Stat label="মোট খরচ" value={taka(ps.total_expenses)} tone="red" icon={TrendingDown} />
        <Stat label="হিসাব অনুযায়ী অবশিষ্ট" value={taka(ps.recorded_balance)} tone="blue" icon={Scale} />
      </div>
      <div className="grid grid-cols-4 gap-2" role="tablist">
        {SECTIONS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={sec === id} onClick={() => setSec(id)}
            className={`min-h-[52px] rounded-2xl text-sm sm:text-base font-semibold border transition ${sec === id ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-blue-600 shadow-md' : 'bg-white/80 text-blue-800 border-blue-200'}`}>
            {label}
          </button>
        ))}
      </div>
      {sec === 'members' && <Members members={members} reload={load} />}
      {sec === 'deposit' && <DepositForm members={active} onSaved={load} />}
      {sec === 'expense' && <ExpenseForm onSaved={load} />}
      {sec === 'reports' && <Reports members={members} />}
    </>
  );
}

function Members({ members, reload }: any) {
  const [q, setQ] = useState('');
  const [f, setF] = useState({ full_name: '', email: '', member_code: '', phone: '' });
  const [view, setView] = useState<any>(null);
  const [stmt, setStmt] = useState<any[] | null>(null);
  const add = useAction();
  const st = useAction();

  const list = members.filter((m: any) => (m.full_name + ' ' + m.member_code).toLowerCase().includes(q.trim().toLowerCase()));

  const invite = (e: any) => {
    e.preventDefault();
    if (!f.full_name.trim() || !f.email.trim() || !f.member_code.trim()) return add.setMsg({ ok: false, t: 'নাম, ইমেইল ও সদস্য কোড দিন।' });
    add.run(async () => {
      const { data, error } = await supabase.functions.invoke('invite-member', { body: f });
      if (error) {
        let t = '';
        try { t = (await (error as any).context.json()).error; } catch {}
        throw new Error(t || 'সদস্য যুক্ত করা যায়নি।');
      }
      if (data?.error) throw new Error(data.error);
      setF({ full_name: '', email: '', member_code: '', phone: '' });
      reload();
      return 'আমন্ত্রণ ইমেইলে পাঠানো হয়েছে। সদস্য নিজে পাসওয়ার্ড বানাবেন।';
    });
  };

  const toggle = (m: any) => {
    const next = m.membership_status === 'active' ? 'inactive' : 'active';
    if (!confirm(`${m.full_name}-কে ${next === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করবেন?`)) return;
    st.run(async () => {
      const { error } = await supabase.from('project_members').update({ membership_status: next }).eq('user_id', m.user_id);
      if (error) throw error;
      reload();
      return 'সদস্যের অবস্থা বদলানো হয়েছে।';
    });
  };

  const openStmt = async (m: any) => {
    setView(m); setStmt(null);
    const { data } = await supabase.from('transaction_status').select('*').eq('member_id', m.user_id).eq('transaction_type', 'contribution').order('transaction_date', { ascending: false });
    setStmt(data ?? []);
  };

  return (
    <>
      <Card>
        <form onSubmit={invite} className="space-y-3">
          <h2 className="text-lg font-bold">নতুন সদস্য যুক্ত করুন</h2>
          <Field label="পুরো নাম"><input className={inputCls} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></Field>
          <Field label="ইমেইল" hint="এই ইমেইলে আমন্ত্রণ যাবে"><input className={inputCls} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="সদস্য কোড" hint="যেমন: M-001"><input className={inputCls} value={f.member_code} onChange={(e) => setF({ ...f, member_code: e.target.value })} /></Field>
          <Field label="ফোন (ঐচ্ছিক)"><input className={inputCls} inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Msg m={add.msg} />
          <Btn type="submit" disabled={add.busy} className="w-full">{add.busy ? 'অপেক্ষা করুন…' : 'আমন্ত্রণ পাঠান'}</Btn>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-2">সব সদস্য</h2>
        <input className={inputCls + ' mb-3'} placeholder="নাম বা সদস্য কোড দিয়ে খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} aria-label="সদস্য খুঁজুন" />
        <Msg m={st.msg} />
        {list.length === 0 ? <Empty text="কোনো সদস্য পাওয়া যায়নি।" /> : (
          <ul>
            {list.map((m: any) => (
              <li key={m.user_id} className="py-3 border-b border-slate-100 last:border-0">
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="font-semibold">{m.full_name} <span className="text-slate-500 text-base">({m.member_code})</span></div>
                    <div className="text-sm text-slate-600">{m.role === 'admin' ? 'অ্যাডমিন' : 'সদস্য'} · {m.membership_status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</div>
                  </div>
                  <div className="font-bold text-green-700 whitespace-nowrap">{taka(m.total_contributions)}</div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Btn variant="ghost" className="flex-1" onClick={() => openStmt(m)}>হিসাব দেখুন</Btn>
                  <Btn variant="ghost" className="flex-1" disabled={st.busy} onClick={() => toggle(m)}>{m.membership_status === 'active' ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}</Btn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {view && (
        <Card>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">{view.full_name}-এর জমার হিসাব</h2>
            <button className="text-blue-700 underline" onClick={() => setView(null)}>বন্ধ করুন</button>
          </div>
          {!stmt ? <Spinner /> : stmt.length === 0 ? <Empty text="কোনো জমা নেই।" /> : (
            <ul>{stmt.map((t) => <TxRow key={t.id} t={t} kind="in" title="জমা" actions={<TxActions t={t} members={members} onChanged={() => { openStmt(view); reload(); }} />} />)}</ul>
          )}
        </Card>
      )}
    </>
  );
}
