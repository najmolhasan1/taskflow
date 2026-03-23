'use client'
import { useState } from 'react'
import { Task, TaskStatus } from '@/types'
import { cn, formatTimeBn, priorityLabel, statusLabel } from '@/lib/utils'

interface Props {
  task: Task
  locked: boolean
  onUpdate: (id: string, updates: { status?: TaskStatus; progress?: number }) => void
}

const STATUS_ORDER: TaskStatus[] = ['todo', 'inprogress', 'done', 'overdue']

const chipClass: Record<string, string> = {
  todo: 'chip-todo', inprogress: 'chip-inprogress', done: 'chip-done', overdue: 'chip-overdue'
}
const sttActiveClass: Record<string, string> = {
  todo: 'active-todo', inprogress: 'active-inprogress', done: 'active-done', overdue: 'active-overdue'
}
const progColor: Record<string, string> = {
  todo: '#b0b5c8', inprogress: '#4361ee', done: '#10b981', overdue: '#f43f5e'
}
const borderAccent: Record<string, string> = {
  todo: '#d0d4e8', inprogress: '#4361ee', done: '#10b981', overdue: '#f43f5e'
}

export default function TaskCard({ task, locked, onUpdate }: Props) {
  const [showLog, setShowLog] = useState(false)
  const [localProg, setLocalProg] = useState(task.progress)
  const isDone = task.status === 'done'

  function handleStatus(st: TaskStatus) {
    if (locked) return
    onUpdate(task.id, { status: st })
  }

  function handleProgressCommit(val: number) {
    if (locked) return
    onUpdate(task.id, { progress: val })
  }

  return (
    <div className="bg-white border border-border rounded-xl p-4 mb-2.5 shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md hover:border-border-2 animate-fade-up relative overflow-hidden"
      style={{ borderLeftColor: borderAccent[task.status], borderLeftWidth: 3 }}>

      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        {/* Checkbox */}
        <button
          onClick={() => handleStatus(isDone ? 'inprogress' : 'done')}
          disabled={locked}
          className={cn(
            'w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 transition-all flex items-center justify-center',
            isDone ? 'bg-emerald border-emerald' : 'border-border-2 bg-surface-2 hover:border-emerald'
          )}>
          {isDone && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold text-ink leading-snug mb-2', isDone && 'line-through text-ink-3')}>
            {task.title}
          </p>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className={cn('chip', chipClass[task.status])}>{statusLabel(task.status)}</span>
            <span className={cn('chip', task.priority === 'high' ? 'chip-high' : task.priority === 'low' ? 'chip-low' : 'chip-mid')}>
              {priorityLabel(task.priority)}
            </span>
            {task.deadline && (
              <span className="chip chip-dl">⏰ {task.deadline}</span>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-[10px] font-mono text-ink-4 flex-shrink-0 mt-0.5">
          ⊕ {formatTimeBn(task.created_at)}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">অগ্রগতি</span>
          <span className="text-xs font-mono font-semibold text-ink-2">{localProg}%</span>
        </div>
        {/* Visual bar */}
        <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${localProg}%`, background: progColor[task.status] }} />
        </div>
        {/* Slider */}
        {!locked && (
          <input type="range" min={0} max={100} value={localProg}
            onChange={e => setLocalProg(Number(e.target.value))}
            onMouseUp={e => handleProgressCommit(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={e => handleProgressCommit(Number((e.target as HTMLInputElement).value))}
            className="w-full h-1 rounded-full cursor-pointer accent-accent" />
        )}
      </div>

      {/* Status buttons */}
      {!locked && (
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <span className="text-[10px] font-mono text-ink-4 mr-1">স্ট্যাটাস:</span>
          {STATUS_ORDER.map(st => (
            <button key={st} onClick={() => handleStatus(st)}
              className={cn('status-btn', task.status === st && sttActiveClass[st])}>
              {statusLabel(st)}
            </button>
          ))}
        </div>
      )}

      {/* Note */}
      {task.note && (
        <div className="mt-2 px-3 py-2 bg-surface-2 rounded-lg border-l-2 border-border-2 text-xs text-ink-3">
          📝 {task.note}
        </div>
      )}

      {/* Audit log toggle */}
      <button onClick={() => setShowLog(s => !s)}
        className="mt-2.5 flex items-center gap-1.5 text-[11px] font-mono text-ink-4 hover:text-ink-3 transition-colors">
        <span className={cn('transition-transform duration-200', showLog && 'rotate-90')}>▶</span>
        পরিবর্তনের ইতিহাস
        <span className="bg-surface-3 text-ink-4 text-[10px] px-1.5 py-0.5 rounded-full">
          {/* log count placeholder - will be filled with real data */}
          লগ দেখুন
        </span>
      </button>

      {showLog && (
        <div className="mt-2.5 border-l-2 border-surface-3 pl-3.5">
          <div className="flex gap-2.5 py-1.5">
            <div className="w-2 h-2 rounded-full bg-accent mt-1 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-ink-4">{formatTimeBn(task.created_at)}</span>
              <p className="text-xs text-ink-3">টাস্ক তৈরি করা হয়েছে</p>
            </div>
          </div>
          <div className="flex gap-2.5 py-1.5">
            <div className="w-2 h-2 rounded-full bg-amber mt-1 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-ink-4">{formatTimeBn(task.updated_at)}</span>
              <p className="text-xs text-ink-3">সর্বশেষ আপডেট — {statusLabel(task.status)}, {task.progress}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
