import { Landmark, Layers, Package, HardHat, Truck, FileText, Receipt } from 'lucide-react';
const TONES = [
  { bg: 'bg-rose-100', fg: 'text-rose-700', bar: 'bg-rose-500' },
  { bg: 'bg-amber-100', fg: 'text-amber-700', bar: 'bg-amber-500' },
  { bg: 'bg-sky-100', fg: 'text-sky-700', bar: 'bg-sky-500' },
  { bg: 'bg-emerald-100', fg: 'text-emerald-700', bar: 'bg-emerald-500' },
  { bg: 'bg-violet-100', fg: 'text-violet-700', bar: 'bg-violet-500' },
  { bg: 'bg-orange-100', fg: 'text-orange-700', bar: 'bg-orange-500' },
];
export function catStyle(name = '', idx = 0) {
  let Icon: any = Receipt;
  if (name.includes('জমি')) Icon = Landmark;
  else if (name.includes('রড') || name.includes('স্টিল')) Icon = Layers;
  else if (name.includes('সিমেন্ট') || name.includes('ইট') || name.includes('বালু')) Icon = Package;
  else if (name.includes('শ্রমিক') || name.includes('মজুরি')) Icon = HardHat;
  else if (name.includes('পরিবহন')) Icon = Truck;
  else if (name.includes('অনুমোদন')) Icon = FileText;
  return { Icon, ...TONES[idx % TONES.length] };
}
