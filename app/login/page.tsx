'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('ইমেইল বা পাসওয়ার্ড সঠিক নয়।'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen grid grid-cols-2 max-lg:grid-cols-1">
      {/* Left panel */}
      <div className="bg-accent relative overflow-hidden flex flex-col justify-between p-12 max-lg:hidden">
        {/* Grid texture */}
        <div className="absolute inset-0"
          style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.04) 39px,rgba(255,255,255,.04) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.04) 39px,rgba(255,255,255,.04) 40px)'}} />
        {/* Glow orbs */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full" style={{background:'radial-gradient(circle, rgba(139,92,246,.3) 0%, transparent 70%)'}} />
        <div className="absolute right-16 bottom-32 w-40 h-40 rounded-full" style={{background:'radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%)'}} />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/15 border border-white/25 rounded-xl flex items-center justify-center font-display font-bold text-lg text-white backdrop-blur-sm">T</div>
            <span className="font-display font-bold text-xl text-white tracking-tight">TaskFlow</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl text-white leading-tight tracking-tight mb-4">
            আপনার টিমের প্রতিদিনের কাজ একটাই জায়গায়।
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            Morning standup থেকে evening review পর্যন্ত — প্রতিটি টাস্কের সম্পূর্ণ ইতিহাস।
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          {[
            'Morning ও Evening scrum integration',
            'প্রতিটি টাস্কের রিয়েল-টাইম অডিট লগ',
            'রাত ১১টায় auto email summary',
            'Weekly ও Monthly performance report',
          ].map(f => (
            <div key={f} className="flex items-center gap-3 text-white/80 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center font-display font-bold text-white">T</div>
            <span className="font-display font-bold text-lg text-ink tracking-tight">TaskFlow</span>
          </div>

          <h2 className="font-display font-bold text-2xl text-ink tracking-tight mb-1">স্বাগতম 👋</h2>
          <p className="text-ink-3 text-sm mb-8">আপনার অ্যাকাউন্টে লগইন করুন</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-ink-3 font-mono mb-1.5">ইমেইল</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                className="field-input" placeholder="name@company.com" required />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-ink-3 font-mono mb-1.5">পাসওয়ার্ড</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                className="field-input" placeholder="••••••••" required />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose text-sm rounded-lg px-4 py-2.5 font-mono">
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary justify-center mt-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  লগইন হচ্ছে...
                </span>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                  লগইন করুন
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-border" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-ink-4 font-mono">setup guide-এর জন্য নিচে দেখুন</span></div>
          </div>

          <div className="bg-surface-2 border border-border rounded-xl p-4">
            <p className="text-xs font-mono text-ink-3 mb-3 font-semibold uppercase tracking-wider">First time setup?</p>
            <p className="text-xs text-ink-3 leading-relaxed">
              Supabase Dashboard → Authentication → Users → এ গিয়ে employee-দের account তৈরি করুন।
              তারপর profiles table-এ role সেট করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
