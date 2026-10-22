import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { taka, today } from '../lib/format';
import { Btn, Field, inputCls, Modal, Msg, useAction } from '../ui';

function EditModal({ t, members, onClose, onChanged }: any) {
  const [f, setF] = useState({
    amount: String(t.amount), date: t.transaction_date, member: t.member_id ?? '', cat: t.expense_category_id ?? '',
    description: t.description ?? '', payee: t.payee ?? '', method: t.payment_method ?? '', period: t.period_label ?? '', receipt: t.receipt_ref ?? '',
  });
  const [cats, setCats] = useState<any[]>([]);
  const a = useAction();
  const isExp = t.transaction_type === 'expense';
  const isDep = t.transaction_type === 'contribution';
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  useEffect(() => {
    if (isExp) supabase.from('expense_categories').select('id,name').order('created_at').then(({ data }) => setCats(data ?? []));
  }, []);

  const save = (e: any) => {
    e.preventDefault();
    const amt = Number(f.amount);
    if (!(amt > 0)) return a.setMsg({ ok: false, t: 'টাকার পরিমাণ ০ এর বেশি লিখুন।' });
    if (!f.date) return a.setMsg({ ok: false, t: 'তারিখ দিন।' });
    if (!confirm(`লেনদেনটি ${taka(amt)} দিয়ে বদলাবেন?`)) return;
    a.run(async () => {
      const { error } = await supabase.rpc('update_transaction', {
        p_tx: t.id, p_amount: amt, p_date: f.date, p_member: isDep ? f.member : null, p_category: isExp ? f.cat : null,
        p_description: f.description || null, p_payee: f.payee || null, p_method: f.method || null,
        p_period: f.period || null, p_receipt: f.receipt || null, p_reason: null,
      });
      if (error) throw error;
      onChanged();
      return 'সম্পাদনা সংরক্ষণ হয়েছে।';
    });
  };

  return (
    <Modal open onClose={onClose} title={isExp ? 'খরচ সম্পাদনা' : 'জমা সম্পাদনা'}>
      <form onSubmit={save} className="space-y-3">
        {isDep && (
          <Field label="সদস্য">
            <select className={inputCls} value={f.member} onChange={set('member')}>
              {members.map((m: any) => <option key={m.user_id} value={m.user_id}>{m.full_name} ({m.member_code})</option>)}
            </select>
          </Field>
        )}
        {isExp && (
          <Field label="খরচের খাত">
            <select className={inputCls} value={f.cat} onChange={set('cat')}>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="টাকার পরিমাণ (৳)"><input className={inputCls} inputMode="decimal" value={f.amount} onChange={set('amount')} /></Field>
        <Field label="তারিখ"><input className={inputCls} type="date" max={today()} value={f.date} onChange={set('date')} /></Field>
        {isDep && <Field label="সময়কাল"><input className={inputCls} value={f.period} onChange={set('period')} /></Field>}
        {isDep && <Field label="পদ্ধতি"><input className={inputCls} value={f.method} onChange={set('method')} /></Field>}
        {isExp && <Field label="প্রাপক"><input className={inputCls} value={f.payee} onChange={set('payee')} /></Field>}
        <Field label="বিবরণ"><input className={inputCls} value={f.description} onChange={set('description')} /></Field>
        <Field label="রসিদ নম্বর"><input className={inputCls} value={f.receipt} onChange={set('receipt')} /></Field>
        <Msg m={a.msg} />
        <div className="grid grid-cols-2 gap-2">
          <Btn type="button" variant="ghost" onClick={onClose}>বন্ধ করুন</Btn>
          <Btn type="submit" disabled={a.busy}>{a.busy ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}</Btn>
        </div>
      </form>
    </Modal>
  );
}

export default function TxActions({ t, members = [], onChanged }: any) {
  const [open, setOpen] = useState(false);
  const a = useAction();
  const canEdit = t.transaction_type !== 'reversal';
  const del = () => {
    if (!confirm(`${taka(t.amount)}-এর এই লেনদেনটি মুছে ফেলবেন? মুছলে ফেরত আনা যাবে না। (মোছার রেকর্ড অডিট লগে থাকবে।)`)) return;
    a.run(async () => {
      const { error } = await supabase.rpc('delete_transaction', { p_tx: t.id, p_reason: null });
      if (error) throw error;
      onChanged();
      return 'লেনদেন মুছে ফেলা হয়েছে।';
    });
  };
  const b = 'inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border text-sm font-semibold disabled:opacity-60';
  return (
    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap gap-2">
        {canEdit && <button type="button" className={`${b} border-blue-200 bg-white/80 text-blue-800`} onClick={() => setOpen(true)}><Pencil size={16} /> সম্পাদনা</button>}
        <button type="button" disabled={a.busy} className={`${b} border-red-300 bg-white/80 text-red-700`} onClick={del}><Trash2 size={16} /> মুছুন</button>
      </div>
      {a.msg && !a.msg.ok && <div className="mt-2"><Msg m={a.msg} /></div>}
      {open && <EditModal t={t} members={members} onClose={() => setOpen(false)} onChanged={() => { setOpen(false); onChanged(); }} />}
    </div>
  );
}
