import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Mark } from '../Logo';
import { Msg, useAction } from '../ui';

const box = 'flex items-center gap-3 rounded-2xl bg-white/85 border border-white px-3 py-2 min-h-[72px] focus-within:ring-2 focus-within:ring-blue-600';

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
    <div className="login-bg flex items-end lg:items-center justify-center lg:justify-end p-3 sm:p-6 lg:pr-[4vw]">
      <form onSubmit={forgot ? reset : login} className="login-card w-full max-w-[520px] lg:max-w-none lg:w-[44vw] lg:max-w-[680px] rounded-[28px] p-5 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Mark size={52} />
          <div className="leading-tight">
            <div className="text-2xl sm:text-3xl font-bold text-blue-950">Prokolpo</div>
            <div className="text-slate-600">সবার জমা, সবার হিসাব।</div>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">{forgot ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'স্বাগতম!'}</h1>
          <p className="text-slate-700 mt-1">
            {forgot ? 'আপনার ইমেইল দিন, পাসওয়ার্ড বদলানোর লিংক পাঠাব।' : 'আপনার অ্যাকাউন্টে লগইন করুন এবং আপনার প্রকল্পের হিসাব দেখুন।'}
          </p>
        </div>

        <label className={box}>
          <span className="shrink-0 w-11 h-11 rounded-full bg-slate-100 grid place-items-center text-slate-700"><Mail size={22} /></span>
          <span className="block flex-1 min-w-0">
            <span className="block text-sm font-semibold text-slate-900">ইমেইল ঠিকানা</span>
            <input className="w-full bg-transparent outline-none placeholder:text-slate-500" type="email" autoComplete="email" placeholder="আপনার ইমেইল লিখুন" value={email} onChange={(e) => setEmail(e.target.value)} />
          </span>
        </label>

        {!forgot && (
          <label className={box}>
            <span className="shrink-0 w-11 h-11 rounded-full bg-slate-100 grid place-items-center text-slate-700"><Lock size={22} /></span>
            <span className="block flex-1 min-w-0">
              <span className="block text-sm font-semibold text-slate-900">পাসওয়ার্ড</span>
              <input className="w-full bg-transparent outline-none placeholder:text-slate-500" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="আপনার পাসওয়ার্ড লিখুন" value={pw} onChange={(e) => setPw(e.target.value)} />
            </span>
            <button type="button" onClick={() => setShow(!show)} className="shrink-0 p-2 text-slate-600" aria-label={show ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}>
              {show ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </label>
        )}

        <div className="text-right">
          <button type="button" className="text-blue-700 font-semibold py-1" onClick={() => { setForgot(!forgot); a.setMsg(null); }}>
            {forgot ? 'লগইনে ফিরে যান' : 'পাসওয়ার্ড ভুলে গেছেন?'}
          </button>
        </div>

        <Msg m={a.msg} />

        <button type="submit" disabled={a.busy}
          className="w-full min-h-[58px] rounded-2xl text-lg font-bold text-white inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg shadow-blue-700/30 hover:from-blue-600 hover:to-blue-800 disabled:opacity-60">
          <ArrowRight size={22} /> {a.busy ? 'অপেক্ষা করুন…' : forgot ? 'লিংক পাঠান' : 'লগইন করুন'}
        </button>

        <div className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white px-3 py-3 text-slate-700 text-[15px]">
          <ShieldCheck size={22} className="shrink-0 text-blue-700" />
          এটি একটি নিরাপদ সিস্টেম। আপনার তথ্য সম্পূর্ণভাবে সুরক্ষিত।
        </div>
      </form>
    </div>
  );
}
