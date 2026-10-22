import { useEffect, useState } from 'react';
import { Home, Wallet, Receipt, User, Settings, LogOut } from 'lucide-react';
import { supabase, configured } from './lib/supabase';
import { greeting } from './lib/format';
import Logo from './Logo';
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
  const [adminSec, setAdminSec] = useState('members');
  const go = (t: string, sec?: string) => { if (sec) setAdminSec(sec); setTab(t); window.scrollTo({ top: 0 }); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((ev, s) => { setSession(s); if (ev === 'PASSWORD_RECOVERY') setNeedPw(true); });
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

  if (!configured) return <div className="p-6">⚠ সেটআপ বাকি: Vercel-এ VITE_SUPABASE_URL ও VITE_SUPABASE_ANON_KEY দিন।</div>;
  if (!ready) return <div className="app-bg"><Spinner /></div>;
  if (!session) return <Login />;
  if (needPw) return <SetPassword onDone={() => setNeedPw(false)} />;
  if (!me) return <div className="app-bg"><Spinner /></div>;

  if (!me.profile || me.status !== 'active')
    return (
      <div className="app-bg min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md space-y-3">
          <p className="font-semibold">আপনি এই প্রকল্পের সক্রিয় সদস্য নন।</p>
          <p className="text-slate-600">অ্যাডমিনের সঙ্গে যোগাযোগ করুন।</p>
          <Btn variant="ghost" onClick={() => supabase.auth.signOut()}>লগআউট</Btn>
        </Card>
      </div>
    );

  const isAdmin = me.role === 'admin';
  const tabs = [
    { id: 'home', label: 'হোম', short: 'হোম', icon: Home },
    { id: 'deposits', label: 'আমার জমা', short: 'আমার জমা', icon: Wallet },
    { id: 'expenses', label: 'প্রজেক্টের খরচ', short: 'খরচ', icon: Receipt },
    ...(isAdmin ? [{ id: 'admin', label: 'ব্যবস্থাপনা', short: 'ব্যবস্থাপনা', icon: Settings }] : []),
    { id: 'profile', label: 'আমার প্রোফাইল', short: 'প্রোফাইল', icon: User },
  ];
  const initial = (me.profile.full_name || '?').trim().charAt(0);

  return (
    <div className="app-bg">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col p-4 text-white z-30 bg-gradient-to-b from-[#143272] via-[#0e2556] to-[#0a1a40]">
        <div className="px-2 py-3"><Logo light /></div>
        <nav className="mt-6 space-y-1.5 flex-1" aria-label="প্রধান মেনু">
          {tabs.map((t) => {
            const Icon = t.icon; const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => go(t.id)} aria-current={on ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 min-h-[52px] rounded-2xl text-left font-medium transition ${on ? 'bg-blue-600 shadow-lg shadow-blue-950/50' : 'text-blue-100 hover:bg-white/10'}`}>
                <Icon size={22} /> {t.label}
              </button>
            );
          })}
        </nav>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 px-4 min-h-[52px] rounded-2xl border border-white/20 text-blue-100 hover:bg-white/10">
          <LogOut size={20} /> লগআউট
        </button>
      </aside>

      <div className="lg:pl-64 min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 glass rounded-none border-x-0 border-t-0 px-4 py-2 flex items-center justify-between">
          <Logo />
          <button onClick={() => go('profile')} aria-label="আমার প্রোফাইল" className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white font-bold text-lg">{initial}</button>
        </header>
        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-between max-w-5xl mx-auto px-6 pt-6">
          <div>
            <div className="text-slate-600">{greeting()}</div>
            <div className="text-2xl font-bold text-blue-950">{me.profile.full_name}</div>
          </div>
          <div className="flex items-center gap-3 glass rounded-full pl-4 pr-1.5 py-1.5">
            <span className="text-slate-600 text-sm">সদস্য কোড: <b className="text-slate-800">{me.profile.member_code}</b></span>
            <button onClick={() => go('profile')} aria-label="আমার প্রোফাইল" className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white font-bold">{initial}</button>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 lg:py-6 pb-28 lg:pb-10 space-y-5">
          {tab === 'home' && <HomePage me={me} go={go} isAdmin={isAdmin} />}
          {tab === 'deposits' && <MyDeposits me={me} />}
          {tab === 'expenses' && <Expenses isAdmin={isAdmin} go={go} />}
          {tab === 'admin' && isAdmin && <Admin initial={adminSec} />}
          {tab === 'profile' && <Profile me={me} email={session.user.email} />}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass rounded-none border-x-0 border-b-0" aria-label="প্রধান মেনু">
          <div className="grid pb-[env(safe-area-inset-bottom)]" style={{ gridTemplateColumns: `repeat(${tabs.length},1fr)` }}>
            {tabs.map((t) => {
              const Icon = t.icon; const on = tab === t.id;
              return (
                <button key={t.id} onClick={() => go(t.id)} aria-current={on ? 'page' : undefined}
                  className={`flex flex-col items-center justify-center gap-0.5 min-h-[64px] text-[13px] ${on ? 'text-blue-700 font-bold' : 'text-slate-600'}`}>
                  <span className={`px-4 py-1 rounded-full ${on ? 'bg-blue-100' : ''}`}><Icon size={22} /></span>
                  {t.short}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
