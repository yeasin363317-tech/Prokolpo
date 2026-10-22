import { useState } from 'react';
import { FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { dt, taka } from '../lib/format';

export function ReceiptLink({ path }: { path: string }) {
  const [busy, setBusy] = useState(false);
  const open = async () => {
    setBusy(true);
    const { data } = await supabase.storage.from('receipts').createSignedUrl(path, 120);
    setBusy(false);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
    else alert('রসিদ খোলা যায়নি।');
  };
  return (
    <button onClick={open} disabled={busy} className="inline-flex items-center gap-1 text-blue-700 underline">
      <FileText size={16} /> রসিদ দেখুন
    </button>
  );
}

export default function TxRow({ t, kind, title }: { t: any; kind: 'in' | 'out'; title: string }) {
  const out = kind === 'out';
  return (
    <li className={`py-3 border-b border-slate-100 last:border-0 ${t.is_reversed ? 'opacity-60' : ''}`}>
      <div className="flex justify-between gap-3">
        <div>
          <div className={`font-semibold ${t.is_reversed ? 'line-through' : ''}`}>{title}</div>
          <div className="text-sm text-slate-600">{dt(t.transaction_date)}</div>
          {t.period_label && <div className="text-sm text-slate-600">সময়কাল: {t.period_label}</div>}
          {t.description && <div className="text-sm">{t.description}</div>}
          {t.payee && <div className="text-sm text-slate-600">প্রাপক: {t.payee}</div>}
          {t.receipt_ref && <div className="text-sm text-slate-600">রসিদ নং: {t.receipt_ref}</div>}
          {t.receipt_path && <ReceiptLink path={t.receipt_path} />}
          {t.is_reversed && <div className="text-sm font-semibold text-orange-700">✖ বাতিল করা হয়েছে</div>}
        </div>
        <div className={`font-bold whitespace-nowrap ${out ? 'text-red-700' : 'text-green-700'}`}>
          {out ? '− ' : '+ '}
          {taka(t.amount)}
        </div>
      </div>
    </li>
  );
}
