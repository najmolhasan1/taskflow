import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const today = new Date().toISOString().split('T')[0]

  // Check lock time (11pm)
  if (new Date().getHours() >= 23)
    return NextResponse.json({ error: 'রাত ১১টার পর নতুন টাস্ক যোগ করা যাবে না।' }, { status: 403 })

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: body.title,
      note: body.note || null,
      deadline: body.deadline || null,
      priority: body.priority ?? 'mid',
      status: 'todo',
      progress: 0,
      task_date: today,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Write audit log
  await supabase.from('task_logs').insert({
    task_id: task.id,
    user_id: user.id,
    action: 'created',
    new_value: { title: task.title, priority: task.priority },
  })

  return NextResponse.json({ task })
}
