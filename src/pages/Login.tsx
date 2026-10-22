import { useState } from 'react';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from '../Logo';
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

  return (
    <div className="login-shell">
      <section className="login-scene" aria-label="Landing section">
        <div className="login-scene__topbar">
          <div className="login-brand-wrap">
            <Logo light />
          </div>
          <button type="button" className="login-language" aria-label="ভাষা নির্বাচন">
            <span className="login-language__icon">◐</span>
            <span>বাংলা</span>
            <span className="login-language__caret">▾</span>
          </button>
        </div>

        <div className="login-scene__copy">
          <h2>
            একসাথে গড়ি
            <br />
            আমাদের ডিজিটাল ভবিষ্যৎ
          </h2>
          <p>
            নির্বাচন, প্রজেক্ট, আর্থিক হিসাব, এবং সবার জন্য একসাথে একটি নতুন
            <br />
            নেটওয়ার্ক গড়ে তুলুন।
          </p>
        </div>

        <div className="service-strip">
          {[
            ['নির্বাচন', '📊'],
            ['সদর জনা', '👥'],
            ['খরচ', '💰'],
            ['স্মারক', '📁'],
          ].map(([label, icon]) => (
            <div key={label} className="service-item">
              <span className="service-item__icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="login-scene__footer">© 2026 Prokolpo. সব স্বত্ব সংরক্ষিত।</div>
      </section>

      <aside className="login-panel">
        <div className="login-card glass">
          <div className="login-card__brand">
            <Logo />
          </div>

          <h1>{forgot ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'স্বাগতম!'}</h1>
          <p className="login-card__lead">
            {forgot
              ? 'ইমেইল দিন, বদলানোর লিংক পাঠাব।'
              : 'আপনার অ্যাকাউন্টে লগইন করুন এবং আপনার প্রোফাইল পরিচালনা করুন।'}
          </p>

          <form onSubmit={forgot ? reset : login} className="login-form">
            <label className="login-field">
              <span>ইমেইল</span>
              <div className="login-input-wrap">
                <Mail className="login-input-icon" size={18} />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="আপনার ইমেইল লিখুন"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>

            {!forgot && (
              <label className="login-field">
                <span>পাসওয়ার্ড</span>
                <div className="login-input-wrap">
                  <Lock className="login-input-icon" size={18} />
                  <input
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="আপনার পাসওয়ার্ড"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="password-toggle"
                    aria-label={show ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}

            <Msg m={a.msg} />

            <div className="login-remember-row">
              <label className="remember-me">
                <input type="checkbox" defaultChecked />
                <span>আমাকে মনে রাখুন</span>
              </label>

              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setForgot(!forgot);
                  a.setMsg(null);
                }}
              >
                {forgot ? 'লগইনে ফিরে যান' : 'পাসওয়ার্ড ভুলে গেছেন?'}
              </button>
            </div>

            <Btn type="submit" disabled={a.busy} className="login-submit">
              <LogIn size={20} /> {a.busy ? 'অপেক্ষা করুন…' : forgot ? 'লিংক পাঠান' : 'লগইন করুন'}
            </Btn>

            <div className="login-divider">অথবা</div>

            <button type="button" className="login-guest-btn">
              <span className="guest-icon">◌</span>
              <span>একটি নতুন সদস্য হিসেবে সাইন আপ করুন</span>
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
