export function Mark({ size = 40, light = false }: { size?: number; light?: boolean }) {
  const a = light ? '#ffffff' : '#1d4ed8';
  const b = light ? '#bfdbfe' : '#60a5fa';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="9" y="12" width="17" height="30" rx="2" fill={a} />
      <rect x="22" y="4" width="17" height="38" rx="2" fill={b} opacity=".95" />
      {[16, 22, 28, 34].map((y) => <rect key={y} x="12" y={y} width="4" height="3" rx=".6" fill={light ? '#1e3a8a' : '#eff6ff'} />)}
      {[16, 22, 28, 34].map((y) => <rect key={'b' + y} x="19" y={y} width="4" height="3" rx=".6" fill={light ? '#1e3a8a' : '#eff6ff'} />)}
      {[9, 15, 21, 27, 33].map((y) => <rect key={'c' + y} x="26" y={y} width="4" height="3" rx=".6" fill={light ? '#1e3a8a' : '#1d4ed8'} opacity=".6" />)}
      <rect x="5" y="42" width="38" height="2.5" rx="1.2" fill={a} />
    </svg>
  );
}

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Mark light={light} size={42} />
      <div className="leading-tight">
        <div className={`text-xl font-bold ${light ? 'text-white' : 'text-blue-900'}`}>Prokolpo</div>
        <div className={`text-base font-medium ${light ? 'text-blue-200' : 'text-blue-600'}`}>প্রকল্প</div>
      </div>
    </div>
  );
}

export function BuildingArt({ className = '' }: { className?: string }) {
  const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <svg viewBox="0 0 320 420" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#93c5fd" /><stop offset="1" stopColor="#3b82f6" /></linearGradient>
        <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#dbeafe" /><stop offset="1" stopColor="#60a5fa" /></linearGradient>
      </defs>
      <path d="M250 8 V120 M250 20 L170 20 M170 20 V46 M250 20 L290 20" stroke="#1d4ed8" strokeWidth="3" fill="none" opacity=".55" />
      <rect x="60" y="120" width="120" height="290" rx="6" fill="url(#bg1)" opacity=".9" />
      <rect x="150" y="60" width="110" height="350" rx="6" fill="url(#bg2)" />
      {rows.map((r) => (
        <g key={r}>
          {[0, 1, 2].map((c) => <rect key={c} x={72 + c * 36} y={136 + r * 30} width="22" height="16" rx="2" fill="#eff6ff" opacity=".85" />)}
          {[0, 1, 2].map((c) => <rect key={'b' + c} x={164 + c * 32} y={78 + r * 34} width="20" height="18" rx="2" fill="#1e40af" opacity=".28" />)}
        </g>
      ))}
      <rect x="20" y="408" width="280" height="6" rx="3" fill="#1e3a8a" opacity=".5" />
    </svg>
  );
}
