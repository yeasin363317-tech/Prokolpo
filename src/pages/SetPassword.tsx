import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Btn, Card, Field, inputCls, Msg, useAction } from '../ui';

export default function SetPassword({ onDone, title = 'নতুন পাসওয়ার্ড দিন' }: any) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const a = useAction();
  const submit = (e: any) => {
    e.preventDefault();
    if (p1.length < 8) return a.setMsg({ ok: false, t: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' });
    if (p1 !== p2) return a.setMsg({ ok: false, t: 'দুইবার একই পাসওয়ার্ড লিখুন।' });
    a.run(async () => {
      const { error } = await supabase.auth.updateUser({ password: p1 });
      if (error) throw error;
      history.replaceState(null, '', window.location.pathname);
      setTimeout(onDone, 800);
      return 'পাসওয়ার্ড সফলভাবে সেট হয়েছে।';
    });
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <Field label="নতুন পাসওয়ার্ড" hint="কমপক্ষে ৮ অক্ষর">
            <input className={inputCls} type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} />
          </Field>
          <Field label="আবার লিখুন">
            <input className={inputCls} type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} />
          </Field>
          <Msg m={a.msg} />
          <Btn type="submit" disabled={a.busy} className="w-full"><KeyRound size={20} /> পাসওয়ার্ড সেট করুন</Btn>
        </form>
      </Card>
    </div>
  );
}
