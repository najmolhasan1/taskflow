import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  // Verify cron secret (set in Vercel cron)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // 1. Lock all today's tasks
  await supabase.from('tasks').update({ locked: true }).eq('task_date', today).eq('locked', false)

  // 2. Get all employees
  const { data: employees } = await supabase.from('profiles').select('*').eq('role', 'employee')
  if (!employees?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  for (const emp of employees) {
    // Check not already sent today
    const { data: existing } = await supabase.from('email_logs')
      .select('id').eq('user_id', emp.id).eq('log_date', today).eq('email_type', 'daily_summary').single()
    if (existing) continue

    // Get today's tasks
    const { data: tasks } = await supabase.from('tasks')
      .select('*').eq('user_id', emp.id).eq('task_date', today).order('created_at')
    if (!tasks) continue

    const total = tasks.length
    const done = tasks.filter(t => t.status === 'done').length
    const inprog = tasks.filter(t => t.status === 'inprogress').length
    const overdue = tasks.filter(t => t.status === 'overdue').length
    const todo = tasks.filter(t => t.status === 'todo').length
    const pct = total ? Math.round(done / total * 100) : 0

    const statusColor = (s: string) => ({ done: '#10b981', inprogress: '#4361ee', overdue: '#f43f5e', todo: '#b0b5c8' })[s] ?? '#b0b5c8'
    const priorityLabel = (p: string) => ({ high: '🔴 High', mid: '🟡 Mid', low: '🟢 Low' })[p] ?? p

    const taskRows = tasks.map(t => `
      <tr style="border-bottom:1px solid #f0f2f8">
        <td style="padding:10px 12px;font-size:13px;color:#1a1f36">${t.title}</td>
        <td style="padding:10px 12px;text-align:center">
          <span style="background:${statusColor(t.status)}20;color:${statusColor(t.status)};padding:2px 10px;border-radius:20px;font-size:11px;font-family:monospace">${t.status}</span>
        </td>
        <td style="padding:10px 12px;text-align:center;font-family:monospace;font-size:12px;color:#4361ee">${t.progress}%</td>
        <td style="padding:10px 12px;text-align:center;font-size:12px;color:#7a7f96">${t.deadline ?? '—'}</td>
        <td style="padding:10px 12px;text-align:center;font-size:12px">${priorityLabel(t.priority)}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{font-family:'DM Sans',Arial,sans-serif;background:#f5f6fa;margin:0;padding:0}
.wrap{max-width:600px;margin:0 auto;padding:32px 16px}
.card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07)}
.header{background:#4361ee;padding:28px 32px;background-image:radial-gradient(ellipse at 80% 20%,rgba(139,92,246,.4) 0%,transparent 60%)}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.stat{padding:16px;text-align:center;border-right:1px solid #f0f2f8}
</style></head><body>
<div class="wrap">
<div class="card">
  <div class="header">
    <div style="color:rgba(255,255,255,.7);font-size:12px;font-family:monospace;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">TaskFlow · Daily Summary</div>
    <div style="color:#fff;font-size:22px;font-weight:700">আজকের রিপোর্ট, ${emp.full_name.split(' ')[0]}!</div>
    <div style="color:rgba(255,255,255,.7);font-size:13px;margin-top:4px">${new Date().toLocaleDateString('bn-BD',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
  </div>

  <div style="padding:24px 32px;border-bottom:1px solid #f0f2f8">
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:48px;font-weight:700;color:${pct===100?'#10b981':pct>60?'#4361ee':'#f59e0b'};font-family:monospace;line-height:1">${pct}%</div>
      <div style="color:#7a7f96;font-size:13px;margin-top:4px">আজকের সম্পন্নতা</div>
    </div>
    <div class="stat-grid">
      <div class="stat"><div style="font-size:24px;font-weight:700;color:#4361ee">${total}</div><div style="font-size:11px;color:#7a7f96;font-family:monospace;text-transform:uppercase">মোট</div></div>
      <div class="stat"><div style="font-size:24px;font-weight:700;color:#10b981">${done}</div><div style="font-size:11px;color:#7a7f96;font-family:monospace;text-transform:uppercase">Done</div></div>
      <div class="stat"><div style="font-size:24px;font-weight:700;color:#f59e0b">${inprog}</div><div style="font-size:11px;color:#7a7f96;font-family:monospace;text-transform:uppercase">চলমান</div></div>
      <div class="stat" style="border-right:none"><div style="font-size:24px;font-weight:700;color:#f43f5e">${overdue}</div><div style="font-size:11px;color:#7a7f96;font-family:monospace;text-transform:uppercase">Overdue</div></div>
    </div>
  </div>

  <div style="padding:24px 32px">
    <div style="font-size:12px;font-family:monospace;text-transform:uppercase;letter-spacing:.8px;color:#7a7f96;margin-bottom:14px">আজকের টাস্ক বিস্তারিত</div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:#f5f6fa">
        <th style="padding:8px 12px;text-align:left;font-size:11px;font-family:monospace;color:#7a7f96;text-transform:uppercase">টাস্ক</th>
        <th style="padding:8px 12px;font-size:11px;font-family:monospace;color:#7a7f96;text-transform:uppercase">স্ট্যাটাস</th>
        <th style="padding:8px 12px;font-size:11px;font-family:monospace;color:#7a7f96;text-transform:uppercase">%</th>
        <th style="padding:8px 12px;font-size:11px;font-family:monospace;color:#7a7f96;text-transform:uppercase">ডেডলাইন</th>
        <th style="padding:8px 12px;font-size:11px;font-family:monospace;color:#7a7f96;text-transform:uppercase">প্রায়োরিটি</th>
      </tr></thead>
      <tbody>${taskRows}</tbody>
    </table>
  </div>

  <div style="padding:20px 32px;background:#f5f6fa;border-top:1px solid #e4e6f0;text-align:center">
    <div style="font-size:12px;color:#b0b5c8;font-family:monospace">TaskFlow · আগামীকাল সকাল ১০টায় morning scrum</div>
  </div>
</div></div></body></html>`

    const { error: emailErr } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: emp.email,
      subject: `TaskFlow: ${pct}% সম্পন্ন — ${emp.full_name.split(' ')[0]}-এর আজকের রিপোর্ট`,
      html,
    })

    if (!emailErr) {
      await supabase.from('email_logs').insert({ user_id: emp.id, email_type: 'daily_summary', log_date: today })
      sent++
    }
  }

  return NextResponse.json({ success: true, sent, date: today })
}
