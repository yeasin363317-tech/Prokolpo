import { useState } from 'react';
import { Eye, EyeOff, LogIn, Mail, Lock, ShieldCheck, Sparkles, Users, Scale } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo, { BuildingArt } from '../Logo';
import { Btn, Msg, useAction } from '../ui';

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

  const feats = [[ShieldCheck, 'নির্ভরযোগ্য হিসাব'], [Sparkles, 'সহজ ব্যবহার'], [Users, 'সবার জন্য একসাথে'], [Scale, 'স্বচ্ছ ও আধুনিক']];

  return (
    <div className="app-bg min-h-screen lg:grid lg:grid-cols-2">
      <section className="hidden lg:flex relative flex-col justify-between p-10 text-white overflow-hidden bg-gradient-to-br from-[#143272] via-[#1d4ed8] to-[#0a1a40]">
        <BuildingArt className="absolute right-0 bottom-0 h-[92%] opacity-60" />
        <div className="relative"><Logo light /><p className="mt-3 text-xl text-blue-100">সবার জমা, সবার হিসাব।</p></div>
        <ul className="relative space-y-3">
          {feats.map(([Icon, t]: any) => (
            <li key={t} className="flex items-center gap-3 glass-dark rounded-2xl px-4 py-3 w-fit"><Icon size={22} /> {t}</li>
          ))}
        </ul>
      </section>

      <section className="flex items-center justify-center p-4 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-5"><Logo /></div>
          <form onSubmit={forgot ? reset : login} className="glass rounded-[28px] p-6 sm:p-8 space-y-5">
            <div>
              <h1 className="text-3xl font-bold text-blue-950">{forgot ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'আপনাকে স্বাগতম'}</h1>
              <p className="text-slate-600 mt-1">{forgot ? 'ইমেইল দিন, বদলানোর লিংক পাঠাব।' : 'আপনার অ্যাকাউন্টে লগইন করুন'}</p>
            </div>
            <label className="block">
              <span className="block font-semibold mb-1">ইমেইল</span>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input className="w-full min-h-[54px] rounded-2xl border border-slate-200 bg-white/85 pl-11 pr-4 focus:border-blue-600" type="email" autoComplete="email" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </label>
            {!forgot && (
              <label className="block">
                <span className="block font-semibold mb-1">পাসওয়ার্ড</span>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input className="w-full min-h-[54px] rounded-2xl border border-slate-200 bg-white/85 pl-11 pr-14 focus:border-blue-600" type={show ? 'text' : 'password'} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500" aria-label={show ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}>
                    {show ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </label>
            )}
            <Msg m={a.msg} />
            <Btn type="submit" disabled={a.busy} className="w-full text-lg">
              <LogIn size={20} /> {a.busy ? 'অপেক্ষা করুন…' : forgot ? 'লিংক পাঠান' : 'লগইন করুন'}
            </Btn>
            <button type="button" className="w-full text-blue-700 font-medium py-1" onClick={() => { setForgot(!forgot); a.setMsg(null); }}>
              {forgot ? 'লগইনে ফিরে যান' : 'পাসওয়ার্ড ভুলে গেছেন?'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-600 mt-4">এটি একটি ব্যক্তিগত সাইট। নতুন সদস্যকে অ্যাডমিন আমন্ত্রণ পাঠাবেন।</p>
        </div>
      </section>
    </div>
  );
}
