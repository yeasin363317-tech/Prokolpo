import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { taka, today } from '../lib/format';
import { Btn, Card, Field, inputCls, Msg, useAction } from '../ui';

export function DepositForm({ members, onSaved }: any) {
  const blank = { member: '', amount: '', date: today(), period: '', method: '', description: '', receipt: '' };
  const [f, setF] = useState(blank);
  const key = useRef(crypto.randomUUID());
  const a = useAction();
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const submit = (e: any) => {
    e.preventDefault();
    const amt = Number(f.amount);
    if (!f.member) return a.setMsg({ ok: false, t: 'সদস্য বেছে নিন।' });
    if (!(amt > 0)) return a.setMsg({ ok: false, t: 'টাকার পরিমাণ ০ এর বেশি লিখুন।' });
    if (!f.date) return a.setMsg({ ok: false, t: 'তারিখ দিন।' });
    const m = members.find((x: any) => x.user_id === f.member);
    if (!confirm(`${m.full_name}-এর জমা ${taka(amt)} লিখবেন?`)) return;
    a.run(async () => {
      const { error } = await supabase.rpc('record_contribution', {
        p_member: f.member, p_amount: amt, p_date: f.date, p_period: f.period || null,
        p_method: f.method || null, p_description: f.description || null, p_receipt: f.receipt || null, p_key: key.current,
      });
      if (error) throw error;
      key.current = crypto.randomUUID();
      setF({ ...blank, date: f.date });
      onSaved();
      return `${m.full_name}-এর ${taka(amt)} জমা সফলভাবে লেখা হয়েছে।`;
    });
  };

  return (
    <Card>
      <form onSubmit={submit} className="space-y-3">
        <h2 className="text-xl font-bold">নতুন জমা যোগ করুন</h2>
        <Field label="সদস্য">
          <select className={inputCls} value={f.member} onChange={set('member')}>
            <option value="">— সদস্য বেছে নিন —</option>
            {members.map((m: any) => <option key={m.user_id} value={m.user_id}>{m.full_name} ({m.member_code})</option>)}
          </select>
        </Field>
        <Field label="টাকার পরিমাণ (৳)" hint="যেমন: 5000"><input className={inputCls} inputMode="decimal" value={f.amount} onChange={set('amount')} /></Field>
        <Field label="যে তারিখে পেয়েছেন"><input className={inputCls} type="date" value={f.date} onChange={set('date')} /></Field>
        <Field label="কোন মাস/সময়ের জন্য (ঐচ্ছিক)" hint="যেমন: অক্টোবর ২০২৬"><input className={inputCls} value={f.period} onChange={set('period')} /></Field>
        <Field label="কীভাবে দিয়েছেন (ঐচ্ছিক)" hint="যেমন: নগদ, বিকাশ, ব্যাংক"><input className={inputCls} value={f.method} onChange={set('method')} /></Field>
        <Field label="বিবরণ (ঐচ্ছিক)"><input className={inputCls} value={f.description} onChange={set('description')} /></Field>
        <Field label="রসিদ নম্বর (ঐচ্ছিক)"><input className={inputCls} value={f.receipt} onChange={set('receipt')} /></Field>
        <Msg m={a.msg} />
        <Btn type="submit" disabled={a.busy} className="w-full">{a.busy ? 'সংরক্ষণ হচ্ছে…' : 'জমা সংরক্ষণ করুন'}</Btn>
      </form>
    </Card>
  );
}

const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export function ExpenseForm({ onSaved }: any) {
  const blank = { cat: '', amount: '', date: today(), description: '', payee: '', receipt: '' };
  const [f, setF] = useState(blank);
  const [cats, setCats] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [newCat, setNewCat] = useState('');
  const key = useRef(crypto.randomUUID());
  const a = useAction();
  const c = useAction();
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const loadCats = async () => {
    const { data } = await supabase.from('expense_categories').select('id,name').eq('is_active', true).order('created_at');
    setCats(data ?? []);
  };
  useEffect(() => { loadCats(); }, []);

  const addCat = () => {
    if (newCat.trim().length < 2) return c.setMsg({ ok: false, t: 'খাতের নাম লিখুন।' });
    c.run(async () => {
      const { data: p } = await supabase.from('projects').select('id').limit(1).single();
      const { error } = await supabase.from('expense_categories').insert({ project_id: p!.id, name: newCat.trim() });
      if (error) throw new Error(error.code === '23505' ? 'এই খাত আগেই আছে।' : 'খাত যোগ করা যায়নি।');
      setNewCat(''); loadCats();
      return 'নতুন খাত যোগ হয়েছে।';
    });
  };

  const submit = (e: any) => {
    e.preventDefault();
    const amt = Number(f.amount);
    if (!f.cat) return a.setMsg({ ok: false, t: 'খরচের খাত বেছে নিন।' });
    if (!(amt > 0)) return a.setMsg({ ok: false, t: 'টাকার পরিমাণ ০ এর বেশি লিখুন।' });
    if (!f.date) return a.setMsg({ ok: false, t: 'তারিখ দিন।' });
    if (file && !OK_TYPES.includes(file.type)) return a.setMsg({ ok: false, t: 'রসিদ ছবি (JPG/PNG/WEBP) বা PDF হতে হবে।' });
    if (file && file.size > 5 * 1024 * 1024) return a.setMsg({ ok: false, t: 'রসিদের ফাইল ৫ MB এর বেশি হবে না।' });
    const name = cats.find((x) => x.id === f.cat)?.name;
    if (!confirm(`${name} খাতে ${taka(amt)} খরচ লিখবেন?`)) return;
    a.run(async () => {
      let path: string | null = null;
      if (file) {
        const ext = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1];
        path = `expenses/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from('receipts').upload(path, file, { contentType: file.type });
        if (up.error) throw new Error('রসিদ আপলোড করা যায়নি।');
      }
      const { error } = await supabase.rpc('record_expense', {
        p_category: f.cat, p_amount: amt, p_date: f.date, p_description: f.description || null,
        p_payee: f.payee || null, p_receipt: f.receipt || null, p_receipt_path: path, p_key: key.current,
      });
      if (error) throw error;
      key.current = crypto.randomUUID();
      setF({ ...blank, date: f.date }); setFile(null);
      onSaved();
      return `${name} খাতে ${taka(amt)} খরচ সফলভাবে লেখা হয়েছে।`;
    });
  };

  return (
    <>
      <Card>
        <form onSubmit={submit} className="space-y-3">
          <h2 className="text-xl font-bold">নতুন খরচ যোগ করুন</h2>
          <Field label="খরচের খাত">
            <select className={inputCls} value={f.cat} onChange={set('cat')}>
              <option value="">— খাত বেছে নিন —</option>
              {cats.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </Field>
          <Field label="টাকার পরিমাণ (৳)" hint="যেমন: 25000"><input className={inputCls} inputMode="decimal" value={f.amount} onChange={set('amount')} /></Field>
          <Field label="তারিখ"><input className={inputCls} type="date" value={f.date} onChange={set('date')} /></Field>
          <Field label="বিবরণ" hint="যেমন: ২০ বস্তা সিমেন্ট কেনা"><input className={inputCls} value={f.description} onChange={set('description')} /></Field>
          <Field label="কাকে দিয়েছেন (ঐচ্ছিক)"><input className={inputCls} value={f.payee} onChange={set('payee')} /></Field>
          <Field label="রসিদ/বিল নম্বর (ঐচ্ছিক)"><input className={inputCls} value={f.receipt} onChange={set('receipt')} /></Field>
          <Field label="রসিদের ছবি বা PDF (ঐচ্ছিক)" hint="সর্বোচ্চ ৫ MB">
            <input className={inputCls} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </Field>
          <Msg m={a.msg} />
          <Btn type="submit" disabled={a.busy} className="w-full">{a.busy ? 'সংরক্ষণ হচ্ছে…' : 'খরচ সংরক্ষণ করুন'}</Btn>
        </form>
      </Card>
      <Card>
        <h2 className="text-lg font-bold mb-2">নতুন খাত যোগ করুন</h2>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="যেমন: বিদ্যুৎ সংযোগ" value={newCat} onChange={(e) => setNewCat(e.target.value)} aria-label="নতুন খাতের নাম" />
          <Btn variant="ghost" disabled={c.busy} onClick={addCat}>যোগ</Btn>
        </div>
        <div className="mt-2"><Msg m={c.msg} /></div>
      </Card>
    </>
  );
}
