import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Btn, Card } from '../ui';
import SetPassword from './SetPassword';

export default function Profile({ me, email }: any) {
  const [changing, setChanging] = useState(false);
  if (changing) return <SetPassword title="পাসওয়ার্ড বদলান" onDone={() => setChanging(false)} />;
  const row = (k: string, v: string) => (
    <div className="flex justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-slate-600">{k}</span><span className="font-semibold text-right break-all">{v}</span>
    </div>
  );
  return (
    <>
      <h1 className="text-2xl font-bold">আমার প্রোফাইল</h1>
      <Card>
        {row('নাম', me.profile.full_name)}
        {row('সদস্য কোড', me.profile.member_code)}
        {row('ইমেইল', email)}
        {me.profile.phone && row('ফোন', me.profile.phone)}
        {row('ভূমিকা', me.role === 'admin' ? 'অ্যাডমিন' : 'সদস্য')}
      </Card>
      <Btn variant="ghost" className="w-full" onClick={() => setChanging(true)}>পাসওয়ার্ড বদলান</Btn>
      <Btn variant="danger" className="w-full" onClick={() => supabase.auth.signOut()}><LogOut size={20} /> লগআউট</Btn>
    </>
  );
}
