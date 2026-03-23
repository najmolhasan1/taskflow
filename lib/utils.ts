import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function formatTimeBn(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateBn(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'শুভ সকাল'
  if (h < 17) return 'শুভ দুপুর'
  if (h < 20) return 'শুভ বিকাল'
  return 'শুভ সন্ধ্যা'
}

export function getScrumMessage(): string {
  const h = new Date().getHours()
  if (h < 10) return 'Morning scrum শুরুর আগে আজকের টাস্ক প্ল্যান করুন।'
  if (h < 19) return 'সারাদিন যেকোনো সময় টাস্ক আপডেট করুন।'
  if (h < 23) return 'Evening scrum — সব টাস্ক ফাইনাল আপডেট করুন।'
  return 'আজকের কাজ সম্পন্ন। কাল দেখা হবে!'
}

export function isLockTime(): boolean {
  return new Date().getHours() >= 23
}

export function priorityLabel(p: string) {
  return { high: '⬆ High', mid: '▶ Med', low: '⬇ Low' }[p] ?? p
}

export function statusLabel(s: string) {
  return { todo: '○ To Do', inprogress: '◎ In Progress', done: '✓ Done', overdue: '⚠ Overdue' }[s] ?? s
}
