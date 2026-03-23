'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types'
import { getInitials } from '@/lib/utils'
import { useState, useEffect } from 'react'

export default function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setTime(d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }))
      setDate(d.toLocaleDateString('bn-BD', { weekday: 'short', day: 'numeric', month: 'short' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Nav */}
      <nav className="h-14 bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="h-full px-6 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mr-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-display font-bold text-sm text-white">T</div>
            <span className="font-display font-bold text-base text-ink tracking-tight">TaskFlow</span>
          </div>

          <div className="w-px h-5 bg-border" />

          {/* Nav label */}
          <span className="text-sm font-medium text-ink-3">
            {profile.role === 'manager' ? '📊 টিম ওভারভিউ' : '📋 আজকের টাস্ক'}
          </span>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2.5">
            {/* Scrum pills */}
            <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-600 border border-amber-200">
              🌅 ১০:০০ Morning
            </span>
            <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-violet-50 text-violet-600 border border-violet-200">
              🌆 ১৯:০০ Evening
            </span>

            {/* Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-mono text-ink-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse-dot" />
              <span>{time}</span>
              <span className="opacity-50">{date}</span>
            </div>

            {/* User chip */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white font-display flex-shrink-0"
                style={{ background: profile.avatar_color }}>
                {getInitials(profile.full_name)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-ink-2 leading-none">{profile.full_name}</div>
                <div className="text-[10px] font-mono text-ink-4 mt-0.5 capitalize">{profile.role}</div>
              </div>
            </div>

            {/* Logout */}
            <button onClick={logout}
              className="w-8 h-8 rounded-lg border border-border bg-surface-2 flex items-center justify-center text-ink-3 transition-all hover:border-rose hover:text-rose hover:bg-rose-50">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
