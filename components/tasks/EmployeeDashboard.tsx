'use client'
import { useState, useCallback, useEffect } from 'react'
import { Profile, Task, TaskLog, CreateTaskInput, TaskStatus, Priority } from '@/types'
import { getGreeting, getScrumMessage, isLockTime, cn, formatTimeBn } from '@/lib/utils'
import TaskCard from '@/components/tasks/TaskCard'
import DonutChart from '@/components/ui/DonutChart'
import Toast from '@/components/ui/Toast'

interface Props {
  profile: Profile
  initialTasks: Task[]
  initialLogs: TaskLog[]
}

export default function EmployeeDashboard({ profile, initialTasks, initialLogs }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [logs, setLogs] = useState<TaskLog[]>(initialLogs)
  const [toast, setToast] = useState<{ msg: string; icon?: string } | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<CreateTaskInput & { note: string }>({
    title: '', deadline: '', priority: 'mid', note: ''
  })
  const locked = isLockTime()

  const showToast = useCallback((msg: string, icon = '✦') => {
    setToast({ msg, icon })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Stats
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const inprog = tasks.filter(t => t.status === 'inprogress').length
  const overdue = tasks.filter(t => t.status === 'overdue').length
  const avgPct = total ? Math.round(tasks.reduce((a, t) => a + t.progress, 0) / total) : 0

  async function addTask() {
    if (!form.title.trim()) { showToast('টাস্কের বিবরণ লিখুন!', '⚠'); return }
    if (locked) { showToast('রাত ১১টার পর নতুন টাস্ক যোগ করা যাবে না।', '🔒'); return }
    setAdding(true)
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, note: form.note, deadline: form.deadline, priority: form.priority }),
    })
    const data = await res.json()
    if (res.ok) {
      setTasks(prev => [data.task, ...prev])
      setForm({ title: '', deadline: '', priority: 'mid', note: '' })
      showToast(`"${data.task.title}" যোগ হয়েছে`)
    } else {
      showToast(data.error ?? 'কিছু একটা সমস্যা হয়েছে।', '⚠')
    }
    setAdding(false)
  }

  async function updateTask(id: string, updates: { status?: TaskStatus; progress?: number }) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (res.ok) {
      setTasks(prev => prev.map(t => t.id === id ? data.task : t))
      showToast('আপডেট হয়েছে ✓')
    } else {
      showToast(data.error ?? 'আপডেট ব্যর্থ হয়েছে।', '⚠')
    }
  }

  const h = new Date().getHours()
  const alertClass = locked ? 'bg-rose-50 border-rose-200 text-rose-800' :
    h >= 19 ? 'bg-violet-50 border-violet-200 text-violet-800' : 'bg-amber-50 border-amber-200 text-amber-800'
  const alertMsg = locked ? '🔒 আপডেট বন্ধ — রাত ১১:০০ পার হয়েছে। Email পাঠানো হচ্ছে...' :
    h >= 19 ? '🌆 Evening scrum চলছে — সব টাস্ক ফাইনাল আপডেট করুন।' :
    '⏳ রাত ১১:০০ টার মধ্যে সকল টাস্ক আপডেট করুন — তারপর লক হয়ে যাবে।'

  return (
    <div className="max-w-6xl mx-auto px-6 py-7 pb-16">

      {/* Greeting banner */}
      <div className="rounded-2xl p-7 mb-6 flex items-center justify-between overflow-hidden relative"
        style={{background:'linear-gradient(135deg, #4361ee 0%, #6c7ff8 100%)'}}>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-10 bg-violet-300 pointer-events-none" />
        <div className="absolute right-16 bottom-4 w-24 h-24 rounded-full opacity-5 bg-white pointer-events-none" />
        <div className="relative z-10">
          <p className="text-xs font-mono text-white/60 uppercase tracking-widest mb-1">আজকের ডেইলি ট্র্যাকার</p>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight mb-1">
            {getGreeting()}, {profile.full_name.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/70 text-sm">{getScrumMessage()}</p>
        </div>
        <div className="relative z-10 flex gap-5">
          {[
            { val: total, lbl: 'টাস্ক' },
            { val: done, lbl: 'সম্পন্ন' },
            { val: `${avgPct}%`, lbl: 'অগ্রগতি' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display font-bold text-3xl text-white leading-none">{s.val}</div>
              <div className="text-xs font-mono text-white/60 mt-1 uppercase tracking-wider">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert */}
      <div className={cn('rounded-xl px-4 py-2.5 mb-5 text-sm font-mono font-medium border', alertClass)}>
        {alertMsg}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-5 items-start max-lg:grid-cols-1">
        {/* Main col */}
        <div>
          {/* Add task card */}
          {!locked && (
            <div className="card mb-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-sm">✦</span>
                <span className="font-display font-bold text-sm text-ink">নতুন টাস্ক যোগ করুন</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3 max-sm:grid-cols-1">
                <div className="col-span-1 max-sm:col-span-1">
                  <label className="block text-[10px] font-semibold tracking-wider uppercase text-ink-3 font-mono mb-1">টাস্কের বিবরণ</label>
                  <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    className="field-input" placeholder="আজকে কী করবেন?" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold tracking-wider uppercase text-ink-3 font-mono mb-1">ডেডলাইন</label>
                  <input value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))}
                    className="field-input" placeholder="যেমন: ১৭:০০" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold tracking-wider uppercase text-ink-3 font-mono mb-1">প্রায়োরিটি</label>
                  <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value as Priority}))}
                    className="field-input">
                    <option value="high">🔴 High</option>
                    <option value="mid">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold tracking-wider uppercase text-ink-3 font-mono mb-1">নোট (ঐচ্ছিক)</label>
                  <input value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))}
                    className="field-input" placeholder="বাড়তি তথ্য..." />
                </div>
                <button onClick={addTask} disabled={adding}
                  className="btn-primary mt-[18px] disabled:opacity-60">
                  {adding ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  )}
                  টাস্ক যোগ
                </button>
              </div>
            </div>
          )}

          {/* Task list */}
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">আজকের টাস্ক</span>
            <span className="bg-accent/10 text-accent text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full">
              {total}টি
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 text-ink-4 font-mono text-sm">
              <div className="text-3xl mb-3 opacity-40">📋</div>
              কোনো টাস্ক নেই। উপরে যোগ করুন!
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} locked={locked} onUpdate={updateTask} />
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Donut */}
          <div className="card">
            <p className="text-xs font-semibold tracking-wider uppercase text-ink-3 font-mono mb-4">আজকের অগ্রগতি</p>
            <DonutChart pct={avgPct} />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { val: total, lbl: 'মোট', cls: 'text-accent' },
                { val: done, lbl: 'Done', cls: 'text-emerald' },
                { val: inprog, lbl: 'চলমান', cls: 'text-amber' },
                { val: overdue, lbl: 'Overdue', cls: 'text-rose' },
              ].map(s => (
                <div key={s.lbl} className="bg-surface-2 border border-border rounded-xl p-3">
                  <div className={cn('font-display font-bold text-2xl leading-none mb-1', s.cls)}>{s.val}</div>
                  <div className="text-[10px] font-mono text-ink-3 uppercase tracking-wide">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity log */}
          <div className="card">
            <p className="text-xs font-semibold tracking-wider uppercase text-ink-3 font-mono mb-4">কার্যক্রম লগ</p>
            {tasks.length === 0 ? (
              <div className="text-center py-4 text-ink-4 font-mono text-xs">এখনো কিছু নেই</div>
            ) : (
              <div className="flex flex-col">
                {tasks.slice(0, 6).flatMap(t => t).map((task, i) => (
                  <div key={task.id} className="flex gap-2.5 py-2 border-b border-surface-3 last:border-none">
                    <div className="flex flex-col items-center pt-1.5">
                      <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                      {i < 5 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-ink-4">{formatTimeBn(task.updated_at)}</div>
                      <div className="text-xs text-ink-3 mt-0.5 truncate">"{task.title}" — {task.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} icon={toast.icon} />}
    </div>
  )
}
