import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch current task
  const { data: current } = await supabase.from('tasks').select('*').eq('id', params.id).single()
  if (!current) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  if (current.locked) return NextResponse.json({ error: 'এই টাস্ক লক হয়ে গেছে।' }, { status: 403 })

  const body = await req.json()
  const updates: Record<string, unknown> = {}
  const logEntries: Array<{ action: string; old_value: object; new_value: object }> = []

  if (body.status !== undefined && body.status !== current.status) {
    updates.status = body.status
    if (body.status === 'done') updates.progress = 100
    else if (body.status === 'todo') updates.progress = 0
    logEntries.push({ action: 'status_changed', old_value: { status: current.status }, new_value: { status: body.status } })
  }

  if (body.progress !== undefined && body.progress !== current.progress) {
    updates.progress = body.progress
    logEntries.push({ action: 'progress_updated', old_value: { progress: current.progress }, new_value: { progress: body.progress } })
  }

  if (body.note !== undefined && body.note !== current.note) {
    updates.note = body.note
    logEntries.push({ action: 'note_updated', old_value: { note: current.note }, new_value: { note: body.note } })
  }

  if (!Object.keys(updates).length) return NextResponse.json({ task: current })

  const { data: task, error } = await supabase
    .from('tasks').update(updates).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Write all log entries
  if (logEntries.length) {
    await supabase.from('task_logs').insert(
      logEntries.map(e => ({ task_id: params.id, user_id: user.id, ...e }))
    )
  }

  return NextResponse.json({ task })
}
