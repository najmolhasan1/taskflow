import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EmployeeDashboard from '@/components/tasks/EmployeeDashboard'
import ManagerDashboard from '@/components/tasks/ManagerDashboard'
import AppShell from '@/components/layout/AppShell'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch today's tasks
  const today = new Date().toISOString().split('T')[0]

  if (profile.role === 'manager') {
    // Manager gets all employees + their tasks
    const { data: employees } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .order('full_name')

    const { data: allTasks } = await supabase
      .from('tasks')
      .select('*, profiles(full_name, email, avatar_color)')
      .eq('task_date', today)
      .order('created_at', { ascending: false })

    return (
      <AppShell profile={profile}>
        <ManagerDashboard profile={profile} employees={employees ?? []} tasks={allTasks ?? []} />
      </AppShell>
    )
  }

  // Employee gets own tasks + logs
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('task_date', today)
    .order('created_at', { ascending: false })

  const taskIds = (tasks ?? []).map(t => t.id)
  const { data: logs } = taskIds.length ? await supabase
    .from('task_logs')
    .select('*')
    .in('task_id', taskIds)
    .order('created_at', { ascending: false }) : { data: [] }

  return (
    <AppShell profile={profile}>
      <EmployeeDashboard
        profile={profile}
        initialTasks={tasks ?? []}
        initialLogs={logs ?? []}
      />
    </AppShell>
  )
}
