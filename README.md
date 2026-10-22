# প্রকল্প (Prokolpo) — সবার জমা, সবার হিসাব।

React + TypeScript + Tailwind + Supabase। সব লেখা বাংলায়।

## ১. GitHub-এ তুলুন
```
git init
git add .
git commit -m "Prokolpo first version"
git branch -M main
git remote add origin https://github.com/<আপনার-নাম>/prokolpo.git
git push -u origin main
```

## ২. Vercel-এ deploy করুন
1. vercel.com → Add New → Project → GitHub থেকে `prokolpo` বেছে নিন।
2. Framework: Vite (নিজে থেকেই ধরবে)।
3. **Environment Variables** এ দুটি দিন (মান `.env.example` ফাইলে আছে):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy চাপুন। শেষে একটা লিংক পাবেন, যেমন `https://prokolpo.vercel.app`।

## ৩. Supabase-এ ৩টি সেটিং (একবারই)
Supabase ড্যাশবোর্ড → আপনার প্রজেক্ট:
1. **Authentication → URL Configuration**: *Site URL* এ আপনার Vercel লিংক দিন, আর *Redirect URLs* এ একই লিংক যোগ করুন। (না দিলে আমন্ত্রণ/পাসওয়ার্ড রিসেটের ইমেইলের লিংক কাজ করবে না।)
2. **Authentication → Sign In / Providers → Email**: "Allow new users to sign up" বন্ধ করুন।
3. **Edge Functions → Secrets**: `SITE_URL` = আপনার Vercel লিংক। (ইনভাইট ইমেইলের লিংক এখানেই ফিরবে।)

> Supabase-এর ডিফল্ট ইমেইল সেবায় ঘণ্টায় অল্প কয়েকটা ইমেইল যায়। ৩০ জনকে আমন্ত্রণ পাঠাতে হলে ধাপে ধাপে পাঠান, অথবা Authentication → SMTP এ নিজের ইমেইল সেবা যোগ করুন।

## ৪. প্রথম লগইন
অ্যাডমিন অ্যাকাউন্ট ডাটাবেসে তৈরি আছে। লগইন করে **আমার প্রোফাইল → পাসওয়ার্ড বদলান** দিয়ে সঙ্গে সঙ্গে শক্ত পাসওয়ার্ড দিন।

## নিরাপত্তা
- সব অনুমতি ডাটাবেসের RLS ও ফাংশনে বাঁধা; React শুধু দেখায়।
- `service_role` key কোথাও নেই। শুধু publishable (anon) key ব্যবহার হয়।
- লেনদেন মোছা/বদলানো যায় না; ভুল হলে "সংশোধন" (বাতিল এন্ট্রি)।

## লোকাল চালানো
```
npm install
cp .env.example .env
npm run dev
```
