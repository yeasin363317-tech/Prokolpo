import { useState } from 'react';
import { LogOut, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Btn, Card, PageHeader } from '../ui';
import SetPassword from './SetPassword';

export default function Profile({ me, email }: any) {
  const [changing, setChanging] = useState(false);
  if (changing) return <SetPassword title="পাসওয়ার্ড বদলান" onDone={() => setChanging(false)} />;
  const initial = (me.profile.full_name || '?').trim().charAt(0);
  const row = (k: string, v: string) => (
    <div className="flex justify-between gap-3 py-3 border-b border-slate-200/70 last:border-0">
      <span className="text-slate-600">{k}</span><span className="font-semibold text-right break-all">{v}</span>
    </div>
  );
  return (
    <>
      <PageHeader title="আমার প্রোফাইল" sub="আপনার অ্যাকাউন্টের তথ্য" />
      <Card className="flex flex-col items-center text-center gap-1 py-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white text-3xl font-bold grid place-items-center shadow-lg">{initial}</div>
        <div className="text-xl font-bold mt-2">{me.profile.full_name}</div>
        <div className="text-slate-600">{me.role === 'admin' ? 'অ্যাডমিন' : 'সদস্য'}</div>
      </Card>
      <Card>
        {row('সদস্য কোড', me.profile.member_code)}
        {row('ইমেইল', email)}
        {me.profile.phone && row('ফোন', me.profile.phone)}
      </Card>
      <div className="grid sm:grid-cols-2 gap-3">
        <Btn variant="ghost" onClick={() => setChanging(true)}><KeyRound size={20} /> পাসওয়ার্ড বদলান</Btn>
        <Btn variant="danger" onClick={() => supabase.auth.signOut()}><LogOut size={20} /> লগআউট</Btn>
      </div>
    </>
  );
}
