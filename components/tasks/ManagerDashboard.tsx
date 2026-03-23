'use client'
import { useState } from 'react'
import { Profile, Task } from '@/types'
import { cn, getInitials, formatTimeBn, statusLabel, priorityLabel } from '@/lib/utils'

interface Props {
  profile: Profile
  employees: Profile[]
  tasks: Task[]
}

const chipClass: Record<string, string> = {
  todo: 'chip-todo', inprogress: 'chip-inprogress', done: 'chip-done', overdue: 'chip-overdue'
}
const progFill: Record<string, string> = {
  todo: '#b0b5c8', inprogress: '#4361ee', done: '#10b981', overdue: '#f43f5e'
}

const DAYS_BN = ['রবি','সোম','মঙ্গল','বুধ','বৃহ','শুক্র','শনি']
const WEEK_DATA = [
  {done:5,over:1},{done:7,over:0},{done:4,over:2},{done:8,over:0},{done:6,over:1},{done:3,over:0},{done:9,over:0}
]

export default function ManagerDashboard({ profile, employees, tasks }: Props) {
  const [selectedEmp, setSelectedEmp] = useState<string>(employees[0]?.id ?? '')

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const progTasks = tasks.filter(t => t.status === 'inprogress').length
  const overTasks = tasks.filter(t => t.status === 'overdue').length
  const donePct = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0

  const empTasks = tasks.filter(t => t.user_id === selectedEmp)
  const selEmp = employees.find(e => e.id === selectedEmp)

  const today = new Date().getDay()
  const maxBar = Math.max(...WEEK_DATA.map(d => d.done + d.over))

  return (
    <div className="max-w-7xl mx-auto px-6 py-7 pb-16">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl text-ink tracking-tight">টিম ওভারভিউ</h1>
          <p className="text-xs font-mono text-ink-3 mt-0.5">
            {new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-border text-xs font-mono text-ink-3">
          📧 রাত ১১টায় সব employee-কে email যাবে
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6 max-lg:grid-cols-2">
        {[
          { icon: '📋', val: totalTasks, lbl: 'মোট টাস্ক আজ', sub: 'সব employee মিলে', color: '#4361ee', bg: '#eef1fd' },
          { icon: '✅', val: doneTasks, lbl: 'সম্পন্ন', sub: `${donePct}% সম্পন্নতা`, color: '#10b981', bg: '#ecfdf5' },
          { icon: '⏳', val: progTasks, lbl: 'চলমান', sub: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
          { icon: '⚠️', val: overTasks, lbl: 'Overdue', sub: 'সময়মতো হয়নি', color: '#f43f5e', bg: '#fff1f2' },
        ].map(s => (
          <div key={s.lbl} className="bg-white border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.07]" style={{ background: s.color }} />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <div className="font-display font-bold text-3xl leading-none mb-1 tracking-tight" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs font-mono text-ink-3">{s.lbl}</div>
            <div className="text-[10px] font-mono text-ink-4 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Employee tabs */}
      <div className="flex gap-2 border-b border-border mb-5 overflow-x-auto">
        {employees.map(emp => {
          const cnt = tasks.filter(t => t.user_id === emp.id).length
          const done = tasks.filter(t => t.user_id === emp.id && t.status === 'done').length
          const isActive = emp.id === selectedEmp
          return (
            <button key={emp.id} onClick={() => setSelectedEmp(emp.id)}
              className={cn(
                'flex items-center gap-2.5 px-4 py-2.5 pb-3 -mb-px border-b-2 transition-all rounded-t-lg whitespace-nowrap',
                isActive ? 'border-accent bg-blue-50' : 'border-transparent hover:bg-surface-3'
              )}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white font-display flex-shrink-0"
                style={{ background: emp.avatar_color }}>
                {getInitials(emp.full_name)}
              </div>
              <div className="text-left">
                <div className={cn('text-sm font-semibold', isActive ? 'text-accent' : 'text-ink-2')}>{emp.full_name}</div>
                <div className="text-[10px] font-mono text-ink-4">{emp.role}</div>
              </div>
              <span className={cn('text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold',
                isActive ? 'bg-accent text-white' : 'bg-surface-3 text-ink-3')}>
                {cnt}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-[1fr_280px] gap-5 items-start max-lg:grid-cols-1">

        {/* Task list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">{selEmp?.full_name ?? 'Employee'}-এর টাস্ক</span>
            <span className="bg-accent/10 text-accent text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full">{empTasks.length}টি</span>
          </div>

          {empTasks.length === 0 ? (
            <div className="text-center py-12 text-ink-4 font-mono text-sm">
              <div className="text-3xl mb-3 opacity-40">📋</div>
              আজকে কোনো টাস্ক নেই।
            </div>
          ) : (
            empTasks.map(task => (
              <div key={task.id} className="bg-white border border-border rounded-xl p-4 mb-2.5 shadow-sm hover:shadow-md hover:border-border-2 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink mb-2">{task.title}</p>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      <span className={cn('chip', chipClass[task.status])}>{statusLabel(task.status)}</span>
                      <span className={cn('chip', task.priority === 'high' ? 'chip-high' : task.priority === 'low' ? 'chip-low' : 'chip-mid')}>
                        {priorityLabel(task.priority)}
                      </span>
                      {task.deadline && <span className="chip chip-dl">⏰ {task.deadline}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${task.progress}%`, background: progFill[task.status] }} />
                      </div>
                      <span className="text-xs font-mono text-ink-3 min-w-[36px]">{task.progress}%</span>
                    </div>
                    {task.note && <p className="mt-2 text-xs text-ink-3 bg-surface-2 rounded px-2 py-1">📝 {task.note}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] font-mono text-ink-4">⊕ {formatTimeBn(task.created_at)}</div>
                    <div className="text-[10px] font-mono text-ink-4 mt-1">↻ {formatTimeBn(task.updated_at)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">

          {/* Weekly chart */}
          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold tracking-wider uppercase text-ink-3 font-mono mb-4">সাপ্তাহিক চিত্র</p>
            <div className="flex items-end gap-1.5 h-20 mb-2">
              {WEEK_DATA.map((d, i) => {
                const dh = Math.round((d.done / maxBar) * 64)
                const oh = Math.round((d.over / maxBar) * 64)
                const isToday = i === today
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: 64 }}>
                      {oh > 0 && <div className="flex-1 rounded-t-sm" style={{ height: oh, background: '#f43f5e', opacity: isToday ? 1 : .6 }} />}
                      <div className="flex-1 rounded-t-sm" style={{ height: dh, background: '#10b981', opacity: isToday ? 1 : .6 }} />
                    </div>
                    <span className={cn('text-[10px] font-mono', isToday ? 'text-accent font-semibold' : 'text-ink-4')}>
                      {DAYS_BN[i]}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3">
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-ink-3">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald inline-block" />সম্পন্ন
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-ink-3">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose inline-block" />Overdue
              </span>
            </div>
          </div>

          {/* Employee performance */}
          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold tracking-wider uppercase text-ink-3 font-mono mb-4">কর্মক্ষমতা</p>
            {employees.map(emp => {
              const et = tasks.filter(t => t.user_id === emp.id)
              const ed = et.filter(t => t.status === 'done').length
              const pct = et.length ? Math.round(ed / et.length * 100) : 0
              const barColor = pct === 100 ? '#10b981' : pct > 60 ? '#4361ee' : '#f59e0b'
              return (
                <div key={emp.id} className="flex items-center gap-3 py-2.5 border-b border-surface-3 last:border-none">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white font-display flex-shrink-0"
                    style={{ background: emp.avatar_color }}>
                    {getInitials(emp.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-ink-2 mb-1.5 truncate">{emp.full_name}</div>
                    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-ink-2 min-w-[36px] text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
