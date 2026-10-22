export const taka = (n: any) =>
  '৳ ' + new Intl.NumberFormat('bn-BD', { maximumFractionDigits: 2 }).format(Number(n ?? 0));
export const dt = (d: string) =>
  d ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
export const monthKey = (d: string) => d.slice(0, 7);
export const monthLabel = (k: string) =>
  new Date(k + '-01T00:00:00').toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' });
export const today = () => new Date().toISOString().slice(0, 10);
export const errMsg = (e: any) => {
  const m: string = e?.message ?? '';
  if (/[\u0980-\u09FF]/.test(m)) return m;
  if (/Invalid login/i.test(m)) return 'ইমেইল বা পাসওয়ার্ড ঠিক নয়।';
  if (/fetch|network/i.test(m)) return 'ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
  return 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।';
};
export function downloadCsv(name: string, rows: any[][]) {
  const safe = (c: any) => {
    let s = String(c ?? '');
    if (/^[=+@]/.test(s) || (/^-/.test(s) && isNaN(Number(s)))) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const csv = '\ufeff' + rows.map((r) => r.map(safe).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = name;
  a.click();
}
