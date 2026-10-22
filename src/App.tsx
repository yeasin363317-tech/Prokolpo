import { useEffect, useState } from 'react';
import { Home, Wallet, Receipt, User, Settings } from 'lucide-react';
import { supabase, configured } from './lib/supabase';
import Login from './pages/Login';
import SetPassword from './pages/SetPassword';
import HomePage from './pages/HomePage';
import MyDeposits from './pages/MyDeposits';
import Expenses from './pages/Expenses';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { Btn, Card, Spinner } from './ui';

const startsWithInvite = /type=(invite|recovery)/.test(window.location.hash);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [needPw, setNeedPw] = useState(startsWithInvite);
  const [me, setMe] = useState<any>(null);
  const [tab, setTab] = useState('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((ev, s) => {
      setSession(s);
      if (ev === 'PASSWORD_RECOVERY') setNeedPw(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setMe(null); return; }
    const uid = session.user.id;
    (async () => {
      const [p, m] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
        supabase.from('project_members').select('role,membership_status').eq('user_id', uid).maybeSingle(),
      ]);
      setMe({ profile: p.data, role: m.data?.role, status: m.data?.membership_status });
    })();
  }, [session?.user?.id]);

  if (!configured)
    return <div className="p-6">⚠ সেটআপ বাকি: Vercel-এ VITE_SUPABASE_URL ও VITE_SUPABASE_ANON_KEY দিন।</div>;
  if (!ready) return <Spinner />;
  if (!session) return <Login />;
  if (needPw) return <SetPassword onDone={() => setNeedPw(false)} />;
  if (!me) return <Spinner />;

  if (!me.profile || me.status !== 'active')
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md space-y-3">
          <p className="font-semibold">আপনি এই প্রকল্পের সক্রিয় সদস্য নন।</p>
          <p className="text-slate-600">অ্যাডমিনের সঙ্গে যোগাযোগ করুন।</p>
          <Btn variant="ghost" onClick={() => supabase.auth.signOut()}>লগআউট</Btn>
        </Card>
      </div>
    );

  const isAdmin = me.role === 'admin';
  const tabs = [
    { id: 'home', label: 'হোম', icon: Home },
    { id: 'deposits', label: 'আমার জমা', icon: Wallet },
    { id: 'expenses', label: 'প্রজেক্টের খরচ', icon: Receipt },
    ...(isAdmin ? [{ id: 'admin', label: 'ব্যবস্থাপনা', icon: Settings }] : []),
    { id: 'profile', label: 'আমার প্রোফাইল', icon: User },
  ];

  return (
    <div className="min-h-screen pb-28">
      <header className="bg-blue-700 text-white px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="text-xl font-bold">প্রকল্প</div>
          <div className="text-blue-100 text-sm">সবার জমা, সবার হিসাব।</div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {tab === 'home' && <HomePage me={me} go={setTab} />}
        {tab === 'deposits' && <MyDeposits me={me} />}
        {tab === 'expenses' && <Expenses />}
        {tab === 'admin' && isAdmin && <Admin />}
        {tab === 'profile' && <Profile me={me} email={session.user.email} />}
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200" aria-label="প্রধান মেনু">
        <div className="max-w-3xl mx-auto grid" style={{ gridTemplateColumns: `repeat(${tabs.length},1fr)` }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} aria-current={on ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 py-2 min-h-[64px] text-xs sm:text-sm ${on ? 'text-blue-700 font-bold border-t-4 border-blue-600' : 'text-slate-600 border-t-4 border-transparent'}`}>
                <Icon size={24} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
