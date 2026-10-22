import { useState } from 'react';
import { FileText, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { dt, taka } from '../lib/format';

export function ReceiptLink({ path }: { path: string }) {
  const [busy, setBusy] = useState(false);
  const open = async (e: any) => {
    e.stopPropagation();
    setBusy(true);
    const { data } = await supabase.storage.from('receipts').createSignedUrl(path, 120);
    setBusy(false);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
    else alert('রসিদ খোলা যায়নি।');
  };
  return (
    <button onClick={open} disabled={busy} className="inline-flex items-center gap-1 text-blue-700 font-medium underline">
      <FileText size={16} /> রসিদ দেখুন
    </button>
  );
}

export default function TxRow({ t, kind, title, actions }: { t: any; kind: 'in' | 'out'; title: string; actions?: any }) {
  const out = kind === 'out';
  return (
    <li className={`flex items-center gap-3 py-3 border-b border-slate-200/70 last:border-0 ${t.is_reversed ? 'opacity-60' : ''}`}>
      <div className={`shrink-0 w-11 h-11 rounded-2xl grid place-items-center ${out ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
        {out ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`font-semibold ${t.is_reversed ? 'line-through' : ''}`}>{title}</div>
        <div className="text-sm text-slate-600">
          {dt(t.transaction_date)}{t.period_label ? ` · ${t.period_label}` : ''}
        </div>
        {t.description && <div className="text-sm text-slate-700 break-words">{t.description}</div>}
        {t.receipt_ref && <div className="text-sm text-slate-600">রসিদ নং: {t.receipt_ref}</div>}
        {t.receipt_path && <ReceiptLink path={t.receipt_path} />}
        {t.is_reversed && <div className="text-sm font-semibold text-orange-700">✖ বাতিল করা হয়েছে</div>}
        {actions}
      </div>
      <div className={`font-bold nums whitespace-nowrap ${out ? 'text-rose-700' : 'text-emerald-700'}`}>
        {out ? '− ' : '+ '}{taka(t.amount)}
      </div>
    </li>
  );
}
