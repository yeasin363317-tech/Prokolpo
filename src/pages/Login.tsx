import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Btn, Card, ErrorBox, Field, inputCls, Msg, useAction } from '../ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [forgot, setForgot] = useState(false);
  const a = useAction();

  const login = (e: any) => {
    e.preventDefault();
    if (!email.trim() || !pw) return a.setMsg({ ok: false, t: 'ইমেইল ও পাসওয়ার্ড দিন।' });
    a.run(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
      if (error) throw error;
      return 'লগইন সফল হয়েছে।';
    });
  };
  const reset = (e: any) => {
    e.preventDefault();
    if (!email.trim()) return a.setMsg({ ok: false, t: 'আপনার ইমেইল লিখুন।' });
    a.run(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
      if (error) throw error;
      return 'ইমেইলে পাসওয়ার্ড বদলানোর লিংক পাঠানো হয়েছে। ইনবক্স দেখুন।';
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-700">প্রকল্প</h1>
          <p className="text-slate-600 mt-1">সবার জমা, সবার হিসাব।</p>
        </div>
        <Card>
          <form onSubmit={forgot ? reset : login} className="space-y-4">
            <h2 className="text-xl font-bold">{forgot ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'লগইন করুন'}</h2>
            <Field label="ইমেইল" hint="যেমন: name@gmail.com">
              <input className={inputCls} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            {!forgot && (
              <Field label="পাসওয়ার্ড">
                <div className="relative">
                  <input className={inputCls + ' pr-14'} type={show ? 'text' : 'password'} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2" aria-label={show ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}>
                    {show ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </Field>
            )}
            <Msg m={a.msg} />
            <Btn type="submit" disabled={a.busy} className="w-full">
              <LogIn size={20} /> {a.busy ? 'অপেক্ষা করুন…' : forgot ? 'লিংক পাঠান' : 'লগইন করুন'}
            </Btn>
            <button type="button" className="w-full text-blue-700 underline py-2" onClick={() => { setForgot(!forgot); a.setMsg(null); }}>
              {forgot ? 'লগইনে ফিরে যান' : 'পাসওয়ার্ড ভুলে গেছেন?'}
            </button>
          </form>
        </Card>
        <p className="text-center text-sm text-slate-500">এটি একটি ব্যক্তিগত সাইট। নতুন সদস্যকে অ্যাডমিন আমন্ত্রণ পাঠাবেন।</p>
      </div>
    </div>
  );
}
