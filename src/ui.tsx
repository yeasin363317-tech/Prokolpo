import { ReactNode, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { errMsg } from './lib/format';

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-sm ${className}`}>{children}</div>
);

export const Btn = ({ children, variant = 'primary', className = '', ...p }: any) => {
  const v: any = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50',
    danger: 'bg-white text-red-700 border border-red-300 hover:bg-red-50',
  };
  return (
    <button
      {...p}
      className={`min-h-[52px] px-5 rounded-xl font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 ${v[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Field = ({ label, hint, children }: any) => (
  <label className="block">
    <span className="block font-semibold mb-1">{label}</span>
    {children}
    {hint && <span className="block text-sm text-slate-500 mt-1">{hint}</span>}
  </label>
);
export const inputCls =
  'w-full min-h-[52px] rounded-xl border border-slate-300 bg-white px-3 py-2 focus:border-blue-600';

export const Spinner = () => (
  <div className="flex items-center justify-center gap-2 py-10 text-slate-600" role="status">
    <Loader2 className="animate-spin" /> অপেক্ষা করুন…
  </div>
);
export const ErrorBox = ({ text }: { text: string }) =>
  text ? <div className="rounded-xl border border-red-300 bg-red-50 text-red-800 p-3" role="alert">⚠ {text}</div> : null;
export const Empty = ({ text }: { text: string }) => (
  <div className="text-center text-slate-500 py-8">{text}</div>
);
export const Msg = ({ m }: { m: { ok: boolean; t: string } | null }) =>
  m ? (
    <div
      role="alert"
      className={`rounded-xl p-3 border ${m.ok ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}
    >
      {m.ok ? '✔ ' : '⚠ '}
      {m.t}
    </div>
  ) : null;

export function useAction() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const run = async (fn: () => Promise<string>) => {
    if (busy) return false;
    setBusy(true);
    setMsg(null);
    try {
      setMsg({ ok: true, t: await fn() });
      return true;
    } catch (e) {
      setMsg({ ok: false, t: errMsg(e) });
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, msg, run, setMsg };
}

export const Stat = ({ label, value, tone }: { label: string; value: string; tone: 'green' | 'red' | 'blue' }) => {
  const c: any = { green: 'text-green-700', red: 'text-red-700', blue: 'text-blue-700' };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-slate-600">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${c[tone]}`}>{value}</div>
    </div>
  );
};
