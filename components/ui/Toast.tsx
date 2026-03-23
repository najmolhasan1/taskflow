'use client'
interface Props { msg: string; icon?: string }

export default function Toast({ msg, icon = '✓' }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-ink text-white text-xs font-mono
      rounded-xl px-4 py-3 shadow-lg animate-fade-up max-w-xs">
      <span className="text-base flex-shrink-0">{icon}</span>
      <span>{msg}</span>
    </div>
  )
}
