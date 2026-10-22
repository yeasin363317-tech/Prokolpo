import { ReactNode, useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { errMsg } from './lib/format';

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`glass rounded-3xl p-4 sm:p-5 ${className}`}>{children}</div>
);

export const Btn = ({ children, variant = 'primary', className = '', ...p }: any) => {
  const v: any = {
    primary: 'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/25 hover:from-blue-600 hover:to-blue-800',
    ghost: 'bg-white/80 text-blue-800 border border-blue-200 hover:bg-white',
    danger: 'bg-white/80 text-red-700 border border-red-300 hover:bg-red-50',
  };
  return (
    <button {...p} className={`min-h-[52px] px-5 rounded-2xl font-semibold inline-flex items-center justify-center gap-2 transition disabled:opacity-60 ${v[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Field = ({ label, hint, children }: any) => (
  <label className="block">
    <span className="block font-semibold mb-1 text-slate-800">{label}</span>
    {children}
    {hint && <span className="block text-sm text-slate-500 mt-1">{hint}</span>}
  </label>
);
export const inputCls = 'w-full min-h-[52px] rounded-2xl border border-slate-200 bg-white/85 px-4 py-2 focus:border-blue-600 focus:bg-white';

export const PageHeader = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
  <div className="flex flex-wrap items-end justify-between gap-3 pt-1">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-950">{title}</h1>
      {sub && <p className="text-slate-600 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

export const Spinner = () => (
  <div className="flex items-center justify-center gap-2 py-16 text-slate-600" role="status">
    <Loader2 className="animate-spin" /> অপেক্ষা করুন…
  </div>
);
export const ErrorBox = ({ text }: { text: string }) =>
  text ? <div className="rounded-2xl border border-red-300 bg-red-50 text-red-800 p-3" role="alert">⚠ {text}</div> : null;
export const Empty = ({ text }: { text: string }) => <div className="text-center text-slate-500 py-8">{text}</div>;
export const Msg = ({ m }: { m: { ok: boolean; t: string } | null }) =>
  m ? (
    <div role="alert" className={`rounded-2xl p-3 border ${m.ok ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
      {m.ok ? '✔ ' : '⚠ '}{m.t}
    </div>
  ) : null;

export function useAction() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const run = async (fn: () => Promise<string>) => {
    if (busy) return false;
    setBusy(true); setMsg(null);
    try { setMsg({ ok: true, t: await fn() }); return true; }
    catch (e) { setMsg({ ok: false, t: errMsg(e) }); return false; }
    finally { setBusy(false); }
  };
  return { busy, msg, run, setMsg };
}

const TONES: any = {
  green: { icon: 'bg-emerald-100 text-emerald-700', num: 'text-emerald-700', edge: 'from-emerald-50/80' },
  red: { icon: 'bg-rose-100 text-rose-700', num: 'text-rose-700', edge: 'from-rose-50/80' },
  blue: { icon: 'bg-blue-100 text-blue-700', num: 'text-blue-700', edge: 'from-blue-50/80' },
  violet: { icon: 'bg-violet-100 text-violet-700', num: 'text-violet-700', edge: 'from-violet-50/80' },
};
export const Stat = ({ label, value, tone, icon: Icon, className = '' }: { label: string; value: string; tone: string; icon?: any; className?: string }) => {
  const t = TONES[tone] ?? TONES.blue;
  return (
    <div className={`glass rounded-3xl p-4 bg-gradient-to-br ${t.edge} to-white/60 flex items-center gap-3 ${className}`}>
      {Icon && <div className={`shrink-0 w-12 h-12 rounded-2xl grid place-items-center ${t.icon}`}><Icon size={26} /></div>}
      <div className="min-w-0">
        <div className="text-slate-600 text-[15px]">{label}</div>
        <div className={`text-2xl sm:text-[28px] font-bold nums leading-tight break-words ${t.num}`}>{value}</div>
      </div>
    </div>
  );
};

export function Modal({ open, onClose, title, children }: any) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className="glass bg-white/95 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="বন্ধ করুন" className="p-2 rounded-full hover:bg-slate-100"><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
