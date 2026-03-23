# TaskFlow — সম্পূর্ণ Deploy গাইড
## ধাপে ধাপে Live করুন (৩০-৪৫ মিনিট)

---

## ধাপ ১ — GitHub-এ code upload করুন

1. **github.com** → New Repository → নাম দিন `taskflow-app` → Create
2. আপনার computer-এ zip extract করুন
3. Terminal খুলুন, সেই folder-এ যান:

```bash
cd taskflow-app
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/taskflow-app.git
git push -u origin main
```

---

## ধাপ ২ — Supabase Project তৈরি করুন

1. **supabase.com** → Sign up (ফ্রি) → New Project
2. Project name: `taskflow` | Password: (strong password) | Region: `Southeast Asia (Singapore)`
3. Project তৈরি হতে ২ মিনিট লাগবে

### Database Schema চালু করুন
4. Left sidebar → **SQL Editor** → New Query
5. `supabase-schema.sql` ফাইলের সম্পূর্ণ content paste করুন
6. **Run** বাটনে click করুন → সব table তৈরি হবে

### API Keys নিন
7. Left sidebar → **Settings** → **API**
8. এই তিনটা value কপি করুন:
   - `Project URL` → এটা `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → এটা `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → এটা `SUPABASE_SERVICE_ROLE_KEY`

---

## ধাপ ৩ — Employee Account তৈরি করুন

### Supabase-এ User তৈরি
1. Left sidebar → **Authentication** → **Users** → **Add User**
2. প্রতিটা employee-এর জন্য:
   - Email: `rahela@yourcompany.com`
   - Password: (তারা পরে change করবে)
   - **Create User** → User ID কপি করুন

### Profile Table-এ যোগ করুন
3. Left sidebar → **Table Editor** → `profiles` table
4. **Insert Row** করুন প্রতিটার জন্য:

```
id          → (Supabase-এর User UUID)
full_name   → রাহেলা আক্তার
email       → rahela@yourcompany.com
role        → employee
avatar_color→ #4361ee
```

5. Manager-এর জন্য role = `manager`

---

## ধাপ ৪ — Resend (Email) Setup করুন

1. **resend.com** → Sign up (ফ্রি — ৩০০০ email/মাস)
2. **API Keys** → Create API Key → কপি করুন
3. **Domains** → Add Domain (আপনার company domain যোগ করুন)
   - যদি domain না থাকে: `onboarding@resend.dev` দিয়ে test করা যাবে

---

## ধাপ ৫ — Vercel-এ Deploy করুন

1. **vercel.com** → Sign up with GitHub
2. **New Project** → Import `taskflow-app` repository
3. **Framework Preset**: Next.js (auto detect হবে)
4. **Environment Variables** সেকশনে একে একে যোগ করুন:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | আপনার Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | `TaskFlow <noreply@yourdomain.com>` |
| `CRON_SECRET` | যেকোনো random string (যেমন: `my-secret-2024`) |
| `NEXT_PUBLIC_APP_URL` | `https://taskflow-app.vercel.app` |

5. **Deploy** → ২-৩ মিনিটে live হবে!

---

## ধাপ ৬ — Supabase-এ Redirect URL সেট করুন

1. Supabase → **Authentication** → **URL Configuration**
2. **Site URL**: `https://taskflow-app.vercel.app`
3. **Redirect URLs**: `https://taskflow-app.vercel.app/api/auth/callback`

---

## ধাপ ৭ — Daily Email Cron Verify করুন

`vercel.json` এ এই config আছে:
```json
{
  "crons": [{ "path": "/api/cron/daily-email", "schedule": "0 17 * * *" }]
}
```

এটা UTC ১৭:০০ = বাংলাদেশ সময় রাত ১১:০০ — ✅

Vercel Dashboard → **Cron Jobs** tab-এ দেখতে পাবেন।

---

## ✅ সব শেষ! Test করুন

1. Browser-এ যান: `https://taskflow-app.vercel.app`
2. Login করুন employee account দিয়ে
3. টাস্ক যোগ করুন, status update করুন
4. Manager account দিয়ে login করে টিম দেখুন

---

## সমস্যা হলে

**Login কাজ করছে না?**
→ Supabase → Authentication → URL Configuration → Redirect URL ঠিক আছে কিনা দেখুন

**Database error?**
→ Supabase → SQL Editor → schema আবার run করুন

**Email যাচ্ছে না?**
→ Resend dashboard-এ email log দেখুন | `CRON_SECRET` ঠিক আছে কিনা চেক করুন

**Build fail?**
→ Vercel → Deployment logs দেখুন | Environment variables সব আছে কিনা চেক করুন

---

## খরচের হিসাব (১০ জনের জন্য)

| Service | Plan | খরচ |
|---------|------|-----|
| Vercel | Hobby (free) | $0 |
| Supabase | Free tier (500MB) | $0 |
| Resend | Free (3000 email/মাস) | $0 |
| **মোট** | | **$0/মাস** |

10 জন × 30 দিন × 1 email = 300 email/মাস → ফ্রি লিমিটের মধ্যে ✅
